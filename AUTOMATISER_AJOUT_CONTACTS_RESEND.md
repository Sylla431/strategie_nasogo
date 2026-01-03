# Automatiser l'ajout des contacts à Resend

Ce guide explique comment configurer l'ajout automatique de chaque nouvel utilisateur inscrit aux contacts de Resend.

## Fonctionnement

Lorsqu'un nouvel utilisateur s'inscrit sur le site, il est automatiquement ajouté aux contacts de Resend. Cela permet de :

- Avoir une liste à jour de tous les utilisateurs dans Resend
- Envoyer des emails promotionnels directement depuis Resend
- Suivre les statistiques d'engagement par contact

## Configuration

### 1. Créer une Audience dans Resend (Optionnel mais recommandé)

1. Aller sur [https://resend.com/audiences](https://resend.com/audiences)
2. Cliquer sur **"Create Audience"**
3. Donner un nom (ex: "VB Sniper - Utilisateurs")
4. Copier l'**Audience ID** (commence par `aud_`)

### 2. Configurer les variables d'environnement

Ajouter dans votre fichier `.env.local` :

```env
# Resend Configuration (déjà configuré normalement)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Audience ID Resend (optionnel mais recommandé)
RESEND_AUDIENCE_ID=aud_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note** : Si vous ne configurez pas `RESEND_AUDIENCE_ID`, les contacts seront ajoutés à l'audience par défaut de Resend.

### 3. Vérifier que tout fonctionne

1. Créer un nouveau compte de test sur `/auth`
2. Vérifier dans Resend Dashboard → Audiences → Contacts que le contact apparaît
3. Le contact devrait avoir :
   - L'email de l'utilisateur
   - Le prénom et nom (si fournis lors de l'inscription)
   - Le téléphone (si fourni)

## Fonctionnement technique

### Flux d'inscription

1. L'utilisateur remplit le formulaire d'inscription
2. `supabase.auth.signUp()` crée le compte
3. Après la création réussie, une requête est envoyée à `/api/resend/add-contact`
4. L'API route ajoute le contact à Resend via `resend.contacts.create()`
5. Le contact apparaît dans Resend

### Gestion des erreurs

- Si l'ajout à Resend échoue, l'inscription n'est **pas** bloquée
- Les erreurs sont loggées dans la console pour le débogage
- Si un contact existe déjà, il n'est pas dupliqué (Resend gère cela automatiquement)

## API Route

### POST `/api/resend/add-contact`

Ajoute un contact à Resend.

**Body** :
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",  // Optionnel
  "firstName": "John",      // Optionnel (priorité sur fullName)
  "lastName": "Doe",        // Optionnel (priorité sur fullName)
  "phone": "+223 73 69 51 25" // Optionnel
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Contact ajouté à Resend avec succès",
  "data": { ... }
}
```

## Utilisation manuelle

Si vous voulez ajouter un contact manuellement (par exemple pour des utilisateurs existants), vous pouvez appeler l'API :

```bash
curl -X POST https://vbsniperacademie.com/api/resend/add-contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+223 73 69 51 25"
  }'
```

## Migration des utilisateurs existants

Pour ajouter tous les utilisateurs existants à Resend, vous pouvez :

1. Exporter la liste des emails depuis `/admin` (section "📧 Envoyer un email promotionnel")
2. Créer un script qui appelle `/api/resend/add-contact` pour chaque email
3. Ou utiliser l'interface Resend pour importer en masse

## Dépannage

### Le contact n'apparaît pas dans Resend

1. Vérifier que `RESEND_API_KEY` est correctement configurée
2. Vérifier les logs du serveur pour voir les erreurs
3. Vérifier que l'email est valide
4. Vérifier dans Resend Dashboard → Audiences → Contacts

### Erreur "Contact already exists"

C'est normal ! Resend détecte automatiquement les doublons. Le contact existe déjà, donc l'opération est considérée comme réussie.

### Erreur "RESEND_API_KEY non configurée"

Vérifier que la variable d'environnement `RESEND_API_KEY` est définie dans `.env.local` et redémarrer le serveur.

## Avantages

- ✅ Liste de contacts toujours à jour
- ✅ Pas besoin d'exporter/importer manuellement
- ✅ Prêt pour les campagnes email dans Resend
- ✅ Statistiques d'engagement par contact
- ✅ Gestion automatique des doublons

## Limitations

- Les contacts sont ajoutés de manière asynchrone (ne bloque pas l'inscription)
- Si Resend est indisponible, l'inscription continue mais le contact ne sera pas ajouté
- Les contacts existants ne sont pas mis à jour automatiquement (seulement créés)

