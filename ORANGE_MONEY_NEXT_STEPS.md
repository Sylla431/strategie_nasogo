# Prochaines étapes - Intégration Orange Money

## ✅ Ce qui a été fait

- ✅ Adaptation des endpoints selon la documentation officielle
- ✅ Implémentation de l'initiation de paiement
- ✅ Implémentation du webhook de notification
- ✅ Implémentation de la vérification de statut
- ✅ Intégration dans le flux de commande
- ✅ Pages de retour (succès/annulation)

## 📋 Étapes suivantes

### 1. Obtenir les identifiants Orange Money

#### 1.1 Créer une application sur Orange Developer
1. Connectez-vous à https://developer.orange.com/myapps
2. Créez une nouvelle application
3. Notez votre **Client ID** et **Client Secret**

#### 1.2 Ajouter l'API Orange Money WebPayDev
1. Dans votre application, ajoutez l'API "Orange Money WebPayDev"
2. Entrez votre **Merchant Account Number** (ex: 7701900100)
3. Entrez votre **Merchant Code** (ex: 101021)
4. Générez votre **Merchant Key** (à stocker dans `ORANGE_MONEY_MERCHANT_KEY`)

**Note** : Si vous n'avez pas reçu ces identifiants par email, contactez :
- georgiana.cruceru@orange.com

#### 1.3 Obtenir l'Access Token
1. Utilisez l'endpoint OAuth2.0 pour obtenir un token :
   ```
   POST https://api.orange.com/oauth/v3/token
   ```
2. Avec vos credentials :
   - **grant_type**: `client_credentials`
   - **Client ID**: Votre Client ID
   - **Client Secret**: Votre Client Secret
3. Récupérez l'`access_token` (valide ~90 jours)
4. Stockez-le dans `ORANGE_MONEY_ACCESS_TOKEN`

**Exemple de requête** :
```bash
curl -X POST https://api.orange.com/oauth/v3/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET"
```

### 2. Configurer les variables d'environnement

Créez ou mettez à jour votre fichier `.env.local` :

```env
# Orange Money Configuration
ORANGE_MONEY_ACCESS_TOKEN=your_access_token_here
ORANGE_MONEY_MERCHANT_KEY=your_merchant_key_here

# Environnement (sandbox ou production)
ORANGE_MONEY_ENV=sandbox
# Code pays pour production (ex: "ml" pour Mali, "sn" pour Sénégal)
ORANGE_MONEY_COUNTRY_CODE=dev

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Pour développement
# NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com  # Pour production
```

**Important** :
- En développement, utilisez `ORANGE_MONEY_ENV=sandbox` et `ORANGE_MONEY_COUNTRY_CODE=dev`
- En production, changez `ORANGE_MONEY_ENV=production` et `ORANGE_MONEY_COUNTRY_CODE` avec le code pays (ex: "ml", "sn")

### 3. Tester l'intégration en sandbox

#### 3.1 Tester l'initiation de paiement
1. Démarrez votre serveur de développement :
   ```bash
   npm run dev
   ```
2. Accédez à votre site : http://localhost:3000
3. Connectez-vous ou créez un compte
4. Sélectionnez "Mobile Money (Orange money)" comme moyen de paiement
5. Cliquez sur "Profiter de l'offre"
6. Vérifiez que vous êtes redirigé vers la page de paiement Orange Money

#### 3.2 Utiliser le simulateur USSD pour tester le paiement
1. Accédez au simulateur : https://mpayment.orange-money.com/mpayment-otp/login
2. Connectez-vous avec :
   - **Login** : Merchant Account Number (ex: 7701900100)
   - **Password** : Channel User ID (ex: MerchantWP00100)
3. Demandez un OTP avec le PIN du subscriber
4. Utilisez l'OTP dans la page de paiement Orange Money
5. Cliquez sur "Confirmer"

#### 3.3 Vérifier le webhook
1. Le webhook doit être accessible publiquement
2. En développement local, utilisez **ngrok** pour exposer votre serveur :
   ```bash
   ngrok http 3000
   ```
3. Mettez à jour `NEXT_PUBLIC_APP_URL` avec l'URL ngrok :
   ```env
   NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
   ```
