# Graph Report - strategie_nasogo  (2026-09-05)

## Corpus Check
- 347 files · ~1,031,636 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5221 nodes · 6591 edges · 454 communities (300 shown, 154 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 422 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `069869ff`
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
- Payment Cancel Page
- Nasongon Service Layout
- ESLint Config
- Next Config
- PostCSS Config
- Admin Index Page
- Misc API Route A
- Misc API Route B
- Misc API Route C
- Sitemap
- 📋 Étapes suivantes
- Réactiver la confirmation d'email dans Supabase
- Corriger l'erreur "requested path is invalid" lors de la confirmation d'email
- Template de confirmation d'email amélioré
- Configurer les variables d'environnement sur Vercel
- Corriger le problème d'emails marqués comme spam
- Configurer les URLs de redirection dans Supabase
- page.tsx
- Comment obtenir les codes de paiement Orange Money
- Confirmation du paiement Orange Money - Numéro de téléphone
- Guide : Envoyer des emails promotionnels via Resend
- Automatiser l'ajout des contacts à Resend
- Dépannage : "Frais: undefined undefined" sur la page Orange Money
- Restructuration du site VB Sniper Académie
- Comment obtenir le code OTP Requestor Orange Money
- Ajouter la colonne payment_reference à la table orders
- Ajouter la fonction d'accès automatique pour Orange Money
- Modifications apportées
- Solution temporaire : Utiliser l'URL Vercel
- Informations nécessaires du document "NEWGuide d'utilisation API webpayment.docx"
- page.tsx
- page.tsx
- Templates d'email Supabase
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
- Problèmes courants
- Différences entre environnements
- Obtention des identifiants
- Vérification après déploiement
- Configuration complète des variables d'environnement sur Vercel
- POST /api/resend/add-contact
- Intégration PayTech documentation officielle
- Solution temporaire URL Vercel
- button
- Tailwind CSS Utility Reference
- Tailwind CSS Utility Reference
- slide_search_core.py
- slide_search_core.py
- search
- Brand Guidelines v1.0
- Brand Guidelines v1.0
- Design
- Canvas Design System
- Design
- Canvas Design System
- Prerequisites
- search_stack
- spacing
- search_stack
- design_system.py
- Form & Input Components
- Tailwind CSS Responsive Design
- Form & Input Components
- Tailwind CSS Responsive Design
- core.py
- design_system.py
- core.py
- Typography Specifications
- read_rows
- Typography Specifications
- color
- getTelegramConfig
- Logo Usage Rules
- Component Specifications
- shadcn/ui Accessibility Patterns
- TestTailwindConfigGenerator
- Logo Usage Rules
- Component Specifications
- shadcn/ui Accessibility Patterns
- TestTailwindConfigGenerator
- _select_palette_for_mode
- read_rows
- html-token-validator.py
- html-token-validator.py
- search
- search
- Asset Approval Checklist
- Logo AI Prompt Engineering
- BM25
- Asset Approval Checklist
- Logo AI Prompt Engineering
- Color Palette Management
- CIP Deliverable Guide
- BM25
- States and Variants
- UI Styling Skill
- Color Palette Management
- CIP Deliverable Guide
- BM25
- States and Variants
- UI Styling Skill
- Workflow
- _select_palette_for_mode
- Workflow
- Design System
- Tailwind CSS Customization
- Design System
- Tailwind CSS Customization
- spacing
- radius
- DesignSystemGenerator
- Routing by Task Type
- generate-slide.py
- shadcn/ui Theming & Customization
- TestShadcnInstaller
- Routing by Task Type
- generate-slide.py
- shadcn/ui Theming & Customization
- TestShadcnInstaller
- notifyPaymentSuccess.ts
- Asset Organization Guide
- Primary Color Meanings
- Core Logo Types
- color
- DesignSystemGenerator
- Asset Organization Guide
- Primary Color Meanings
- Core Logo Types
- Brand Consistency Checklist
- CIP Mockup Prompt Engineering
- fetch-background.py
- TailwindConfigGenerator
- Brand Consistency Checklist
- CIP Mockup Prompt Engineering
- fetch-background.py
- TailwindConfigGenerator
- TestThresholdGate
- BM25
- TestThresholdGate
- Design Principles
- Design Principles
- generate.py
- fontSize
- ShadcnInstaller
- main
- CatalogRefreshTest
- Design Principles
- Design Principles
- generate.py
- fontSize
- ShadcnInstaller
- main
- CatalogRefreshTest
- CIP Design Reference
- Icon Design Reference
- Copywriting Formulas
- Copywriting Formulas
- detect_domain
- .generate
- CIP Design Reference
- Icon Design Reference
- Copywriting Formulas
- Copywriting Formulas
- detect_domain
- Banner Design - Multi-Format Creative Banner System
- Messaging Framework
- Brand Voice Framework
- Layout Patterns
- Tailwind Integration
- radius
- Layout Patterns
- parse_decision_rules
- Banner Design - Multi-Format Creative Banner System
- Messaging Framework
- Brand Voice Framework
- Layout Patterns
- Tailwind Integration
- Layout Patterns
- orangeMoney.ts
- update.md
- Logo Design Reference
- design-tokens-starter.json
- update.md
- Logo Design Reference
- primitive
- parse_decision_rules
- paytech.ts
- card
- .generate_config_string
- _resolve_color_mode
- .generate_config_string
- _resolve_color_mode
- Core Visual Elements
- CIP Design Style Guide
- Quick Reference
- Core Visual Elements
- CIP Design Style Guide
- Brand
- Slide Strategies
- generate.py
- button
- duration
- Slide Strategies
- ._base_config
- TestGeneratedConfigIsValidJs
- TestTextLayoutDataContracts
- Brand
- Slide Strategies
- generate.py
- duration
- Slide Strategies
- ._base_config
- TestGeneratedConfigIsValidJs
- TestTextLayoutDataContracts
- _run
- _normalize
- _run
- _normalize
- input
- _suggest_identities
- UI/UX Pro Max - Design Intelligence
- Solution : Ajouter l'URL de redirection dans Supabase
- _suggest_identities
- Slides Reference
- HTML Slide Template
- HTML Slide Template
- Query Contract
- Slides Reference
- HTML Slide Template
- HTML Slide Template
- _filter_anti_patterns_for_mode
- Slides
- Pre-Delivery Checklist
- Prerequisites
- Slides
- Solutions
- Brand Guidelines Template
- $type
- radius
- lg
- sm
- Common Rules for Professional UI
- Example Workflow
- Brand Guidelines Template
- sm
- Solutions
- padding-y
- xl
- none
- Tips for Better Results
- xl
- test_sync_brand_to_tokens.py
- main
- 16
- 1
- 3
- 8
- destructive
- destructive-foreground
- muted
- primary-foreground
- ring
- Problèmes courants
- .__init__
- format_output
- test_sync_brand_to_tokens.py
- main
- Solution : Ajouter l'URL de redirection dans Supabase
- primary-hover
- .__init__
- format_output
- slides-create.md
- create.md
- .test_add_components_no_config
- .test_add_components_with_overwrite
- .test_add_components_dry_run
- .test_add_components_success
- .test_add_components_npx_not_found
- .test_add_all_components_success
- .test_list_installed_no_config
- .test_list_installed_empty
- .test_list_installed_with_components
- .test_init_default_project_root
- .test_init_dry_run
- .test_get_installed_components_empty
- .test_get_installed_components_with_files
- .test_get_installed_components_no_config
- .test_add_components_no_components
- .test_add_color_palette
- .test_add_fonts
- .test_add_spacing
- .test_recommend_plugins
- .test_generate_typescript_config
- .test_init_default_typescript
- .test_generate_javascript_config
- .test_validate_config_valid
- .test_validate_config_empty_theme
- .test_init_javascript
- .test_write_config_creates_content
- slides-create.md
- create.md
- .test_add_components_no_config
- .test_add_components_with_overwrite
- .test_add_components_dry_run
- .test_add_components_success
- .test_add_components_npx_not_found
- .test_add_all_components_success
- .test_list_installed_no_config
- .test_list_installed_empty
- .test_list_installed_with_components
- .test_init_default_project_root
- .test_init_dry_run
- .test_get_installed_components_empty
- .test_get_installed_components_with_files
- .test_get_installed_components_no_config
- .test_add_components_no_components
- .test_add_color_palette
- .test_add_fonts
- .test_add_spacing
- .test_recommend_plugins
- .test_generate_typescript_config
- .test_init_default_typescript
- .test_generate_javascript_config
- .test_validate_config_valid
- .test_validate_config_empty_theme
- .test_init_javascript
- .test_write_config_creates_content
- destructive-foreground
- muted
- primary-foreground
- ring
- secondary-foreground
- _suggest_identities
- 12
- $type
- radius
- lg
- Solutions
- 2
- 4
- destructive
- 0
- md
- 6
- foreground
- 16
- 1
- 8
- muted
- ring
- 8

## God Nodes (most connected - your core abstractions)
1. `DesignSystemGenerator` - 61 edges
2. `TailwindConfigGenerator` - 59 edges
3. `TailwindConfigGenerator` - 55 edges
4. `createSupabaseFromRequest()` - 43 edges
5. `search()` - 40 edges
6. `search()` - 40 edges
7. `TestTailwindConfigGenerator` - 35 edges
8. `TestTailwindConfigGenerator` - 35 edges
9. `ShadcnInstaller` - 34 edges
10. `ShadcnInstaller` - 32 edges

## Surprising Connections (you probably didn't know these)
- `TestDomainDetection` --uses--> `BM25`  [INFERRED]
  .cursor/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/design/scripts/cip/core.py
- `TestPersistence` --uses--> `BM25`  [INFERRED]
  .cursor/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/design/scripts/cip/core.py
- `TestReasoningMatch` --uses--> `BM25`  [INFERRED]
  .cursor/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/design/scripts/cip/core.py
- `TestSearchDomains` --uses--> `BM25`  [INFERRED]
  .cursor/skills/ui-ux-pro-max/scripts/tests/test_core.py → .claude/skills/design/scripts/cip/core.py
- `TestShadcnInstaller` --uses--> `ShadcnInstaller`  [INFERRED]
  .cursor/skills/ui-styling/scripts/tests/test_shadcn_add.py → .claude/skills/ui-styling/scripts/shadcn_add.py

## Import Cycles
- None detected.

## Communities (454 total, 154 thin omitted)

### Community 0 - "Course Access APIs"
Cohesion: 0.20
Nodes (14): GET(), getUserIdAndRole(), POST(), POST(), POST(), initiatePayment(), Course, initiateMonerooForOrder() (+6 more)

### Community 1 - "Orders Payment Access SQL"
Cohesion: 0.16
Nodes (18): DELETE(), GET(), getProfileRole(), POST(), GET(), getProfileRole(), GET(), getRole() (+10 more)

### Community 2 - "Students Admin APIs"
Cohesion: 0.12
Nodes (17): 1. Le code échangé n'est pas un code de confirmation d'email, 2. Le code a expiré, 3. Le code a déjà été utilisé, 4. Problème avec la configuration Supabase, Causes possibles, Dépannage : Email non vérifié après confirmation, Logs de débogage, Option 1 : Vérifier la configuration Supabase (+9 more)

### Community 3 - "Auth Reset Pages"
Cohesion: 0.06
Nodes (76): GET(), POST(), RecordPaymentPayload, CourseRelation, DELETE(), GET(), PUT(), StudentProfile (+68 more)

### Community 4 - "Payment Providers Docs"
Cohesion: 0.06
Nodes (33): 1. Initiation de Paiement (`src/lib/paytech.ts`), 1. URL de Base API, 2. Authentification, 2. Vérification Webhook (`src/lib/paytech.ts`), 3. Endpoint d'Initiation, 3. Route d'Initiation (`src/app/api/payments/paytech/initiate/route.ts`), 4. Paramètres de Requête, 4. Route Webhook (`src/app/api/payments/paytech/webhook/route.ts`) (+25 more)

### Community 5 - "Admin Dashboard Pages"
Cohesion: 0.06
Nodes (31): Configuration DNS recommandée, Configurer SMTP dans Supabase - Guide pas à pas, DMARC (Domain-based Message Authentication), Dépannage, Erreur : "Authentication failed", Erreur : "Connection timeout", Erreur : "Invalid sender", Les emails arrivent mais dans les spams (+23 more)

### Community 6 - "Telegram Bot APIs"
Cohesion: 0.17
Nodes (12): Configuration des URLs, Configuration Orange Money WebPayment API, Documentation supplémentaire, Format des données, Initiation de paiement, Notes importantes, Statuts de transaction, Test avec le Sandbox (+4 more)

### Community 7 - "Orange Money Payment APIs"
Cohesion: 0.07
Nodes (27): Accès automatique au cours, Application de la migration SQL, 🔧 Configuration, Configuration des webhooks, 📚 Documentation, 🔍 Dépannage, Erreur "Configuration manquante", Erreur "payment_method invalide" (+19 more)

### Community 8 - "NPM Dependencies"
Cohesion: 0.15
Nodes (13): Causes possibles, Dépannage : Erreur DNS pour vbsniperacademie.com, Erreur "Domain not found" dans Vercel, Erreur rencontrée, Le domaine est configuré mais ne fonctionne pas, Le domaine fonctionne mais pas le www, Option A : Utiliser l'URL Vercel, Option B : Utiliser un sous-domaine (+5 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.07
Nodes (26): 1.1 Créer une application sur Orange Developer, 1.2 Ajouter l'API Orange Money WebPayDev, 1.3 Obtenir l'Access Token, 1. Obtenir les identifiants Orange Money, 2. Configurer les variables d'environnement, 3.1 Tester l'initiation de paiement, 3.2 Utiliser le simulateur USSD pour tester le paiement, 3.3 Vérifier le webhook (+18 more)

### Community 10 - "Email Templates Resend"
Cohesion: 0.09
Nodes (22): Comportement après activation, Connexion (Sign In), Gestion des messages, Gestion des utilisateurs existants, Inscription (Sign Up), Modifier le code frontend (si nécessaire), Personnalisation du template d'email, Problème (+14 more)

### Community 11 - "PayTech Moneroo Code"
Cohesion: 0.08
Nodes (25): dependencies, grammy, next, react, react-dom, resend, @supabase/supabase-js, devDependencies (+17 more)

### Community 12 - "Resend SMTP Setup"
Cohesion: 0.12
Nodes (17): 1. Vérifier l'URL dans l'email, 2. Tester la confirmation, 3. Vérifier les logs Supabase, Configuration complète recommandée, Corriger l'erreur "requested path is invalid" lors de la confirmation d'email, Dépannage, Développement local, Format des URLs (+9 more)

### Community 13 - "Admin Shell Layout"
Cohesion: 0.12
Nodes (16): 1. Vérifier que la variable est bien définie, 2. Tester les fonctionnalités, Bonnes pratiques, Comment ajouter les variables, Configuration complète des variables d'environnement sur Vercel, Configuration sur Vercel, Configurer les variables d'environnement sur Vercel, Exemple de configuration complète (+8 more)

### Community 14 - "Marketing Home Page"
Cohesion: 0.08
Nodes (23): 1. Vérifier la configuration actuelle Supabase, 2. Configurer Resend (Recommandé), 3. Tester l'envoi, Amélioration continue, Causes possibles, Corriger le problème d'emails marqués comme spam, DKIM (DomainKeys Identified Mail), DMARC (Domain-based Message Authentication) (+15 more)

### Community 16 - "Resend Contacts Helper"
Cohesion: 0.18
Nodes (11): AdminStudentsPage(), CourseOption, PaymentInstallment, statusLabel, StudentDetailResponse, StudentPaymentFilterOption, StudentSortOption, StudentSummary (+3 more)

### Community 17 - "Root App Layout"
Cohesion: 0.09
Nodes (21): 1. **`pay_token`** (Token de paiement), 2. **`notif_token`** (Token de notification), 3. **`txnid`** (ID de transaction), Comment obtenir les codes de paiement Orange Money, Dépannage, Endpoint, Erreur 403 (Accès non autorisé), Exemple de requête (+13 more)

### Community 18 - "Telegram Cron Workflow"
Cohesion: 0.10
Nodes (20): 1. Initiation du paiement (par le marchand), 2. Redirection vers Orange Money, 3. Confirmation du paiement (par le CLIENT), Code actuel, Confirmation du paiement Orange Money - Numéro de téléphone, Exemple concret, FAQ, Flux de paiement détaillé (+12 more)

### Community 19 - "Payment Cancel Page"
Cohesion: 0.10
Nodes (20): 1. Créer un compte Resend, 2. Obtenir votre API Key, 3. Configurer les variables d'environnement, 4. Vérifier votre domaine (Production), Configuration, Dépannage, Emails non reçus, Erreur lors de la récupération des utilisateurs (+12 more)

### Community 20 - "Nasongon Service Layout"
Cohesion: 0.10
Nodes (19): 1. Créer une Audience dans Resend (Optionnel mais recommandé), 2. Configurer les variables d'environnement, 3. Vérifier que tout fonctionne, API Route, Automatiser l'ajout des contacts à Resend, Avantages, Configuration, Dépannage (+11 more)

### Community 21 - "ESLint Config"
Cohesion: 0.10
Nodes (19): 1. Variable d'environnement `ORANGE_MONEY_ENV` non définie ou incorrecte, 2. Prix du cours invalide ou manquant, 3. Format des données incorrect dans la requête API, 4. Réponse d'Orange Money incorrecte, Cas 1 : `ORANGE_MONEY_ENV` est undefined, Cas 2 : Le prix du cours est null ou undefined, Cas 3 : La devise est undefined, Cas 4 : Orange Money retourne une erreur (+11 more)

### Community 22 - "Next Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "PostCSS Config"
Cohesion: 0.11
Nodes (17): 1. Nouvelle page d'accueil principale, 2. Déplacer la page de vente actuelle, 3. Créer un composant réutilisable pour les services, 4. Mettre à jour les métadonnées, 5. Navigation (optionnel), Architecture, Contenu à fournir, Design et style (+9 more)

### Community 24 - "Admin Index Page"
Cohesion: 0.14
Nodes (9): AdminDashboard(), AdminSection, Course, CourseAccess, CourseVideo, Order, SECTION_META, TelegramVipUser (+1 more)

### Community 25 - "Misc API Route A"
Cohesion: 0.12
Nodes (16): Comment obtenir le code OTP Requestor, Comment obtenir le code OTP Requestor Orange Money, Dans le code (si nécessaire), Dans les variables d'environnement, Différence entre OTP Requestor et autres identifiants, Exemple de configuration complète, FAQ, Format du code OTP Requestor (+8 more)

### Community 26 - "Misc API Route B"
Cohesion: 0.14
Nodes (13): Ajouter la colonne payment_reference à la table orders, Dépannage, Erreur "permission denied", La colonne existe déjà, Méthode 1 : Via l'éditeur SQL de Supabase (Recommandé), Méthode 2 : Via la ligne de commande (Supabase CLI), Méthode 3 : Via l'interface Table Editor, Notes importantes (+5 more)

### Community 27 - "Misc API Route C"
Cohesion: 0.14
Nodes (13): Ajouter la fonction d'accès automatique pour Orange Money, Code modifié, Fonctionnement, Notes importantes, Option 1 : Via l'interface Supabase (recommandé), Option 2 : Via la ligne de commande, Pour les paiements en espèces, Pour les paiements Orange Money (+5 more)

### Community 28 - "Sitemap"
Cohesion: 0.15
Nodes (12): 1. Ajout du statut "failed" pour les commandes, 2. Mise à jour automatique des anciennes commandes, 3. Mise à jour du webhook pour les échecs, 4. Vérification de l'accès payé et changement de bouton, 5. Protection contre les doubles paiements, Flux utilisateur, Gestion des échecs de paiement et changement de bouton, Migration à appliquer (+4 more)

### Community 29 - "📋 Étapes suivantes"
Cohesion: 0.17
Nodes (11): Configuration pour le développement local, Important, Problème, Quand configurer le domaine personnalisé, Solution immédiate : Utiliser l'URL Vercel, Solution temporaire : Utiliser l'URL Vercel, Vérification, Étape 1 : Trouver votre URL Vercel (+3 more)

### Community 30 - "Réactiver la confirmation d'email dans Supabase"
Cohesion: 0.17
Nodes (8): Alternative : Modifier les politiques RLS, Comment obtenir le Service Role Key, Configuration, Configurer SUPABASE_SERVICE_ROLE_KEY, Problème, Solution : Utiliser le Service Role Key, Sécurité, Vérification

### Community 31 - "Corriger l'erreur "requested path is invalid" lors de la confirmation d'email"
Cohesion: 0.18
Nodes (10): 1. Configuration de base, 2. Endpoint d'initiation de paiement, 3. Authentification, 4. Webhook, 5. Vérification de statut (si disponible), 6. Codes de statut, Adaptation Orange Money API selon la documentation, Comment fournir les informations (+2 more)

### Community 32 - "Template de confirmation d'email amélioré"
Cohesion: 0.16
Nodes (23): confirmOrderPayment(), confirmVipPayment(), OrderRow, POST(), ServiceSupabase, findVipPayment(), handleOrderWebhook(), handleVipWebhook() (+15 more)

### Community 33 - "Configurer les variables d'environnement sur Vercel"
Cohesion: 0.24
Nodes (9): ClientSpace(), Course, CourseAccess, CourseVideo, Order, orderStatusClass(), orderStatusLabel(), PAYMENT_METHOD_LABELS (+1 more)

### Community 34 - "Corriger le problème d'emails marqués comme spam"
Cohesion: 0.24
Nodes (9): Countdown, findNasongonCourse(), formatPrice(), Home(), otherProducts, product, store, testimonials (+1 more)

### Community 35 - "Configurer les URLs de redirection dans Supabase"
Cohesion: 0.24
Nodes (7): metadata, AdminShell(), isNavActive(), NAV_GROUPS, NavGroup, NavItem, SidebarCard()

### Community 36 - "page.tsx"
Cohesion: 0.32
Nodes (6): formatPrice(), Service, ServiceCard(), prefersReducedMotion(), Service, ServicesCarousel()

### Community 37 - "Comment obtenir les codes de paiement Orange Money"
Cohesion: 0.20
Nodes (9): Configuration dans Supabase, Fichiers, Instructions, Notes, Paiements (Resend), Personnalisation, Supabase Auth, Templates d'email (+1 more)

### Community 38 - "Confirmation du paiement Orange Money - Numéro de téléphone"
Cohesion: 0.25
Nodes (6): __dirname, env, envPath, resend, to, when

### Community 39 - "Guide : Envoyer des emails promotionnels via Resend"
Cohesion: 0.29
Nodes (5): env, ref, resend, supabase, to

### Community 40 - "Automatiser l'ajout des contacts à Resend"
Cohesion: 0.33
Nodes (4): Supabase Reset Password template, VB Sniper Academie password reset email, Sujet réinitialisation mot de passe, {{ .ConfirmationURL }}

### Community 41 - "Dépannage : "Frais: undefined undefined" sur la page Orange Money"
Cohesion: 0.47
Nodes (4): POST(), addContactToResend(), AddContactToResendParams, resend

### Community 42 - "Restructuration du site VB Sniper Académie"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 43 - "Comment obtenir le code OTP Requestor Orange Money"
Cohesion: 0.13
Nodes (4): Mode, Course, CourseVideo, supabase

### Community 45 - "Ajouter la fonction d'accès automatique pour Orange Money"
Cohesion: 1.00
Nodes (3): Telegram VIP expiry cron workflow, /api/telegram/cron, TELEGRAM_CRON_SECRET

### Community 47 - "Modifications apportées"
Cohesion: 0.15
Nodes (13): founderInfo, newService, otherServices, services, store, testimonials, findNasongonDerivCourse(), formatPrice() (+5 more)

### Community 136 - "Template confirmation email Supabase"
Cohesion: 0.40
Nodes (3): env, since, supabase

### Community 138 - "Problèmes courants"
Cohesion: 0.07
Nodes (46): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _catalog_date(), _check_app_interface_contract(), _check_catalog_contract() (+38 more)

### Community 139 - "Différences entre environnements"
Cohesion: 0.07
Nodes (46): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _catalog_date(), _check_app_interface_contract(), _check_catalog_contract() (+38 more)

### Community 140 - "Obtention des identifiants"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 141 - "Vérification après déploiement"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 142 - "Configuration complète des variables d'environnement sur Vercel"
Cohesion: 0.06
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 146 - "button"
Cohesion: 0.15
Nodes (17): $type, $value, $type, $value, bg, bg, border, padding (+9 more)

### Community 147 - "Tailwind CSS Utility Reference"
Cohesion: 0.05
Nodes (43): Arbitrary Values, Aspect Ratio, Background Colors, Border Color, Border Radius, Border Style, Border Width, Borders (+35 more)

### Community 148 - "Tailwind CSS Utility Reference"
Cohesion: 0.05
Nodes (43): Arbitrary Values, Aspect Ratio, Background Colors, Border Color, Border Radius, Border Style, Border Width, Borders (+35 more)

### Community 149 - "slide_search_core.py"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 150 - "slide_search_core.py"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 151 - "search"
Cohesion: 0.07
Nodes (37): detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+29 more)

