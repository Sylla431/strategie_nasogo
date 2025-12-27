# Corriger la redirection de réinitialisation de mot de passe

## Problème

Lorsque vous cliquez sur le lien de réinitialisation de mot de passe dans l'email, vous êtes redirigé vers la page d'accueil au lieu de la page `/auth/reset-password`.

## Solution

### 1. Vérifier la variable d'environnement sur Vercel

Assurez-vous que `NEXT_PUBLIC_APP_URL` est bien configurée sur Vercel :

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **Environment Variables**
4. Vérifier que `NEXT_PUBLIC_APP_URL` est définie avec la valeur : `https://vbsniperacademie.com`
5. Si elle n'existe pas, l'ajouter
6. **Redéployer** l'application

### 2. Vérifier les URLs de redirection dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **URL Configuration**
4. Dans **Redirect URLs**, vérifier que cette URL est présente :
   ```
   https://vbsniperacademie.com/auth/reset-password
   ```
5. Si elle n'est pas présente, l'ajouter
6. Cliquer sur **Save**

### 3. Vérifier le format de l'URL

L'URL doit être exactement :
- ✅ `https://vbsniperacademie.com/auth/reset-password` (correct)
- ❌ `https://vbsniperacademie.com/auth/reset-password/` (pas de slash final)
- ❌ `vbsniperacademie.com/auth/reset-password` (pas de protocole)

## Comment ça fonctionne

### Flux de réinitialisation

1. **L'utilisateur demande la réinitialisation** :
   - Remplit son email sur `/auth`
   - Le code utilise `NEXT_PUBLIC_APP_URL` pour construire l'URL de redirection

2. **Supabase envoie l'email** :
   - L'email contient un lien avec un token de réinitialisation
   - Le lien pointe vers : `https://votre-projet.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://vbsniperacademie.com/auth/reset-password`

3. **L'utilisateur clique sur le lien** :
   - Supabase vérifie le token
   - Redirige vers `/auth/reset-password` avec le token dans l'URL (hash ou query params)

4. **La page de réinitialisation** :
   - Détecte le token dans l'URL
   - Permet à l'utilisateur de définir un nouveau mot de passe

## Vérification

### Tester la réinitialisation

1. Aller sur `/auth`
2. Cliquer sur "Mot de passe oublié"
3. Entrer votre email
4. Cliquer sur le lien dans l'email reçu
5. Vérifier que vous êtes redirigé vers `/auth/reset-password` (et non vers la page d'accueil)

### Vérifier les logs

Si le problème persiste, vérifier les logs :

1. **Logs Vercel** :
   - Aller dans Vercel Dashboard → **Deployments** → Sélectionner le déploiement → **Functions**
   - Chercher les erreurs liées à la réinitialisation

2. **Logs Supabase** :
   - Aller dans Supabase Dashboard → **Logs** → **Auth**
   - Chercher les erreurs liées à la redirection

## Dépannage

### Le problème persiste après configuration

1. **Vérifier que `NEXT_PUBLIC_APP_URL` est bien définie** :
   - Dans Vercel, vérifier que la variable existe et a la bonne valeur
   - Redéployer après avoir ajouté/modifié la variable

2. **Vérifier l'URL dans l'email** :
   - Ouvrir l'email de réinitialisation
   - Vérifier l'URL complète du lien
   - S'assurer qu'elle contient `redirect_to=https://vbsniperacademie.com/auth/reset-password`

3. **Vérifier le code** :
   - Dans `src/app/auth/page.tsx`, ligne 92-96, l'URL est construite avec `NEXT_PUBLIC_APP_URL`
   - S'assurer que le code utilise bien cette variable

### L'URL change selon l'environnement

Le code utilise maintenant :
```typescript
const appUrl = typeof window !== "undefined" 
  ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
  : (process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com");
```

Cela garantit que :
- En production (Vercel) : utilise `NEXT_PUBLIC_APP_URL` si définie
- En développement local : utilise `window.location.origin` si `NEXT_PUBLIC_APP_URL` n'est pas définie
- Fallback : utilise `https://vbsniperacademie.com` par défaut

## Configuration complète recommandée

### Variables d'environnement sur Vercel

```
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

### URLs dans Supabase

**Site URL** :
```
https://vbsniperacademie.com
```

**Redirect URLs** :
```
https://vbsniperacademie.com/auth/reset-password
https://vbsniperacademie.com/auth/callback
https://vbsniperacademie.com/auth
```

## Ressources

- [Documentation Supabase - Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Configurer les variables d'environnement sur Vercel](CONFIGURER_VERCEL_ENV.md)
- [Configurer les URLs de redirection](CONFIGURER_URLS_REDIRECTION_SUPABASE.md)

