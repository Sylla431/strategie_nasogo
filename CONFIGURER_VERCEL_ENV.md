# Configurer les variables d'environnement sur Vercel

## Question : NEXT_PUBLIC_APP_URL est-elle nécessaire ?

**Réponse : OUI, elle est nécessaire** pour plusieurs fonctionnalités importantes.

## Utilisations de NEXT_PUBLIC_APP_URL

Cette variable est utilisée dans votre code pour :

1. **Confirmation d'email** (`src/app/auth/page.tsx`)
   - Construire l'URL de redirection après confirmation : `/auth/callback`

2. **Paiements Orange Money** (`src/app/api/payments/orange-money/initiate/route.ts`)
   - Construire les URLs de retour (`return_url`, `cancel_url`, `notif_url`)
   - Orange Money nécessite des URLs absolues (pas de `localhost`)

3. **API Orders** (`src/app/api/orders/route.ts`)
   - Construire l'URL pour appeler l'API d'initiation de paiement

## Configuration sur Vercel

### Option 1 : Utiliser votre domaine personnalisé (RECOMMANDÉ)

Si vous avez configuré un domaine personnalisé sur Vercel (ex: `vbsniperacademie.com`) :

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter la variable :
   - **Name** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://vbsniperacademie.com`
   - **Environments** : Sélectionner **Production**, **Preview**, et **Development** (selon vos besoins)
5. Cliquer sur **Save**

### Option 2 : Utiliser l'URL Vercel automatique (non recommandé pour la production)

Vercel fournit automatiquement `VERCEL_URL` qui contient l'URL du déploiement (ex: `votre-projet.vercel.app`).

**⚠️ Attention** : Cette option n'est pas recommandée pour la production car :
- L'URL change si vous supprimez et recréez le projet
- Orange Money nécessite un domaine stable
- Les emails de confirmation doivent pointer vers votre domaine principal

Si vous voulez quand même l'utiliser temporairement :

```bash
# Dans Vercel Environment Variables
NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app
```

## Valeur recommandée pour la production

```bash
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

**Important** :
- ✅ Utilisez `https://` (pas `http://`)
- ✅ Pas de slash final (`/`)
- ✅ Utilisez votre domaine personnalisé, pas l'URL Vercel par défaut

## Configuration complète des variables d'environnement sur Vercel

### Variables nécessaires pour la production

1. **Supabase** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

2. **Application** :
   ```
   NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
   ```

3. **Orange Money** :
   ```
   ORANGE_MONEY_ACCESS_TOKEN=votre_access_token
   ORANGE_MONEY_MERCHANT_KEY=votre_merchant_key
   ORANGE_MONEY_ENV=production
   ORANGE_MONEY_COUNTRY_CODE=CI
   ```

### Comment ajouter les variables

1. **Via le Dashboard Vercel** :
   - Aller dans **Settings** → **Environment Variables**
   - Cliquer sur **Add New**
   - Entrer le nom et la valeur
   - Sélectionner les environnements (Production, Preview, Development)
   - Cliquer sur **Save**

2. **Via Vercel CLI** (alternative) :
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL production
   # Entrer la valeur : https://vbsniperacademie.com
   ```

## Vérification après déploiement

### 1. Vérifier que la variable est bien définie

Après le déploiement, vous pouvez vérifier dans les logs Vercel ou en ajoutant temporairement :

```typescript
// Dans un composant ou API route
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
```

### 2. Tester les fonctionnalités

- ✅ **Confirmation d'email** : Créer un compte et vérifier que le lien de confirmation fonctionne
- ✅ **Paiement Orange Money** : Tester un paiement et vérifier que les redirections fonctionnent
- ✅ **Webhooks** : Vérifier que les webhooks Orange Money arrivent correctement

## Différences entre environnements

### Production
```bash
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

### Preview (Pull Requests)
```bash
# Option 1 : Utiliser l'URL Vercel de la preview
NEXT_PUBLIC_APP_URL=https://votre-projet-git-branch.vercel.app

# Option 2 : Utiliser le même domaine (si vous avez un seul domaine)
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

### Development (local)
```bash
# Pour le développement local, utilisez localhost ou ngrok
NEXT_PUBLIC_APP_URL=http://localhost:3000
# OU si vous utilisez ngrok
NEXT_PUBLIC_APP_URL=https://votre-url-ngrok.ngrok.io
```

## Problèmes courants

### 1. Les redirections ne fonctionnent pas

**Symptôme** : Les redirections après paiement ou confirmation d'email ne fonctionnent pas.

**Solution** :
- Vérifier que `NEXT_PUBLIC_APP_URL` est bien définie dans Vercel
- Vérifier que la valeur est correcte (avec `https://`, sans slash final)
- Redéployer l'application après avoir ajouté/modifié la variable

### 2. Orange Money rejette les URLs

**Symptôme** : Erreur "Invalid body field" ou "Invalid URL" de la part d'Orange Money.

**Solution** :
- Vérifier que `NEXT_PUBLIC_APP_URL` pointe vers votre domaine personnalisé (pas `localhost` ou `127.0.0.1`)
- Vérifier que l'URL est accessible publiquement
- Vérifier que l'URL utilise `https://` (Orange Money peut exiger HTTPS)

### 3. La variable n'est pas accessible côté client

**Symptôme** : `process.env.NEXT_PUBLIC_APP_URL` est `undefined` dans le navigateur.

**Solution** :
- Vérifier que le nom de la variable commence par `NEXT_PUBLIC_` (obligatoire pour les variables accessibles côté client)
- Redémarrer le serveur de développement après avoir ajouté la variable
- Redéployer sur Vercel après avoir ajouté la variable

## Bonnes pratiques

1. **Utiliser un domaine personnalisé** : Plus professionnel et stable
2. **HTTPS obligatoire** : Toujours utiliser `https://` en production
3. **Pas de slash final** : Ne pas mettre de `/` à la fin de l'URL
4. **Variables par environnement** : Configurer différentes valeurs pour Production, Preview, et Development si nécessaire
5. **Ne pas commiter les secrets** : Les variables d'environnement ne doivent jamais être dans le code source

## Exemple de configuration complète

Dans Vercel Dashboard → Settings → Environment Variables :

```
✅ NEXT_PUBLIC_SUPABASE_URL
   Production: https://xxxxx.supabase.co
   Preview: https://xxxxx.supabase.co
   Development: http://localhost:54321

✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   Production: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Development: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ SUPABASE_SERVICE_ROLE_KEY
   Production: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Development: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ NEXT_PUBLIC_APP_URL
   Production: https://vbsniperacademie.com
   Preview: https://vbsniperacademie.com
   Development: http://localhost:3000

✅ ORANGE_MONEY_ACCESS_TOKEN
   Production: votre_token_production
   Preview: votre_token_sandbox (si différent)
   Development: votre_token_sandbox

✅ ORANGE_MONEY_MERCHANT_KEY
   Production: votre_merchant_key_production
   Preview: votre_merchant_key_sandbox
   Development: votre_merchant_key_sandbox

✅ ORANGE_MONEY_ENV
   Production: production
   Preview: sandbox
   Development: sandbox

✅ ORANGE_MONEY_COUNTRY_CODE
   Production: CI
   Preview: CI
   Development: CI
```

## Ressources

- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Next.js - Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Guide Orange Money](ORANGE_MONEY_SETUP.md)
- [Guide Supabase](CONFIGURER_SERVICE_ROLE.md)

