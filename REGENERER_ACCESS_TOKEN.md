# Comment régénérer l'Access Token Orange Money

## Problème

Vous recevez l'erreur :
```
status: 401
code: 42
message: 'Expired credentials'
description: 'The requested service needs credentials, and the ones provided were out-of-date'
```

Cela signifie que votre `ORANGE_MONEY_ACCESS_TOKEN` a expiré (les tokens expirent après ~90 jours).

## Solution : Régénérer un nouveau token

### Méthode 1 : Via curl (ligne de commande)

```bash
curl -X POST https://api.orange.com/oauth/v3/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -d "grant_type=client_credentials"
```

**Remplacez** :
- `YOUR_CLIENT_ID` : Votre Client ID depuis https://developer.orange.com/myapps
- `YOUR_CLIENT_SECRET` : Votre Client Secret depuis https://developer.orange.com/myapps

**Exemple** :
```bash
curl -X POST https://api.orange.com/oauth/v3/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'abc123def456:secret789xyz' | base64)" \
  -d "grant_type=client_credentials"
```

**Réponse attendue** :
```json
{
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 7776000
}
```

### Méthode 2 : Via Postman ou un client HTTP

1. **Méthode** : `POST`
2. **URL** : `https://api.orange.com/oauth/v3/token`
3. **Headers** :
   - `Content-Type`: `application/x-www-form-urlencoded`
   - `Authorization`: `Basic <base64(CLIENT_ID:CLIENT_SECRET)>`
4. **Body** (x-www-form-urlencoded) :
   - `grant_type`: `client_credentials`

**Pour générer l'Authorization Basic** :
- Allez sur https://www.base64encode.org/
- Encodez : `YOUR_CLIENT_ID:YOUR_CLIENT_SECRET`
- Utilisez le résultat dans le header `Authorization: Basic <resultat>`

### Méthode 3 : Via Node.js (script)

Créez un fichier `get-token.js` :

```javascript
const https = require('https');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const options = {
  hostname: 'api.orange.com',
  path: '/oauth/v3/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${credentials}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('Nouveau Access Token:');
    console.log(response.access_token);
    console.log('\nExpire dans:', response.expires_in, 'secondes');
    console.log('Expire dans:', Math.round(response.expires_in / 86400), 'jours');
  });
});

req.on('error', (error) => {
  console.error('Erreur:', error);
});

req.write('grant_type=client_credentials');
req.end();
```

Exécutez :
```bash
node get-token.js
```

## Mettre à jour votre configuration

Une fois que vous avez obtenu le nouveau token :

1. **Mettez à jour votre `.env.local`** :
```env
ORANGE_MONEY_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Redémarrez votre serveur** :
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

## Où trouver vos identifiants

1. **Connectez-vous** à https://developer.orange.com/myapps
2. **Sélectionnez votre application** Orange Money
3. **Trouvez** :
   - **Client ID** : Dans la section "Credentials" ou "API Keys"
   - **Client Secret** : Dans la même section (peut être masqué, cliquez sur "Show")

## Vérification

Après avoir mis à jour le token, testez à nouveau le paiement. Les logs devraient montrer :
```
Orange Money API Response: {
  status: 201,  // ✅ Succès au lieu de 401
  data: {
    pay_token: "...",
    payment_url: "...",
    ...
  }
}
```

## Notes importantes

- ⏰ **Durée de validité** : Les tokens expirent après ~90 jours (7776000 secondes)
- 🔄 **Renouvellement** : Régénérez le token avant qu'il n'expire
- 🔒 **Sécurité** : Ne partagez jamais votre Client Secret ou Access Token
- 📝 **Documentation** : Consultez https://developer.orange.com/apis/orange-money-webpay-dev/ pour plus d'informations

## Dépannage

### Erreur "Invalid credentials"
- Vérifiez que votre Client ID et Client Secret sont corrects
- Vérifiez que vous utilisez les bons identifiants pour l'environnement (sandbox vs production)

### Erreur "Invalid grant_type"
- Assurez-vous d'utiliser `grant_type=client_credentials` (exactement comme écrit)

### Erreur de base64
- Vérifiez que le format `CLIENT_ID:CLIENT_SECRET` est correct
- Pas d'espaces avant ou après les deux-points

## Script automatique (optionnel)

Pour automatiser le renouvellement, vous pouvez créer un script qui :
1. Vérifie la date d'expiration du token
2. Régénère automatiquement un nouveau token si nécessaire
3. Met à jour le fichier `.env.local`

Mais pour l'instant, la méthode manuelle est la plus simple.

