# Template de confirmation d'email amélioré

## Guide d'utilisation

Ce document contient un template HTML professionnel pour l'email de confirmation d'inscription dans Supabase.

## Comment l'utiliser dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Email Templates**
4. Sélectionner le template **"Confirm signup"**
5. Copier le contenu HTML ci-dessous dans le champ **Body**
6. Personnaliser si nécessaire (logo, couleurs, texte)
7. **Sauvegarder** les modifications

## Template HTML complet

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmer votre email - VB Sniper Academie</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header avec logo -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                VB Sniper Academie
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Formations et coaching Trading depuis 2022
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; line-height: 1.3;">
                Bienvenue ! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Merci de vous être inscrit sur <strong style="color: #d4af37;">VB Sniper Academie</strong> ! Nous sommes ravis de vous accueillir dans notre communauté de traders.
              </p>
              
              <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Pour finaliser votre inscription et accéder à votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
              </p>

              <!-- Bouton de confirmation -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #d4af37; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3); transition: background-color 0.3s;">
                      Confirmer mon email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Lien alternatif -->
              <p style="margin: 30px 0 20px; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="margin: 0 0 30px; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #d4af37; text-decoration: underline; font-size: 14px;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Informations importantes -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #d4af37;">⏰ Important :</strong> Ce lien est valide pendant <strong>24 heures</strong>. Après ce délai, vous devrez demander un nouveau lien de confirmation.
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Une fois votre email confirmé, vous pourrez accéder à votre espace membre et commencer votre formation.
              </p>
            </td>
          </tr>

          <!-- Séparateur -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #fafafa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 15px; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                <strong style="color: #1a1a1a;">Besoin d'aide ?</strong>
              </p>
              <p style="margin: 0 0 20px; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
              </p>
              
              <p style="margin: 0 0 10px; color: #6a6a6a; font-size: 13px;">
                <strong>VB Sniper Academie</strong><br>
                Formations et coaching Trading
              </p>
              
              <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                © 2024 VB Sniper Academie. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Template texte simple (alternative)

Si vous préférez un email en texte simple, voici une version alternative :

```
Bonjour,

Merci de vous être inscrit sur VB Sniper Academie ! Nous sommes ravis de vous accueillir dans notre communauté de traders.

Pour finaliser votre inscription et accéder à votre compte, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

{{ .ConfirmationURL }}

⏰ Important : Ce lien est valide pendant 24 heures. Après ce délai, vous devrez demander un nouveau lien de confirmation.

Une fois votre email confirmé, vous pourrez accéder à votre espace membre et commencer votre formation.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe VB Sniper Academie

---
VB Sniper Academie
Formations et coaching Trading depuis 2022
© 2024 VB Sniper Academie. Tous droits réservés.
```

## Personnalisation

### Variables disponibles dans Supabase

- `{{ .ConfirmationURL }}` : URL de confirmation (à inclure obligatoirement)
- `{{ .Email }}` : Email de l'utilisateur
- `{{ .SiteURL }}` : URL de votre site

### Modifier les couleurs

Dans le template HTML, vous pouvez modifier :
- **Couleur principale (or)** : `#d4af37` → Remplacez par votre couleur de marque
- **Couleur de fond** : `#f5f5f5` → Modifiez selon vos préférences
- **Couleur du texte** : `#4a4a4a` → Ajustez pour le contraste

### Ajouter un logo

Pour ajouter un logo, remplacez le header texte par :

```html
<tr>
  <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); border-radius: 8px 8px 0 0;">
    <img src="https://vbsniperacademie.com/logo/logo.png" alt="VB Sniper Academie" style="max-width: 120px; height: auto; margin-bottom: 15px;">
    <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
      Formations et coaching Trading depuis 2022
    </p>
  </td>
</tr>
```

**Note** : Assurez-vous que l'URL du logo est accessible publiquement.

## Sujet de l'email (Subject)

Dans Supabase, configurez le **Subject** du template avec :

```
Confirmez votre email - VB Sniper Academie
```

Ou une variante :

```
Bienvenue ! Confirmez votre inscription - VB Sniper Academie
```

## Test du template

### Tester dans Supabase

1. Aller dans **Authentication** → **Email Templates**
2. Cliquer sur **"Send test email"** (si disponible)
3. Entrer votre email de test
4. Vérifier la réception et l'affichage

### Tester avec un compte réel

1. Créer un compte de test
2. Vérifier que l'email arrive correctement
3. Tester le lien de confirmation
4. Vérifier l'affichage sur différents clients email (Gmail, Outlook, etc.)

## Compatibilité

Le template est compatible avec :
- ✅ Gmail (web et mobile)
- ✅ Outlook (web et desktop)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ La plupart des clients email modernes

## Bonnes pratiques

1. **Tester sur plusieurs clients** : Vérifiez l'affichage sur différents clients email
2. **Responsive** : Le template s'adapte aux écrans mobiles
3. **Accessibilité** : Utilisez des couleurs avec un bon contraste
4. **Liens clairs** : Le lien de confirmation est visible et facile à cliquer
5. **Message de sécurité** : Informez l'utilisateur s'il n'a pas créé de compte

## Dépannage

### Le template ne s'affiche pas correctement

1. Vérifier que le HTML est valide
2. Vérifier que les variables `{{ .ConfirmationURL }}` sont correctement utilisées
3. Tester avec un email de test

### Le lien de confirmation ne fonctionne pas

1. Vérifier que `{{ .ConfirmationURL }}` est présent dans le template
2. Vérifier les URLs de redirection dans Supabase (voir `CONFIGURER_URLS_REDIRECTION_SUPABASE.md`)
3. Vérifier que la page `/auth/callback` existe

## Ressources

- [Documentation Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Guide de configuration des URLs](CONFIGURER_URLS_REDIRECTION_SUPABASE.md)
- [Réactiver la confirmation d'email](REACTIVER_CONFIRMATION_EMAIL.md)

