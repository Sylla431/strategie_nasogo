# Graph Report - .  (2026-07-09)

## Corpus Check
- Large corpus: 171 files · ~561,212 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 452 nodes · 766 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `createSupabaseFromRequest()` - 35 edges
2. `requireAdmin()` - 24 edges
3. `getTelegramConfig()` - 21 edges
4. `compilerOptions` - 16 edges
5. `isSubscriptionActive()` - 15 edges
6. `findSubscriptionForAccount()` - 12 edges
7. `isUuid()` - 9 edges
8. `supabase` - 9 edges
9. `handleStartWithToken()` - 9 edges
10. `resolveUserFromEmailOrId()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Corriger erreur confirmation email` --semantically_similar_to--> `Configurer URLs redirection Supabase`  [INFERRED] [semantically similar]
  CORRIGER_ERREUR_CONFIRMATION_EMAIL.md → CONFIGURER_URLS_REDIRECTION_SUPABASE.md
- `VB Sniper Académie` --semantically_similar_to--> `vbsniperacademie.com`  [INFERRED] [semantically similar]
  .cursor/plans/int-gration-orange-money-6ca8dea5.plan.md → DEPANNAGE_DNS_DOMAINE.md
- `Resend SMTP for Supabase` --semantically_similar_to--> `Resend`  [INFERRED] [semantically similar]
  CONFIGURER_SMTP_SUPABASE.md → AUTOMATISER_AJOUT_CONTACTS_RESEND.md
- `Corriger problème email spam` --semantically_similar_to--> `Configurer SMTP Supabase`  [INFERRED] [semantically similar]
  CORRIGER_PROBLEME_EMAIL_SPAM.md → CONFIGURER_SMTP_SUPABASE.md
- `Frais undefined undefined (Orange Money)` --semantically_similar_to--> `Orange Money WebPayment API`  [INFERRED] [semantically similar]
  DEPANNAGE_UNDEFINED_ORANGE_MONEY.md → ORANGE_MONEY_SETUP.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Orange Money payment token lifecycle** — ajouter_colonne_payment_reference_pay_token, ajouter_colonne_payment_reference_notif_token, ajouter_colonne_payment_reference_txnid, ajouter_colonne_payment_reference_payment_reference, comment_obtenir_codes_paiement_orange_money_initiate, ajouter_fonction_acces_automatique_orange_money_webhook [EXTRACTED 1.00]
- **Supabase auth email redirect configuration** — configurer_urls_redirection_supabase_redirect_urls, configurer_urls_redirection_supabase_auth_callback, configurer_urls_redirection_supabase_auth_reset_password, corriger_erreur_confirmation_email_requested_path_invalid, configurer_vercel_env_next_public_app_url [INFERRED 0.85]
- **Transactional email deliverability stack** — configurer_smtp_supabase_custom_smtp, configurer_smtp_supabase_resend_smtp, configurer_smtp_supabase_spf_dkim_dmarc, corriger_probleme_email_spam_deliverability, automatiser_ajout_contacts_resend_resend [INFERRED 0.75]
- **Orange Money payment configuration and ops** — orange_money_setup_webpayment_api, orange_money_next_steps_oauth_access_token, orange_money_setup_notif_token, orange_money_next_steps_ussd_simulator, depannage_undefined_orange_money_currency_ouv_xof [INFERRED 0.85]
- **Multi-provider payment and course access** — integration_paytech_moneroo_paytech, integration_paytech_moneroo_moneroo, orange_money_setup_webpayment_api, integration_paytech_moneroo_grant_course_access, integration_paytech_moneroo_payment_method_routing [EXTRACTED 1.00]
- **Supabase auth email templates** — template_confirmation_email_confirm_signup, email_templates_readme_reset_password, email_templates_reset_password_simple_vb_sniper, reactiver_confirmation_email_supabase_confirm, template_confirmation_email_confirmation_url [INFERRED 0.75]

## Communities (29 total, 5 thin omitted)

