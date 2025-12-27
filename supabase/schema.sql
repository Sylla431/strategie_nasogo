-- Users profile table (one-to-one with auth.users)
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client','admin')),
  email text unique,
  phone text,
  full_name text,
  created_at timestamp with time zone default now()
);

-- SECURITY DEFINER helper (avoids RLS recursion in policies)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile
    where id = uid and role = 'admin'
  );
$$;

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, auth
as $$
begin
  -- Vérifier si le profil existe déjà
  if exists (select 1 from public.users_profile where id = new.id) then
    -- Mettre à jour le profil existant
    update public.users_profile
    set email = coalesce(new.email, users_profile.email),
        full_name = coalesce(new.raw_user_meta_data->>'full_name', users_profile.full_name),
        phone = coalesce(new.raw_user_meta_data->>'phone', users_profile.phone)
    where id = new.id;
  else
    -- Créer un nouveau profil
    -- Utiliser INSERT directement car security definer contourne RLS
    insert into public.users_profile (id, email, full_name, phone, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', null),
      coalesce(new.raw_user_meta_data->>'phone', null),
      'client' -- Valeur par défaut
    )
    on conflict (id) do update
      set email = coalesce(excluded.email, users_profile.email),
          full_name = coalesce(excluded.full_name, users_profile.full_name),
          phone = coalesce(excluded.phone, users_profile.phone);
  end if;
  return new;
exception
  when others then
    -- Log l'erreur mais ne bloque pas la création de l'utilisateur
    -- Essayer de créer le profil avec les valeurs minimales si la première tentative échoue
    begin
      insert into public.users_profile (id, email, role)
      values (new.id, new.email, 'client')
      on conflict (id) do nothing;
    exception
      when others then
    raise warning 'Error creating user profile for user %: %', new.id, sqlerrm;
    end;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Function to ensure all auth.users have a profile in users_profile
create or replace function public.ensure_all_profiles_exist()
returns integer
language plpgsql
security definer set search_path = public, auth
as $$
declare
  created_count integer := 0;
begin
  -- Créer les profils manquants pour tous les utilisateurs dans auth.users
  insert into public.users_profile (id, email, role)
  select 
    au.id,
    au.email,
    'client' as role
  from auth.users au
  where not exists (
    select 1 from public.users_profile up where up.id = au.id
  )
  on conflict (id) do nothing;
  
  get diagnostics created_count = row_count;
  return created_count;
exception
  when others then
    raise warning 'Error ensuring profiles exist: %', sqlerrm;
    return 0;
end;
$$;

-- Function to sync email from auth.users to users_profile (for existing users)
create or replace function public.sync_user_email()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
begin
  update public.users_profile up
  set email = au.email
  from auth.users au
  where up.id = au.id
    and (up.email is null or up.email != au.email);
end;
$$;

-- Function to get user email from auth.users
create or replace function public.get_user_email(user_id uuid)
returns text
language plpgsql
security definer set search_path = public, auth
as $$
declare
  user_email text;
begin
  select email into user_email from auth.users where id = user_id;
  return user_email;
end;
$$;

-- Function to find user ID by email from auth.users
create or replace function public.find_user_by_email(user_email text)
returns uuid
language plpgsql
security definer set search_path = public, auth
as $$
declare
  user_id uuid;
begin
  select id into user_id from auth.users where email = lower(trim(user_email));
  return user_id;
end;
$$;

-- Function to grant course access (bypasses RLS)
create or replace function public.grant_course_access(
  p_user_id uuid,
  p_course_id uuid,
  p_granted_by uuid
)
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  result jsonb;
  inserted_id uuid;
