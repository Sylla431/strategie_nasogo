-- Email utilisé lors de la validation admin (secours si user_id change)
alter table public.telegram_subscriptions
  add column if not exists granted_email text;

create index if not exists telegram_subscriptions_granted_email_idx
  on public.telegram_subscriptions (lower(granted_email))
  where granted_email is not null;
