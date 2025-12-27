# Comment obtenir le code OTP Requestor Orange Money

Le **OTP Requestor** est un identifiant unique utilisé par Orange Money pour identifier votre application lors des transactions nécessitant une authentification OTP (One-Time Password).

## Qu'est-ce que l'OTP Requestor ?

L'OTP Requestor est un code unique qui identifie votre application marchande dans le système Orange Money. Il est utilisé pour :
- Générer des codes OTP pour les paiements
- Authentifier les transactions
- Lier les paiements à votre application

## Comment obtenir le code OTP Requestor

### Méthode 1 : Depuis le portail Orange Developer

1. **Connectez-vous au portail Orange Developer**
   - URL : https://developer.orange.com/myapps
   - Connectez-vous avec vos identifiants

2. **Accédez à votre application**
   - Sélectionnez l'application que vous avez créée pour Orange Money
   - Ou créez une nouvelle application si nécessaire

3. **Accédez aux paramètres de l'API Orange Money WebPayDev**
   - Dans votre application, trouvez la section "Orange Money WebPayDev"
   - Cliquez sur "Configuration" ou "Settings"

4. **Récupérez le OTP Requestor**
   - Le code OTP Requestor devrait être affiché dans les paramètres de l'API
   - Il peut être nommé :
     - "OTP Requestor"
     - "Requestor ID"
     - "OTP Requestor Code"
     - "Requestor Identifier"

### Méthode 2 : Depuis les emails Orange Money

Si vous avez reçu des identifiants par email de Orange Money, le code OTP Requestor devrait être inclus dans :
- L'email de bienvenue
- L'email contenant vos identifiants marchand
- Les documents de configuration

**Contact Orange Money** : georgiana.cruceru@orange.com

### Méthode 3 : Depuis le dashboard Orange Money (si disponible)

1. Connectez-vous au dashboard Orange Money
2. Accédez à la section "Configuration" ou "Paramètres"
3. Trouvez la section "API Configuration"
4. Le code OTP Requestor devrait être affiché

## Format du code OTP Requestor

Le code OTP Requestor peut avoir différents formats selon la configuration :
- Un code numérique (ex: `123456`)
- Un code alphanumérique (ex: `REQ123456`)
- Un UUID (ex: `550e8400-e29b-41d4-a716-446655440000`)

## Utilisation du code OTP Requestor

### Dans les variables d'environnement

Une fois que vous avez obtenu le code OTP Requestor, ajoutez-le à votre fichier `.env.local` :

```env
# Orange Money Configuration
ORANGE_MONEY_ACCESS_TOKEN=your_access_token
ORANGE_MONEY_MERCHANT_KEY=your_merchant_key
ORANGE_MONEY_OTP_REQUESTOR=your_otp_requestor_code

# Environnement
ORANGE_MONEY_ENV=sandbox
ORANGE_MONEY_COUNTRY_CODE=dev

# Application URL
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

### Dans le code (si nécessaire)

Si l'API Orange Money nécessite le code OTP Requestor dans les requêtes, vous pouvez l'utiliser ainsi :

```typescript
// Exemple d'utilisation dans une requête
const otpRequestor = process.env.ORANGE_MONEY_OTP_REQUESTOR;

const requestBody = {
  merchant_key: merchantKey,
  amount: amount,
  order_id: orderId,
  otp_requestor: otpRequestor, // Si requis par l'API
  // ... autres champs
};
```

## Vérification

Pour vérifier que votre code OTP Requestor est correct :

1. **Testez une transaction en sandbox**
   - Utilisez le simulateur : https://mpayment.orange-money.com/mpayment-otp/login
   - Vérifiez que les transactions fonctionnent correctement

2. **Vérifiez les logs**
   - Si le code est incorrect, vous recevrez une erreur dans les logs
   - Les erreurs typiques incluent :
     - "Invalid OTP Requestor"
     - "OTP Requestor not found"
     - "Unauthorized requestor"

## Différence entre OTP Requestor et autres identifiants

| Identifiant | Usage | Où l'obtenir |
|------------|-------|--------------|
| **OTP Requestor** | Identifie votre application pour les OTP | Portail Orange Developer |
| **Merchant Key** | Clé de sécurité pour les transactions | Portail Orange Developer |
| **Access Token** | Token d'authentification OAuth2.0 | API OAuth2.0 |
| **Merchant Account Number** | Numéro de compte marchand | Email Orange Money |
| **Merchant Code** | Code marchand | Email Orange Money |

## Notes importantes

1. **Sécurité** : Ne partagez jamais votre code OTP Requestor publiquement
2. **Sandbox vs Production** : Vous pouvez avoir des codes différents pour le sandbox et la production
3. **Expiration** : Le code OTP Requestor ne devrait pas expirer, contrairement à l'Access Token
4. **Support** : Si vous ne trouvez pas votre code OTP Requestor, contactez le support Orange Money

## Support

Si vous avez des difficultés à obtenir votre code OTP Requestor :

1. **Contact Orange Money** : georgiana.cruceru@orange.com
2. **Documentation** : Consultez le document "NEWGuide d'utilisation API webpayment.docx"
3. **Portail Developer** : https://developer.orange.com/myapps

## Exemple de configuration complète

```env
# Orange Money - Configuration complète
ORANGE_MONEY_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
ORANGE_MONEY_MERCHANT_KEY=abc123def456...
ORANGE_MONEY_OTP_REQUESTOR=REQ123456789
ORANGE_MONEY_ENV=sandbox
ORANGE_MONEY_COUNTRY_CODE=dev
NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
```

## FAQ

**Q : Le code OTP Requestor est-il obligatoire ?**
R : Cela dépend de la configuration de votre API. Consultez la documentation Orange Money pour votre cas spécifique.

**Q : Puis-je utiliser le même code pour le sandbox et la production ?**
R : Généralement non. Vous aurez des codes différents pour chaque environnement.

**Q : Que faire si je ne trouve pas mon code OTP Requestor ?**
R : Contactez le support Orange Money (georgiana.cruceru@orange.com) avec votre Merchant Account Number.

**Q : Le code OTP Requestor change-t-il ?**
R : Non, le code OTP Requestor est généralement permanent et ne change pas, sauf si vous recréez votre application.