begin
  -- Vérifier que l'utilisateur qui accorde l'accès est admin
  if not exists (
    select 1 from public.users_profile 
    where id = p_granted_by and role = 'admin'
  ) then
    raise exception 'Seuls les admins peuvent accorder l''accès';
  end if;
  
  -- Vérifier que l'utilisateur existe dans auth.users
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Utilisateur non trouvé dans auth.users';
  end if;
  
  -- S'assurer que le profil existe dans users_profile, sinon le créer
  -- Créer le profil avec seulement id et role (colonnes minimales requises)
  -- Note: On n'utilise pas email car cette colonne peut ne pas exister dans la table
  if not exists (select 1 from public.users_profile where id = p_user_id) then
    insert into public.users_profile (id, role)
    values (p_user_id, 'client')
    on conflict (id) do nothing;
  end if;
  
  -- Insérer l'accès (contourne RLS grâce à security definer)
  insert into public.course_access (user_id, course_id, granted_by)
  values (p_user_id, p_course_id, p_granted_by)
  on conflict (user_id, course_id) do update
    set granted_by = excluded.granted_by,
        granted_at = excluded.granted_at
  returning id into inserted_id;
  
  -- Récupérer les données complètes
  select to_jsonb(ca.*) into result
  from public.course_access ca
  where ca.user_id = p_user_id and ca.course_id = p_course_id;
  
  return result;
exception
  when others then
    raise exception 'Erreur lors de l''attribution de l''accès: %', sqlerrm;
end;
$$;

-- Function to grant course access automatically (for Orange Money payments)
-- This function bypasses admin check and is used by webhooks
create or replace function public.grant_course_access_automatic(
  p_user_id uuid,
  p_course_id uuid,
  p_granted_by uuid default null
)
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  result jsonb;
  inserted_id uuid;
begin
  -- Vérifier que l'utilisateur existe dans auth.users
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Utilisateur non trouvé dans auth.users';
  end if;
  
  -- S'assurer que le profil existe dans users_profile, sinon le créer
  if not exists (select 1 from public.users_profile where id = p_user_id) then
    insert into public.users_profile (id, role)
    values (p_user_id, 'client')
    on conflict (id) do nothing;
  end if;
  
  -- Insérer l'accès (contourne RLS grâce à security definer)
  -- Si p_granted_by est null, on utilise p_user_id comme granted_by (auto-attribution)
  insert into public.course_access (user_id, course_id, granted_by)
  values (p_user_id, p_course_id, coalesce(p_granted_by, p_user_id))
  on conflict (user_id, course_id) do update
    set granted_by = excluded.granted_by,
        granted_at = excluded.granted_at
  returning id into inserted_id;
  
  -- Récupérer les données complètes
  select to_jsonb(ca.*) into result
  from public.course_access ca
  where ca.user_id = p_user_id and ca.course_id = p_course_id;
  
  return result;
exception
  when others then
    raise exception 'Erreur lors de l''attribution automatique de l''accès: %', sqlerrm;
end;
$$;

-- Function to get all course accesses for admin (bypasses RLS)
create or replace function public.get_all_course_accesses(p_admin_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  result jsonb;
begin
  -- Vérifier que l'utilisateur est admin
  if not exists (
    select 1 from public.users_profile 
    where id = p_admin_id and role = 'admin'
  ) then
    raise exception 'Seuls les admins peuvent voir tous les accès';
  end if;
  
  -- Récupérer tous les accès avec les infos utilisateur et cours
  -- Récupérer email, full_name et phone depuis auth.users.raw_user_meta_data
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ca.id,
        'user_id', ca.user_id,
        'course_id', ca.course_id,
        'granted_by', ca.granted_by,
        'granted_at', ca.granted_at,
        'courses', case 
          when c.id is not null then jsonb_build_object(
            'id', c.id,
            'title', c.title,
            'price', c.price,
            'cover_url', c.cover_url
          )
          else null
        end,
        'users_profile', case
          when au.id is not null then jsonb_build_object(
            'id', au.id,
            'email', au.email,
            'full_name', au.raw_user_meta_data->>'full_name',
            'phone', au.raw_user_meta_data->>'phone',
            'role', up.role
          )
          else null
        end
      )
      order by ca.granted_at desc
    ),
    '[]'::jsonb
  ) into result
  from public.course_access ca
  left join public.courses c on c.id = ca.course_id
  left join auth.users au on au.id = ca.user_id
  left join public.users_profile up on up.id = ca.user_id;
  
  return result;
