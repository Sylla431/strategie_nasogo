# Intégration PayTech et Moneroo

Ce document explique comment utiliser les nouveaux providers de paiement PayTech et Moneroo qui ont été intégrés dans l'application.

## 📋 Fichiers créés

### Migrations SQL
- `supabase/migrations/add_paytech_moneroo_payment_methods.sql` - Ajoute `paytech` et `moneroo` aux options de `payment_method`

### Librairies
- `src/lib/paytech.ts` - Fonctions pour interagir avec l'API PayTech
- `src/lib/moneroo.ts` - Fonctions pour interagir avec l'API Moneroo

### Routes API
- `src/app/api/payments/paytech/initiate/route.ts` - Initie un paiement PayTech
- `src/app/api/payments/paytech/webhook/route.ts` - Webhook pour les notifications PayTech
- `src/app/api/payments/moneroo/initiate/route.ts` - Initie un paiement Moneroo
- `src/app/api/payments/moneroo/webhook/route.ts` - Webhook pour les notifications Moneroo

### Fichiers modifiés
- `src/app/api/orders/route.ts` - Routage vers le bon provider selon `payment_method`
- `src/app/services/strategie-nasongon/page.tsx` - Ajout des options PayTech et Moneroo dans l'interface

## 🔧 Configuration

### Variables d'environnement requises

#### Pour PayTech
```env
PAYTECH_API_KEY=votre_api_key_paytech
PAYTECH_API_SECRET=votre_api_secret_paytech
PAYTECH_ENV=test  # ou "prod" (production nécessite activation du compte)
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

**Important** : 
- En mode `test`, seul un montant aléatoire entre 100 et 150 CFA sera débité, peu importe le montant réel
- Pour passer en production (`prod`), votre compte doit être activé par PayTech (contact: contact@paytech.sn)

#### Pour Moneroo
```env
MONEROO_SECRET_KEY=votre_secret_key_moneroo
# Si PayTech est configuré comme passerelle dans Moneroo
MONEROO_WEBHOOK_URL=https://votre-domaine.com/api/payments/moneroo/webhook
MONEROO_WEBHOOK_SECRET=votre_secret_webhook_moneroo
```

**Important** :
- Pour le développement/test, utilisez une **clé sandbox** (commence par `test_`)
- Pour la production, utilisez une **clé live** depuis votre dashboard Moneroo
- Les clés sandbox sont disponibles dans la section **Developer** > **API Keys** du dashboard Moneroo
- Ne confondez pas la **clé publique** (Public Key) avec la **clé secrète** (Secret Key) - seule la clé secrète fonctionne pour les appels API backend

**Note importante** : Si vous avez configuré PayTech comme passerelle de paiement dans Moneroo, vous devez :
1. Récupérer le `webhook_url` et le `secret du webhook` depuis le dashboard Moneroo
2. Configurer `MONEROO_WEBHOOK_URL` avec l'URL fournie par Moneroo (ou votre propre URL HTTPS)
3. Configurer `MONEROO_WEBHOOK_SECRET` avec le secret fourni par Moneroo pour vérifier les webhooks

### Application de la migration SQL

Exécutez la migration dans Supabase pour ajouter les nouveaux `payment_method` :

```sql
-- Via Supabase Dashboard > SQL Editor
-- Ou via CLI: supabase migration up
```

Le fichier de migration se trouve dans : `supabase/migrations/add_paytech_moneroo_payment_methods.sql`

## 🚀 Utilisation

### Pour les utilisateurs

Les utilisateurs peuvent maintenant choisir entre :
- **Mobile Money (Orange money)** - Orange Money (existant)
- **PayTech** - Nouveau provider
- **Moneroo** - Nouveau provider

### Flux de paiement

1. L'utilisateur sélectionne un moyen de paiement sur la page de service
2. Une commande est créée avec le `payment_method` correspondant
3. Le système route automatiquement vers le bon endpoint API
4. L'utilisateur est redirigé vers la page de paiement du provider
5. Après paiement, le webhook met à jour le statut et accorde l'accès automatiquement

## 🔐 Webhooks

### Configuration des webhooks

#### PayTech
- URL du webhook : `https://votre-domaine.com/api/payments/paytech/webhook`
- Configurez cette URL dans votre dashboard PayTech (paramètre `ipn_url` lors de la création du paiement)
- Le webhook vérifie l'authenticité via deux méthodes :
  1. **HMAC-SHA256** (recommandée) : via le champ `hmac_compute` dans le payload
  2. **SHA256** (classique) : via `api_key_sha256` et `api_secret_sha256` dans le payload
