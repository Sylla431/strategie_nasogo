# Configurer les URLs de redirection dans Supabase

## Problème

Vous recevez l'erreur : `"error": "requested path is invalid"` lorsque vous cliquez sur le lien de réinitialisation de mot de passe dans l'email.

Cela signifie que l'URL de redirection n'est pas dans la liste des URLs autorisées dans Supabase.

## Solution : Ajouter l'URL de redirection dans Supabase

### Étape 1 : Aller dans les paramètres d'authentification

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **URL Configuration** (ou **Settings** → **Auth** → **URL Configuration**)

### Étape 2 : Ajouter les URLs de redirection

Dans la section **Redirect URLs**, ajouter les URLs suivantes :

#### Pour la production (votre domaine) :
```
https://vbsniperacademie.com/auth/reset-password
https://vbsniperacademie.com/auth/callback
```

#### Pour le développement local (si vous testez en local) :
```
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/reset-password
http://127.0.0.1:3000/auth/callback
```

#### Si vous utilisez ngrok ou un autre tunnel :
```
https://votre-url-ngrok.ngrok.io/auth/reset-password
https://votre-url-ngrok.ngrok.io/auth/callback
```

### Étape 3 : Ajouter les Site URLs autorisées

Dans la section **Site URL**, s'assurer que votre URL principale est configurée :

```
https://vbsniperacademie.com
```

Ou pour le développement :
```
http://localhost:3000
```

### Étape 4 : Sauvegarder

Cliquer sur **Save** pour enregistrer les modifications.

## Format des URLs

**Important** : Les URLs doivent être exactes, incluant :
- Le protocole (`https://` ou `http://`)
- Le domaine complet
- Le chemin complet (`/auth/reset-password`)
- **Sans** slash final (pas de `/` à la fin)

✅ **Correct** :
```
https://vbsniperacademie.com/auth/reset-password
```

❌ **Incorrect** :
```
https://vbsniperacademie.com/auth/reset-password/
vbsniperacademie.com/auth/reset-password
/auth/reset-password
```

## Vérification

### Tester la réinitialisation

1. Aller sur votre page d'authentification : `https://vbsniperacademie.com/auth`
2. Cliquer sur "Mot de passe oublié"
3. Entrer votre email
4. Cliquer sur le lien dans l'email reçu
5. Vérifier que vous êtes redirigé vers `/auth/reset-password` sans erreur

### Vérifier les logs

Si le problème persiste :

1. Dans Supabase Dashboard → **Logs** → **Auth**
2. Chercher les erreurs liées à la redirection
3. Vérifier l'URL exacte qui est rejetée

## URLs à configurer selon votre environnement

### Production uniquement

```
Site URL: https://vbsniperacademie.com

Redirect URLs:
- https://vbsniperacademie.com/auth/reset-password
- https://vbsniperacademie.com/auth/callback
- https://vbsniperacademie.com/auth
- https://vbsniperacademie.com/client
```

### Développement local

```
Site URL: http://localhost:3000

Redirect URLs:
- http://localhost:3000/auth/reset-password
- http://localhost:3000/auth/callback
- http://localhost:3000/auth
- http://localhost:3000/client
- http://127.0.0.1:3000/auth/reset-password
- http://127.0.0.1:3000/auth/callback
```

### Production + Développement

Si vous testez en local ET en production, ajouter toutes les URLs :

```
Site URL: https://vbsniperacademie.com

Redirect URLs:
- https://vbsniperacademie.com/auth/reset-password
- https://vbsniperacademie.com/auth/callback
- https://vbsniperacademie.com/auth
- https://vbsniperacademie.com/client
- http://localhost:3000/auth/reset-password
- http://localhost:3000/auth/callback
- http://localhost:3000/auth
- http://localhost:3000/client
```

## Dépannage

### Erreur persiste après configuration

1. **Vérifier l'URL exacte dans l'email** :
   - Ouvrir l'email de réinitialisation
   - Vérifier l'URL complète du lien
   - S'assurer qu'elle correspond exactement à celle configurée dans Supabase

2. **Vérifier le code** :
   - Dans `src/app/auth/page.tsx`, ligne 72, l'URL est : `${window.location.origin}/auth/reset-password`
   - S'assurer que `window.location.origin` correspond à votre domaine

3. **Vérifier les variables d'environnement** :
   - Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est correct
   - Vérifier que `NEXT_PUBLIC_APP_URL` (si utilisé) correspond à votre domaine

### L'URL change selon l'environnement

Si vous utilisez différents environnements (dev, staging, prod), vous pouvez utiliser une variable d'environnement :

```typescript
redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/reset-password`,
```

Et configurer `NEXT_PUBLIC_APP_URL` dans vos variables d'environnement.

## Configuration recommandée pour la production

Pour la production, configurer uniquement les URLs de production :

```
Site URL: https://vbsniperacademie.com

Redirect URLs:
- https://vbsniperacademie.com/auth/reset-password
- https://vbsniperacademie.com/auth/callback
- https://vbsniperacademie.com/auth
- https://vbsniperacademie.com/client
- https://vbsniperacademie.com/payment/success
- https://vbsniperacademie.com/payment/cancel
```

## Ressources

- [Documentation Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts#redirect-urls)
- [Documentation Supabase - Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)

