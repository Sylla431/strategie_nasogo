# Corriger l'erreur "requested path is invalid" lors de la confirmation d'email

## Problème

Vous recevez l'erreur `"error": "requested path is invalid"` lorsque vous cliquez sur le lien de confirmation d'email.

Cela signifie que l'URL de redirection dans l'email n'est pas dans la liste des URLs autorisées dans Supabase.

## Solution : Ajouter l'URL de redirection dans Supabase

### Étape 1 : Aller dans les paramètres d'authentification

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **URL Configuration** (ou **Settings** → **Auth** → **URL Configuration**)

### Étape 2 : Ajouter l'URL de callback pour la confirmation d'email

Dans la section **Redirect URLs**, ajouter l'URL suivante :

#### Pour la production (votre domaine) :
```
https://vbsniperacademie.com/auth/callback
```

#### Pour le développement local (si vous testez en local) :
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

#### Si vous utilisez ngrok ou un autre tunnel :
```
https://votre-url-ngrok.ngrok.io/auth/callback
```

### Étape 3 : Vérifier la Site URL

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
- Le chemin complet (`/auth/callback`)
- **Sans** slash final (pas de `/` à la fin)

✅ **Correct** :
```
https://vbsniperacademie.com/auth/callback
```

❌ **Incorrect** :
```
https://vbsniperacademie.com/auth/callback/
vbsniperacademie.com/auth/callback
/auth/callback
```

## Configuration complète recommandée

Pour éviter tous les problèmes de redirection, ajouter toutes ces URLs :

### Production uniquement

```
Site URL: https://vbsniperacademie.com

Redirect URLs:
- https://vbsniperacademie.com/auth/callback
- https://vbsniperacademie.com/auth/reset-password
- https://vbsniperacademie.com/auth
- https://vbsniperacademie.com/client
```

### Développement local

```
Site URL: http://localhost:3000

Redirect URLs:
- http://localhost:3000/auth/callback
- http://localhost:3000/auth/reset-password
- http://localhost:3000/auth
- http://localhost:3000/client
- http://127.0.0.1:3000/auth/callback
- http://127.0.0.1:3000/auth/reset-password
```

### Production + Développement

Si vous testez en local ET en production, ajouter toutes les URLs :

```
Site URL: https://vbsniperacademie.com

Redirect URLs:
- https://vbsniperacademie.com/auth/callback
- https://vbsniperacademie.com/auth/reset-password
- https://vbsniperacademie.com/auth
- https://vbsniperacademie.com/client
- http://localhost:3000/auth/callback
- http://localhost:3000/auth/reset-password
- http://localhost:3000/auth
- http://localhost:3000/client
```

## Vérification

### 1. Vérifier l'URL dans l'email

1. Ouvrir l'email de confirmation
2. Vérifier l'URL complète du lien de confirmation
3. S'assurer qu'elle correspond exactement à celle configurée dans Supabase

L'URL devrait ressembler à :
```
https://votre-projet.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://vbsniperacademie.com/auth/callback
```

### 2. Tester la confirmation

1. Créer un nouveau compte de test
2. Vérifier que l'email de confirmation arrive
3. Cliquer sur le lien de confirmation
4. Vérifier que vous êtes redirigé vers `/auth/callback` puis vers `/auth` avec un message de succès

### 3. Vérifier les logs Supabase

Si le problème persiste :

1. Dans Supabase Dashboard → **Logs** → **Auth**
2. Chercher les erreurs liées à la redirection
3. Vérifier l'URL exacte qui est rejetée

## Dépannage

### L'erreur persiste après configuration

1. **Vérifier l'URL exacte dans l'email** :
   - Ouvrir l'email de confirmation
   - Vérifier l'URL complète du lien
   - S'assurer qu'elle correspond exactement à celle configurée dans Supabase

2. **Vérifier le code** :
   - Dans `src/app/auth/page.tsx`, ligne 137, l'URL est construite avec `NEXT_PUBLIC_APP_URL`
   - S'assurer que `NEXT_PUBLIC_APP_URL` est correctement configurée (voir `CONFIGURER_VERCEL_ENV.md`)

3. **Vérifier les variables d'environnement** :
   - Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est correct
   - Vérifier que `NEXT_PUBLIC_APP_URL` correspond à votre domaine

4. **Redémarrer/Redéployer** :
   - Si vous avez modifié les variables d'environnement, redéployer l'application
   - Si vous avez modifié les URLs dans Supabase, attendre quelques minutes pour que les changements prennent effet

### L'URL change selon l'environnement

Si vous utilisez différents environnements (dev, staging, prod), vous pouvez utiliser une variable d'environnement :

Dans `src/app/auth/page.tsx`, l'URL est déjà construite dynamiquement :
```typescript
const redirectUrl = typeof window !== "undefined" 
  ? `${window.location.origin}/auth/callback`
  : `${process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com"}/auth/callback`;
```

Assurez-vous que `NEXT_PUBLIC_APP_URL` est configurée correctement pour chaque environnement.

### Le lien dans l'email pointe vers localhost

Si le lien dans l'email pointe vers `localhost` alors que vous êtes en production :

1. Vérifier que `NEXT_PUBLIC_APP_URL` est configurée avec votre domaine de production
2. Vérifier que vous n'êtes pas en train de tester en local
3. Redéployer l'application après avoir configuré la variable

## Étapes de résolution rapide

1. ✅ Aller dans Supabase → **Authentication** → **URL Configuration**
2. ✅ Ajouter `https://vbsniperacademie.com/auth/callback` dans **Redirect URLs**
3. ✅ Vérifier que **Site URL** est `https://vbsniperacademie.com`
4. ✅ Cliquer sur **Save**
5. ✅ Vérifier que `NEXT_PUBLIC_APP_URL` est configurée dans Vercel (voir `CONFIGURER_VERCEL_ENV.md`)
6. ✅ Tester avec un nouveau compte

## Ressources

- [Documentation Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts#redirect-urls)
- [Documentation Supabase - Email Confirmations](https://supabase.com/docs/guides/auth/auth-email)
- [Configurer les variables d'environnement sur Vercel](CONFIGURER_VERCEL_ENV.md)
- [Réactiver la confirmation d'email](REACTIVER_CONFIRMATION_EMAIL.md)

