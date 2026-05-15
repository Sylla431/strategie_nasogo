-- OWASP / access control: RLS on student registry + block role self-escalation

alter table public.students enable row level security;
alter table public.student_course_payments enable row level security;

drop policy if exists students_admin_all on public.students;
create policy students_admin_all on public.students
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists student_course_payments_admin_all on public.student_course_payments;
create policy student_course_payments_admin_all on public.student_course_payments
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Users cannot promote themselves to admin
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin(auth.uid()) then
    raise exception 'Modification du rôle non autorisée';
  end if;
  return new;
end;
$$;

drop trigger if exists users_profile_prevent_role_escalation on public.users_profile;
create trigger users_profile_prevent_role_escalation
  before update on public.users_profile
  for each row
  execute function public.prevent_role_self_escalation();

-- Restrict email lookup RPCs to service role (admin API uses service role)
revoke all on function public.get_user_email(uuid) from public, anon, authenticated;
revoke all on function public.find_user_by_email(text) from public, anon, authenticated;
grant execute on function public.get_user_email(uuid) to service_role;
grant execute on function public.find_user_by_email(text) to service_role;
