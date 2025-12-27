# Gestion des échecs de paiement et changement de bouton

## Modifications apportées

### 1. Ajout du statut "failed" pour les commandes

Un nouveau statut `failed` a été ajouté à la table `orders` pour marquer les commandes dont le paiement a échoué.

**Migration SQL** : `supabase/migrations/add_failed_status_to_orders.sql`

```sql
alter table public.orders 
add constraint orders_status_check 
check (status in ('pending','paid','failed'));
```

### 2. Mise à jour automatique des anciennes commandes

Lorsqu'un client retente un paiement après un échec, les anciennes commandes en `pending` pour le même cours sont automatiquement mises en `failed`.

**Fichier modifié** : `src/app/api/orders/route.ts`

```typescript
// Mettre en "failed" les anciennes commandes en "pending" pour ce cours et cet utilisateur
const { error: updateOldOrdersError } = await supabase
  .from("orders")
  .update({ status: "failed" })
  .eq("user_id", userId)
  .eq("course_id", courseId)
  .eq("status", "pending");
```

### 3. Mise à jour du webhook pour les échecs

Lorsqu'Orange Money envoie un webhook avec le statut `FAILED`, la commande est maintenant mise en `failed` au lieu de rester en `pending`.

**Fichier modifié** : `src/app/api/payments/webhook/route.ts`

```typescript
} else if (payload.status === "FAILED") {
  // Le paiement a échoué, mettre la commande en "failed"
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("id", order.id);
  // ...
}
```

### 4. Vérification de l'accès payé et changement de bouton

La page d'accueil vérifie maintenant si l'utilisateur a déjà payé pour le cours et change le bouton en conséquence.

**Fichier modifié** : `src/app/page.tsx`

- **Nouveau state** : `hasPaidAccess` et `isCheckingAccess`
- **Vérification** : Vérifie les commandes payées (`status: "paid"`) et les accès accordés (`course_access`)
- **Bouton** :
  - Si l'utilisateur a déjà payé : "✅ Accès déjà obtenu" (désactivé)
  - Si vérification en cours : "Vérification en cours..." (désactivé)
  - Sinon : Texte normal du bouton

**Code ajouté** :

```typescript
// Vérifier si l'utilisateur a déjà payé pour le cours
useEffect(() => {
  const checkPaidAccess = async () => {
    if (!userId || !sessionToken) {
      setHasPaidAccess(false);
      return;
    }

    // Vérifier les commandes payées
    const ordersRes = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });

    if (ordersRes.ok) {
      const orders = await ordersRes.json();
      const hasPaidOrder = orders.some(
        (o: { course_id: string; status: string }) => 
          o.course_id === courseId && o.status === "paid"
      );

      // Vérifier aussi les accès accordés
      const { data: accessData } = await supabase
        .from("course_access")
        .select("course_id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      const hasAccess = hasPaidOrder || !!accessData;
      setHasPaidAccess(hasAccess);
    }
  };

  checkPaidAccess();
}, [userId, sessionToken]);
```

### 5. Protection contre les doubles paiements

L'API `/api/orders` vérifie maintenant si l'utilisateur a déjà une commande payée pour le cours avant de créer une nouvelle commande.

**Fichier modifié** : `src/app/api/orders/route.ts`

```typescript
// Vérifier si l'utilisateur a déjà une commande payée pour ce cours
const { data: existingPaidOrder } = await supabase
  .from("orders")
  .select("id, status")
  .eq("user_id", userId)
  .eq("course_id", courseId)
  .eq("status", "paid")
  .single();

if (existingPaidOrder) {
  return NextResponse.json({ 
    error: "Vous avez déjà payé pour ce cours",
    already_paid: true 
  }, { status: 400 });
}
```

## Flux utilisateur

### Scénario 1 : Paiement échoué puis retentative

1. **Premier paiement** : L'utilisateur crée une commande avec `status: "pending"`
2. **Échec** : Orange Money envoie un webhook avec `status: "FAILED"`
3. **Mise à jour** : La commande est mise en `status: "failed"`
4. **Retentative** : L'utilisateur clique à nouveau sur "Profiter de l'offre"
5. **Nouvelle commande** : Une nouvelle commande est créée avec `status: "pending"`
6. **Anciennes commandes** : Les anciennes commandes en `pending` pour le même cours sont mises en `failed`

### Scénario 2 : Utilisateur ayant déjà payé

1. **Vérification** : La page vérifie automatiquement si l'utilisateur a déjà payé
2. **Bouton** : Le bouton affiche "✅ Accès déjà obtenu" et est désactivé
3. **Message** : Un message s'affiche avec un lien vers "/client"
4. **Protection** : L'API empêche la création d'une nouvelle commande si une commande payée existe déjà

## Migration à appliquer

Exécutez la migration SQL dans Supabase :

1. Ouvrez **SQL Editor** dans Supabase
2. Copiez le contenu de `supabase/migrations/add_failed_status_to_orders.sql`
3. Exécutez la requête

## Tests à effectuer

1. ✅ Créer une commande, simuler un échec, vérifier que le statut est `failed`
2. ✅ Retenter un paiement, vérifier que l'ancienne commande est en `failed`
3. ✅ Vérifier que le bouton change si l'utilisateur a déjà payé
4. ✅ Vérifier que l'API empêche la création d'une nouvelle commande si une commande payée existe