- Les deux méthodes utilisent `PAYTECH_API_KEY` et `PAYTECH_API_SECRET` pour la vérification

#### Moneroo
- URL du webhook : `https://votre-domaine.com/api/payments/moneroo/webhook`
- Configurez cette URL dans votre dashboard Moneroo
- **Si PayTech est utilisé comme passerelle dans Moneroo** :
  - Le `webhook_url` et le `secret du webhook` sont disponibles dans les paramètres de la passerelle PayTech dans Moneroo
  - Utilisez `MONEROO_WEBHOOK_SECRET` pour vérifier l'authenticité des webhooks
  - Le webhook vérifie la signature HMAC-SHA256 avec le secret fourni par Moneroo
- Le webhook vérifie automatiquement les signatures selon le format Moneroo ou PayTech

## ✅ Fonctionnalités

### Accès automatique au cours

Comme pour Orange Money, les paiements réussis via PayTech et Moneroo accordent automatiquement l'accès au cours en utilisant la fonction SQL `grant_course_access_automatic`.

### Gestion des échecs

Les paiements échoués mettent automatiquement le statut de la commande à `failed` et stockent les informations dans `payment_reference`.

## 📝 Notes importantes

1. **Vérification des signatures PayTech** : 
   - La fonction `verifyWebhookSignature` dans `paytech.ts` implémente les deux méthodes de vérification selon la documentation officielle PayTech
   - Méthode HMAC-SHA256 (recommandée) : vérifie le champ `hmac_compute`
   - Méthode SHA256 (classique) : vérifie `api_key_sha256` et `api_secret_sha256`
   - Les deux méthodes sont automatiquement utilisées selon ce qui est disponible dans le payload

2. **Format des réponses PayTech** : 
   - La réponse de l'API PayTech contient `success` (1 = succès, -1 = erreur)
   - L'URL de redirection est dans `redirect_url` ou `redirectUrl`
   - Le token de paiement est dans `token`

3. **Code Orange Money inchangé** : Le code Orange Money existant n'a pas été modifié, garantissant la compatibilité avec les paiements existants.

4. **Documentation officielle PayTech** : 
   - Documentation : https://doc.intech.sn/doc_paytech.php
   - Collection Postman : https://doc.intech.sn/PayTech%20x%20DOC.postman_collection.json
   - L'intégration est basée exclusivement sur ces sources officielles

## 🔍 Dépannage

### Erreur "payment_method invalide"
- Vérifiez que la migration SQL a été appliquée
- Vérifiez que le `payment_method` envoyé est bien `paytech` ou `moneroo`

### Erreur "Configuration manquante"
- Vérifiez que les variables d'environnement sont définies
- Pour PayTech : `PAYTECH_API_KEY` et `PAYTECH_API_SECRET` (pas `PAYTECH_SIGNING_KEY`)
- Pour Moneroo : `MONEROO_SECRET_KEY`
- Si PayTech est utilisé comme passerelle dans Moneroo : `MONEROO_WEBHOOK_SECRET` (récupéré depuis le dashboard Moneroo)

### Webhook ne fonctionne pas
- Vérifiez que l'URL du webhook est correctement configurée dans le dashboard du provider
- Vérifiez que `NEXT_PUBLIC_APP_URL` est correctement défini
- Consultez les logs serveur pour voir les erreurs de webhook

## 📚 Documentation

- **PayTech** : 
  - Documentation officielle : https://doc.intech.sn/doc_paytech.php
  - Collection Postman : https://doc.intech.sn/PayTech%20x%20DOC.postman_collection.json
  - URL de base API : `https://paytech.sn/api`
  - Headers requis : `API_KEY` et `API_SECRET`
- **Moneroo** : 
  - Documentation officielle : https://docs.moneroo.io/
  - Standard Integration : https://docs.moneroo.io/payments/standard-integration
  - Endpoint d'initialisation : `POST /v1/payments/initialize`
  - Format de réponse : `{ message: "...", data: { id: "...", checkout_url: "..." } }`
  - Statut de succès : `201` (Created)