### Community 0 - "Course Access APIs"
Cohesion: 0.07
Nodes (40): GET(), getProfileRole(), POST(), GET(), getProfileRole(), GET(), getRole(), POST() (+32 more)

### Community 1 - "Orders Payment Access SQL"
Cohesion: 0.05
Nodes (47): Ajouter colonne payment_reference, notif_token, orders table, pay_token, orders.payment_reference, txnid, Ajouter fonction accès automatique, grant_course_access (+39 more)

### Community 2 - "Students Admin APIs"
Cohesion: 0.13
Nodes (29): GET(), POST(), RecordPaymentPayload, CourseRelation, DELETE(), GET(), PUT(), StudentProfile (+21 more)

### Community 3 - "Auth Reset Pages"
Cohesion: 0.07
Nodes (17): Mode, Course, CourseAccess, CourseVideo, Order, Course, CourseVideo, Countdown (+9 more)

### Community 4 - "Payment Providers Docs"
Cohesion: 0.09
Nodes (32): Currency OUV sandbox / XOF production, Dépannage Frais undefined Orange Money, Frais undefined undefined (Orange Money), Gestion des échecs de paiement, Double payment protection on /api/orders, hasPaidAccess button guard, orders status failed, Intégration PayTech et Moneroo (+24 more)

### Community 5 - "Admin Dashboard Pages"
Cohesion: 0.08
Nodes (20): AdminStudentsPage(), CourseOption, PaymentInstallment, statusLabel, StudentDetailResponse, StudentPaymentFilterOption, StudentSortOption, StudentSummary (+12 more)

### Community 6 - "Telegram Bot APIs"
Cohesion: 0.17
Nodes (25): GET(), isAuthorized(), POST(), GET(), GET(), GET(), PATCH(), POST() (+17 more)

### Community 7 - "Orange Money Payment APIs"
Cohesion: 0.18
Nodes (22): POST(), POST(), GET(), POST(), callTelegramApi(), createPersonalInviteLink(), sendTelegramMessage(), TelegramApiResponse (+14 more)

### Community 8 - "NPM Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, grammy, next, react, react-dom, resend, @supabase/supabase-js, devDependencies (+17 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Email Templates Resend"
Cohesion: 0.17
Nodes (14): Templates email Supabase README, Supabase Reset Password template, VB Sniper Academie password reset email, Sujet réinitialisation mot de passe, Guide emails promotionnels Resend, getPromoEndingEmailTemplate (emailTemplates.ts), Resend, API /api/email/send-promo (+6 more)

### Community 11 - "PayTech Moneroo Code"
Cohesion: 0.26
Nodes (10): getUserId(), POST(), POST(), decodeCustomField(), initiatePayment(), PayTechInitiateRequest, PayTechInitiateResponse, PayTechWebhookPayload (+2 more)

### Community 12 - "Resend SMTP Setup"
Cohesion: 0.20
Nodes (12): Automatiser ajout contacts Resend, POST /api/resend/add-contact, RESEND_AUDIENCE_ID, Resend, Configurer SMTP Supabase, Supabase Custom SMTP, Mailgun SMTP, Resend SMTP for Supabase (+4 more)

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

## Ambiguous Edges - Review These
- `Templates email Supabase README` → `reset-password-simple.html`  [AMBIGUOUS]
  email-templates/README.md · relation: references

## Knowledge Gaps
- **128 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Templates email Supabase README` and `reset-password-simple.html`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `createSupabaseFromRequest()` connect `Course Access APIs` to `PayTech Moneroo Code`, `Telegram Bot APIs`, `Orange Money Payment APIs`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `supabase` connect `Auth Reset Pages` to `Admin Dashboard Pages`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `sanitizePhoneInput()` connect `Students Admin APIs` to `Admin Dashboard Pages`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Course Access APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.07077922077922078 - nodes in this community are weakly interconnected._
- **Should `Orders Payment Access SQL` be split into smaller, more focused modules?**
  _Cohesion score 0.05087881591119334 - nodes in this community are weakly interconnected._