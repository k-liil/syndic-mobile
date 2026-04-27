#!/bin/bash

# Script de configuration du keystore Android pour Linux/Mac
# Utilisation: chmod +x setup-keystore.sh && ./setup-keystore.sh

echo "=== Configuration du Keystore Android ==="
echo ""

KEYSTORE_PATH="android/syndicly-release.jks"

# Étape 1 : Générer le keystore s'il n'existe pas
if [ -f "$KEYSTORE_PATH" ]; then
    echo "✅ Keystore trouvé : $KEYSTORE_PATH"
else
    echo "❌ Keystore non trouvé. Génération..."
    echo ""

    read -p "Mot de passe du keystore: " STORE_PASS
    read -p "Mot de passe de la clé: " KEY_PASS

    KEY_ALIAS="syndicly-key"

    echo "Génération de la clé... (cela peut prendre 30 secondes)"

    keytool -genkey -v \
        -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias "$KEY_ALIAS" \
        -storepass "$STORE_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=Syndicly, OU=Development, O=Syndicly, L=Casablanca, S=Casablanca-Settat, C=MA"

    echo ""
    echo "✅ Keystore généré avec succès!"
fi

# Étape 2 : Convertir en base64
echo ""
echo "=== Conversion en Base64 ==="
echo ""

KEYSTORE_BASE64=$(base64 < "$KEYSTORE_PATH")

echo "Voici votre keystore en base64 (à copier dans GitHub Secrets):"
echo "Longueur: ${#KEYSTORE_BASE64} caractères"
echo ""
echo "$KEYSTORE_BASE64"
echo ""

# Sur Mac, copier dans le presse-papiers
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "$KEYSTORE_BASE64" | pbcopy
    echo "✅ Copié dans le presse-papiers!"
fi

# Étape 3 : Instructions
echo ""
echo "=== Ajouter à GitHub Secrets ==="
echo ""
echo "1. Allez sur: https://github.com/YOUR_USERNAME/syndic-mobile/settings/secrets/actions"
echo "2. Cliquez sur 'New repository secret'"
echo "3. Ajoutez ces 4 secrets:"
echo ""
echo "   ANDROID_KEYSTORE_FILE = (contenu ci-dessus)"
echo "   ANDROID_KEYSTORE_PASSWORD = (mot de passe du keystore)"
echo "   ANDROID_KEY_ALIAS = syndicly-key"
echo "   ANDROID_KEY_PASSWORD = (mot de passe de la clé)"
echo ""
echo "✅ Configuration terminée!"
