-- Migration: Ajouter la colonne payment_reference à la table orders
-- Date: 2024
-- Description: Cette colonne stocke les tokens Orange Money (pay_token, notif_token, txnid) au format JSON

-- Ajouter la colonne payment_reference si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN payment_reference text;
        
        RAISE NOTICE 'Colonne payment_reference ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne payment_reference existe déjà';
    END IF;
END $$;

