-- Migration: Ajouter la fonction grant_course_access_automatic
-- Cette fonction permet d'accorder l'accès automatiquement pour les paiements Orange Money
-- sans vérification du rôle admin

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

