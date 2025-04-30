# Centralisation des Cours BUT

Application de centralisation des cours pour BUT (TD, TP, et autres documents).

## Structure de l'application

L'application est divisée en deux parties indépendantes :

1. **Client** : Application Electron avec interface React
2. **Serveur** : API REST Node.js avec Express

Cette séparation permet de déployer le serveur sur une machine distante indépendante du client.

## Prérequis

- Node.js (v14+)
- npm ou yarn

## Installation et démarrage

### Serveur

```bash
# Naviguer vers le répertoire du serveur
cd server

# Installer les dépendances
npm install

# Démarrer le serveur en mode développement
npm run dev

# OU démarrer le serveur en mode production
npm start
```

Le serveur sera accessible à l'adresse http://localhost:5000.

### Client

```bash
# Dans le répertoire racine du projet
npm install

# Démarrer l'application en mode développement
npm run dev
```

L'application Electron se lancera et se connectera au serveur.

## Configuration

### Configuration du serveur

Les paramètres du serveur sont dans le fichier `.env` :

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

En production, modifiez ces valeurs, particulièrement le `JWT_SECRET`.

### Configuration du client

La configuration du client pour se connecter au serveur se trouve dans `src/services/api.js`.
Par défaut, le client se connecte à `http://localhost:5000/api`. Modifiez cette URL si le serveur est déployé sur une autre machine.

## Utilisateurs par défaut

Un utilisateur administrateur est créé par défaut :

- Nom d'utilisateur : `admin`
- Mot de passe : `admin123`

Vous pouvez utiliser ces identifiants pour la connexion initiale.

## Fonctionnalités

- **Authentification** : Connexion sécurisée avec JWT
- **Téléversement de documents** : Upload de TD, TP et autres documents de cours
- **Téléchargement** : Recherche et téléchargement des documents
- **Tableau de bord** : Statistiques et documents récents

## Structure des répertoires

### Serveur
- `/config` : Fichiers de configuration et données persistantes
- `/controllers` : Logique métier
- `/middleware` : Middleware (authentification, upload de fichiers)
- `/models` : Modèles de données
- `/routes` : Routes API
- `/uploads` : Stockage des fichiers téléversés

### Client
- `/src/components` : Composants React pour l'interface
- `/src/services` : Services pour la communication avec l'API