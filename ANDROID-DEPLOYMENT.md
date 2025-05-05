# Guide de déploiement - Version Android

Ce document explique comment déployer l'application Centralisation des Cours sur Android.

## Prérequis

- Node.js et npm installés
- Android Studio installé
- JDK 11 ou supérieur installé
- Variables d'environnement JAVA_HOME et ANDROID_HOME configurées
- Un serveur déployé et accessible depuis Internet pour héberger l'API

## Étapes pour créer l'APK Android

### 1. Préparation avec le script automatisé

Le script `android-build.sh` automatise la plupart des étapes de configuration :

**Sur Windows :**
```batch
# Ouvrir un terminal Git Bash ou WSL et exécuter
bash android-build.sh
```

**Sur macOS/Linux :**
```bash
# Rendre le script exécutable
chmod +x android-build.sh

# Exécuter le script
./android-build.sh
```

### 2. Configuration de l'URL du serveur

Avant de compiler l'application, vous devez configurer l'URL de votre serveur backend :

1. Ouvrez le fichier `src/services/api-android.js`
2. Modifiez la variable `SERVER_URL` avec l'URL de votre serveur déployé :
   ```javascript
   const SERVER_URL = 'https://votre-serveur.com'; // URL de votre serveur
   ```

### 3. Compilation et génération de l'APK

1. Ouvrez le projet Android Studio avec la commande :
   ```
   npm run open:android
   ```

2. Dans Android Studio :
   - Attendez que le projet se synchronise avec Gradle
   - **Facultatif :** Personnalisez l'icône de l'application dans `android/app/src/main/res`
   - **Facultatif :** Mettez à jour le fichier `android/app/src/main/AndroidManifest.xml` pour ajouter des permissions supplémentaires si nécessaire

3. Générez l'APK de débogage :
   - Menu `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
   - L'APK sera disponible dans `android/app/build/outputs/apk/debug/app-debug.apk`

4. Pour une version de production :
   - Menu `Build` > `Generate Signed Bundle / APK`
   - Suivez les instructions pour créer une clé de signature
   - Choisissez APK comme type de sortie
   - Sélectionnez la variante `release`
   - Cliquez sur `Finish` pour générer l'APK

### 4. Personnalisation avancée

Pour personnaliser davantage l'application Android :

- **Splash Screen** : Modifiez `android/app/src/main/res/drawable/splash.png`
- **Icônes** : Remplacez les icônes dans les différents dossiers `mipmap` dans `android/app/src/main/res/`
- **Couleurs** : Modifiez `android/app/src/main/res/values/colors.xml`

### 5. Tests et déploiement

1. **Test sur émulateur :**
   - Lancez l'émulateur Android depuis Android Studio
   - Installez l'APK sur l'émulateur

2. **Test sur appareil réel :**
   - Activez le débogage USB sur votre appareil Android
   - Connectez votre appareil via USB
   - Installez l'APK sur l'appareil

3. **Publication sur Google Play Store :**
   - Créez un compte développeur sur Google Play Console
   - Créez une nouvelle application sur Google Play Console
   - Téléchargez votre APK signé ou bundle AAB
   - Complétez les informations de la fiche Play Store
   - Passez par les tests internes/alpha/bêta avant la production

## Problèmes connus et solutions

### Problème de connexion au serveur
- Vérifiez que votre serveur est accessible depuis Internet
- Vérifiez que les CORS sont correctement configurés sur le serveur
- Utilisez HTTPS pour le serveur en production

### Problèmes de compilation
- Vérifiez la version du JDK (doit être 11 ou supérieur)
- Vérifiez que les variables d'environnement JAVA_HOME et ANDROID_HOME sont correctement configurées

### Problèmes de performances
- Optimisez les images et ressources
- Implémentez la mise en cache côté client pour réduire les appels API