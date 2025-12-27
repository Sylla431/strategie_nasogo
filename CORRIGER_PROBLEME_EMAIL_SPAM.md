# Corriger le problème d'emails marqués comme spam

## Problème identifié

Les emails de réinitialisation de mot de passe sont marqués comme spam avec un score de 8.21 et détruits avant d'atteindre les destinataires.

**Détails du problème :**
- Score SPAM: 8.21 (très élevé, seuil généralement à 5.0)
- Statut: Destroyed for spam
- Expéditeur: support@vbsniperacademie.com
- Les emails ne sont plus reçus

## Causes possibles

1. **Configuration email par défaut de Supabase** : Supabase utilise un service d'email basique qui peut avoir une mauvaise réputation
2. **Absence de SPF/DKIM/DMARC** : Les enregistrements DNS ne sont pas correctement configurés
3. **Réputation de l'expéditeur** : L'adresse `support@vbsniperacademie.com` n'a pas de réputation établie
4. **Contenu de l'email** : Le template par défaut peut contenir des éléments déclencheurs de spam

## Solutions recommandées

### Solution 1 : Configurer un service d'email transactionnel (RECOMMANDÉ)

Utiliser un service d'email professionnel comme **Resend**, **SendGrid**, ou **Mailgun** avec Supabase.

#### Option A : Resend (Recommandé pour Next.js)

1. **Créer un compte Resend** :
   - Aller sur https://resend.com
   - Créer un compte gratuit (100 emails/jour)
   - Vérifier votre domaine `vbsniperacademie.com`

2. **Configurer le domaine dans Resend** :
   - Ajouter votre domaine
   - Configurer les enregistrements DNS (SPF, DKIM, DMARC)
   - Attendre la vérification (peut prendre quelques heures)

3. **Configurer Supabase pour utiliser Resend** :
   - Dans Supabase Dashboard → Authentication → Email Templates
   - Configurer SMTP avec les identifiants Resend :
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Votre API Key Resend]
     Sender email: support@vbsniperacademie.com
     Sender name: VB Sniper Academie
     ```

#### Option B : SendGrid

1. **Créer un compte SendGrid** :
   - Aller sur https://sendgrid.com
   - Créer un compte (100 emails/jour gratuit)
   - Vérifier votre domaine

2. **Configurer Supabase** :
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Votre API Key SendGrid]
   Sender email: support@vbsniperacademie.com
   ```

#### Option C : Mailgun

1. **Créer un compte Mailgun** :
   - Aller sur https://mailgun.com
   - Créer un compte (5000 emails/mois gratuit)
   - Vérifier votre domaine

2. **Configurer Supabase** :
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: [Votre nom d'utilisateur Mailgun]
   Password: [Votre mot de passe Mailgun]
   Sender email: support@vbsniperacademie.com
   ```

### Solution 2 : Améliorer les enregistrements DNS

Si vous utilisez déjà un service d'email, vérifiez vos enregistrements DNS :

#### SPF (Sender Policy Framework)
Ajouter dans votre DNS :
```
TXT @ "v=spf1 include:_spf.supabase.co ~all"
```
Ou si vous utilisez un autre service :
```
TXT @ "v=spf1 include:sendgrid.net include:resend.com ~all"
```

#### DKIM (DomainKeys Identified Mail)
Le service d'email (Resend, SendGrid, etc.) vous fournira les clés DKIM à ajouter dans votre DNS.

#### DMARC (Domain-based Message Authentication)
Ajouter dans votre DNS :
```
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@vbsniperacademie.com"
```

### Solution 3 : Personnaliser les templates d'email Supabase

1. **Aller dans Supabase Dashboard** :
   - Authentication → Email Templates

2. **Personnaliser le template de réinitialisation** :
   - Améliorer le contenu pour éviter les déclencheurs de spam
   - Ajouter votre logo et branding
   - Utiliser un texte clair et professionnel

3. **Vérifier les liens** :
   - S'assurer que les liens pointent vers votre domaine
   - Éviter les liens raccourcis

### Solution 4 : Utiliser un sous-domaine pour les emails transactionnels

Créer un sous-domaine dédié aux emails transactionnels :
- `noreply@mail.vbsniperacademie.com`
- `support@mail.vbsniperacademie.com`

Cela isole la réputation des emails transactionnels de votre domaine principal.

## Étapes immédiates à suivre

### 1. Vérifier la configuration actuelle Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Settings** → **SMTP Settings**
4. Vérifier si un service SMTP est configuré

### 2. Configurer Resend (Recommandé)

1. **Créer un compte Resend** : https://resend.com/signup
2. **Ajouter votre domaine** :
   - Dans Resend Dashboard → Domains → Add Domain
   - Entrer `vbsniperacademie.com`
   - Copier les enregistrements DNS fournis
3. **Ajouter les enregistrements DNS** :
   - Aller dans votre panneau DNS (chez votre hébergeur)
   - Ajouter les enregistrements TXT et CNAME fournis par Resend
   - Attendre la vérification (généralement 1-2 heures)
4. **Configurer Supabase** :
   - Dans Supabase → Authentication → Settings → SMTP Settings
   - Activer "Enable Custom SMTP"
   - Remplir avec :
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Votre API Key Resend - commençant par re_]
     Sender email: support@vbsniperacademie.com
     Sender name: VB Sniper Academie
     ```
   - Cliquer sur "Save"

### 3. Tester l'envoi

1. Aller sur votre page d'authentification
2. Cliquer sur "Mot de passe oublié"
3. Entrer une adresse email de test
4. Vérifier que l'email arrive dans la boîte de réception (et non dans les spams)

## Vérification de la délivrabilité

### Outils de vérification

1. **Mail-Tester** : https://www.mail-tester.com
   - Envoyer un email à l'adresse fournie
   - Obtenir un score de délivrabilité (objectif : 10/10)

2. **MXToolbox** : https://mxtoolbox.com
   - Vérifier les enregistrements SPF, DKIM, DMARC
   - Vérifier la réputation du domaine

3. **Google Postmaster Tools** : https://postmaster.google.com
   - Surveiller la délivrabilité vers Gmail

## Amélioration continue

1. **Surveiller les taux de délivrabilité** :
   - Utiliser les analytics de votre service d'email
   - Surveiller les bounces et les plaintes

2. **Maintenir une liste propre** :
   - Supprimer les adresses invalides
   - Ne pas envoyer à des adresses qui ont marqué comme spam

3. **Respecter les bonnes pratiques** :
   - Ne pas envoyer trop d'emails
   - Respecter les demandes de désinscription
   - Utiliser un contenu clair et professionnel

## Support

Si le problème persiste après avoir configuré un service d'email professionnel :

1. Vérifier les logs dans Supabase Dashboard → Logs
2. Vérifier les logs dans votre service d'email (Resend, SendGrid, etc.)
3. Contacter le support de votre service d'email
4. Vérifier que votre domaine n'est pas sur une liste noire

## Ressources

- [Documentation Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Documentation Resend](https://resend.com/docs)
- [Documentation SendGrid](https://docs.sendgrid.com)
- [Guide de délivrabilité email](https://www.mailgun.com/blog/email-deliverability-guide/)

