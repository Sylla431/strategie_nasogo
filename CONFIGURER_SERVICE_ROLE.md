# Configurer SUPABASE_SERVICE_ROLE_KEY

## Problème

Si vous voyez `rows_updated: 0` sans erreur lors de la mise à jour de `payment_reference`, c'est probablement dû à RLS (Row Level Security) qui bloque la mise à jour.

## Solution : Utiliser le Service Role Key

Le Service Role Key permet de contourner RLS pour les opérations administratives comme la mise à jour de `payment_reference`.

## Comment obtenir le Service Role Key

1. **Connectez-vous à Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans Settings** → **API**
4. **Trouvez la section "Project API keys"**
5. **Copiez la clé "service_role"** (⚠️ **NE JAMAIS** exposer cette clé publiquement !)

## Configuration

Ajoutez la clé dans votre fichier `.env.local` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (pour contourner RLS dans les API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Sécurité

⚠️ **IMPORTANT** :
- **NE JAMAIS** commiter le Service Role Key dans Git
- **NE JAMAIS** l'exposer dans le code client (frontend)
- Utilisez-le **UNIQUEMENT** dans les API routes serveur
- Le fichier `.env.local` est déjà dans `.gitignore` (ne sera pas commité)

## Vérification

Après avoir ajouté la clé, redémarrez votre serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

Lors du prochain paiement, vous devriez voir dans les logs :
```
✅ Mise à jour réussie avec service role
```

Au lieu de :
```
⚠️ Service role: 0 lignes mises à jour
```

## Alternative : Modifier les politiques RLS

Si vous préférez ne pas utiliser le service role, vous pouvez modifier les politiques RLS dans Supabase pour permettre aux utilisateurs de mettre à jour leurs propres commandes :

```sql
-- Permettre aux utilisateurs de mettre à jour leurs propres commandes
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id);
```

Mais l'utilisation du service role est plus simple et plus sécurisée pour les opérations backend.

