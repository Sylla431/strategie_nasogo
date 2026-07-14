# Graph Report - strategie_nasogo  (2026-07-10)

## Corpus Check
- 129 files · ~565,609 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1034 nodes · 1296 edges · 137 communities (49 shown, 88 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `46e6f0ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Course Access APIs
- Orders Payment Access SQL
- Students Admin APIs
- Auth Reset Pages
- Payment Providers Docs
- Admin Dashboard Pages
- Telegram Bot APIs
- Orange Money Payment APIs
- NPM Dependencies
- TypeScript Config
- Email Templates Resend
- PayTech Moneroo Code
- Resend SMTP Setup
- Admin Shell Layout
- Marketing Home Page
- Promo Email API
- Resend Contacts Helper
- Root App Layout
- Telegram Cron Workflow
- Nasongon Service Layout
- ESLint Config
- Next Config
- PostCSS Config
- 📋 Étapes suivantes
- Réactiver la confirmation d'email dans Supabase
- Corriger l'erreur "requested path is invalid" lors de la confirmation d'email
- Template de confirmation d'email amélioré
- Configurer les variables d'environnement sur Vercel
- Corriger le problème d'emails marqués comme spam
- Configurer les URLs de redirection dans Supabase
- Comment obtenir les codes de paiement Orange Money
- Confirmation du paiement Orange Money - Numéro de téléphone
- Guide : Envoyer des emails promotionnels via Resend
- Automatiser l'ajout des contacts à Resend
- Dépannage : "Frais: undefined undefined" sur la page Orange Money
- Restructuration du site VB Sniper Académie
- Comment obtenir le code OTP Requestor Orange Money
- Ajouter la colonne payment_reference à la table orders
- Ajouter la fonction d'accès automatique pour Orange Money
- page.tsx
- Modifications apportées
- Solution temporaire : Utiliser l'URL Vercel
- Informations nécessaires du document "NEWGuide d'utilisation API webpayment.docx"
- page.tsx
- page.tsx
- Templates d'email Supabase
- README.md
- CLAUDE.md
- notif_token
- orders table
- pay_token
- orders.payment_reference
- txnid
- grant_course_access
- grant_course_access_automatic
- Orange Money payment webhook
- POST /api/resend/add-contact
- RESEND_AUDIENCE_ID
- Resend
- checkPaymentStatus
- POST /api/payments/orange-money/initiate
- GET /api/orders/{orderId}/payment-codes
- Orange Money Access Token
- Merchant Key
- Orange Developer portal
- OTP Requestor
- Row Level Security (RLS)
- SUPABASE_SERVICE_ROLE_KEY
- Supabase Custom SMTP
- Mailgun SMTP
- Resend SMTP for Supabase
- SendGrid SMTP
- SPF DKIM DMARC DNS records
- /auth/callback
- /auth/reset-password
- Supabase Redirect URLs
- NEXT_PUBLIC_APP_URL
- Orange Money Vercel env vars
- Client phone PIN/OTP confirmation
- Merchant Orange Money credentials
- requested path is invalid
- Email deliverability / spam score
- Geoffroy Boko
- Preserve Orange Money payment on page move
- ServiceCard component
- Stratégie Nasongon
- VB Sniper Académie
- DNS_PROBE_FINISHED_NXDOMAIN
- vbsniperacademie.com
- Vercel custom domain DNS
- Auth callback code exchange
- email_confirmed_at
- Currency OUV sandbox / XOF production
- Dépannage Frais undefined Orange Money
- Frais undefined undefined (Orange Money)
- Templates email Supabase README
- Guide emails promotionnels Resend
- getPromoEndingEmailTemplate (emailTemplates.ts)
- Resend
- API /api/email/send-promo
- Gestion des échecs de paiement
- Double payment protection on /api/orders
- hasPaidAccess button guard
- orders status failed
- grant_course_access_automatic
- payment_method routing (orders API)
- Adaptation Orange Money API checklist
- NEWGuide d'utilisation API webpayment.docx
- Prochaines étapes Orange Money
- ngrok for local Orange Money webhook
- Orange Money OAuth2 access token
- Orange Money USSD sandbox simulator
- notif_token webhook authenticity
- Orange Money transaction statuses
- Orange Money WebPayment API
- PayTech API https://paytech.sn/api
- Intégration PayTech documentation officielle
- PayTech webhook HMAC-SHA256 verification
- PayTech /payment/request-payment
- Auth callback /auth/callback
- Réactiver confirmation email Supabase
- Supabase Enable email confirmations
- README Next.js project
- Next.js
- Vercel deployment
- Solution temporaire URL Vercel
- NEXT_PUBLIC_APP_URL
- vbsniperacademie.com NXDOMAIN
- Supabase Confirm signup HTML template
- Template confirmation email Supabase
- route.ts

## God Nodes (most connected - your core abstractions)
1. `createSupabaseFromRequest()` - 38 edges
2. `requireAdmin()` - 24 edges
3. `getTelegramConfig()` - 21 edges
4. `compilerOptions` - 16 edges
5. `isSubscriptionActive()` - 15 edges
6. `notifyAdminOrderPaid()` - 12 edges
7. `findSubscriptionForAccount()` - 12 edges
8. `Configurer les variables d'environnement sur Vercel` - 12 edges
9. `Template de confirmation d'email amélioré` - 12 edges
10. `Comment obtenir le code OTP Requestor Orange Money` - 11 edges

## Surprising Connections (you probably didn't know these)
- `VB Sniper Academie password reset email` --shares_data_with--> `{{ .ConfirmationURL }}`  [EXTRACTED]
  email-templates/reset-password-simple.html → TEMPLATE_CONFIRMATION_EMAIL.md
- `AdminStudentsPage()` --calls--> `sanitizePhoneInput()`  [EXTRACTED]
  src/app/admin/students/page.tsx → src/lib/studentSecurity.ts
- `GET()` --calls--> `createSupabaseFromRequest()`  [EXTRACTED]
  src/app/api/courses/[id]/videos/route.ts → src/lib/supabaseServer.ts
- `GET()` --calls--> `getPromoEndingEmailTemplate()`  [EXTRACTED]
  src/app/api/email/get-template/route.ts → src/lib/emailTemplates.ts
- `POST()` --calls--> `getPromoEndingEmailTemplate()`  [EXTRACTED]
  src/app/api/email/send-promo/route.ts → src/lib/emailTemplates.ts

## Import Cycles
- None detected.

## Communities (137 total, 88 thin omitted)

### Community 0 - "Course Access APIs"
Cohesion: 0.08
Nodes (39): DELETE(), GET(), getProfileRole(), POST(), GET(), getProfileRole(), GET(), getRole() (+31 more)

### Community 1 - "Orders Payment Access SQL"
Cohesion: 0.07
Nodes (24): Alternative : Modifier les politiques RLS, Comment obtenir le Service Role Key, Configuration, Configurer SUPABASE_SERVICE_ROLE_KEY, Problème, Solution : Utiliser le Service Role Key, Sécurité, Vérification (+16 more)

### Community 2 - "Students Admin APIs"
Cohesion: 0.13
Nodes (29): GET(), POST(), RecordPaymentPayload, CourseRelation, DELETE(), GET(), PUT(), StudentProfile (+21 more)

### Community 3 - "Auth Reset Pages"
Cohesion: 0.13
Nodes (4): Mode, Course, CourseVideo, supabase

### Community 4 - "Payment Providers Docs"
Cohesion: 0.07
Nodes (27): Accès automatique au cours, Application de la migration SQL, 🔧 Configuration, Configuration des webhooks, 📚 Documentation, 🔍 Dépannage, Erreur "Configuration manquante", Erreur "payment_method invalide" (+19 more)

### Community 5 - "Admin Dashboard Pages"
Cohesion: 0.14
Nodes (9): AdminDashboard(), AdminSection, Course, CourseAccess, CourseVideo, Order, SECTION_META, TelegramVipUser (+1 more)

### Community 6 - "Telegram Bot APIs"
Cohesion: 0.10
Nodes (47): GET(), isAuthorized(), POST(), GET(), POST(), POST(), GET(), GET() (+39 more)

### Community 7 - "Orange Money Payment APIs"
Cohesion: 0.06
Nodes (33): 1. Initiation de Paiement (`src/lib/paytech.ts`), 1. URL de Base API, 2. Authentification, 2. Vérification Webhook (`src/lib/paytech.ts`), 3. Endpoint d'Initiation, 3. Route d'Initiation (`src/app/api/payments/paytech/initiate/route.ts`), 4. Paramètres de Requête, 4. Route Webhook (`src/app/api/payments/paytech/webhook/route.ts`) (+25 more)

### Community 8 - "NPM Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, grammy, next, react, react-dom, resend, @supabase/supabase-js, devDependencies (+17 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Email Templates Resend"
Cohesion: 0.33
Nodes (4): Supabase Reset Password template, VB Sniper Academie password reset email, Sujet réinitialisation mot de passe, {{ .ConfirmationURL }}

### Community 11 - "PayTech Moneroo Code"
Cohesion: 0.07
Nodes (27): 1. Ajouter le domaine, 2. Configurer les DNS, 3. Attendre la propagation, 4. Vérifier le certificat SSL, Causes possibles, Configuration complète du domaine sur Vercel, Dépannage : Erreur DNS pour vbsniperacademie.com, Erreur "Domain not found" dans Vercel (+19 more)

### Community 12 - "Resend SMTP Setup"
Cohesion: 0.06
Nodes (31): Configuration DNS recommandée, Configurer SMTP dans Supabase - Guide pas à pas, DMARC (Domain-based Message Authentication), Dépannage, Erreur : "Authentication failed", Erreur : "Connection timeout", Erreur : "Invalid sender", Les emails arrivent mais dans les spams (+23 more)

### Community 13 - "Admin Shell Layout"
Cohesion: 0.24
Nodes (7): metadata, AdminShell(), isNavActive(), NAV_GROUPS, NavGroup, NavItem, SidebarCard()

### Community 14 - "Marketing Home Page"
Cohesion: 0.22
Nodes (7): founderInfo, services, store, testimonials, formatPrice(), Service, ServiceCard()

### Community 15 - "Promo Email API"
Cohesion: 0.48
Nodes (4): GET(), POST(), resend, getPromoEndingEmailTemplate()

### Community 16 - "Resend Contacts Helper"
Cohesion: 0.47
Nodes (4): POST(), addContactToResend(), AddContactToResendParams, resend

### Community 18 - "Telegram Cron Workflow"
Cohesion: 1.00
Nodes (3): Telegram VIP expiry cron workflow, /api/telegram/cron, TELEGRAM_CRON_SECRET

### Community 29 - "📋 Étapes suivantes"
Cohesion: 0.07
Nodes (26): 1.1 Créer une application sur Orange Developer, 1.2 Ajouter l'API Orange Money WebPayDev, 1.3 Obtenir l'Access Token, 1. Obtenir les identifiants Orange Money, 2. Configurer les variables d'environnement, 3.1 Tester l'initiation de paiement, 3.2 Utiliser le simulateur USSD pour tester le paiement, 3.3 Vérifier le webhook (+18 more)

### Community 30 - "Réactiver la confirmation d'email dans Supabase"
Cohesion: 0.07
Nodes (27): Comportement après activation, Connexion (Sign In), Dépannage, Gestion des messages, Gestion des utilisateurs existants, Inscription (Sign Up), La redirection après confirmation ne fonctionne pas, Les emails de confirmation ne sont pas envoyés (+19 more)

### Community 31 - "Corriger l'erreur "requested path is invalid" lors de la confirmation d'email"
Cohesion: 0.08
Nodes (25): 1. Vérifier l'URL dans l'email, 2. Tester la confirmation, 3. Vérifier les logs Supabase, Configuration complète recommandée, Corriger l'erreur "requested path is invalid" lors de la confirmation d'email, Dépannage, Développement local, Format des URLs (+17 more)

### Community 32 - "Template de confirmation d'email amélioré"
Cohesion: 0.09
Nodes (23): 1. Le code échangé n'est pas un code de confirmation d'email, 2. Le code a expiré, 3. Le code a déjà été utilisé, 4. Problème avec la configuration Supabase, Causes possibles, Dépannage : Email non vérifié après confirmation, Logs de débogage, Option 1 : Vérifier la configuration Supabase (+15 more)

### Community 33 - "Configurer les variables d'environnement sur Vercel"
Cohesion: 0.08
Nodes (24): 1. Les redirections ne fonctionnent pas, 1. Vérifier que la variable est bien définie, 2. Orange Money rejette les URLs, 2. Tester les fonctionnalités, 3. La variable n'est pas accessible côté client, Bonnes pratiques, Comment ajouter les variables, Configuration complète des variables d'environnement sur Vercel (+16 more)

### Community 34 - "Corriger le problème d'emails marqués comme spam"
Cohesion: 0.08
Nodes (23): 1. Vérifier la configuration actuelle Supabase, 2. Configurer Resend (Recommandé), 3. Tester l'envoi, Amélioration continue, Causes possibles, Corriger le problème d'emails marqués comme spam, DKIM (DomainKeys Identified Mail), DMARC (Domain-based Message Authentication) (+15 more)

### Community 35 - "Configurer les URLs de redirection dans Supabase"
Cohesion: 0.05
Nodes (42): Configuration recommandée pour la production, Configurer les URLs de redirection dans Supabase, Dépannage, Développement local, Erreur persiste après configuration, Format des URLs, L'URL change selon l'environnement, Pour la production (votre domaine) : (+34 more)

### Community 37 - "Comment obtenir les codes de paiement Orange Money"
Cohesion: 0.09
Nodes (21): 1. **`pay_token`** (Token de paiement), 2. **`notif_token`** (Token de notification), 3. **`txnid`** (ID de transaction), Comment obtenir les codes de paiement Orange Money, Dépannage, Endpoint, Erreur 403 (Accès non autorisé), Exemple de requête (+13 more)

### Community 38 - "Confirmation du paiement Orange Money - Numéro de téléphone"
Cohesion: 0.10
Nodes (20): 1. Initiation du paiement (par le marchand), 2. Redirection vers Orange Money, 3. Confirmation du paiement (par le CLIENT), Code actuel, Confirmation du paiement Orange Money - Numéro de téléphone, Exemple concret, FAQ, Flux de paiement détaillé (+12 more)

### Community 39 - "Guide : Envoyer des emails promotionnels via Resend"
Cohesion: 0.10
Nodes (20): 1. Créer un compte Resend, 2. Obtenir votre API Key, 3. Configurer les variables d'environnement, 4. Vérifier votre domaine (Production), Configuration, Dépannage, Emails non reçus, Erreur lors de la récupération des utilisateurs (+12 more)

### Community 40 - "Automatiser l'ajout des contacts à Resend"
Cohesion: 0.10
Nodes (19): 1. Créer une Audience dans Resend (Optionnel mais recommandé), 2. Configurer les variables d'environnement, 3. Vérifier que tout fonctionne, API Route, Automatiser l'ajout des contacts à Resend, Avantages, Configuration, Dépannage (+11 more)

### Community 41 - "Dépannage : "Frais: undefined undefined" sur la page Orange Money"
Cohesion: 0.10
Nodes (19): 1. Variable d'environnement `ORANGE_MONEY_ENV` non définie ou incorrecte, 2. Prix du cours invalide ou manquant, 3. Format des données incorrect dans la requête API, 4. Réponse d'Orange Money incorrecte, Cas 1 : `ORANGE_MONEY_ENV` est undefined, Cas 2 : Le prix du cours est null ou undefined, Cas 3 : La devise est undefined, Cas 4 : Orange Money retourne une erreur (+11 more)

### Community 42 - "Restructuration du site VB Sniper Académie"
Cohesion: 0.11
Nodes (17): 1. Nouvelle page d'accueil principale, 2. Déplacer la page de vente actuelle, 3. Créer un composant réutilisable pour les services, 4. Mettre à jour les métadonnées, 5. Navigation (optionnel), Architecture, Contenu à fournir, Design et style (+9 more)

### Community 43 - "Comment obtenir le code OTP Requestor Orange Money"
Cohesion: 0.12
Nodes (16): Comment obtenir le code OTP Requestor, Comment obtenir le code OTP Requestor Orange Money, Dans le code (si nécessaire), Dans les variables d'environnement, Différence entre OTP Requestor et autres identifiants, Exemple de configuration complète, FAQ, Format du code OTP Requestor (+8 more)

### Community 44 - "Ajouter la colonne payment_reference à la table orders"
Cohesion: 0.14
Nodes (13): Ajouter la colonne payment_reference à la table orders, Dépannage, Erreur "permission denied", La colonne existe déjà, Méthode 1 : Via l'éditeur SQL de Supabase (Recommandé), Méthode 2 : Via la ligne de commande (Supabase CLI), Méthode 3 : Via l'interface Table Editor, Notes importantes (+5 more)

### Community 45 - "Ajouter la fonction d'accès automatique pour Orange Money"
Cohesion: 0.14
Nodes (13): Ajouter la fonction d'accès automatique pour Orange Money, Code modifié, Fonctionnement, Notes importantes, Option 1 : Via l'interface Supabase (recommandé), Option 2 : Via la ligne de commande, Pour les paiements en espèces, Pour les paiements Orange Money (+5 more)

### Community 46 - "page.tsx"
Cohesion: 0.18
Nodes (11): AdminStudentsPage(), CourseOption, PaymentInstallment, statusLabel, StudentDetailResponse, StudentPaymentFilterOption, StudentSortOption, StudentSummary (+3 more)

### Community 47 - "Modifications apportées"
Cohesion: 0.15
Nodes (12): 1. Ajout du statut "failed" pour les commandes, 2. Mise à jour automatique des anciennes commandes, 3. Mise à jour du webhook pour les échecs, 4. Vérification de l'accès payé et changement de bouton, 5. Protection contre les doubles paiements, Flux utilisateur, Gestion des échecs de paiement et changement de bouton, Migration à appliquer (+4 more)

### Community 48 - "Solution temporaire : Utiliser l'URL Vercel"
Cohesion: 0.17
Nodes (11): Configuration pour le développement local, Important, Problème, Quand configurer le domaine personnalisé, Solution immédiate : Utiliser l'URL Vercel, Solution temporaire : Utiliser l'URL Vercel, Vérification, Étape 1 : Trouver votre URL Vercel (+3 more)

### Community 49 - "Informations nécessaires du document "NEWGuide d'utilisation API webpayment.docx""
Cohesion: 0.18
Nodes (10): 1. Configuration de base, 2. Endpoint d'initiation de paiement, 3. Authentification, 4. Webhook, 5. Vérification de statut (si disponible), 6. Codes de statut, Adaptation Orange Money API selon la documentation, Comment fournir les informations (+2 more)

### Community 50 - "page.tsx"
Cohesion: 0.24
Nodes (9): ClientSpace(), Course, CourseAccess, CourseVideo, Order, orderStatusClass(), orderStatusLabel(), PAYMENT_METHOD_LABELS (+1 more)

### Community 51 - "page.tsx"
Cohesion: 0.24
Nodes (9): Countdown, findNasongonCourse(), formatPrice(), Home(), otherProducts, product, store, testimonials (+1 more)

### Community 52 - "Templates d'email Supabase"
Cohesion: 0.25
Nodes (7): Configuration dans Supabase, Fichiers, Instructions, Notes, Personnalisation, Templates d'email Supabase, Variables disponibles dans Supabase

### Community 53 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 137 - "route.ts"
Cohesion: 0.09
Nodes (36): getUserRole(), POST(), confirmOrderPayment(), confirmVipPayment(), OrderRow, POST(), ServiceSupabase, findVipPayment() (+28 more)

## Knowledge Gaps
- **601 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+596 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **88 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseFromRequest()` connect `Course Access APIs` to `route.ts`, `Telegram Bot APIs`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `supabase` connect `Auth Reset Pages` to `page.tsx`, `page.tsx`, `Admin Dashboard Pages`, `page.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Réactiver la confirmation d'email dans Supabase` connect `Réactiver la confirmation d'email dans Supabase` to `Orders Payment Access SQL`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _605 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Course Access APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.07811447811447811 - nodes in this community are weakly interconnected._
- **Should `Orders Payment Access SQL` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Students Admin APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.13225371120107962 - nodes in this community are weakly interconnected._