end;
$$;

-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  video_url jsonb default '[]'::jsonb,
  price numeric not null,
  created_at timestamp with time zone default now()
);

-- Migration: convertir video_url en JSONB si elle existe déjà comme text
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'courses' 
    and column_name = 'video_url' 
    and data_type = 'text'
  ) then
    alter table public.courses alter column video_url type jsonb using 
      case 
        when video_url is null or video_url = '' then '[]'::jsonb
        else ('[' || jsonb_build_object('video_url', video_url, 'title', '', 'position', 0)::text || ']')::jsonb
      end;
  end if;
end $$;

-- Course videos (one course has many videos)
create table if not exists public.course_videos (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  video_url text not null,
  position integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Orders (one course per order for simplicité; extend with order_items if needed)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  payment_method text not null default 'orange_money' check (payment_method in ('orange_money','cash')),
  payment_reference text,
  created_at timestamp with time zone default now(),
  paid_at timestamp with time zone
);

-- Access grants (admin allows access to a course)
create table if not exists public.course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  granted_by uuid references public.users_profile(id),
  granted_at timestamp with time zone default now(),
  unique (user_id, course_id)
);

-- RLS
alter table public.users_profile enable row level security;
alter table public.courses enable row level security;
alter table public.course_videos enable row level security;
alter table public.orders enable row level security;
alter table public.course_access enable row level security;

-- Drop existing policies to allow re-run
drop policy if exists profiles_select_self_or_admin on public.users_profile;
drop policy if exists profiles_insert_self on public.users_profile;
drop policy if exists profiles_update_self on public.users_profile;

drop policy if exists courses_select_all on public.courses;
drop policy if exists courses_insert_admin on public.courses;
drop policy if exists courses_update_admin on public.courses;

drop policy if exists course_videos_select_by_access on public.course_videos;
drop policy if exists course_videos_insert_admin on public.course_videos;
drop policy if exists course_videos_update_admin on public.course_videos;

drop policy if exists orders_select_self_or_admin on public.orders;
drop policy if exists orders_insert_self on public.orders;
drop policy if exists orders_update_admin on public.orders;

drop policy if exists access_select_self_or_admin on public.course_access;
drop policy if exists access_insert_admin on public.course_access;

-- Profiles: user can view own, admin all
create policy "profiles_select_self_or_admin" on public.users_profile
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_insert_self" on public.users_profile
  for insert with check (auth.uid() = id);

create policy "profiles_update_self" on public.users_profile
  for update using (auth.uid() = id);

-- Courses: readable by all, writable by admin
create policy "courses_select_all" on public.courses
  for select using (true);

create policy "courses_insert_admin" on public.courses
  for insert with check (public.is_admin(auth.uid()));

create policy "courses_update_admin" on public.courses
  for update using (public.is_admin(auth.uid()));

-- Course videos: readable if user has access (via course_access OR paid order) OR admin; writable by admin
create policy "course_videos_select_by_access" on public.course_videos
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.course_access a
      where a.course_id = course_videos.course_id
        and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.orders o
      where o.course_id = course_videos.course_id
        and o.user_id = auth.uid()
        and o.status = 'paid'
    )
  );

create policy "course_videos_insert_admin" on public.course_videos
  for insert with check (public.is_admin(auth.uid()));

create policy "course_videos_update_admin" on public.course_videos
  for update using (public.is_admin(auth.uid()));

-- Orders: user sees own, admin sees all; admin can update status
create policy "orders_select_self_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "orders_insert_self" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "orders_update_admin" on public.orders
  for update using (public.is_admin(auth.uid()));

-- Course access: user sees own, admin sees all; only admin can grant
create policy "access_select_self_or_admin" on public.course_access
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "access_insert_admin" on public.course_access
  for insert with check (public.is_admin(auth.uid()));

