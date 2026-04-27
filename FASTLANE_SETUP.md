# Configuration Fastlane pour Compilation Android

## Vue d'ensemble

Au lieu d'utiliser EAS Build (qui a des files d'attente), ce workflow utilise **Fastlane** pour compiler directement dans GitHub Actions.

✅ **Pas de file d'attente**  
✅ **Compilation immédiate**  
✅ **APK disponible en 5-10 minutes**  

---

## Étapes de configuration

### 1️⃣ Générer ou utiliser une clé de signature Android

Vous avez deux options :

#### Option A : Générer une nouvelle clé (première fois)

```bash
# Dans le dossier android/
keytool -genkey -v -keystore syndicly-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias syndicly-key \
  -storepass password123 \
  -keypass password123
```

**Important** : Sauvegardez ce fichier `.jks` en sécurité ! Il faut l'utiliser pour tous les builds futurs.

#### Option B : Utiliser une clé existante

Si vous avez déjà un fichier `keystore.jks`, gardez-le.

---

### 2️⃣ Configurer GitHub Secrets

Allez sur GitHub → Settings → Secrets → New repository secret

Ajoutez 4 secrets :

| Secret | Valeur |
|--------|--------|
| `ANDROID_KEYSTORE_FILE` | Contenu du fichier .jks en base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Le mot de passe du keystore |
| `ANDROID_KEY_ALIAS` | `syndicly-key` (ou votre alias) |
| `ANDROID_KEY_PASSWORD` | Le mot de passe de la clé |

**Pour créer le secret ANDROID_KEYSTORE_FILE** (sur Windows PowerShell) :

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("android/syndicly-release.jks")) | Set-Clipboard
```

Puis collez dans le secret GitHub.

---

### 3️⃣ Mettre à jour le build.gradle

Modifiez `android/app/build.gradle` pour utiliser la clé :

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../syndicly-release.jks")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

### 4️⃣ Mettre à jour le Fastfile

Modifiez `android/fastlane/Fastfile` pour utiliser les secrets :

```ruby
lane :build do
  # Créer le fichier keystore depuis le secret GitHub
  sh("echo '#{ENV['ANDROID_KEYSTORE_FILE_BASE64']}' | base64 -d > syndicly-release.jks")
  
  sh("chmod +x ../gradlew")

  gradle(
    task: "clean assembleRelease",
    project_dir: "./"
  )

  puts "✅ APK signé compilé avec succès!"
end
```

---

### 5️⃣ Mettre à jour le workflow GitHub Actions

Dans `.github/workflows/build-android.yml`, ajouter les secrets :

```yaml
- name: Build APK with Fastlane
  working-directory: ./android
  run: fastlane android build
  env:
    EXPO_PUBLIC_API_URL: https://syndicly.ma
    ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
    ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
    ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
    ANDROID_KEYSTORE_FILE_BASE64: ${{ secrets.ANDROID_KEYSTORE_FILE }}
```

---

## Test local

Avant de pousser sur GitHub, testez localement :

```bash
cd android
fastlane android build
```

---

## Résultat

✅ À chaque **push sur main**, une build démarre **immédiatement**  
✅ APK signé disponible en **5-10 minutes**  
✅ Téléchargeable dans **Actions → Build artifacts**  

---

## Dépannage

**Erreur : "Permission denied" sur gradlew**
```bash
chmod +x android/gradlew
```

**Erreur : "Keystore file not found"**
- Vérifiez que le secret GitHub contient bien le fichier en base64
- Vérifiez le chemin dans build.gradle

**Erreur : "Gradle build failed"**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## Prochaines étapes

1. **Générez ou trouvez votre keystore** (étape 1)
2. **Encodez-le en base64** et ajoutez les secrets GitHub (étape 2)
3. **Mettez à jour build.gradle** (étape 3)
4. **Mettez à jour le Fastfile** (étape 4)
5. **Poussez sur main** et observez la build dans Actions
