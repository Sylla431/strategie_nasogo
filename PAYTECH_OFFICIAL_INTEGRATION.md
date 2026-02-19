# Intégration PayTech - Documentation Officielle

Ce document décrit l'intégration PayTech basée **exclusivement** sur la documentation officielle PayTech.

## 📚 Sources Officielles

- **Documentation** : https://doc.intech.sn/doc_paytech.php
- **Collection Postman** : https://doc.intech.sn/PayTech%20x%20DOC.postman_collection.json

## 🔄 Changements Majeurs par Rapport à l'Ancienne Implémentation

### 1. URL de Base API

**Avant** :
- Sandbox: `https://engine-sandbox.pay.tech`
- Production: `https://engine.pay.tech`

**Maintenant** (selon documentation officielle) :
- **URL unique** : `https://paytech.sn/api`
- L'environnement est géré via le paramètre `env` dans le body (`test` ou `prod`)

### 2. Authentification

**Avant** :
```typescript
headers: {
  "Authorization": `Bearer ${apiKey}`,
}
```

**Maintenant** (selon documentation officielle) :
```typescript
headers: {
  "API_KEY": apiKey,
  "API_SECRET": apiSecret,
}
```

### 3. Endpoint d'Initiation

**Avant** :
- Endpoint : `/api/v1/payments`
- Méthode : POST

**Maintenant** (selon documentation officielle) :
- Endpoint : `/payment/request-payment`
- Méthode : POST
- URL complète : `https://paytech.sn/api/payment/request-payment`

### 4. Paramètres de Requête

**Avant** :
```typescript
{
  amount: number,
  currency: string,
  order_id: string,
  return_url: string,
  cancel_url: string,
  webhook_url: string,
  customer_email?: string,
  customer_phone?: string,
  description?: string,
}
```

**Maintenant** (selon documentation officielle) :
```typescript
{
  item_name: string,        // Obligatoire
  item_price: number,       // Obligatoire (montant en FCFA)
  ref_command: string,      // Obligatoire (référence unique)
  command_name: string,     // Obligatoire
  currency?: string,        // Optionnel (défaut: XOF)
  env?: string,             // Optionnel (test ou prod, défaut: prod)
  ipn_url?: string,         // Optionnel (URL de notification)
  success_url?: string,     // Optionnel
  cancel_url?: string,     // Optionnel
  custom_field?: string,    // Optionnel (JSON encodé)
  target_payment?: string,  // Optionnel (méthode ciblée)
  refund_notif_url?: string // Optionnel
}
```

### 5. Format de Réponse

**Avant** :
```typescript
{
  status: number,
  message?: string,
  payment_id?: string,
  redirectUrl?: string,
}
```

**Maintenant** (selon documentation officielle) :
```typescript
{
  success: number,        // 1 = succès, -1 = erreur
  token?: string,         // Token de paiement
  redirect_url?: string,  // URL de redirection
  redirectUrl?: string,   // Alias de redirect_url
  message?: string,       // Message d'erreur si success = -1
}
```

### 6. Webhook/IPN

**Avant** :
- Format JSON simple avec `status`, `order_id`, `signature`
- Vérification via `x-paytech-signature` header

**Maintenant** (selon documentation officielle) :
- Format POST (form-data ou JSON)
- Types d'événements : `sale_complete`, `sale_canceled`, `refund_complete`, `transfer_success`, `transfer_failed`
- Vérification via deux méthodes :
  1. **HMAC-SHA256** (recommandée) : champ `hmac_compute` dans le payload
  2. **SHA256** (classique) : champs `api_key_sha256` et `api_secret_sha256` dans le payload
- `custom_field` est encodé en Base64 et doit être décodé

### 7. Variables d'Environnement

**Avant** :
```env
PAYTECH_API_KEY=...
PAYTECH_SIGNING_KEY=...
PAYTECH_ENV=production
```

**Maintenant** (selon documentation officielle) :
```env
PAYTECH_API_KEY=...        # Clé API PayTech
PAYTECH_API_SECRET=...     # Clé secrète PayTech (pas SIGNING_KEY)
PAYTECH_ENV=test           # ou "prod" (production nécessite activation)
NEXT_PUBLIC_APP_URL=...    # URL de base de l'application
```

## ✅ Fonctionnalités Implémentées

### 1. Initiation de Paiement (`src/lib/paytech.ts`)

- ✅ Appel API selon documentation officielle
- ✅ Headers `API_KEY` et `API_SECRET`
- ✅ Gestion des paramètres obligatoires et optionnels
- ✅ Support de `target_payment` pour cibler des méthodes spécifiques
- ✅ Support de `custom_field` pour données additionnelles
- ✅ Gestion des environnements `test` et `prod`

### 2. Vérification Webhook (`src/lib/paytech.ts`)

- ✅ Vérification HMAC-SHA256 (méthode recommandée)
- ✅ Vérification SHA256 (méthode classique)
- ✅ Décodage automatique de `custom_field` depuis Base64
- ✅ Support des événements de paiement et de transfer

### 3. Route d'Initiation (`src/app/api/payments/paytech/initiate/route.ts`)

- ✅ Récupération de la commande et vérification utilisateur
- ✅ Construction des paramètres selon format PayTech
- ✅ Génération de `ref_command` unique
- ✅ Encodage de `custom_field` avec données de commande
- ✅ Mise à jour de la commande avec token PayTech
- ✅ Retour de l'URL de redirection

### 4. Route Webhook (`src/app/api/payments/paytech/webhook/route.ts`)