### Community 152 - "Brand Guidelines v1.0"
Cohesion: 0.05
Nodes (37): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Imagery Guidelines, 6. Design Components, Accessibility, AI Image Generation (+29 more)

### Community 153 - "Brand Guidelines v1.0"
Cohesion: 0.05
Nodes (37): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Imagery Guidelines, 6. Design Components, Accessibility, AI Image Generation (+29 more)

### Community 154 - "Design"
Cohesion: 0.06
Nodes (35): Banner Design (Built-in), Banner: Design Rules, Banner: Quick Size Reference, Banner: Top Art Styles, Banner: Workflow, CIP Design (Built-in), CIP: Generate Brief, CIP: Generate Mockups (+27 more)

### Community 155 - "Canvas Design System"
Cohesion: 0.06
Nodes (35): 1. Visual Communication First, 2. Minimal Text Integration, 3. Expert Craftsmanship, 4. Systematic Patterns, Analog Meditation, Approach, Canvas Boundaries, Canvas Design System (+27 more)

### Community 156 - "Design"
Cohesion: 0.06
Nodes (35): Banner Design (Built-in), Banner: Design Rules, Banner: Quick Size Reference, Banner: Top Art Styles, Banner: Workflow, CIP Design (Built-in), CIP: Generate Brief, CIP: Generate Mockups (+27 more)

