# Réactiver la confirmation d'email dans Supabase

## Problème

La confirmation d'email a été désactivée lors de l'authentification. Vous souhaitez la réactiver pour améliorer la sécurité et valider les adresses email des utilisateurs.

## Solution : Réactiver dans Supabase Dashboard

### Étape 1 : Accéder aux paramètres d'authentification

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Settings** (ou **Settings** → **Auth**)

### Étape 2 : Activer la confirmation d'email

1. Dans la section **Email Auth**, chercher l'option **"Enable email confirmations"** ou **"Confirm email"**
2. Activer cette option (toggle ou checkbox)
3. **Sauvegarder** les modifications

## Étape 2.5 : Configurer les URLs de redirection (IMPORTANT)

1. Dans la section **URL Configuration** ou **Redirect URLs**, ajouter les URLs suivantes :
   - `https://vbsniperacademie.com/auth/callback`
   - `http://localhost:3000/auth/callback` (pour le développement local)
   
2. **Site URL** : Définir `https://vbsniperacademie.com` comme URL de base

3. **Sauvegarder** les modifications

**Note** : Ces URLs sont essentielles pour que la redirection après confirmation d'email fonctionne correctement. Consultez `CONFIGURER_URLS_REDIRECTION_SUPABASE.md` pour plus de détails.

### Étape 3 : Configurer le comportement

Vous pouvez également configurer :

- **"Secure email change"** : Exiger une confirmation lors du changement d'email
- **"Double confirm email changes"** : Double confirmation pour les changements d'email

### Étape 4 : Vérifier les templates d'email

1. Aller dans **Authentication** → **Email Templates**
2. Vérifier que le template **"Confirm signup"** est configuré
3. Personnaliser le template si nécessaire (ajouter votre logo, texte personnalisé, etc.)

## Comportement après activation

### Inscription (Sign Up)

1. L'utilisateur s'inscrit avec email et mot de passe
2. Un email de confirmation est envoyé automatiquement
3. L'utilisateur doit cliquer sur le lien dans l'email pour confirmer son compte
4. Une fois confirmé, l'utilisateur peut se connecter

### Connexion (Sign In)

- Si l'email n'est pas confirmé, l'utilisateur verra un message d'erreur
- Il devra d'abord confirmer son email avant de pouvoir se connecter

## Personnalisation du template d'email

### Template de confirmation d'inscription

Dans **Authentication** → **Email Templates** → **Confirm signup**, vous pouvez personnaliser :

- **Subject** : Objet de l'email
- **Body** : Corps de l'email (HTML supporté)

**Variables disponibles** :
- `{{ .ConfirmationURL }}` : URL de confirmation
- `{{ .Email }}` : Email de l'utilisateur
- `{{ .SiteURL }}` : URL de votre site

**Template amélioré** :

Un template HTML professionnel et moderne est disponible dans le fichier `TEMPLATE_CONFIRMATION_EMAIL.md`. Ce template inclut :