- ✅ Support form-data et JSON
- ✅ Vérification d'authenticité via `verifyWebhookSignature`
- ✅ Traitement des événements :
  - `sale_complete` : mise à jour statut `paid`, accès automatique au cours
  - `sale_canceled` : mise à jour statut `failed`
  - `refund_complete` : mise à jour statut `refunded`
- ✅ Gestion des promotions (si `promo_enabled`)
- ✅ Décodage de `custom_field` pour récupérer `order_id`
- ✅ Recherche de commande par `ref_command` ou `order_id`

## 🔐 Sécurité

### Vérification des Webhooks

PayTech propose deux méthodes de vérification :

#### Méthode 1 : HMAC-SHA256 (Recommandée)

```typescript
// Pour paiements: message = amount|ref_command|api_key
// Pour transfers: message = amount|id_transfer|api_key
const message = `${final_item_price}|${ref_command}|${apiKey}`;
const expectedHmac = crypto
  .createHmac("sha256", apiSecret)
  .update(message)
  .digest("hex");
```

#### Méthode 2 : SHA256 (Classique)

```typescript
const expectedApiKeyHash = crypto
  .createHash("sha256")
  .update(apiKey)
  .digest("hex");
const expectedApiSecretHash = crypto
  .createHash("sha256")
  .update(apiSecret)
  .digest("hex");
```

## 📋 Configuration Requise

### Variables d'Environnement

```env
# PayTech
PAYTECH_API_KEY=votre_api_key
PAYTECH_API_SECRET=votre_api_secret
PAYTECH_ENV=test  # ou "prod" (production nécessite activation)

# Application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
# Optionnel: URL HTTPS pour les webhooks en développement local (ex: tunnel ngrok)
PAYTECH_WEBHOOK_URL=https://votre-tunnel-ngrok.ngrok.io

# Supabase (pour webhooks)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Important pour le développement local** :
- PayTech exige **HTTPS** pour les webhooks (`ipn_url` et `refund_notif_url`)
- En développement local avec `http://localhost:3000`, les webhooks ne seront pas configurés automatiquement
- Pour tester les webhooks en local, utilisez un tunnel HTTPS comme **ngrok** :
  1. Installez ngrok : `npm install -g ngrok` ou téléchargez depuis https://ngrok.com
  2. Lancez votre serveur local : `npm run dev`
  3. Dans un autre terminal : `ngrok http 3000`
  4. Copiez l'URL HTTPS fournie par ngrok (ex: `https://abc123.ngrok.io`)
  5. Définissez `PAYTECH_WEBHOOK_URL=https://abc123.ngrok.io` dans votre `.env.local`
- En production, utilisez toujours votre domaine HTTPS dans `NEXT_PUBLIC_APP_URL`

### Configuration Webhook dans PayTech Dashboard

1. Connectez-vous à votre dashboard PayTech
2. Allez dans **Paramètres** > **API**
3. Configurez l'URL du webhook : `https://votre-domaine.com/api/payments/paytech/webhook`
4. Cette URL sera également utilisée automatiquement via le paramètre `ipn_url` lors de l'initiation

## 🧪 Tests

### Mode Test (Sandbox)

- Paramètre `env: "test"` dans la requête
- Montant débité : aléatoire entre 100 et 150 CFA (peu importe le montant réel)
- Disponible immédiatement pour tous les comptes

### Mode Production

- Paramètre `env: "prod"` dans la requête
- Montant débité : montant exact de la transaction
- **Nécessite activation du compte** par PayTech
- Contact : contact@paytech.sn avec documents requis

## 📝 Exemples d'Utilisation

### Initiation de Paiement

```typescript
import { initiatePayment } from "@/lib/paytech";

const result = await initiatePayment({
  item_name: "Formation Premium",
  item_price: 50000,
  ref_command: `CMD_${Date.now()}_${orderId}`,
  command_name: "Paiement Formation Premium via PayTech",
  currency: "XOF",
  env: "test",
  ipn_url: "https://votre-domaine.com/api/payments/paytech/webhook",
  success_url: "https://votre-domaine.com/payment/success",
  cancel_url: "https://votre-domaine.com/payment/cancel",
  custom_field: JSON.stringify({ order_id: orderId, user_id: userId }),
  target_payment: "Orange Money", // Optionnel
});

if (result.success === 1) {
  // Rediriger vers result.redirect_url
}
```

### Traitement Webhook

Le webhook traite automatiquement :
- `sale_complete` : met à jour le statut, accorde l'accès au cours
- `sale_canceled` : met à jour le statut en `failed`
- `refund_complete` : met à jour le statut en `refunded`

## 🔍 Dépannage

### Erreur "success !== 1"

- Vérifiez que `PAYTECH_API_KEY` et `PAYTECH_API_SECRET` sont corrects
- Vérifiez que le compte est activé si vous utilisez `env: "prod"`
- Consultez le message d'erreur dans `result.message`

### Webhook non reçu

- Vérifiez que l'URL du webhook est accessible publiquement (HTTPS requis)
- Vérifiez que `NEXT_PUBLIC_APP_URL` est correctement configuré
- Vérifiez les logs serveur pour voir les requêtes reçues

### Signature invalide

- Vérifiez que `PAYTECH_API_KEY` et `PAYTECH_API_SECRET` correspondent à ceux utilisés lors de l'initiation
- Vérifiez que les deux méthodes de vérification (HMAC et SHA256) sont testées

## 📚 Références

- Documentation officielle : https://doc.intech.sn/doc_paytech.php
- Collection Postman : https://doc.intech.sn/PayTech%20x%20DOC.postman_collection.json
- Support PayTech : contact@paytech.sn
