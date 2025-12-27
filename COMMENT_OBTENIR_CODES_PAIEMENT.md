# Comment obtenir les codes de paiement Orange Money

Ce document explique comment récupérer les différents codes de paiement Orange Money pour une commande.

## Types de codes de paiement

Orange Money utilise trois types de codes/tokens :

### 1. **`pay_token`** (Token de paiement)
- **Quand** : Obtenu lors de l'initiation du paiement
- **Usage** : Permet de vérifier le statut d'un paiement via l'API Orange Money
- **Stockage** : Dans `orders.payment_reference` (format JSON)

### 2. **`notif_token`** (Token de notification)
- **Quand** : Obtenu lors de l'initiation du paiement
- **Usage** : Permet de vérifier l'authenticité des webhooks reçus d'Orange Money
- **Stockage** : Dans `orders.payment_reference` (format JSON)

### 3. **`txnid`** (ID de transaction)
- **Quand** : Obtenu après le paiement via le webhook Orange Money
- **Usage** : Identifiant unique de la transaction chez Orange Money
- **Stockage** : Dans `orders.payment_reference` (format JSON) après le webhook

## Méthodes pour obtenir les codes

### Méthode 1 : Via l'API REST (Recommandé)

#### Endpoint
```
GET /api/orders/{orderId}/payment-codes
```

#### Exemple de requête
```bash
curl -X GET \
  https://votre-domaine.com/api/orders/123e4567-e89b-12d3-a456-426614174000/payment-codes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Exemple de réponse
```json
{
  "order_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "payment_method": "orange_money",
  "codes": {
    "pay_token": "abc123def456...",
    "notif_token": "xyz789uvw012...",
    "txnid": null
  },
  "info": {
    "pay_token": {
      "description": "Token de paiement obtenu lors de l'initiation du paiement",
      "usage": "Utilisé pour vérifier le statut du paiement via l'API Orange Money",
      "obtained_at": "Lors de l'appel à /api/payments/orange-money/initiate"
    },
    "notif_token": {
      "description": "Token de notification pour vérifier l'authenticité des webhooks",
      "usage": "Comparé avec le token reçu dans les notifications Orange Money",
      "obtained_at": "Lors de l'appel à /api/payments/orange-money/initiate"
    },
    "txnid": {
      "description": "ID de transaction Orange Money",
      "usage": "Identifiant unique de la transaction chez Orange Money",
      "obtained_at": "Lors de la réception du webhook après le paiement"
    }
  }
}
```

### Méthode 2 : Directement depuis la base de données

Les codes sont stockés dans la colonne `payment_reference` de la table `orders` au format JSON :

```sql
SELECT 
  id,
  status,
  payment_method,
  payment_reference
FROM orders
WHERE id = 'votre-order-id';
```

Le champ `payment_reference` contient un JSON comme :
```json
{
  "pay_token": "abc123def456...",
  "notif_token": "xyz789uvw012...",
  "txnid": "TXN123456789"  // Seulement après le paiement
}
```

### Méthode 3 : Via le frontend (JavaScript/TypeScript)

```typescript
// Récupérer les codes de paiement d'une commande
async function getPaymentCodes(orderId: string, accessToken: string) {
  const response = await fetch(`/api/orders/${orderId}/payment-codes`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des codes');
  }
  
  const data = await response.json();
  return data.codes;
}

// Utilisation
const codes = await getPaymentCodes('order-id', 'access-token');
console.log('Pay Token:', codes.pay_token);
console.log('Notif Token:', codes.notif_token);
console.log('Transaction ID:', codes.txnid);
```

## Utilisation des codes

### Vérifier le statut d'un paiement avec `pay_token`

Utilisez la fonction `checkPaymentStatus` de `src/lib/orangeMoney.ts` :

```typescript
import { checkPaymentStatus } from '@/lib/orangeMoney';

const status = await checkPaymentStatus({
  order_id: orderId,
  amount: 19700,
  pay_token: codes.pay_token,
});

console.log('Statut:', status.status); // INITIATED, PENDING, SUCCESS, FAILED
console.log('Transaction ID:', status.txnid);
```

### Vérifier l'authenticité d'un webhook avec `notif_token`

Le `notif_token` est utilisé dans le webhook handler (`src/app/api/payments/webhook/route.ts`) pour vérifier que la notification provient bien d'Orange Money.

## Flux complet

1. **Initiation du paiement** :
   - L'utilisateur clique sur "Profiter de l'offre"
   - Appel à `POST /api/orders` avec `payment_method: "orange_money"`
   - Appel interne à `POST /api/payments/orange-money/initiate`
   - Orange Money retourne `pay_token` et `notif_token`
   - Ces tokens sont stockés dans `orders.payment_reference`

2. **Paiement** :
   - L'utilisateur est redirigé vers `payment_url` (Orange Money)
   - L'utilisateur complète le paiement

3. **Confirmation** :
   - Orange Money envoie un webhook à `/api/payments/webhook`
   - Le webhook contient `notif_token` et `txnid`
   - Le `notif_token` est vérifié avec celui stocké
   - Le `txnid` est ajouté à `payment_reference`
   - La commande est mise à jour en `status: "paid"`

## Notes importantes

- **`pay_token`** et **`notif_token`** sont disponibles immédiatement après l'initiation
- **`txnid`** n'est disponible qu'après le paiement (via webhook)
- Si le webhook n'arrive pas, vous pouvez utiliser `checkPaymentStatus` avec le `pay_token` pour vérifier le statut
- Les codes sont sensibles et ne doivent pas être exposés publiquement

## Dépannage

### Les codes sont `null`
- Vérifiez que la commande utilise bien `payment_method: "orange_money"`
- Vérifiez que l'initiation du paiement a réussi
- Consultez les logs du serveur pour voir les erreurs

### Le `txnid` est `null`
- Le paiement n'a peut-être pas encore été complété
- Le webhook n'est peut-être pas encore arrivé
- Utilisez `checkPaymentStatus` pour vérifier le statut

### Erreur 403 (Accès non autorisé)
- Vérifiez que vous êtes connecté
- Vérifiez que la commande vous appartient (ou que vous êtes admin)

