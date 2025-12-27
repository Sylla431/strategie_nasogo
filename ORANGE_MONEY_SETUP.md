# Configuration Orange Money WebPayment API

## Variables d'environnement requises

Ajoutez les variables suivantes à votre fichier `.env.local` :

```env
# Orange Money API Configuration
# Obtenez ces valeurs depuis https://developer.orange.com/myapps
ORANGE_MONEY_ACCESS_TOKEN=your_access_token
ORANGE_MONEY_MERCHANT_KEY=your_merchant_key
# Code OTP Requestor (si requis par votre configuration)
# Voir COMMENT_OBTENIR_OTP_REQUESTOR.md pour plus de détails
ORANGE_MONEY_OTP_REQUESTOR=your_otp_requestor_code

# Environnement (sandbox ou production)
ORANGE_MONEY_ENV=sandbox
# Code pays pour production (ex: "ml" pour Mali, "sn" pour Sénégal)
ORANGE_MONEY_COUNTRY_CODE=dev

# Application URL (pour les URLs de retour)
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

## Obtention des identifiants

### 1. Créer une application
1. Connectez-vous à https://developer.orange.com/myapps
2. Créez une nouvelle application

### 2. Ajouter l'API Orange Money WebPayDev
1. Ajoutez l'API "Orange Money WebPayDev" à votre application
2. Entrez votre **Merchant Account Number** (ex: 7701900100)
3. Entrez votre **Merchant Code** (ex: 101021)
4. Générez votre **Merchant Key** (à stocker dans `ORANGE_MONEY_MERCHANT_KEY`)
5. Récupérez votre **OTP Requestor** (si requis, voir `COMMENT_OBTENIR_OTP_REQUESTOR.md`)

### 3. Obtenir l'Access Token
1. Utilisez l'endpoint OAuth2.0 :
   ```
   POST https://api.orange.com/oauth/v3/token
   ```
2. Avec vos credentials (Client ID, Client Secret)
3. Récupérez l'`access_token` (valide ~90 jours)
4. Stockez-le dans `ORANGE_MONEY_ACCESS_TOKEN`

**Note** : L'access_token expire après ~90 jours. Vous devrez en générer un nouveau si nécessaire.

**Si vous recevez l'erreur "Expired credentials" (401)**, consultez `REGENERER_ACCESS_TOKEN.md` pour régénérer un nouveau token.

## Configuration des URLs

### Webhook (notif_url)
L'URL de webhook est envoyée dans chaque requête d'initiation de paiement :
```
https://vbsniperacademie.com/api/payments/webhook
```

### URLs de retour
- **return_url** : `https://vbsniperacademie.com/payment/success?order_id={orderId}`
- **cancel_url** : `https://vbsniperacademie.com/payment/cancel?order_id={orderId}`

**Important** : Ces URLs sont limitées à 120 caractères maximum.

## Format des données

### Initiation de paiement
- `order_id` : Maximum 30 caractères, doit être unique
- `reference` : Maximum 30 caractères (nom du marchand)
- `return_url`, `cancel_url`, `notif_url` : Maximum 120 caractères
- `currency` : "OUV" pour sandbox, code pays pour production (ex: "XOF")

### Webhook (Notification)
Le webhook reçoit :
```json
{
  "status": "SUCCESS" | "FAILED",
  "notif_token": "...",
  "txnid": "..."
}
```

Le `notif_token` doit correspondre à celui reçu lors de l'initiation du paiement.

## Test avec le Sandbox

1. Utilisez le simulateur USSD : https://mpayment.orange-money.com/mpayment-otp/login
2. Connectez-vous avec :
   - Login : Merchant Account Number (ex: 7701900100)
   - Password : Channel User ID (ex: MerchantWP00100)
3. Demandez un OTP avec le PIN du subscriber
4. Utilisez l'OTP dans la page de paiement Orange Money

## Statuts de transaction

- **INITIATED** : En attente d'entrée utilisateur
- **PENDING** : Utilisateur a cliqué sur "Confirmer", transaction en cours
- **EXPIRED** : Token expiré (validité par défaut : 10 minutes)
- **SUCCESS** : Paiement réussi
- **FAILED** : Paiement échoué

## Notes importantes

- Les montants doivent être en **FCFA (XOF)** en production, **OUV** en sandbox
- Le webhook doit être accessible publiquement (pas de localhost)
- En développement, utilisez ngrok pour exposer votre webhook localement
- Le `notif_token` est utilisé pour vérifier l'authenticité des notifications
- L'`order_id` doit être unique dans le système Orange Money

## Documentation supplémentaire

- **Comment obtenir les codes de paiement** : Voir `COMMENT_OBTENIR_CODES_PAIEMENT.md`
- **Comment obtenir le code OTP Requestor** : Voir `COMMENT_OBTENIR_OTP_REQUESTOR.md`
- **Quel numéro de téléphone pour confirmer le paiement** : Voir `CONFIRMATION_PAIEMENT_ORANGE_MONEY.md`

