# Configurer SMTP dans Supabase - Guide pas à pas

## Problème

Vous recevez l'erreur : "Erreur d'envoi d'email. Le service d'email n'est pas configuré correctement."

Cela signifie que Supabase n'a pas de configuration SMTP personnalisée et utilise le service par défaut qui peut être bloqué ou avoir des problèmes.

## Solution : Configurer un service SMTP professionnel

### Option 1 : Resend (Recommandé - Gratuit et facile)

#### Étape 1 : Créer un compte Resend

1. Aller sur https://resend.com/signup
2. Créer un compte (gratuit : 100 emails/jour)
3. Vérifier votre email

#### Étape 2 : Obtenir votre API Key

1. Dans Resend Dashboard, aller dans **API Keys**
2. Cliquer sur **Create API Key**
3. Donner un nom (ex: "Supabase SMTP")
4. Copier la clé API (commence par `re_`)

#### Étape 3 : Ajouter votre domaine (Optionnel mais recommandé)

1. Dans Resend Dashboard, aller dans **Domains**
2. Cliquer sur **Add Domain**
3. Entrer `vbsniperacademie.com`
4. Resend vous donnera des enregistrements DNS à ajouter :
   - Des enregistrements TXT pour SPF et DKIM
   - Des enregistrements CNAME pour la vérification
5. Ajouter ces enregistrements dans votre panneau DNS
6. Attendre la vérification (généralement 1-2 heures)

**Note** : Vous pouvez utiliser Resend sans vérifier votre domaine, mais la délivrabilité sera meilleure avec un domaine vérifié.

#### Étape 4 : Configurer Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Settings** (ou **Project Settings** → **Auth**)
4. Scroller jusqu'à **SMTP Settings**
5. Activer **Enable Custom SMTP**
6. Remplir les champs suivants :

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [Votre API Key Resend - celle qui commence par re_]
Sender email: support@vbsniperacademie.com
Sender name: VB Sniper Academie
```

7. Cliquer sur **Save**

#### Étape 5 : Tester

1. Aller sur votre page d'authentification
2. Cliquer sur "Mot de passe oublié"
3. Entrer une adresse email de test
4. Vérifier que l'email arrive (vérifier aussi les spams)

---

### Option 2 : SendGrid (Alternative)

#### Étape 1 : Créer un compte SendGrid

1. Aller sur https://sendgrid.com
2. Créer un compte (gratuit : 100 emails/jour)
3. Vérifier votre email

#### Étape 2 : Créer une API Key

1. Dans SendGrid Dashboard, aller dans **Settings** → **API Keys**
2. Cliquer sur **Create API Key**
3. Donner un nom et sélectionner "Full Access" ou "Mail Send"
4. Copier la clé API

#### Étape 3 : Configurer Supabase

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Votre API Key SendGrid]
Sender email: support@vbsniperacademie.com
Sender name: VB Sniper Academie
```

---

### Option 3 : Mailgun (Alternative)

#### Étape 1 : Créer un compte Mailgun

1. Aller sur https://mailgun.com
2. Créer un compte (gratuit : 5000 emails/mois)
3. Vérifier votre email

#### Étape 2 : Obtenir les identifiants SMTP

1. Dans Mailgun Dashboard, aller dans **Sending** → **Domain Settings**
2. Sélectionner votre domaine ou créer un nouveau domaine
3. Aller dans **SMTP credentials**
4. Créer un utilisateur SMTP ou utiliser les identifiants par défaut

#### Étape 3 : Configurer Supabase

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Votre nom d'utilisateur Mailgun]
SMTP Password: [Votre mot de passe Mailgun]
Sender email: support@vbsniperacademie.com
Sender name: VB Sniper Academie
```

---

## Vérification de la configuration

### Vérifier dans Supabase

1. Aller dans **Authentication** → **Settings** → **SMTP Settings**
2. Vérifier que **Enable Custom SMTP** est activé
3. Vérifier que tous les champs sont remplis correctement
4. Cliquer sur **Test Email** si disponible

### Vérifier les logs

1. Dans Supabase Dashboard, aller dans **Logs** → **Auth**
2. Chercher les erreurs liées à l'envoi d'email
3. Les erreurs courantes :
   - `535 Authentication failed` : Identifiants incorrects
   - `Connection timeout` : Host ou port incorrect
   - `550 Invalid sender` : Adresse email expéditeur invalide

## Dépannage

### Erreur : "Authentication failed"

**Cause** : Identifiants SMTP incorrects

**Solution** :
- Vérifier que l'API Key ou le mot de passe est correct
- Pour Resend : s'assurer d'utiliser l'API Key complète (commence par `re_`)
- Pour SendGrid : s'assurer d'utiliser `apikey` comme username et l'API Key comme password

### Erreur : "Connection timeout"

**Cause** : Host ou port incorrect

**Solution** :
- Vérifier le host SMTP :
  - Resend : `smtp.resend.com`
  - SendGrid : `smtp.sendgrid.net`
  - Mailgun : `smtp.mailgun.org`
- Vérifier le port (généralement `587` pour STARTTLS ou `465` pour SSL)

### Erreur : "Invalid sender"

**Cause** : L'adresse email expéditeur n'est pas autorisée

**Solution** :
- Pour Resend : Vérifier que le domaine est vérifié dans Resend
- Pour SendGrid : Vérifier que l'adresse email est dans la liste des adresses vérifiées
- Utiliser une adresse email du domaine vérifié

### Les emails arrivent mais dans les spams

**Solution** :
1. Vérifier les enregistrements DNS (SPF, DKIM, DMARC)
2. Utiliser un service d'email professionnel (Resend, SendGrid, Mailgun)
3. Vérifier votre domaine sur https://www.mail-tester.com

## Configuration DNS recommandée

Pour améliorer la délivrabilité, ajouter ces enregistrements DNS :

### SPF (Sender Policy Framework)
```
TXT @ "v=spf1 include:sendgrid.net include:resend.com ~all"
```

### DMARC (Domain-based Message Authentication)
```
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@vbsniperacademie.com"
```

**Note** : Les enregistrements DKIM sont généralement fournis par votre service d'email (Resend, SendGrid, etc.) lors de la vérification du domaine.

## Test rapide

Après configuration, tester avec :

1. Aller sur votre page d'authentification : `/auth`
2. Cliquer sur "Mot de passe oublié"
3. Entrer votre email
4. Vérifier votre boîte de réception (et les spams)
5. Si l'email n'arrive pas, vérifier les logs Supabase

## Support

Si le problème persiste :

1. Vérifier les logs Supabase : **Dashboard** → **Logs** → **Auth**
2. Vérifier les logs de votre service d'email (Resend, SendGrid, etc.)
3. Contacter le support de votre service d'email
4. Vérifier que votre domaine n'est pas sur une liste noire : https://mxtoolbox.com/blacklists.aspx

## Ressources

- [Documentation Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Documentation Resend](https://resend.com/docs)
- [Documentation SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Documentation Mailgun SMTP](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)