### Community 157 - "Canvas Design System"
Cohesion: 0.06
Nodes (35): 1. Visual Communication First, 2. Minimal Text Integration, 3. Expert Craftsmanship, 4. Systematic Patterns, Analog Meditation, Approach, Canvas Boundaries, Canvas Design System (+27 more)

### Community 158 - "Prerequisites"
Cohesion: 0.06
Nodes (34): Accessibility, Available Domains, Available Stacks, Common Rules for Professional UI, Common Sticking Points, Example Workflow, How to Use This Skill, Icons & Visual Elements (+26 more)

### Community 159 - "search_stack"
Cohesion: 0.10
Nodes (8): _project_row(), Search stack-specific guidelines, search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 160 - "spacing"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 161 - "search_stack"
Cohesion: 0.09
Nodes (10): _exact_stack_identifier(), _project_row(), Resolve a standalone API identifier even when its BM25 IDF is low., Search stack-specific guidelines, search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness (+2 more)

### Community 162 - "design_system.py"
Cohesion: 0.09
Nodes (28): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+20 more)

### Community 163 - "Form & Input Components"
Cohesion: 0.06
Nodes (32): Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Card, Checkbox (+24 more)

### Community 164 - "Tailwind CSS Responsive Design"
Cohesion: 0.06
Nodes (32): 1. Mobile-First Design, 2. Consistent Breakpoint Usage, 3. Test at Breakpoint Boundaries, 4. Use Container for Content Width, 5. Progressive Enhancement, 6. Avoid Too Many Breakpoints, Best Practices, Breakpoint System (+24 more)

