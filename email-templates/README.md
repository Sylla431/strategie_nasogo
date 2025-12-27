# Templates d'email Supabase

## Configuration dans Supabase

1. Allez dans **Supabase Dashboard > Authentication > Email Templates**
2. Sélectionnez **Reset Password**
3. Copiez le contenu des fichiers ci-dessous

## Fichiers

- `reset-password.html` - Template HTML pour le corps de l'email
- `reset-password-subject.txt` - Sujet de l'email

## Variables disponibles dans Supabase

- `{{ .ConfirmationURL }}` - URL de réinitialisation
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .Token }}` - Token de réinitialisation (rarement utilisé)
- `{{ .TokenHash }}` - Hash du token (rarement utilisé)
- `{{ .SiteURL }}` - URL de votre site

## Instructions

1. **Sujet de l'email** : Copiez le contenu de `reset-password-subject.txt`
2. **Corps de l'email** : Copiez le contenu de `reset-password.html`
3. **Test** : Testez en demandant une réinitialisation de mot de passe

## Personnalisation

Vous pouvez modifier :
- Les couleurs (actuellement : doré/brand #d4af37)
- Le logo (remplacer par une image si vous en avez une)
- Les informations de contact
- Le style général

## Notes

- Le template est responsive et fonctionne sur mobile
- Les couleurs correspondent au branding VB Sniper Academie
- Le template inclut un avertissement de sécurité
- Le lien alternatif est fourni au cas où le bouton ne fonctionne pas


