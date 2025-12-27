# Adaptation Orange Money API selon la documentation

## Informations nécessaires du document "NEWGuide d'utilisation API webpayment.docx"

Pour adapter complètement le code, j'ai besoin des informations suivantes du document :

### 1. Configuration de base
- [ ] URL de base de l'API (ex: `https://api.orange.com/webpayment/v1/...`)
- [ ] URL de l'environnement sandbox (si différent)
- [ ] URL de l'environnement production

### 2. Endpoint d'initiation de paiement
- [ ] Chemin exact de l'endpoint (ex: `/payment/initiate`, `/webpay/initiate`, `/api/payment`)
- [ ] Méthode HTTP (POST, GET, etc.)
- [ ] Format de la requête :
  - [ ] Structure JSON exacte
  - [ ] Champs obligatoires
  - [ ] Champs optionnels
  - [ ] Format des montants (entier, décimal, etc.)
  - [ ] Format des URLs (retour, annulation, webhook)
- [ ] Format de la réponse :
  - [ ] Nom exact du champ contenant l'URL de paiement
  - [ ] Nom exact du champ contenant l'ID de transaction
  - [ ] Structure des erreurs

### 3. Authentification
- [ ] Méthode d'authentification :
  - [ ] Bearer token dans header Authorization
  - [ ] API Key dans header personnalisé
  - [ ] Autre méthode
- [ ] Nom du header (si API Key)
- [ ] Format du token/clef

### 4. Webhook
- [ ] Structure du payload reçu
- [ ] Champs contenus dans le webhook
- [ ] Méthode de vérification de signature :
  - [ ] Algorithme (SHA256, HMAC-SHA256, etc.)
  - [ ] Ordre des champs dans la chaîne à signer
  - [ ] Format de la signature (hex, base64, etc.)
  - [ ] Header contenant la signature (si applicable)

### 5. Vérification de statut (si disponible)
- [ ] Endpoint pour vérifier le statut d'une transaction
- [ ] Méthode HTTP
- [ ] Format de la réponse

### 6. Codes de statut
- [ ] Liste des statuts possibles (SUCCESS, FAILED, PENDING, etc.)
- [ ] Codes d'erreur et leurs significations

## Fichiers à adapter

Une fois les informations fournies, les fichiers suivants seront adaptés :

1. `src/lib/orangeMoney.ts` - Fonctions principales de l'API
2. `src/app/api/payments/webhook/route.ts` - Handler de webhook
3. `src/app/api/payments/orange-money/initiate/route.ts` - Initiation de paiement
4. `ORANGE_MONEY_SETUP.md` - Documentation de configuration

## Comment fournir les informations

Vous pouvez :
1. Copier-coller les sections pertinentes du document Word
2. Me donner les endpoints exacts et formats
3. Me fournir un exemple de requête/réponse de la documentation

Une fois ces informations fournies, je pourrai adapter le code immédiatement.


