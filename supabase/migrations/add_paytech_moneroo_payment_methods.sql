-- Migration: Ajouter les méthodes de paiement PayTech et Moneroo
-- Cette migration ajoute 'paytech' et 'moneroo' aux options de payment_method

-- Modifier la contrainte CHECK pour inclure 'paytech' et 'moneroo'
alter table public.orders 
drop constraint if exists orders_payment_method_check;

alter table public.orders 
add constraint orders_payment_method_check 
check (payment_method in ('orange_money','cash','paytech','moneroo'));
