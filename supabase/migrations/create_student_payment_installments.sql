-- Historique des versements par étudiant / cours

create table if not exists public.student_payment_installments (
  id uuid primary key default gen_random_uuid(),
  student_course_payment_id uuid not null references public.student_course_payments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric not null check (amount > 0),
  recorded_by uuid references public.users_profile(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists student_payment_installments_student_id_idx
  on public.student_payment_installments (student_id);

create index if not exists student_payment_installments_payment_id_idx
  on public.student_payment_installments (student_course_payment_id);

create index if not exists student_payment_installments_created_at_idx
  on public.student_payment_installments (created_at desc);

-- Rétrocompatibilité : un versement par paiement existant déjà encaissé
insert into public.student_payment_installments (student_course_payment_id, student_id, amount, created_at)
select scp.id, scp.student_id, scp.amount_paid, coalesce(scp.updated_at, scp.created_at)
from public.student_course_payments scp
where scp.amount_paid > 0
  and not exists (
    select 1
    from public.student_payment_installments spi
    where spi.student_course_payment_id = scp.id
  );

alter table public.student_payment_installments enable row level security;

drop policy if exists student_payment_installments_admin_all on public.student_payment_installments;
create policy student_payment_installments_admin_all on public.student_payment_installments
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
