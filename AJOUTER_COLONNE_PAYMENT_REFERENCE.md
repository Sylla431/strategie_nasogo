# Ajouter la colonne payment_reference à la table orders

## Problème

Vous recevez l'erreur :
```
column orders.payment_reference does not exist
```

Cela signifie que la colonne `payment_reference` n'existe pas dans votre table `orders` dans Supabase.

## Solution : Exécuter la migration SQL

### Méthode 1 : Via l'éditeur SQL de Supabase (Recommandé)

1. **Connectez-vous à votre projet Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Exécutez cette requête SQL** :

```sql
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
```

4. **Cliquez sur "Run"** pour exécuter la requête

5. **Vérifiez que la colonne a été ajoutée** :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders' 
AND column_name = 'payment_reference';
```

Vous devriez voir :
```
column_name        | data_type
-------------------|----------
payment_reference  | text
```

### Méthode 2 : Via la ligne de commande (Supabase CLI)

Si vous utilisez Supabase CLI :

```bash
# Exécuter la migration
supabase db push

# Ou directement
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/add_payment_reference_to_orders.sql
```

### Méthode 3 : Via l'interface Table Editor

1. **Allez dans Table Editor**
   - Cliquez sur "Table Editor" dans le menu de gauche
   - Sélectionnez la table `orders`

2. **Ajoutez la colonne**
   - Cliquez sur "Add column"
   - Nom : `payment_reference`
   - Type : `text`
   - Nullable : ✅ (cochez pour permettre NULL)
   - Cliquez sur "Save"

## Vérification

Après avoir ajouté la colonne, testez à nouveau le webhook. Les logs devraient montrer :
```
✅ Commande trouvée avec payment_reference
✅ Paiement confirmé et accès accordé
```

Au lieu de :
```
❌ column orders.payment_reference does not exist
```

## Utilisation de la colonne

La colonne `payment_reference` stocke les données Orange Money au format JSON :

```json
{
  "pay_token": "v11yza8yho76qjgzhqaqfd53ezo7iuafafj3cqzn5piyurtkmqthpaskw3w6ehww",
  "notif_token": "l47ho6nbyftknpl0bnttvzmtkwuiapfq",
  "txnid": "TXN123456789"
}
```

- **`pay_token`** : Stocké lors de l'initiation du paiement
- **`notif_token`** : Stocké lors de l'initiation du paiement
- **`txnid`** : Ajouté lors de la réception du webhook après le paiement

## Notes importantes

- ✅ La colonne est **nullable** (peut être NULL) car les commandes cash n'ont pas de `payment_reference`
- ✅ Le format est **text** pour stocker le JSON stringifié
- ✅ Le code parse automatiquement le JSON lors de la lecture

## Dépannage

### Erreur "permission denied"
- Assurez-vous d'être connecté avec un compte ayant les droits d'administration
- Utilisez le service role key si nécessaire

### La colonne existe déjà
- L'erreur "column already exists" est normale si la colonne existe déjà
- Vous pouvez ignorer cette erreur

### Vérifier si la colonne existe

```sql
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'payment_reference'
);
```

Si cela retourne `true`, la colonne existe déjà.

