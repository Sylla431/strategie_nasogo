-- Tokens éphémères pour lier un compte web au bot Telegram (/start TOKEN)
create table if not exists public.telegram_link_tokens (
  token text primary key,
  user_id uuid not null references public.users_profile(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists telegram_link_tokens_user_id_idx
  on public.telegram_link_tokens (user_id);

create index if not exists telegram_link_tokens_expires_idx
  on public.telegram_link_tokens (expires_at)
  where used_at is null;

alter table public.telegram_link_tokens enable row level security;

-- Pas de policy client : accès service role uniquement pour les écritures/lectures sensibles
