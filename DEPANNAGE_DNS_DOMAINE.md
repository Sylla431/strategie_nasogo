# Dépannage : Erreur DNS pour vbsniperacademie.com

## Erreur rencontrée

```
DNS_PROBE_FINISHED_NXDOMAIN
Ce site est inaccessible
Vérifiez si l'adresse vbsniperacademie.com est correcte.
```

## Causes possibles

1. **Le domaine n'est pas encore configuré dans Vercel**
2. **Les enregistrements DNS ne pointent pas vers Vercel**
3. **Le domaine n'est pas encore acheté/enregistré**
4. **Propagation DNS en cours** (peut prendre jusqu'à 48h)

## Solutions

### Solution 1 : Vérifier que le domaine est configuré dans Vercel

1. Aller sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Settings** → **Domains**
4. Vérifier si `vbsniperacademie.com` est listé
5. Si non, cliquer sur **Add Domain** et ajouter le domaine

### Solution 2 : Configurer les enregistrements DNS

Si le domaine est ajouté dans Vercel, vous devez configurer les DNS chez votre registrar :

1. **Dans Vercel** :
   - Aller dans **Settings** → **Domains**
   - Cliquer sur votre domaine
   - Vercel vous donnera les enregistrements DNS à ajouter

2. **Chez votre registrar** (ex: Namecheap, GoDaddy, OVH, etc.) :
   - Aller dans la gestion DNS de votre domaine
   - Ajouter les enregistrements fournis par Vercel :
     - **Type A** : Pointant vers l'IP de Vercel
     - **Type CNAME** : Pour le www (si nécessaire)
     - **Type TXT** : Pour la vérification (si nécessaire)

3. **Exemple d'enregistrements DNS** :
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

### Solution 3 : Utiliser l'URL Vercel temporairement

En attendant que le domaine soit configuré, vous pouvez utiliser l'URL Vercel automatique :

1. **Trouver l'URL Vercel** :
   - Aller dans **Deployments** dans Vercel
   - L'URL est affichée (ex: `votre-projet.vercel.app`)

2. **Mettre à jour `NEXT_PUBLIC_APP_URL`** :
   - Dans Vercel → **Settings** → **Environment Variables**
   - Modifier `NEXT_PUBLIC_APP_URL` avec l'URL Vercel :
     ```
     NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app
     ```

3. **Redéployer** l'application

### Solution 4 : Pour le développement local

Si vous testez en local, utilisez `localhost` :

1. **Dans `.env.local`** :
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

## Vérification étape par étape

### Étape 1 : Vérifier que le domaine existe

```bash
# Dans un terminal
nslookup vbsniperacademie.com
```

Si aucune réponse, le domaine n'est pas configuré dans le DNS.

### Étape 2 : Vérifier les enregistrements DNS

Utiliser un outil en ligne comme :
- [whatsmydns.net](https://www.whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)

Entrer `vbsniperacademie.com` et vérifier les enregistrements A et CNAME.

### Étape 3 : Vérifier dans Vercel

1. Aller dans **Settings** → **Domains**
2. Vérifier le statut du domaine :
   - ✅ **Valid Configuration** : Le domaine est bien configuré
   - ⚠️ **Pending** : En attente de configuration DNS
   - ❌ **Invalid Configuration** : Les DNS ne sont pas corrects

## Configuration complète du domaine sur Vercel

### 1. Ajouter le domaine

1. Vercel Dashboard → **Settings** → **Domains**
2. Cliquer sur **Add Domain**
3. Entrer `vbsniperacademie.com`
4. Cliquer sur **Add**

### 2. Configurer les DNS

Vercel vous donnera les enregistrements à ajouter. Exemple :

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. Attendre la propagation

- La propagation DNS peut prendre de **quelques minutes à 48 heures**
- Utiliser [whatsmydns.net](https://www.whatsmydns.net/) pour vérifier la propagation

### 4. Vérifier le certificat SSL

Vercel configure automatiquement le certificat SSL (HTTPS). Attendre que le statut soit **Valid**.

## Solutions temporaires

### Option A : Utiliser l'URL Vercel

En attendant la configuration du domaine :

1. Utiliser `https://votre-projet.vercel.app` comme URL principale
2. Mettre à jour `NEXT_PUBLIC_APP_URL` dans Vercel
3. Redéployer

### Option B : Utiliser un sous-domaine

Si vous avez un autre domaine fonctionnel, vous pouvez utiliser un sous-domaine :

1. Ajouter `app.vbsniperacademie.com` dans Vercel
2. Configurer les DNS pour le sous-domaine
3. Mettre à jour `NEXT_PUBLIC_APP_URL` avec le sous-domaine

## Vérification après configuration

Une fois le domaine configuré, vérifier :

1. ✅ Le site est accessible sur `https://vbsniperacademie.com`
2. ✅ Le certificat SSL est valide (cadenas vert dans le navigateur)
3. ✅ `NEXT_PUBLIC_APP_URL` est configurée avec `https://vbsniperacademie.com`
4. ✅ Les redirections fonctionnent (confirmation email, paiements, etc.)

## Problèmes courants

### Le domaine est configuré mais ne fonctionne pas

1. Vérifier que les DNS pointent bien vers Vercel
2. Attendre la propagation DNS (peut prendre jusqu'à 48h)
3. Vérifier que le certificat SSL est valide dans Vercel

### Erreur "Domain not found" dans Vercel

- Le domaine n'est pas encore ajouté dans Vercel
- Ajouter le domaine dans **Settings** → **Domains**

### Le domaine fonctionne mais pas le www

- Configurer le CNAME pour `www` pointant vers Vercel
- Ou configurer une redirection dans Vercel

## Support

Si le problème persiste :

1. Vérifier les logs Vercel pour les erreurs
2. Contacter le support Vercel si nécessaire
3. Vérifier avec votre registrar que le domaine est bien actif

## Ressources

- [Documentation Vercel - Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Vérification DNS](https://www.whatsmydns.net/)
- [Guide Vercel Environment Variables](CONFIGURER_VERCEL_ENV.md)

