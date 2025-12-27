-- Migration: Ajouter le statut 'failed' à la table orders
-- Ce statut permet de marquer les commandes dont le paiement a échoué

-- Modifier la contrainte CHECK pour inclure 'failed'
alter table public.orders 
drop constraint if exists orders_status_check;

alter table public.orders 
add constraint orders_status_check 
check (status in ('pending','paid','failed'));

