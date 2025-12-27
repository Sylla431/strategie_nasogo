# Dépannage : "Frais: undefined undefined" sur la page Orange Money

## Problème

Sur la page de paiement Orange Money, vous voyez :
- **Frais: undefined undefined**
- **Montant total: undefined undefined**

## Causes possibles

### 1. Variable d'environnement `ORANGE_MONEY_ENV` non définie ou incorrecte

**Solution** : Vérifiez votre fichier `.env.local` :

```env
# Pour le sandbox (développement)
ORANGE_MONEY_ENV=sandbox
ORANGE_MONEY_COUNTRY_CODE=dev

# Pour la production
ORANGE_MONEY_ENV=production
ORANGE_MONEY_COUNTRY_CODE=ml  # ou "sn" selon votre pays
```

**Vérification** : Les logs du serveur devraient afficher :
```
Données de paiement: {
  coursePrice: 19700,
  amount: 19700,
  currency: "OUV",  // ou "XOF" en production
  isProduction: false,
  ORANGE_MONEY_ENV: "sandbox"
}
```

### 2. Prix du cours invalide ou manquant

**Solution** : Vérifiez que le cours a un prix valide dans la base de données :

```sql
SELECT id, title, price FROM courses WHERE id = 'votre-course-id';
```

Le `price` doit être un nombre positif (ex: `19700`).

**Vérification** : Les logs devraient afficher :
```
Données de paiement: {
  coursePrice: 19700,  // Doit être un nombre, pas null ou undefined
  amount: 19700,
  ...
}
```

### 3. Format des données incorrect dans la requête API

**Solution** : Vérifiez les logs du serveur pour voir la requête envoyée :

```
Orange Money API Request: {
  body: {
    merchant_key: "abc1...",
    currency: "OUV",  // Doit être "OUV" ou "XOF", pas undefined
    amount: 19700,    // Doit être un nombre, pas undefined
    order_id: "...",
    ...
  },
  amountType: "number",  // Doit être "number", pas "undefined"
  currencyType: "string", // Doit être "string", pas "undefined"
  amountValue: 19700,
  currencyValue: "OUV"
}
```

### 4. Réponse d'Orange Money incorrecte

**Solution** : Vérifiez les logs pour voir la réponse d'Orange Money :

```
Orange Money API Response: {
  status: 201,
  data: {
    status: 201,
    message: "...",
    pay_token: "...",
    payment_url: "...",
    notif_token: "..."
  }
}
```

Si `status !== 201`, il y a une erreur. Consultez `data.message` ou `data.error`.

## Étapes de diagnostic

### Étape 1 : Vérifier les variables d'environnement

```bash
# Vérifiez que les variables sont définies
echo $ORANGE_MONEY_ENV
echo $ORANGE_MONEY_COUNTRY_CODE
```

Ou dans votre `.env.local` :
```env
ORANGE_MONEY_ENV=sandbox
ORANGE_MONEY_COUNTRY_CODE=dev
ORANGE_MONEY_ACCESS_TOKEN=your_token
ORANGE_MONEY_MERCHANT_KEY=your_key
```

### Étape 2 : Vérifier les logs du serveur

Lancez votre serveur et regardez les logs lors de l'initiation du paiement :

```bash
npm run dev
```

Cherchez dans les logs :
1. `Données de paiement:` - Vérifiez que `amount` et `currency` sont définis
2. `Orange Money API Request:` - Vérifiez que `amount` et `currency` sont dans le body
3. `Orange Money API Response:` - Vérifiez le statut et les erreurs

### Étape 3 : Vérifier la base de données

Vérifiez que le cours a un prix valide :

```sql
-- Vérifier le prix du cours
SELECT id, title, price FROM courses;

-- Vérifier la commande
SELECT 
  o.id,
  o.status,
  c.title,
  c.price
FROM orders o
JOIN courses c ON o.course_id = c.id
WHERE o.id = 'votre-order-id';
```

### Étape 4 : Tester avec des valeurs fixes

Pour tester, vous pouvez temporairement forcer des valeurs dans le code :

```typescript
// Dans src/app/api/payments/orange-money/initiate/route.ts
const amount = 19700; // Valeur fixe pour test
const currency = "OUV"; // Valeur fixe pour test
```

Si cela fonctionne, le problème vient de la récupération du prix ou de la variable d'environnement.

## Solutions selon le cas

### Cas 1 : `ORANGE_MONEY_ENV` est undefined

**Solution** : Ajoutez dans `.env.local` :
```env
ORANGE_MONEY_ENV=sandbox
```

### Cas 2 : Le prix du cours est null ou undefined

**Solution** : Vérifiez et mettez à jour le prix dans la base de données :
```sql
UPDATE courses SET price = 19700 WHERE id = 'votre-course-id';
```

### Cas 3 : La devise est undefined

**Solution** : Assurez-vous que `ORANGE_MONEY_ENV` est défini. Le code détermine automatiquement :
- `OUV` si `ORANGE_MONEY_ENV !== "production"`
- `XOF` si `ORANGE_MONEY_ENV === "production"`

### Cas 4 : Orange Money retourne une erreur

**Solution** : Consultez les logs pour voir l'erreur exacte. Erreurs communes :
- `Invalid body field` : Un champ de la requête est invalide
- `Invalid merchant_key` : La clé marchand est incorrecte
- `Invalid access_token` : Le token d'accès est expiré ou invalide

## Vérification rapide

Exécutez cette requête pour vérifier vos données :

```typescript
// Test rapide dans la console du navigateur (après avoir lancé le paiement)
// Ou vérifiez les logs du serveur
```

Les logs devraient montrer :
```
✅ Données de paiement: { amount: 19700, currency: "OUV", ... }
✅ Orange Money API Request: { body: { amount: 19700, currency: "OUV", ... } }
✅ Orange Money API Response: { status: 201, ... }
```

Si l'un de ces logs montre `undefined`, c'est là que se trouve le problème.

## Contact

Si le problème persiste après avoir vérifié tous ces points :
1. Consultez les logs complets du serveur
2. Vérifiez la documentation Orange Money
3. Contactez le support Orange Money : georgiana.cruceru@orange.com

