# Ajouter la fonction d'accès automatique pour Orange Money

## Problème

Lorsqu'un paiement Orange Money est confirmé via webhook, le système tentait d'accorder l'accès au cours en utilisant la fonction `grant_course_access`, qui nécessite qu'un admin accorde l'accès. Cela causait une erreur : "Seuls les admins peuvent accorder l'accès".

## Solution

Une nouvelle fonction SQL `grant_course_access_automatic` a été créée pour permettre l'accès automatique après un paiement Orange Money réussi, sans vérification du rôle admin.

## Étapes pour appliquer la migration

### Option 1 : Via l'interface Supabase (recommandé)

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `supabase/migrations/add_grant_course_access_automatic.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter la migration

### Option 2 : Via la ligne de commande

Si vous utilisez Supabase CLI :

```bash
supabase db push
```

## Vérification

Après avoir exécuté la migration, vous pouvez vérifier que la fonction existe :

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'grant_course_access_automatic';
```

## Fonctionnement

### Pour les paiements Orange Money

- ✅ **Accès automatique** : Lorsqu'un paiement Orange Money est confirmé via webhook, l'accès au cours est accordé automatiquement
- ✅ **Pas de vérification admin** : La fonction `grant_course_access_automatic` ne vérifie pas le rôle admin
- ✅ **Utilisée uniquement par le webhook** : Cette fonction est appelée uniquement dans le webhook Orange Money

### Pour les paiements en espèces

- ✅ **Accès manuel** : L'admin doit valider manuellement la commande et accorder l'accès via l'interface admin
- ✅ **Utilise `grant_course_access`** : La fonction originale avec vérification admin reste utilisée pour les paiements cash

## Code modifié

### Webhook (`src/app/api/payments/webhook/route.ts`)

Le webhook utilise maintenant `grant_course_access_automatic` au lieu de `grant_course_access` :

```typescript
// Accorder automatiquement l'accès au cours pour paiement Orange Money
if (order.user_id && order.course_id && order.payment_method === "orange_money") {
  const { error: accessError } = await supabase.rpc("grant_course_access_automatic", {
    p_user_id: order.user_id,
    p_course_id: order.course_id,
    p_granted_by: null, // null = auto-attribution (pas besoin d'admin)
  });
  // ...
}
```

## Notes importantes

- La fonction `grant_course_access` originale reste inchangée et continue d'être utilisée pour les paiements cash
- La fonction `grant_course_access_automatic` est sécurisée avec `security definer` pour contourner RLS
- Si `p_granted_by` est `null`, l'utilisateur lui-même est utilisé comme `granted_by` (auto-attribution)

