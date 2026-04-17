create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  id_card_photo_path text,
  created_by uuid references public.users_profile(id) on delete set null,
  linked_user_id uuid references public.users_profile(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists public.student_course_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  course_price numeric not null default 0,
  amount_paid numeric not null default 0,
  remaining_amount numeric not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (student_id, course_id)
);