4. Vérifiez que le webhook reçoit les notifications dans les logs

### 4. Configurer le webhook en production

Une fois en production :

1. **URL du webhook** : `https://vbsniperacademie.com/api/payments/webhook`
2. Cette URL est automatiquement envoyée dans chaque requête d'initiation de paiement
3. Assurez-vous que cette URL est accessible publiquement (pas de firewall qui bloque)

### 5. Tester le flux complet

#### Scénario de test :
1. ✅ Créer une commande avec Orange Money
2. ✅ Être redirigé vers Orange Money
3. ✅ Compléter le paiement avec le simulateur
4. ✅ Recevoir la notification webhook
5. ✅ Vérifier que la commande est mise à jour en `paid`
6. ✅ Vérifier que l'accès au cours est accordé automatiquement
7. ✅ Vérifier la redirection vers `/payment/success`

### 6. Gérer les cas d'erreur

#### 6.1 Si le webhook ne fonctionne pas
- Vérifiez que l'URL est accessible publiquement
- Vérifiez les logs du serveur pour voir les erreurs
- Utilisez l'API Transaction Status pour vérifier manuellement le statut

#### 6.2 Si le paiement échoue
- La commande reste en `pending`
- L'utilisateur peut réessayer
- L'admin peut valider manuellement via `/admin` si nécessaire

#### 6.3 Si l'access token expire
- Les tokens expirent après ~90 jours
- Régénérez un nouveau token avec la même méthode OAuth2.0
- Mettez à jour `ORANGE_MONEY_ACCESS_TOKEN`

### 7. Passer en production

Quand vous êtes prêt pour la production :

1. **Obtenir les identifiants de production** :
   - Contactez Orange Money pour obtenir les identifiants de production
   - Créez une nouvelle application sur Orange Developer pour la production

2. **Mettre à jour les variables d'environnement** :
   ```env
   ORANGE_MONEY_ENV=production
   ORANGE_MONEY_COUNTRY_CODE=ml  # ou "sn" selon votre pays
   ORANGE_MONEY_ACCESS_TOKEN=production_access_token
   ORANGE_MONEY_MERCHANT_KEY=production_merchant_key
   NEXT_PUBLIC_APP_URL=https://vbsniperacademie.com
   ```

3. **Tester en production** :
   - Effectuez un paiement de test avec un vrai compte Orange Money
   - Vérifiez que tout fonctionne correctement

### 8. Monitoring et logs

#### Points à surveiller :
- ✅ Logs des requêtes d'initiation de paiement
- ✅ Logs des webhooks reçus
- ✅ Erreurs de validation de `notif_token`
- ✅ Commandes qui restent en `pending` (peuvent nécessiter une validation manuelle)

#### Logs importants à vérifier :
- Console du serveur pour les erreurs
- Logs Supabase pour les erreurs de base de données
- Logs Orange Money (si disponibles) pour les transactions

## 🔍 Checklist de vérification

Avant de passer en production, vérifiez :

- [ ] Variables d'environnement configurées correctement
- [ ] Access token valide et non expiré
- [ ] Merchant key correct
- [ ] Webhook accessible publiquement
- [ ] Test d'initiation de paiement réussi
- [ ] Test de paiement complet réussi
- [ ] Webhook reçoit les notifications
- [ ] Commandes mises à jour automatiquement
- [ ] Accès aux cours accordé automatiquement
- [ ] Pages de retour (succès/annulation) fonctionnent
- [ ] Gestion des erreurs testée

## 📞 Support

Si vous rencontrez des problèmes :

1. **Documentation Orange Money** : Consultez le document "NEWGuide d'utilisation API webpayment.docx"
2. **Support Orange Money** : georgiana.cruceru@orange.com
3. **Logs** : Vérifiez les logs de votre serveur et de Supabase

## 🎯 Résumé des actions immédiates

1. **Maintenant** : Obtenir les identifiants Orange Money (Merchant Key, Access Token)
2. **Ensuite** : Configurer les variables d'environnement
3. **Puis** : Tester en sandbox avec le simulateur USSD
4. **Enfin** : Passer en production après validation complète