- ✅ Design moderne et professionnel
- ✅ Responsive (s'adapte aux mobiles)
- ✅ Bouton de confirmation clair et visible
- ✅ Lien alternatif si le bouton ne fonctionne pas
- ✅ Informations importantes (validité du lien)
- ✅ Footer avec informations de contact
- ✅ Compatible avec tous les clients email

**Pour utiliser le template amélioré** :

1. Ouvrir le fichier `TEMPLATE_CONFIRMATION_EMAIL.md`
2. Copier le template HTML complet
3. Coller dans **Authentication** → **Email Templates** → **Confirm signup** → **Body**
4. Personnaliser si nécessaire (logo, couleurs, texte)
5. Sauvegarder

**Template texte simple (alternative)** :

Si vous préférez un email en texte simple :

```
Bonjour,

Merci de vous être inscrit sur VB Sniper Academie !

Cliquez sur le lien ci-dessous pour confirmer votre email :

{{ .ConfirmationURL }}

Ce lien est valide pendant 24 heures.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

Cordialement,
L'équipe VB Sniper Academie
```

## Gestion des utilisateurs existants

### Problème : Utilisateurs déjà inscrits sans confirmation

Si vous avez déjà des utilisateurs inscrits avant l'activation de la confirmation :

1. **Option 1 : Confirmer manuellement** (pour les utilisateurs existants)
   - Dans Supabase Dashboard → **Authentication** → **Users**
   - Sélectionner un utilisateur
   - Cliquer sur **"Confirm email"** pour confirmer manuellement

2. **Option 2 : Script SQL** (pour confirmer tous les utilisateurs existants)
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = COALESCE(email_confirmed_at, created_at)
   WHERE email_confirmed_at IS NULL;
   ```

3. **Option 3 : Laisser les utilisateurs se reconnecter**
   - Les utilisateurs existants devront demander un nouveau lien de confirmation
   - Utiliser la fonctionnalité "Renvoyer l'email de confirmation" dans votre interface

## Modifier le code frontend (si nécessaire)

Si vous avez désactivé la confirmation dans le code, vérifiez ces fichiers :

### `src/app/auth/page.tsx`

Assurez-vous que le code d'inscription ne désactive pas la confirmation :

```typescript
// ✅ Correct - La confirmation est activée par défaut
const { data, error: err } = await supabase.auth.signUp({
  email,
  password,
});

// ❌ Incorrect - Ne pas utiliser emailRedirectTo si vous voulez la confirmation standard
// const { data, error: err } = await supabase.auth.signUp({
//   email,
//   password,
//   options: {
//     emailRedirectTo: undefined, // Ne pas désactiver
//   }
// });
```

### Gestion des messages

Après l'inscription, afficher un message approprié :

```typescript
if (mode === "register") {
  const { data, error: err } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (err) {
    setError(err.message);
  } else {
    // Afficher un message indiquant qu'un email de confirmation a été envoyé
    setMessage("Un email de confirmation a été envoyé. Vérifiez votre boîte de réception (y compris les spams) et cliquez sur le lien pour confirmer votre compte.");
  }
}
```

## Vérification

### Tester la confirmation d'email

1. Créer un nouveau compte de test
2. Vérifier que l'email de confirmation arrive
3. Cliquer sur le lien de confirmation
4. Vérifier que le compte est confirmé
5. Tenter de se connecter avec le compte confirmé

### Vérifier dans Supabase

1. Aller dans **Authentication** → **Users**
2. Vérifier que les nouveaux utilisateurs ont `email_confirmed_at` rempli après confirmation
3. Les utilisateurs non confirmés auront `email_confirmed_at` = `null`

## Dépannage

### La redirection après confirmation ne fonctionne pas

**Symptôme** : Après avoir cliqué sur le lien de confirmation dans l'email, l'utilisateur voit une erreur "requested path is invalid" ou reste sur une page blanche.

**⚠️ IMPORTANT** : Consultez le guide détaillé `CORRIGER_ERREUR_CONFIRMATION_EMAIL.md` pour résoudre ce problème.

**Solution** :
1. **Vérifier les URLs de redirection dans Supabase** :
   - Aller dans **Authentication** → **URL Configuration** → **Redirect URLs**
   - Ajouter `https://vbsniperacademie.com/auth/callback`
   - Ajouter `http://localhost:3000/auth/callback` (pour le développement)
   - Vérifier que la **Site URL** est `https://vbsniperacademie.com`

2. **Vérifier que le fichier de callback existe** :
   - Le fichier `src/app/auth/callback/route.ts` doit exister (il a été créé automatiquement)

3. **Vérifier les logs** :
   - Vérifier les logs du serveur pour voir s'il y a des erreurs lors de l'échange du code
   - Vérifier les logs Supabase : **Logs** → **Auth**

4. **Consulter le guide complet** :
   - Voir `CONFIGURER_URLS_REDIRECTION_SUPABASE.md` pour plus de détails sur la configuration des URLs

**URLs à ajouter dans Supabase** :
- `https://vbsniperacademie.com/auth/callback`
- `http://localhost:3000/auth/callback` (pour le développement)

### Les emails de confirmation ne sont pas envoyés

1. Vérifier la configuration SMTP (voir `CONFIGURER_SMTP_SUPABASE.md`)
2. Vérifier les logs Supabase : **Logs** → **Auth**
3. Vérifier que le template d'email est configuré
4. Vérifier que l'option "Enable email confirmations" est bien activée

### Les utilisateurs ne reçoivent pas les emails

1. Vérifier les spams
2. Vérifier la configuration SMTP
3. Vérifier la réputation de l'expéditeur (voir `CORRIGER_PROBLEME_EMAIL_SPAM.md`)
4. Vérifier les logs d'envoi dans votre service d'email (Resend, SendGrid, etc.)

### Les utilisateurs existants ne peuvent plus se connecter

Si vous avez activé la confirmation alors que des utilisateurs existants n'ont pas confirmé :

1. Option 1 : Confirmer manuellement leurs comptes dans Supabase Dashboard
2. Option 2 : Exécuter le script SQL pour confirmer tous les utilisateurs existants
3. Option 3 : Ajouter une fonctionnalité "Renvoyer l'email de confirmation" dans votre interface

## Ressources

- [Documentation Supabase - Email Confirmations](https://supabase.com/docs/guides/auth/auth-email)
- [Documentation Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Documentation Supabase - User Management](https://supabase.com/docs/guides/auth/managing-users)

