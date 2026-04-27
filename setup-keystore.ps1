# Script de configuration du keystore Android
# Utilisation: ./setup-keystore.ps1

Write-Host "=== Configuration du Keystore Android ===" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Générer le keystore s'il n'existe pas
$keystorePath = "android/syndicly-release.jks"

if (Test-Path $keystorePath) {
    Write-Host "✅ Keystore trouvé : $keystorePath" -ForegroundColor Green
} else {
    Write-Host "❌ Keystore non trouvé. Génération..." -ForegroundColor Yellow
    Write-Host ""

    # Demander les paramètres
    $storePass = Read-Host "Mot de passe du keystore"
    $keyPass = Read-Host "Mot de passe de la clé"
    $keyAlias = "syndicly-key"

    Write-Host "Génération de la clé... (cela peut prendre 30 secondes)" -ForegroundColor Cyan

    # Générer avec keytool
    & keytool -genkey -v `
        -keystore $keystorePath `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -alias $keyAlias `
        -storepass $storePass `
        -keypass $keyPass `
        -dname "CN=Syndicly, OU=Development, O=Syndicly, L=Casablanca, S=Casablanca-Settat, C=MA"

    Write-Host ""
    Write-Host "✅ Keystore généré avec succès!" -ForegroundColor Green
}

# Étape 2 : Convertir en base64 pour GitHub Secrets
Write-Host ""
Write-Host "=== Conversion en Base64 ===" -ForegroundColor Cyan

$keystoreBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($keystorePath))

Write-Host ""
Write-Host "Voici votre keystore en base64 (à copier dans GitHub Secrets):" -ForegroundColor Yellow
Write-Host "Longueur: $($keystoreBase64.Length) caractères" -ForegroundColor Gray
Write-Host ""

# Copier dans le presse-papiers
$keystoreBase64 | Set-Clipboard
Write-Host "✅ Copié dans le presse-papiers!" -ForegroundColor Green

# Afficher le premier et dernier morceau
$first100 = $keystoreBase64.Substring(0, 100)
$last100 = $keystoreBase64.Substring($keystoreBase64.Length - 100)

Write-Host ""
Write-Host "Début: $first100..." -ForegroundColor Gray
Write-Host "Fin:   ...$last100" -ForegroundColor Gray

# Étape 3 : Instructions pour GitHub
Write-Host ""
Write-Host "=== Ajouter à GitHub Secrets ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur: https://github.com/YOUR_USERNAME/syndic-mobile/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Cliquez sur 'New repository secret'"
Write-Host "3. Ajoutez ces 4 secrets:" -ForegroundColor White
Write-Host ""
Write-Host "   Secret 1:" -ForegroundColor Yellow
Write-Host "   Nom: ANDROID_KEYSTORE_FILE" -ForegroundColor White
Write-Host "   Valeur: (contenu copié au presse-papiers)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret 2:" -ForegroundColor Yellow
Write-Host "   Nom: ANDROID_KEYSTORE_PASSWORD" -ForegroundColor White
Write-Host "   Valeur: (le mot de passe du keystore)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret 3:" -ForegroundColor Yellow
Write-Host "   Nom: ANDROID_KEY_ALIAS" -ForegroundColor White
Write-Host "   Valeur: syndicly-key" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret 4:" -ForegroundColor Yellow
Write-Host "   Nom: ANDROID_KEY_PASSWORD" -ForegroundColor White
Write-Host "   Valeur: (le mot de passe de la clé)" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Copiez le contenu base64 dans GitHub Secrets → ANDROID_KEYSTORE_FILE" -ForegroundColor White
Write-Host "2. Ajoutez les mots de passe aux autres secrets" -ForegroundColor White
Write-Host "3. Poussez vos changements: git push" -ForegroundColor White
Write-Host "4. La build démarre automatiquement dans Actions!" -ForegroundColor White
