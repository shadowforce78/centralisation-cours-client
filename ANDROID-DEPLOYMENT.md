# Guide de déploiement - Version Android

Ce document explique comment déployer l'application Centralisation des Cours sur Android.

## Prérequis

- Node.js et npm installés
- Android Studio installé
- JDK 11 ou supérieur installé
- Variables d'environnement JAVA_HOME et ANDROID_HOME configurées
- Un serveur déployé et accessible depuis Internet pour héberger l'API

## Configuration du serveur pour Android

### 1. Configuration CORS pour Android

Assurez-vous que votre serveur accepte les requêtes provenant de l'application Android. Vérifiez que le fichier `server.js` contient la configuration CORS suivante :

```javascript
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'capacitor://localhost', 'http://localhost', 'https://VOTRE_URL_SERVEUR'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, capacitor apps)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list or if it starts with capacitor://
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('capacitor://')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(msg), false);
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // Needed for file downloads
}));
```

Remplacez `VOTRE_URL_SERVEUR` par l'URL de votre serveur.

### 2. Vérification du URL de l'API

Dans le fichier `src/services/api-android.js`, assurez-vous que l'URL du serveur est correctement configurée pour fonctionner à la fois en émulateur et sur appareil physique :

```javascript
// Configuration pour accéder au serveur depuis l'application Android
// On détecte si on est en local (localhost) ou sur une connexion externe (ngrok)
const isLocalhost = window.location.hostname === 'localhost';

// URL du serveur en fonction de l'environnement
const SERVER_URL = isLocalhost 
  ? 'http://10.0.2.2:5000'  // 10.0.2.2 est l'adresse IP spéciale pour accéder à localhost depuis l'émulateur Android
  : 'https://VOTRE_URL_SERVEUR';  // URL ngrok ou votre serveur de production

const API_URL = `${SERVER_URL}/api`;
```

Remplacez `VOTRE_URL_SERVEUR` par l'URL de votre serveur déployé ou URL ngrok.

## Modification du AndroidManifest.xml

Pour permettre les connexions HTTP et les requêtes réseau, modifiez le fichier `android/app/src/main/AndroidManifest.xml` comme suit :

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
    <!-- ... le reste du code ... -->
</application>

<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Et créez un fichier `android/app/src/main/res/xml/network_security_config.xml` avec le contenu suivant :

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">VOTRE_URL_SERVEUR</domain>
    </domain-config>
</network-security-config>
```

Remplacez `VOTRE_URL_SERVEUR` par le domaine de votre serveur (sans https://).

## Configuration de Capacitor

Assurez-vous que votre fichier `capacitor.config.ts` est correctement configuré pour permettre les connexions HTTP et HTTPS :

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.centralisation.cours',
  appName: 'Centralisation des Cours',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      '*',
      'https://VOTRE_URL_SERVEUR/*',
      'http://10.0.2.2:5000/*',
      'http://localhost:5000/*'
    ]
  },
  loggingBehavior: 'debug',
  android: {
    allowMixedContent: true
  }
};

export default config;
```

Remplacez `VOTRE_URL_SERVEUR` par le domaine de votre serveur.

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

### Problème de connexion au serveur (CORS)
- **Symptôme**: L'app affiche "Erreur lors de la connexion" ou "Network Error" dans les logs
- **Solution**:
  1. Vérifiez que le serveur est accessible depuis Internet
  2. Assurez-vous que la configuration CORS du serveur accepte les requêtes de l'application:
     ```javascript
     // Dans server.js
     const allowedOrigins = ['http://localhost:5173', 'capacitor://localhost', 'http://localhost'];
     
     app.use(cors({
       origin: function(origin, callback) {
         // Allow requests with no origin (like mobile apps, capacitor apps)
         if (!origin) return callback(null, true);
         
         // Check if the origin is in our allowed list or if it starts with capacitor://
         if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('capacitor://')) {
           return callback(null, true);
         }
         
         const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
         console.log(`CORS blocked origin: ${origin}`);
         return callback(new Error(msg), false);
       },
       credentials: true,
       exposedHeaders: ['Content-Disposition'] // Needed for file downloads
     }));
     ```
  3. Vérifiez que `capacitor.config.ts` a les bonnes configurations:
     ```typescript
     server: {
       androidScheme: 'http',
       cleartext: true,
       allowNavigation: ['*', 'https://votre-url-serveur.com/*']
     },
     android: {
       allowMixedContent: true
     }
     ```

### Problème de navigation et chargement
- **Symptôme**: L'application ne charge pas les ressources ou n'arrive pas à se connecter au serveur
- **Solution**:
  1. Vérifiez que votre `AndroidManifest.xml` a les permissions nécessaires:
     ```xml
     <uses-permission android:name="android.permission.INTERNET" />
     <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
     ```
  2. Ajoutez le support du trafic HTTP clair:
     ```xml
     <application
         android:usesCleartextTraffic="true"
         android:networkSecurityConfig="@xml/network_security_config">
         ...
     </application>
     ```
  3. Créez un fichier de configuration de sécurité réseau `network_security_config.xml`

### Problèmes de compilation
- Vérifiez la version du JDK (doit être 11 ou supérieur)
- Vérifiez que les variables d'environnement JAVA_HOME et ANDROID_HOME sont correctement configurées
- Si des erreurs de build apparaissent, essayez de nettoyer le projet (Build > Clean Project)

### Test de connectivité
- Utilisez le composant de test de connectivité inclus dans l'application (`/connectivity-test`)
- Ce test permet de vérifier si votre application peut se connecter correctement au serveur
- Les erreurs détaillées vous aideront à identifier les problèmes de réseau