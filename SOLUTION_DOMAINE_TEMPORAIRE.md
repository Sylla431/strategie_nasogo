# Solution temporaire : Utiliser l'URL Vercel

## Problème

Le domaine `vbsniperacademie.com` n'est pas encore configuré dans le DNS (erreur NXDOMAIN).

## Solution immédiate : Utiliser l'URL Vercel

En attendant la configuration du domaine, vous pouvez utiliser l'URL Vercel automatique.

### Étape 1 : Trouver votre URL Vercel

1. Aller sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet
3. L'URL est affichée dans la section **Deployments** ou **Overview**
   - Format : `votre-projet.vercel.app` ou `votre-projet-git-username.vercel.app`

### Étape 2 : Configurer NEXT_PUBLIC_APP_URL

1. Dans Vercel Dashboard → **Settings** → **Environment Variables**
2. Ajouter ou modifier la variable :
   - **Name** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://votre-projet.vercel.app` (remplacer par votre URL Vercel)
   - **Environments** : Production, Preview, Development
3. Cliquer sur **Save**

### Étape 3 : Redéployer

1. Aller dans **Deployments**
2. Cliquer sur les trois points (⋯) du dernier déploiement
3. Sélectionner **Redeploy**
4. Ou faire un nouveau commit pour déclencher un redéploiement

### Étape 4 : Tester

Une fois redéployé, votre site sera accessible sur `https://votre-projet.vercel.app`

## Configuration pour le développement local

Dans votre fichier `.env.local` :

```env
# Pour le développement local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OU si vous utilisez ngrok pour tester Orange Money
NEXT_PUBLIC_APP_URL=https://votre-url-ngrok.ngrok.io
```

## Quand configurer le domaine personnalisé

Une fois que vous avez :
1. ✅ Acheté/enregistré le domaine `vbsniperacademie.com`
2. ✅ Configuré les DNS chez votre registrar
3. ✅ Ajouté le domaine dans Vercel

Alors vous pourrez :
1. Mettre à jour `NEXT_PUBLIC_APP_URL` avec `https://vbsniperacademie.com`
2. Redéployer

## Vérification

Pour vérifier que votre URL Vercel fonctionne :

```bash
# Remplacer par votre URL Vercel
curl -I https://votre-projet.vercel.app
```

Vous devriez recevoir une réponse `200 OK`.

## Important

- ⚠️ L'URL Vercel peut changer si vous supprimez et recréez le projet
- ✅ Pour la production, configurez un domaine personnalisé dès que possible
- ✅ Le domaine personnalisé est plus professionnel et stable

