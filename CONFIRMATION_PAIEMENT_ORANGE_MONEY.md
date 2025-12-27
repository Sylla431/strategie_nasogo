# Confirmation du paiement Orange Money - Numéro de téléphone

## Réponse rapide

**C'est le numéro de téléphone du CLIENT qui est utilisé pour confirmer le paiement**, pas celui du marchand.

## Flux de paiement détaillé

### 1. Initiation du paiement (par le marchand)
- Le marchand (vous) initie le paiement via l'API
- Vous utilisez vos identifiants marchand :
  - `Merchant Account Number` (ex: 7701900100)
  - `Merchant Key`
  - `Access Token`
- L'API retourne une `payment_url` vers Orange Money

### 2. Redirection vers Orange Money
- Le **client** est redirigé vers la page de paiement Orange Money
- Cette page affiche les détails de la transaction (montant, marchand, etc.)

### 3. Confirmation du paiement (par le CLIENT)
Le **client** doit confirmer le paiement en utilisant **SON PROPRE compte Orange Money** :

#### Option A : Avec numéro de téléphone et PIN
- Le client entre **son numéro de téléphone Orange Money** (ex: +223 73 69 51 25)
- Le client entre **son code PIN Orange Money** (code secret de 4 chiffres)
- Orange Money débit le compte Orange Money du client

#### Option B : Avec code OTP
- Le client peut demander un code OTP (One-Time Password)
- Le code OTP est envoyé par SMS sur **le téléphone du client**
- Le client entre le code OTP reçu sur **son téléphone**
- Orange Money débit le compte Orange Money du client

## Rôles dans le processus

| Acteur | Rôle | Identifiants utilisés |
|--------|------|----------------------|
| **Marchand (vous)** | Initie le paiement | Merchant Account Number, Merchant Key, Access Token |
| **Client** | Confirme et paie | Son numéro de téléphone Orange Money, Son PIN/OTP |

## Exemple concret

### Scénario
1. **Client** : Amadou (numéro Orange Money : +223 73 69 51 25)
2. **Marchand** : VB Sniper Academie (Merchant Account : 7701900100)
3. **Montant** : 19 700 FCFA

### Processus
1. ✅ Amadou clique sur "Profiter de l'offre" sur votre site
2. ✅ Votre système initie le paiement avec vos identifiants marchand
3. ✅ Amadou est redirigé vers Orange Money
4. ✅ **Amadou entre SON numéro** : +223 73 69 51 25
5. ✅ **Amadou entre SON PIN** : 1234 (son code secret)
6. ✅ Orange Money débit **le compte Orange Money d'Amadou** de 19 700 FCFA
7. ✅ Orange Money crédit **votre compte marchand** de 19 700 FCFA
8. ✅ Le paiement est confirmé

## Identifiants du marchand vs client

### Identifiants du MARCHAND (vous)
Ces identifiants sont utilisés pour **initier** le paiement via l'API :
- `ORANGE_MONEY_MERCHANT_KEY` : Clé marchand
- `ORANGE_MONEY_ACCESS_TOKEN` : Token d'authentification API
- `Merchant Account Number` : Numéro de compte marchand (ex: 7701900100)
- `Merchant Code` : Code marchand (ex: 101021)

**Stockage** : Dans vos variables d'environnement (`.env.local`)

### Identifiants du CLIENT
Ces identifiants sont utilisés par le **client** pour **confirmer** le paiement :
- Numéro de téléphone Orange Money du client
- Code PIN Orange Money du client (ou code OTP)

**Stockage** : Le client les entre directement sur la page Orange Money

## Code actuel

Dans votre code (`src/app/api/payments/orange-money/initiate/route.ts`), vous récupérez le numéro de téléphone du client :

```typescript
// Récupérer les informations utilisateur pour le paiement
const { data: userProfile } = await supabase
  .from("users_profile")
  .select("email, phone")
  .eq("id", userId)
  .single();
```

**Note** : Ce numéro de téléphone est récupéré mais **n'est pas envoyé à Orange Money** dans la requête d'initiation. C'est le client qui entre son numéro directement sur la page Orange Money.

## Pourquoi le client entre son numéro ?

1. **Sécurité** : Le client doit confirmer avec son propre compte
2. **Flexibilité** : Le client peut payer avec n'importe quel compte Orange Money
3. **Conformité** : Orange Money doit vérifier l'identité du payeur

## Test en sandbox

Lors des tests avec le simulateur (https://mpayment.orange-money.com/mpayment-otp/login) :

1. **Login** : Vous utilisez le **Merchant Account Number** (identifiant marchand)
2. **Password** : Vous utilisez le **Channel User ID** (identifiant marchand)
3. **OTP** : Vous demandez un OTP pour un **numéro de téléphone subscriber** (simule le client)

Même dans le simulateur, vous simulez un client avec un numéro de téléphone subscriber, pas le numéro du marchand.

## FAQ

**Q : Puis-je pré-remplir le numéro de téléphone du client ?**
R : Non, Orange Money ne permet pas de pré-remplir le numéro. Le client doit l'entrer lui-même pour des raisons de sécurité.

**Q : Le client peut-il payer avec un numéro différent de celui enregistré sur mon site ?**
R : Oui, le client peut utiliser n'importe quel compte Orange Money pour payer, même si c'est différent du numéro enregistré sur votre site.

**Q : Que se passe-t-il si le client n'a pas de compte Orange Money ?**
R : Le paiement échouera. Le client doit avoir un compte Orange Money actif pour pouvoir payer.

**Q : Le marchand doit-il avoir un compte Orange Money ?**
R : Oui, le marchand doit avoir un compte marchand Orange Money pour recevoir les paiements, mais ce compte n'est pas utilisé pour confirmer les paiements des clients.

## Résumé

✅ **Pour confirmer le paiement** : Le **CLIENT** utilise **SON numéro de téléphone Orange Money** et **SON PIN/OTP**

❌ **Le numéro du marchand n'est PAS utilisé** pour confirmer les paiements des clients

✅ **Le numéro du marchand** est utilisé uniquement pour identifier votre compte marchand dans l'API