### Community 165 - "Form & Input Components"
Cohesion: 0.06
Nodes (32): Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Card, Checkbox (+24 more)

### Community 166 - "Tailwind CSS Responsive Design"
Cohesion: 0.06
Nodes (32): 1. Mobile-First Design, 2. Consistent Breakpoint Usage, 3. Test at Breakpoint Boundaries, 4. Use Container for Content Width, 5. Progressive Enhancement, 6. Avoid Too Many Breakpoints, Best Practices, Breakpoint System (+24 more)

### Community 167 - "core.py"
Cohesion: 0.11
Nodes (27): _contains_phrase(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot(), _load_product_keywords(), _load_rows_or_empty() (+19 more)

### Community 168 - "design_system.py"
Cohesion: 0.09
Nodes (28): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+20 more)

### Community 169 - "core.py"
Cohesion: 0.11
Nodes (27): _contains_phrase(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot(), _load_product_keywords(), _load_rows_or_empty() (+19 more)

### Community 170 - "Typography Specifications"
Cohesion: 0.06
Nodes (30): Accessibility, Base System, Best Practices, Clean & Modern, Common Font Pairings, Contrast Requirements, CSS Implementation, Editorial (+22 more)

### Community 171 - "read_rows"
Cohesion: 0.21
Nodes (4): split_values(), style_identities(), TestLandingAndStackContract, TestStyleIdentityContract

### Community 172 - "Typography Specifications"
Cohesion: 0.06
Nodes (30): Accessibility, Base System, Best Practices, Clean & Modern, Common Font Pairings, Contrast Requirements, CSS Implementation, Editorial (+22 more)

### Community 173 - "color"
Cohesion: 0.11
Nodes (19): $type, $value, background, destructive-foreground, primary, primary-foreground, secondary, secondary-foreground (+11 more)

### Community 174 - "getTelegramConfig"
Cohesion: 0.11
Nodes (19): Ajouter un logo, Bonnes pratiques, Comment l'utiliser dans Supabase, Compatibilité, Dépannage, Guide d'utilisation, Le lien de confirmation ne fonctionne pas, Le template ne s'affiche pas correctement (+11 more)

### Community 175 - "Logo Usage Rules"
Cohesion: 0.07
Nodes (28): Absolute Don'ts, Approved Backgrounds, Before Using Logo, Clear Space, Co-branding, Color Rules, Color Usage, Color Variants (+20 more)

### Community 176 - "Component Specifications"
Cohesion: 0.07
Nodes (28): Alert, Anatomy, Anatomy, Anatomy, Anatomy, Anatomy, Badge, Button (+20 more)

### Community 177 - "shadcn/ui Accessibility Patterns"
Cohesion: 0.07
Nodes (28): Accordion, Alert, ARIA Labels, Checkbox and Radio, Color Contrast, Command Palette Navigation, Component-Specific Patterns, Dialog/Modal Navigation (+20 more)

### Community 178 - "TestTailwindConfigGenerator"
Cohesion: 0.07
Nodes (15): Test TailwindConfigGenerator class., Test that adding same plugin twice doesn't duplicate., Test generating config with custom colors., Test generating config with plugins., Test writing configuration to file., Test writing config to invalid path., Test generating complete TypeScript configuration., Test initialization with different frameworks. (+7 more)

### Community 179 - "Logo Usage Rules"
Cohesion: 0.07
Nodes (28): Absolute Don'ts, Approved Backgrounds, Before Using Logo, Clear Space, Co-branding, Color Rules, Color Usage, Color Variants (+20 more)

### Community 180 - "Component Specifications"
Cohesion: 0.07
Nodes (28): Alert, Anatomy, Anatomy, Anatomy, Anatomy, Anatomy, Badge, Button (+20 more)

### Community 181 - "shadcn/ui Accessibility Patterns"
Cohesion: 0.07
Nodes (28): Accordion, Alert, ARIA Labels, Checkbox and Radio, Color Contrast, Command Palette Navigation, Component-Specific Patterns, Dialog/Modal Navigation (+20 more)

### Community 182 - "TestTailwindConfigGenerator"
Cohesion: 0.07
Nodes (15): Test TailwindConfigGenerator class., Test that adding same plugin twice doesn't duplicate., Test generating config with custom colors., Test generating config with plugins., Test writing configuration to file., Test writing config to invalid path., Test generating complete TypeScript configuration., Test initialization with different frameworks. (+7 more)

### Community 183 - "_select_palette_for_mode"
Cohesion: 0.14
Nodes (8): Execute searches across multiple domains., Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/density, Bucket a 1-10 dial value into its tier config. Returns None if value is None., _resolve_dial()

### Community 184 - "read_rows"
Cohesion: 0.15
Nodes (6): read_rows(), split_values(), style_identities(), TestGeneratedCatalogContract, TestLandingAndStackContract, TestStyleIdentityContract

### Community 185 - "html-token-validator.py"
Cohesion: 0.14
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 186 - "html-token-validator.py"
Cohesion: 0.14
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 187 - "search"
Cohesion: 0.10
Nodes (9): _exact_stack_identifier(), Resolve a deprecated in-domain alias, or expose a cross-domain redirect., Main search function with auto-domain detection, Resolve a standalone API identifier even when its BM25 IDF is low., search(), _style_search_destination(), TestSearchDomains, read_rows() (+1 more)

### Community 188 - "search"
Cohesion: 0.11
Nodes (7): Resolve a deprecated in-domain alias, or expose a cross-domain redirect., Main search function with auto-domain detection, search(), _style_search_destination(), TestSearchDomains, read_rows(), TestStyleTaxonomy

### Community 189 - "Asset Approval Checklist"
Cohesion: 0.08
Nodes (25): Accessibility, Archival, Asset Approval Checklist, Automation Support, Color Compliance, Common Issues & Fixes, Content Accessibility, Content Quality (+17 more)

### Community 190 - "Logo AI Prompt Engineering"
Cohesion: 0.08
Nodes (25): Common Pitfalls, Core Prompt Structure, Detailed Brief, Eco/Sustainable, Effective Keywords by Style, Fashion Brand, Healthcare, Industry-Specific Prompts (+17 more)

### Community 191 - "BM25"
Cohesion: 0.15
Nodes (5): BM25, BM25 ranking algorithm for text search, TestBm25CoreBehavior, TestDiagnosticsContracts, TestTokenizer

### Community 192 - "Asset Approval Checklist"
Cohesion: 0.08
Nodes (25): Accessibility, Archival, Asset Approval Checklist, Automation Support, Color Compliance, Common Issues & Fixes, Content Accessibility, Content Quality (+17 more)

### Community 193 - "Logo AI Prompt Engineering"
Cohesion: 0.08
Nodes (25): Common Pitfalls, Core Prompt Structure, Detailed Brief, Eco/Sustainable, Effective Keywords by Style, Fashion Brand, Healthcare, Industry-Specific Prompts (+17 more)

### Community 194 - "Color Palette Management"
Cohesion: 0.08
Nodes (24): Accessibility Requirements, Brand Compliance Validation, Checking Contrast, Color Documentation Format, Color Extraction, Color Palette Examples, Color Palette Management, Color System Structure (+16 more)

### Community 195 - "CIP Deliverable Guide"
Cohesion: 0.08
Nodes (24): Apparel, Business Card, Car/Sedan, CIP Deliverable Guide, Core Identity, Digital Assets, Email Signature, Envelope (+16 more)

### Community 196 - "BM25"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 197 - "States and Variants"
Cohesion: 0.08
Nodes (24): Accessibility, Accessibility Requirements, ARIA States, Color Contrast, Color Variants, Disabled States, Error Messages, Error States (+16 more)

### Community 198 - "UI Styling Skill"
Cohesion: 0.08
Nodes (24): Accessibility Patterns, Alternative: Tailwind-Only Setup, Best Practices, Common Patterns, Component Layer: shadcn/ui, Component Library Guide, Component + Styling Setup, Core Stack (+16 more)

### Community 199 - "Color Palette Management"
Cohesion: 0.08
Nodes (24): Accessibility Requirements, Brand Compliance Validation, Checking Contrast, Color Documentation Format, Color Extraction, Color Palette Examples, Color Palette Management, Color System Structure (+16 more)

### Community 200 - "CIP Deliverable Guide"
Cohesion: 0.08
Nodes (24): Apparel, Business Card, Car/Sedan, CIP Deliverable Guide, Core Identity, Digital Assets, Email Signature, Envelope (+16 more)

### Community 201 - "BM25"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 202 - "States and Variants"
Cohesion: 0.08
Nodes (24): Accessibility, Accessibility Requirements, ARIA States, Color Contrast, Color Variants, Disabled States, Error Messages, Error States (+16 more)

### Community 203 - "UI Styling Skill"
Cohesion: 0.08
Nodes (24): Accessibility Patterns, Alternative: Tailwind-Only Setup, Best Practices, Common Patterns, Component Layer: shadcn/ui, Component Library Guide, Component + Styling Setup, Core Stack (+16 more)

### Community 204 - "Workflow"
Cohesion: 0.08
Nodes (23): Art Direction Styles (Reuse from Banner), Color & Contrast, Design Best Practices, HTML Design Rules, HTML Template Structure, Option A: Chrome Headless CLI (Recommended — zero dependencies), Option B: chrome-devtools skill, Option C: Playwright script (+15 more)

### Community 205 - "_select_palette_for_mode"
Cohesion: 0.10
Nodes (14): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode.      Only the dark c (+6 more)

### Community 206 - "Workflow"
Cohesion: 0.08
Nodes (23): Art Direction Styles (Reuse from Banner), Color & Contrast, Design Best Practices, HTML Design Rules, HTML Template Structure, Option A: Chrome Headless CLI (Recommended — zero dependencies), Option B: chrome-devtools skill, Option C: Playwright script (+15 more)

### Community 207 - "Design System"
Cohesion: 0.09
Nodes (22): Best Practices, Chart.js Integration, Command, Component Spec Pattern, Contextual Decision Flow, Decision System CSVs, Design System, Integration (+14 more)

### Community 208 - "Tailwind CSS Customization"
Cohesion: 0.09
Nodes (22): @apply Directive, Best Practices, Color Customization, Complete Tailwind Config, Configuration Examples, Content Configuration, Custom Color Palette, Custom Font Sizes (+14 more)

### Community 209 - "Design System"
Cohesion: 0.09
Nodes (22): Best Practices, Chart.js Integration, Command, Component Spec Pattern, Contextual Decision Flow, Decision System CSVs, Design System, Integration (+14 more)

### Community 210 - "Tailwind CSS Customization"
Cohesion: 0.09
Nodes (22): @apply Directive, Best Practices, Color Customization, Complete Tailwind Config, Configuration Examples, Content Configuration, Custom Color Palette, Custom Font Sizes (+14 more)

### Community 211 - "spacing"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 212 - "radius"
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

### Community 213 - "DesignSystemGenerator"
Cohesion: 0.10
Nodes (14): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode.      Only the dark c (+6 more)

### Community 214 - "Routing by Task Type"
Cohesion: 0.10
Nodes (19): Banner Design Tasks, Brand Identity Tasks, Component Creation, Corporate Identity Program Tasks, Design Routing Guide, Design System Migration, Icon Design Tasks, Implementation Tasks (+11 more)

### Community 215 - "generate-slide.py"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 216 - "shadcn/ui Theming & Customization"
Cohesion: 0.10
Nodes (19): Base Color Presets, Best Practices, Color Customization, Color Format, Component Customization, CSS Variable System, Customize Styles, Customize Variants (+11 more)

### Community 217 - "TestShadcnInstaller"
Cohesion: 0.10
Nodes (11): Tests for shadcn_add.py, Test adding components that are already installed., Test ShadcnInstaller class., Test component addition with subprocess error., Test adding all components without config., Test adding all components in dry run mode., Create temporary project structure., Test initialization with custom project root. (+3 more)

### Community 218 - "Routing by Task Type"
Cohesion: 0.10
Nodes (19): Banner Design Tasks, Brand Identity Tasks, Component Creation, Corporate Identity Program Tasks, Design Routing Guide, Design System Migration, Icon Design Tasks, Implementation Tasks (+11 more)

### Community 219 - "generate-slide.py"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 220 - "shadcn/ui Theming & Customization"
Cohesion: 0.10
Nodes (19): Base Color Presets, Best Practices, Color Customization, Color Format, Component Customization, CSS Variable System, Customize Styles, Customize Variants (+11 more)

### Community 221 - "TestShadcnInstaller"
Cohesion: 0.10
Nodes (11): Tests for shadcn_add.py, Test adding components that are already installed., Test ShadcnInstaller class., Test component addition with subprocess error., Test adding all components without config., Test adding all components in dry run mode., Create temporary project structure., Test initialization with custom project root. (+3 more)

### Community 222 - "notifyPaymentSuccess.ts"
Cohesion: 0.29
Nodes (10): getUserRole(), POST(), POST(), getPaymentSuccessEmailTemplate(), DEFAULT_PAYMENT_NOTIFY_EMAILS, formatAmount(), getPaymentNotifyEmails(), notifyAdminOrderPaid() (+2 more)

### Community 223 - "Asset Organization Guide"
Cohesion: 0.11
Nodes (18): Asset Entry (manifest.json), Asset Organization Guide, By Campaign, By Status, By Type, Cleanup Workflow, Components, Directory Structure (+10 more)

### Community 224 - "Primary Color Meanings"
Cohesion: 0.11
Nodes (18): Accessibility Considerations, Analogous, Black, Blue, Color Combinations by Industry, Color Harmony Types, Complementary, Green (+10 more)

### Community 225 - "Core Logo Types"
Cohesion: 0.11
Nodes (18): 1. Wordmark (Logotype), 2. Lettermark (Monogram), 3. Pictorial Mark (Brand Mark), 4. Abstract Mark, 5. Mascot, 6. Emblem, 7. Combination Mark, Aesthetic Styles (+10 more)

### Community 226 - "color"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 227 - "DesignSystemGenerator"
Cohesion: 0.16
Nodes (6): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., TestReasoningMatch, read_rows(), TestReasoningContract

### Community 228 - "Asset Organization Guide"
Cohesion: 0.11
Nodes (18): Asset Entry (manifest.json), Asset Organization Guide, By Campaign, By Status, By Type, Cleanup Workflow, Components, Directory Structure (+10 more)

### Community 229 - "Primary Color Meanings"
Cohesion: 0.11
Nodes (18): Accessibility Considerations, Analogous, Black, Blue, Color Combinations by Industry, Color Harmony Types, Complementary, Green (+10 more)

### Community 230 - "Core Logo Types"
Cohesion: 0.11
Nodes (18): 1. Wordmark (Logotype), 2. Lettermark (Monogram), 3. Pictorial Mark (Brand Mark), 4. Abstract Mark, 5. Mascot, 6. Emblem, 7. Combination Mark, Aesthetic Styles (+10 more)

### Community 231 - "Brand Consistency Checklist"
Cohesion: 0.11
Nodes (17): Audit Frequency, Brand Consistency Checklist, Channel Audit, Collateral, Colors, Common Issues, Email, Imagery (+9 more)

### Community 232 - "CIP Mockup Prompt Engineering"
Cohesion: 0.11
Nodes (17): Apparel (Polo/T-Shirt), Base Prompt Structure, Business Card, CIP Mockup Prompt Engineering, Context Modifiers, Corporate Minimal, Deliverable-Specific Modifiers, Letterhead (+9 more)

### Community 233 - "fetch-background.py"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 234 - "TailwindConfigGenerator"
Cohesion: 0.11
Nodes (10): Generate Tailwind CSS configuration files., Add full color palette (50-950 shades) for a base color.          Args:, TailwindConfigGenerator, Test adding colors multiple times., Test adding custom breakpoints., Test plugin recommendations for Next.js., Test validating config with no content paths., Test default output path for JavaScript. (+2 more)

### Community 235 - "Brand Consistency Checklist"
Cohesion: 0.11
Nodes (17): Audit Frequency, Brand Consistency Checklist, Channel Audit, Collateral, Colors, Common Issues, Email, Imagery (+9 more)

### Community 236 - "CIP Mockup Prompt Engineering"
Cohesion: 0.11
Nodes (17): Apparel (Polo/T-Shirt), Base Prompt Structure, Business Card, CIP Mockup Prompt Engineering, Context Modifiers, Corporate Minimal, Deliverable-Specific Modifiers, Letterhead (+9 more)

### Community 237 - "fetch-background.py"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 238 - "TailwindConfigGenerator"
Cohesion: 0.11
Nodes (10): Generate Tailwind CSS configuration files., Add full color palette (50-950 shades) for a base color.          Args:, TailwindConfigGenerator, Test adding colors multiple times., Test adding custom breakpoints., Test plugin recommendations for Next.js., Test validating config with no content paths., Test default output path for JavaScript. (+2 more)

### Community 239 - "TestThresholdGate"
Cohesion: 0.13
Nodes (3): TestFixtureValidation, TestMetricMath, TestThresholdGate

### Community 240 - "BM25"
Cohesion: 0.10
Nodes (10): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, BM25, BM25 ranking algorithm for text search, TestBm25CoreBehavior (+2 more)

### Community 241 - "TestThresholdGate"
Cohesion: 0.13
Nodes (3): TestFixtureValidation, TestMetricMath, TestThresholdGate

### Community 242 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 243 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 244 - "generate.py"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 245 - "fontSize"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 246 - "ShadcnInstaller"
Cohesion: 0.23
Nodes (9): main(), Add all available shadcn/ui components.          Args:             overwrite: If, Handle shadcn/ui component installation., List installed components.          Returns:             Tuple of (success, mess, Check if shadcn is initialized in project.          Returns:             True if, Get list of already installed components.          Returns:             List of, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components.          Args:             components: List of compone (+1 more)

### Community 247 - "main"
Cohesion: 0.12
Nodes (8): main(), Add custom font families.          Args:             fonts: Dict of font_type: [, Add custom spacing values.          Args:             spacing: Dict of name: val, Add custom breakpoints.          Args:             breakpoints: Dict of name: wi, Add plugin requirements.          Args:             plugins: List of plugin name, Get plugin recommendations based on configuration.          Returns:, Validate configuration.          Returns:             Tuple of (valid, message), Add custom colors to theme.          Args:             colors: Dict of color_nam

### Community 249 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 250 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 251 - "generate.py"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 252 - "fontSize"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 253 - "ShadcnInstaller"
Cohesion: 0.23
Nodes (9): main(), Add all available shadcn/ui components.          Args:             overwrite: If, Handle shadcn/ui component installation., List installed components.          Returns:             Tuple of (success, mess, Check if shadcn is initialized in project.          Returns:             True if, Get list of already installed components.          Returns:             List of, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components.          Args:             components: List of compone (+1 more)

### Community 254 - "main"
Cohesion: 0.12
Nodes (8): main(), Add custom font families.          Args:             fonts: Dict of font_type: [, Add custom spacing values.          Args:             spacing: Dict of name: val, Add custom breakpoints.          Args:             breakpoints: Dict of name: wi, Add plugin requirements.          Args:             plugins: List of plugin name, Get plugin recommendations based on configuration.          Returns:, Validate configuration.          Returns:             Tuple of (valid, message), Add custom colors to theme.          Args:             colors: Dict of color_nam

### Community 256 - "CIP Design Reference"
Cohesion: 0.13
Nodes (14): CIP Brief (Start Here), CIP Design Reference, Commands, Deliverable Categories, Design Styles, Detailed References, Generate Mockups, HTML Presentation Features (+6 more)

### Community 257 - "Icon Design Reference"
Cohesion: 0.13
Nodes (14): Available Styles, CLI Options, Commands, Generate Batch Variations, Generate Multiple Sizes, Generate Single Icon, Icon Categories, Icon Design Reference (+6 more)

### Community 258 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 259 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 260 - "detect_domain"
Cohesion: 0.23
Nodes (3): detect_domain(), Auto-detect the most relevant domain from query.      Matches are weighted by ke, TestDomainDetection

### Community 261 - ".generate"
Cohesion: 0.18
Nodes (6): Execute searches across multiple domains., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/density, Bucket a 1-10 dial value into its tier config. Returns None if value is None., _resolve_dial()

### Community 262 - "CIP Design Reference"
Cohesion: 0.13
Nodes (14): CIP Brief (Start Here), CIP Design Reference, Commands, Deliverable Categories, Design Styles, Detailed References, Generate Mockups, HTML Presentation Features (+6 more)

### Community 263 - "Icon Design Reference"
Cohesion: 0.13
Nodes (14): Available Styles, CLI Options, Commands, Generate Batch Variations, Generate Multiple Sizes, Generate Single Icon, Icon Categories, Icon Design Reference (+6 more)

### Community 264 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 265 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 266 - "detect_domain"
Cohesion: 0.23
Nodes (3): detect_domain(), Auto-detect the most relevant domain from query.      Matches are weighted by ke, TestDomainDetection

### Community 267 - "Banner Design - Multi-Format Creative Banner System"
Cohesion: 0.14
Nodes (13): Art Direction Styles (Top 10), Banner Design - Multi-Format Creative Banner System, Banner Size Quick Reference, Design Rules, Prerequisites, Security, Step 1: Gather Requirements (AskUserQuestion), Step 2: Research & Art Direction (+5 more)

### Community 268 - "Messaging Framework"
Cohesion: 0.14
Nodes (13): Core Statements, Elevator Pitches, Framework Structure, Message Architecture, Message by Audience, Message Testing, Messaging Framework, Mission Statement (+5 more)

### Community 269 - "Brand Voice Framework"
Cohesion: 0.14
Nodes (13): Brand Voice Framework, Character Spectrum, Emotion Spectrum, Language Spectrum, Step 1: Define Personality Traits, Step 2: Create Voice Chart, Step 3: Context Adaptation, Tone Spectrum (+5 more)

### Community 270 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 271 - "Tailwind Integration"
Cohesion: 0.14
Nodes (13): Animation Tokens, Base Layer, Button Example, Component Classes, CSS Variables Setup, Dark Mode Toggle, HSL Format Benefits, shadcn/ui Alignment (+5 more)

### Community 272 - "radius"
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

### Community 273 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 274 - "parse_decision_rules"
Cohesion: 0.21
Nodes (8): Find matching reasoning rule for a category., Apply reasoning rules to search results., apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 275 - "Banner Design - Multi-Format Creative Banner System"
Cohesion: 0.14
Nodes (13): Art Direction Styles (Top 10), Banner Design - Multi-Format Creative Banner System, Banner Size Quick Reference, Design Rules, Prerequisites, Security, Step 1: Gather Requirements (AskUserQuestion), Step 2: Research & Art Direction (+5 more)

### Community 276 - "Messaging Framework"
Cohesion: 0.14
Nodes (13): Core Statements, Elevator Pitches, Framework Structure, Message Architecture, Message by Audience, Message Testing, Messaging Framework, Mission Statement (+5 more)

### Community 277 - "Brand Voice Framework"
Cohesion: 0.14
Nodes (13): Brand Voice Framework, Character Spectrum, Emotion Spectrum, Language Spectrum, Step 1: Define Personality Traits, Step 2: Create Voice Chart, Step 3: Context Adaptation, Tone Spectrum (+5 more)

### Community 278 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 279 - "Tailwind Integration"
Cohesion: 0.14
Nodes (13): Animation Tokens, Base Layer, Button Example, Component Classes, CSS Variables Setup, Dark Mode Toggle, HSL Format Benefits, shadcn/ui Alignment (+5 more)

### Community 280 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 281 - "orangeMoney.ts"
Cohesion: 0.21
Nodes (10): getUserId(), POST(), POST(), initiatePayment(), OrangeMoneyInitiateRequest, OrangeMoneyInitiateResponse, OrangeMoneyTransactionStatusRequest, OrangeMoneyTransactionStatusResponse (+2 more)

### Community 282 - "update.md"
Cohesion: 0.15
Nodes (12): Color Presets, Examples, Files Modified, Important, Overview, Skills Used, Step 1: Gather Brand Input, Step 2: Update Brand Guidelines (+4 more)

### Community 283 - "Logo Design Reference"
Cohesion: 0.15
Nodes (12): Available Styles, Color Psychology, Commands, Design Brief (Start Here), Detailed References, Generate Logo, Industry Defaults, Logo Design Reference (+4 more)

### Community 284 - "design-tokens-starter.json"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 285 - "update.md"
Cohesion: 0.15
Nodes (12): Color Presets, Examples, Files Modified, Important, Overview, Skills Used, Step 1: Gather Brand Input, Step 2: Update Brand Guidelines (+4 more)

### Community 286 - "Logo Design Reference"
Cohesion: 0.15
Nodes (12): Available Styles, Color Psychology, Commands, Design Brief (Start Here), Detailed References, Generate Logo, Industry Defaults, Logo Design Reference (+4 more)

### Community 287 - "primitive"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 288 - "parse_decision_rules"
Cohesion: 0.27
Nodes (6): apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 289 - "paytech.ts"
Cohesion: 0.26
Nodes (10): getUserId(), POST(), POST(), decodeCustomField(), initiatePayment(), PayTechInitiateRequest, PayTechInitiateResponse, PayTechWebhookPayload (+2 more)

### Community 290 - "card"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 291 - ".generate_config_string"
Cohesion: 0.20
Nodes (6): Generate configuration file content.          Returns:             Configuration, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config.          Validates each plugin name against a s, Add indentation to JSON string., Write configuration to file.          Returns:             Tuple of (success, me

### Community 292 - "_resolve_color_mode"
Cohesion: 0.21
Nodes (7): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary(), TestModeResolution

### Community 293 - ".generate_config_string"
Cohesion: 0.20
Nodes (6): Generate configuration file content.          Returns:             Configuration, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config.          Validates each plugin name against a s, Add indentation to JSON string., Write configuration to file.          Returns:             Tuple of (success, me

### Community 294 - "_resolve_color_mode"
Cohesion: 0.21
Nodes (7): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary(), TestModeResolution

### Community 295 - "Core Visual Elements"
Cohesion: 0.18
Nodes (10): Color Palette, Colors, Core Visual Elements, Logo, Logo, Quick Checks, Typography, Typography (+2 more)

### Community 296 - "CIP Design Style Guide"
Cohesion: 0.18
Nodes (10): Bold Dynamic, CIP Design Style Guide, Classic Traditional, Color Psychology, Corporate Minimal, Fresh Modern, Luxury Premium, Modern Tech (+2 more)

### Community 297 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 298 - "Core Visual Elements"
Cohesion: 0.18
Nodes (10): Color Palette, Colors, Core Visual Elements, Logo, Logo, Quick Checks, Typography, Typography (+2 more)

### Community 299 - "CIP Design Style Guide"
Cohesion: 0.18
Nodes (10): Bold Dynamic, CIP Design Style Guide, Classic Traditional, Color Psychology, Corporate Minimal, Fresh Modern, Luxury Premium, Modern Tech (+2 more)

### Community 300 - "Brand"
Cohesion: 0.20
Nodes (9): Brand, Brand Sync Workflow, Quick Start, References, Routing, Scripts, Subcommands, Templates (+1 more)

### Community 301 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 302 - "generate.py"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation      Args:         asp, Generate multiple logo variants with different styles (+1 more)

### Community 303 - "button"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 304 - "duration"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 305 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 306 - "._base_config"
Cohesion: 0.22
Nodes (6): Any, Path, Initialize generator.          Args:             typescript: If True, generate ., Determine default output path., Create base configuration structure., Get default content paths for framework.

### Community 307 - "TestGeneratedConfigIsValidJs"
Cohesion: 0.22
Nodes (7): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be     han, Regression guard for the missing-comma bug between the ``theme`` block and     `, The property preceding ``plugins`` must end with a comma (pure-Python         ch, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs

### Community 308 - "TestTextLayoutDataContracts"
Cohesion: 0.22
Nodes (3): read_rows(), TestTextLayoutDataContracts, TestTextLayoutRetrieval

### Community 309 - "Brand"
Cohesion: 0.20
Nodes (9): Brand, Brand Sync Workflow, Quick Start, References, Routing, Scripts, Subcommands, Templates (+1 more)

### Community 310 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 311 - "generate.py"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation      Args:         asp, Generate multiple logo variants with different styles (+1 more)

### Community 312 - "duration"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 313 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 314 - "._base_config"
Cohesion: 0.22
Nodes (6): Any, Path, Initialize generator.          Args:             typescript: If True, generate ., Determine default output path., Create base configuration structure., Get default content paths for framework.

### Community 315 - "TestGeneratedConfigIsValidJs"
Cohesion: 0.22
Nodes (7): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be     han, Regression guard for the missing-comma bug between the ``theme`` block and     `, The property preceding ``plugins`` must end with a comma (pure-Python         ch, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs

### Community 316 - "TestTextLayoutDataContracts"
Cohesion: 0.22
Nodes (3): read_rows(), TestTextLayoutDataContracts, TestTextLayoutRetrieval

### Community 317 - "_run"
Cohesion: 0.28
Nodes (8): CompletedProcess, Path, Regression tests for validate-tokens.cjs.  The validator used to skip any line c, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation()

### Community 318 - "_normalize"
Cohesion: 0.25
Nodes (9): _exact_match_diagnostic(), _legacy_successor_guidance(), _normalize(), Apply longest-first synonym substitution at token boundaries., Whether a stack query explicitly targets an older framework generation., Choose one coherent applicability generation for stack retrieval., Prefer the explicit successor row for a brand-new app on legacy-only stacks., _stack_query_requests_legacy() (+1 more)

### Community 319 - "_run"
Cohesion: 0.28
Nodes (8): CompletedProcess, Path, Regression tests for validate-tokens.cjs.  The validator used to skip any line c, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation()

### Community 320 - "_normalize"
Cohesion: 0.25
Nodes (9): _exact_match_diagnostic(), _legacy_successor_guidance(), _normalize(), Apply longest-first synonym substitution at token boundaries., Whether a stack query explicitly targets an older framework generation., Choose one coherent applicability generation for stack retrieval., Prefer the explicit successor row for a brand-new app on legacy-only stacks., _stack_query_requests_legacy() (+1 more)

### Community 321 - "input"
Cohesion: 0.20
Nodes (12): padding-x, padding-y, input, $type, $value, focus-ring, padding-x, padding-y (+4 more)

### Community 322 - "_suggest_identities"
Cohesion: 0.25
Nodes (8): _exact_row_identity(), Suggest complete public identities so a retry can bypass score thresholds., Return non-empty public identities from ordinary and alias fields., Resolve an explicit style identity without opening generic variant ranking., Return one row whose stable public identity exactly matches the query., _row_identities(), _style_identity(), _suggest_identities()

### Community 323 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.25
Nodes (7): How to Use, Primary Use Cases, Recommended, Rule Categories by Priority, Skip, UI/UX Pro Max - Design Intelligence, When to Apply

### Community 324 - "Solution : Ajouter l'URL de redirection dans Supabase"
Cohesion: 0.43
Nodes (3): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., TestAntiPatternGating

### Community 325 - "_suggest_identities"
Cohesion: 0.13
Nodes (15): Configuration recommandée pour la production, Configurer les URLs de redirection dans Supabase, Dépannage, Développement local, Erreur persiste après configuration, Format des URLs, L'URL change selon l'environnement, Problème (+7 more)

### Community 326 - "Slides Reference"
Cohesion: 0.29
Nodes (6): Key Features, Knowledge Base, Slides Reference, Usage, When to Use, Workflow

### Community 327 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 328 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 329 - "Query Contract"
Cohesion: 0.29
Nodes (7): Query Contract, Step 1: Analyze User Requirements, Step 2: Generate Design System (new projects/pages), Step 2b: Persist Design System (Master + Overrides Pattern), Step 2c: Design Dials (optional), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 330 - "Slides Reference"
Cohesion: 0.29
Nodes (6): Key Features, Knowledge Base, Slides Reference, Usage, When to Use, Workflow

### Community 331 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 332 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 333 - "_filter_anti_patterns_for_mode"
Cohesion: 0.43
Nodes (3): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., TestAntiPatternGating

### Community 334 - "Slides"
Cohesion: 0.33
Nodes (5): References (Knowledge Base), Routing, Slides, Subcommands, When to Use

### Community 335 - "Pre-Delivery Checklist"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 336 - "Prerequisites"
Cohesion: 0.33
Nodes (6): Available Domains, Available Stacks, How to Use This Skill, Output Formats, Prerequisites, Search Reference

### Community 337 - "Slides"
Cohesion: 0.33
Nodes (5): References (Knowledge Base), Routing, Slides, Subcommands, When to Use

### Community 338 - "Solutions"
Cohesion: 0.33
Nodes (6): Solution 1 : Vérifier les logs, Solution 2 : Vérifier manuellement dans Supabase, Solution 3 : Confirmer manuellement l'email, Solution 4 : Vérifier le type de code, Solution 5 : Tester avec un nouveau compte, Solutions

### Community 339 - "Brand Guidelines Template"
Cohesion: 0.40
Nodes (4): Brand Guidelines Template, Document Structure, Extractable Fields, Usage

### Community 340 - "$type"
Cohesion: 0.48
Nodes (4): GET(), POST(), resend, getPromoEndingEmailTemplate()

### Community 341 - "radius"
Cohesion: 0.16
Nodes (5): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., TestReasoningMatch, TestReasoningContract

### Community 342 - "lg"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

### Community 343 - "sm"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 344 - "Common Rules for Professional UI"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 345 - "Example Workflow"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System, Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 346 - "Brand Guidelines Template"
Cohesion: 0.40
Nodes (4): Brand Guidelines Template, Document Structure, Extractable Fields, Usage

### Community 347 - "sm"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 348 - "Solutions"
Cohesion: 0.25
Nodes (8): Pour la production (votre domaine) :, Pour le développement local (si vous testez en local) :, Si vous utilisez ngrok ou un autre tunnel :, Solution : Ajouter l'URL de redirection dans Supabase, Étape 1 : Aller dans les paramètres d'authentification, Étape 2 : Ajouter les URLs de redirection, Étape 3 : Ajouter les Site URLs autorisées, Étape 4 : Sauvegarder

### Community 349 - "padding-y"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 350 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 351 - "none"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 352 - "Tips for Better Results"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 353 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 356 - "16"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 357 - "1"
Cohesion: 0.40
Nodes (5): 1. Ajouter le domaine, 2. Configurer les DNS, 3. Attendre la propagation, 4. Vérifier le certificat SSL, Configuration complète du domaine sur Vercel

### Community 358 - "3"
Cohesion: 0.40
Nodes (5): Dépannage, La redirection après confirmation ne fonctionne pas, Les emails de confirmation ne sont pas envoyés, Les utilisateurs existants ne peuvent plus se connecter, Les utilisateurs ne reçoivent pas les emails

### Community 359 - "8"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 360 - "destructive"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 361 - "destructive-foreground"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 362 - "muted"
Cohesion: 0.67
Nodes (3): $type, $value, 2

### Community 363 - "primary-foreground"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 364 - "ring"
Cohesion: 0.67
Nodes (4): $type, $value, md, md

### Community 365 - "Problèmes courants"
Cohesion: 0.50
Nodes (4): 1. Les redirections ne fonctionnent pas, 2. Orange Money rejette les URLs, 3. La variable n'est pas accessible côté client, Problèmes courants

### Community 370 - "Solution : Ajouter l'URL de redirection dans Supabase"
Cohesion: 0.25
Nodes (8): Pour la production (votre domaine) :, Pour le développement local (si vous testez en local) :, Si vous utilisez ngrok ou un autre tunnel :, Solution : Ajouter l'URL de redirection dans Supabase, Étape 1 : Aller dans les paramètres d'authentification, Étape 2 : Ajouter l'URL de callback pour la confirmation d'email, Étape 3 : Vérifier la Site URL, Étape 4 : Sauvegarder

### Community 371 - "primary-hover"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 430 - "destructive-foreground"
Cohesion: 0.50
Nodes (4): Development (local), Différences entre environnements, Preview (Pull Requests), Production

### Community 431 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 432 - "primary-foreground"
Cohesion: 0.50
Nodes (4): Vérification étape par étape, Étape 1 : Vérifier que le domaine existe, Étape 2 : Vérifier les enregistrements DNS, Étape 3 : Vérifier dans Vercel

### Community 433 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 434 - "secondary-foreground"
Cohesion: 0.50
Nodes (4): 1. Créer une application, 2. Ajouter l'API Orange Money WebPayDev, 3. Obtenir l'Access Token, Obtention des identifiants

### Community 435 - "_suggest_identities"
Cohesion: 0.25
Nodes (8): _exact_row_identity(), Suggest complete public identities so a retry can bypass score thresholds., Return non-empty public identities from ordinary and alias fields., Resolve an explicit style identity without opening generic variant ranking., Return one row whose stable public identity exactly matches the query., _row_identities(), _style_identity(), _suggest_identities()

### Community 436 - "12"
Cohesion: 0.67
Nodes (3): $type, $value, 12

### Community 437 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 438 - "radius"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 439 - "lg"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 440 - "Solutions"
Cohesion: 0.40
Nodes (5): Solution 1 : Vérifier que le domaine est configuré dans Vercel, Solution 2 : Configurer les enregistrements DNS, Solution 3 : Utiliser l'URL Vercel temporairement, Solution 4 : Pour le développement local, Solutions

### Community 441 - "2"
Cohesion: 0.67
Nodes (3): $type, $value, 2

### Community 442 - "4"
Cohesion: 0.67
Nodes (3): $type, $value, 4

### Community 443 - "destructive"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 444 - "0"
Cohesion: 0.67
Nodes (3): $type, $value, 0

### Community 445 - "md"
Cohesion: 0.67
Nodes (4): $type, $value, md, md

### Community 446 - "6"
Cohesion: 0.67
Nodes (3): $type, $value, 6

### Community 447 - "foreground"
Cohesion: 0.67
Nodes (3): foreground, $type, $value

### Community 448 - "16"
Cohesion: 0.67
Nodes (3): muted-foreground, $type, $value

### Community 449 - "1"
Cohesion: 0.67
Nodes (3): primary-hover, $type, $value

### Community 451 - "8"
Cohesion: 0.67
Nodes (3): $type, $value, 8

### Community 453 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 454 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 455 - "8"
Cohesion: 0.67
Nodes (3): $type, $value, 8

## Knowledge Gaps
- **2326 isolated node(s):** `$schema`, `$value`, `$type`, `$value`, `$type` (+2321 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **154 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DesignSystemGenerator` connect `DesignSystemGenerator` to `detect_domain`, `.generate`, `detect_domain`, `Promo Email API`, `parse_decision_rules`, `design_system.py`, `_resolve_color_mode`, `_resolve_color_mode`, `design_system.py`, `read_rows`, `read_rows`, `search`, `search`, `BM25`, `Solution : Ajouter l'URL de redirection dans Supabase`, `_select_palette_for_mode`, `_filter_anti_patterns_for_mode`, `radius`, `DesignSystemGenerator`, `BM25`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `search()` connect `search` to `_normalize`, `search_stack`, `design_system.py`, `core.py`, `detect_domain`, `Problèmes courants`, `BM25`, `_suggest_identities`, `_select_palette_for_mode`, `TestTextLayoutDataContracts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `TestSearchDomains` connect `search` to `BM25`, `search_stack`, `DesignSystemGenerator`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 46 inferred relationships involving `DesignSystemGenerator` (e.g. with `TestBm25CoreBehavior` and `TestDiagnosticsContracts`) actually correct?**
  _`DesignSystemGenerator` has 46 INFERRED edges - model-reasoned connections that need verification._
- **Are the 38 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `.test_node_check_parses_generated_config()`) actually correct?**
  _`TailwindConfigGenerator` has 38 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `TailwindConfigGenerator` (e.g. with `.test_node_check_parses_generated_config()` and `.test_property_before_plugins_is_comma_terminated()`) actually correct?**
  _`TailwindConfigGenerator` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `search()` (e.g. with `.generate()` and `._multi_domain_search()`) actually correct?**
  _`search()` has 22 INFERRED edges - model-reasoned connections that need verification._