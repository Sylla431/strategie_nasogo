-- Ajoute un champ pour stocker la référence de la photo de carte étudiant
alter table public.users_profile
add column if not exists id_card_photo_path text;

