-- Abonnements Telegram (accès canal privé)
create table if not exists public.telegram_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  telegram_user_id bigint unique,
  telegram_username text,
  subscription_expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists telegram_subscriptions_expires_idx
  on public.telegram_subscriptions (subscription_expires_at)
  where status = 'active';

create index if not exists telegram_subscriptions_telegram_user_id_idx
  on public.telegram_subscriptions (telegram_user_id)
  where telegram_user_id is not null;

create or replace function public.telegram_subscriptions_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists telegram_subscriptions_updated_at on public.telegram_subscriptions;
create trigger telegram_subscriptions_updated_at
  before update on public.telegram_subscriptions
  for each row execute procedure public.telegram_subscriptions_set_updated_at();

alter table public.telegram_subscriptions enable row level security;

drop policy if exists telegram_subscriptions_select_self_or_admin on public.telegram_subscriptions;
create policy telegram_subscriptions_select_self_or_admin on public.telegram_subscriptions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
