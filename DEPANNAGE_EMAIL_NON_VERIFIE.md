# Dépannage : Email non vérifié après confirmation

## Problème

Après avoir cliqué sur le lien de confirmation dans l'email, la redirection fonctionne, mais l'email n'est pas vérifié (l'utilisateur ne peut toujours pas se connecter).

## Causes possibles

### 1. Le code échangé n'est pas un code de confirmation d'email

**Symptôme** : L'échange du code fonctionne, mais `email_confirmed_at` reste `null`.

**Solution** : Vérifier que le lien dans l'email est bien un lien de confirmation d'inscription, pas un lien de réinitialisation de mot de passe.

### 2. Le code a expiré

**Symptôme** : Le code de confirmation a expiré (généralement après 24 heures).

**Solution** : Demander un nouveau lien de confirmation.

### 3. Le code a déjà été utilisé

**Symptôme** : Le code ne peut être utilisé qu'une seule fois.

**Solution** : Demander un nouveau lien de confirmation.

### 4. Problème avec la configuration Supabase

**Symptôme** : L'échange fonctionne mais l'email n'est pas confirmé dans la base de données.

**Solution** : Vérifier la configuration de la confirmation d'email dans Supabase.

## Solutions

### Solution 1 : Vérifier les logs

1. Vérifier les logs du serveur (Vercel ou local) pour voir les messages de débogage
2. Vérifier les logs Supabase : **Logs** → **Auth**
3. Chercher les erreurs liées à l'échange du code

### Solution 2 : Vérifier manuellement dans Supabase

1. Aller dans Supabase Dashboard → **Authentication** → **Users**
2. Trouver l'utilisateur concerné
3. Vérifier la colonne `email_confirmed_at`
4. Si elle est `null`, l'email n'est pas confirmé

### Solution 3 : Confirmer manuellement l'email

Si l'email n'est pas confirmé après le clic :

1. Aller dans Supabase Dashboard → **Authentication** → **Users**
2. Trouver l'utilisateur concerné
3. Cliquer sur **"Confirm email"** pour confirmer manuellement

### Solution 4 : Vérifier le type de code

Le callback vérifie maintenant explicitement `email_confirmed_at`. Si l'échange réussit mais l'email n'est pas confirmé, cela peut indiquer :

- Le code utilisé n'est pas un code de confirmation d'email
- Le code a expiré
- Il y a un problème avec la configuration Supabase

### Solution 5 : Tester avec un nouveau compte

1. Créer un nouveau compte de test
2. Vérifier que l'email de confirmation arrive
3. Cliquer sur le lien immédiatement (dans les 24 heures)
4. Vérifier que l'email est confirmé

## Vérifications dans le code

Le callback a été amélioré pour :

1. ✅ Vérifier explicitement `email_confirmed_at` après l'échange
2. ✅ Logger les informations de débogage
3. ✅ Afficher des messages d'erreur plus clairs

## Logs de débogage

Le callback affiche maintenant dans les logs :
- `userId` : ID de l'utilisateur
- `email` : Email de l'utilisateur
- `email_confirmed_at` : Date de confirmation (ou `null`)
- `isEmailConfirmed` : Boolean indiquant si l'email est confirmé

## Vérification après correction

1. Créer un nouveau compte de test
2. Cliquer sur le lien de confirmation
3. Vérifier les logs du serveur pour voir :
   - Si l'échange a réussi
   - Si `email_confirmed_at` est défini
   - Si `isEmailConfirmed` est `true`
4. Essayer de se connecter avec le compte

## Si le problème persiste

### Option 1 : Vérifier la configuration Supabase

1. Aller dans **Authentication** → **Settings**
2. Vérifier que **"Enable email confirmations"** est activé
3. Vérifier que les templates d'email sont correctement configurés

### Option 2 : Vérifier les variables d'environnement

1. Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est correct
2. Vérifier que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correct
3. Vérifier que `NEXT_PUBLIC_APP_URL` est correct

### Option 3 : Contacter le support Supabase

Si le problème persiste après avoir essayé toutes les solutions, il peut s'agir d'un problème avec la configuration Supabase. Consultez les logs Supabase et contactez le support si nécessaire.

## Script SQL pour vérifier les emails non confirmés

Pour vérifier tous les utilisateurs avec des emails non confirmés :

```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Non confirmé'
    ELSE 'Confirmé'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

## Script SQL pour confirmer manuellement un email

Si vous devez confirmer manuellement un email :

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'email@example.com'
  AND email_confirmed_at IS NULL;
```

**⚠️ Attention** : Utilisez ce script avec précaution. Il est préférable de laisser les utilisateurs confirmer leur email via le lien normal.

## Ressources

- [Documentation Supabase - Email Confirmations](https://supabase.com/docs/guides/auth/auth-email)
- [Documentation Supabase - Exchange Code for Session](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession)
- [Réactiver la confirmation d'email](REACTIVER_CONFIRMATION_EMAIL.md)
- [Corriger l'erreur de redirection](CORRIGER_ERREUR_CONFIRMATION_EMAIL.md)

