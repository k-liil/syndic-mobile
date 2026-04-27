# ⚡ Guide Rapide : Fastlane + GitHub Actions

**Alternative à EAS Build : Compilation immédiate, pas de file d'attente.**

---

## ✨ Résumé des changements

❌ **AVANT** : `git push` → attend dans la queue Expo (13+ minutes)  
✅ **APRÈS** : `git push` → compilation immédiate (5-10 minutes)

---

## 🚀 Étapes rapides (5 minutes)

### 1️⃣ Générer le keystore Android

**Sur Windows :**
```powershell
./setup-keystore.ps1
```

**Sur Mac/Linux :**
```bash
chmod +x setup-keystore.sh
./setup-keystore.sh
```

Le script va :
- ✅ Générer un keystore
- ✅ Le convertir en base64
- ✅ Copier dans le presse-papiers

### 2️⃣ Ajouter les secrets GitHub

1. Allez sur : **GitHub → Settings → Secrets and variables → Actions**
2. Cliquez sur **"New repository secret"**
3. Ajoutez 4 secrets :

| Nom | Valeur |
|-----|--------|
| `ANDROID_KEYSTORE_FILE` | Contenu base64 (copié du script) |
| `ANDROID_KEYSTORE_PASSWORD` | Mot de passe du keystore |
| `ANDROID_KEY_ALIAS` | `syndicly-key` |
| `ANDROID_KEY_PASSWORD` | Mot de passe de la clé |

### 3️⃣ Poussez vos changements

```bash
git add .github/workflows/ android/fastlane/
git commit -m "Setup Fastlane build without Expo queue"
git push origin main
```

### 4️⃣ Observez la compilation

- Allez sur **GitHub → Actions**
- La build "Build Android APK (Fastlane)" démarre automatiquement
- ✅ APK prêt en 5-10 minutes (pas d'attente !)

---

## 📦 Récupérer l'APK

Après la build :
1. Allez sur **Actions → Build Android APK (Fastlane)**
2. Cliquez sur le dernier run
3. Téléchargez l'artifact **"android-apk"**

---

## 🔍 Dépannage rapide

| Erreur | Solution |
|--------|----------|
| `Permission denied on gradlew` | Le `chmod +x android/gradlew` est déjà fait par le workflow |
| `Keystore file not found` | Vérifiez que le secret ANDROID_KEYSTORE_FILE est rempli |
| `Build failed` | Vérifiez les logs GitHub Actions pour plus de détails |

---

## ✅ C'est fini !

Votre app compile maintenant sans passer par Expo. À chaque **git push** :
- Compilation immédiate ✅
- APK signé prêt en 5-10 min ✅
- Pas de file d'attente ✅

---

## 📚 Fichiers créés

- `.github/workflows/build-android.yml` - Workflow GitHub Actions
- `android/fastlane/Fastfile` - Configuration Fastlane
- `setup-keystore.ps1` / `setup-keystore.sh` - Scripts d'aide
- `FASTLANE_SETUP.md` - Guide détaillé (pour plus d'infos)

---

## Besoin d'aide ?

Consultez `FASTLANE_SETUP.md` pour les configurations avancées.
