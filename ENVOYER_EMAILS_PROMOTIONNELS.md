# Guide : Envoyer des emails promotionnels via Resend

Ce guide explique comment configurer et utiliser le système d'envoi d'emails promotionnels pour informer tous les utilisateurs inscrits que la promotion se termine bientôt.

## Prérequis

1. **Compte Resend** : Vous devez avoir un compte Resend et une API Key
2. **Variables d'environnement** : Configurer les variables nécessaires

## Configuration

### 1. Créer un compte Resend

1. Aller sur [https://resend.com/signup](https://resend.com/signup)
2. Créer un compte gratuit (100 emails/jour en gratuit)
3. Vérifier votre email

### 2. Obtenir votre API Key

1. Dans Resend Dashboard, aller dans **API Keys**
2. Cliquer sur **Create API Key**
3. Donner un nom (ex: "VB Sniper Production")
4. Copier la clé API (commence par `re_`)

### 3. Configurer les variables d'environnement

Ajouter dans votre fichier `.env.local` :

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="VB Sniper Académie <support@vbsniperacademie.com>"

# Supabase Service Role (déjà configuré normalement)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important** : 
- `RESEND_FROM_EMAIL` doit être un email vérifié dans Resend
- Pour la production, vous devez vérifier votre domaine dans Resend

### 4. Vérifier votre domaine (Production)

1. Dans Resend Dashboard, aller dans **Domains**
2. Cliquer sur **Add Domain**
3. Entrer votre domaine (ex: `vbsniperacademie.com`)
4. Ajouter les enregistrements DNS fournis par Resend :
   - Enregistrements TXT pour SPF et DKIM
   - Enregistrements CNAME pour la vérification
5. Attendre la vérification (peut prendre quelques heures)

## Utilisation

### Option 1 : Via l'interface Resend (Recommandé pour les campagnes)

Cette méthode vous permet d'utiliser l'interface web de Resend avec tous ses outils de design et statistiques.

1. **Exporter la liste des emails** :
   - Se connecter en tant qu'admin sur `/admin`
   - Aller à la section **"📧 Envoyer un email promotionnel"**
   - Cliquer sur **"📥 Exporter la liste des emails"**
   - La liste sera copiée automatiquement et un fichier CSV sera téléchargé

2. **Créer un Broadcast dans Resend** :
   - Aller sur [https://resend.com/emails](https://resend.com/emails)
   - Cliquer sur **"Create Broadcast"**
   - Dans le champ **"To"**, coller la liste des emails (séparés par des virgules)
   - Ou utiliser le fichier CSV téléchargé pour importer les contacts

3. **Créer votre email** :
   - Utiliser l'éditeur visuel de Resend
   - Ou utiliser un template HTML personnalisé
   - Le template de base est disponible dans `src/lib/emailTemplates.ts` pour référence

4. **Envoyer** :
   - Cliquer sur **"Send"** dans Resend
   - Suivre les statistiques d'envoi dans le Dashboard Resend

**Avantages** :
- Interface visuelle pour créer l'email
- Statistiques détaillées (ouvertures, clics)
- Templates prédéfinis
- Gestion des rebonds et désabonnements

### Option 2 : Via l'interface Admin (Automatique)

Cette méthode envoie automatiquement via l'API.

1. Se connecter en tant qu'admin sur `/admin`
2. Aller à la section **"📧 Envoyer un email promotionnel"**
3. Remplir les champs :
   - **Date de fin de promotion** : Date à laquelle la promotion se termine
   - **Prix promotionnel** : Prix actuel (ex: "27 500 F CFA")
   - **Prix original** : Prix normal (ex: "39 700 F CFA")
   - **Nom du produit** : Nom du produit/service (ex: "Stratégie Nasongon")
   - **URL du produit** : Lien vers la page du produit
4. **Mode test** (optionnel) :
   - Remplir l'email de test pour envoyer à une seule adresse
   - Cliquer sur "Envoyer un email de test" pour tester
5. Cliquer sur **"Envoyer à tous les utilisateurs"** pour envoyer à tous les inscrits

**Avantages** :
- Envoi automatique à tous les utilisateurs
- Pas besoin d'exporter/importer manuellement
- Template personnalisé intégré

### Via l'API directement

```bash
curl -X POST https://vbsniperacademie.com/api/email/send-promo \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "promoEndDate": "2025-12-31",
    "promoPrice": "27 500 F CFA",
    "originalPrice": "39 700 F CFA",
    "productName": "Stratégie Nasongon",
    "productUrl": "https://vbsniperacademie.com/services/strategie-nasongon",
    "testEmail": "test@example.com"
  }'
```

## Template d'email

Le template d'email est défini dans `src/lib/emailTemplates.ts`. Il inclut :

- Design responsive et moderne
- Informations sur la promotion
- Prix comparatif (original vs promotionnel)
- Bouton CTA vers le produit
- Footer avec informations de contact

## Limitations Resend

- **Plan gratuit** : 100 emails/jour, 3 000 emails/mois
- **Plan Pro** : 50 000 emails/mois à partir de $20/mois
- **Plan Business** : Emails illimités

## Dépannage

### Erreur "RESEND_API_KEY non configurée"

Vérifier que la variable `RESEND_API_KEY` est bien définie dans `.env.local` et redémarrer le serveur.

### Erreur "Non autorisé"

S'assurer que vous êtes connecté en tant qu'admin et que le token est valide.

### Emails non reçus

1. Vérifier les logs Resend dans le Dashboard
2. Vérifier le dossier spam
3. S'assurer que le domaine est vérifié dans Resend
4. Vérifier que l'email de l'expéditeur est valide

### Erreur lors de la récupération des utilisateurs

Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correctement configurée et a les permissions nécessaires.

## Sécurité

- Seuls les admins peuvent envoyer des emails
- L'API vérifie le rôle admin avant d'envoyer
- Les emails sont envoyés de manière asynchrone pour éviter les timeouts
- Les erreurs sont loggées pour le débogage

## Personnalisation

Pour modifier le template d'email, éditer le fichier `src/lib/emailTemplates.ts` et la fonction `getPromoEndingEmailTemplate`.

