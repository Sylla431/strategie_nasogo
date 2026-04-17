create unique index if not exists students_linked_user_id_unique_idx
  on public.students (linked_user_id)
  where linked_user_id is not null;

create index if not exists student_course_payments_student_id_idx
  on public.student_course_payments (student_id);
