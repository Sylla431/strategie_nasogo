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
security definer set search_path = public
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
    insert into public.users_profile (id, email, full_name, phone)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', null),
      coalesce(new.raw_user_meta_data->>'phone', null)
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
    raise warning 'Error creating user profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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
  status text not null default 'pending' check (status in ('pending','paid')),
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

