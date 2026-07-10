-- Migration: Paiements VIP Telegram (adhésion / renouvellement Moneroo)

create table if not exists public.telegram_vip_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  kind text not null check (kind in ('adhesion', 'renewal')),
  amount integer not null check (amount > 0),
  months integer not null default 1 check (months > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists telegram_vip_payments_user_id_idx
  on public.telegram_vip_payments (user_id);

create index if not exists telegram_vip_payments_status_idx
  on public.telegram_vip_payments (status);

alter table public.telegram_vip_payments enable row level security;

drop policy if exists telegram_vip_payments_select_self_or_admin on public.telegram_vip_payments;
create policy telegram_vip_payments_select_self_or_admin on public.telegram_vip_payments
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Inserts/updates via service role (API) — pas de policy insert pour authenticated
