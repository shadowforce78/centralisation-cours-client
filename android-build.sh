#!/bin/bash
# Script pour convertir l'application web en application Android
# À exécuter depuis le répertoire racine du projet

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Préparation de la version Android de l'application Centralisation des Cours ===${NC}"

# 1. Installer les dépendances nécessaires pour Capacitor et Vite
echo -e "${GREEN}Installation des dépendances Capacitor...${NC}"
npm install @capacitor/core @capacitor/android @capacitor/cli

# 2. Créer un dossier dist temporaire si nécessaire
echo -e "${GREEN}Création du dossier de build...${NC}"
mkdir -p dist
echo "<html><body>Placeholder</body></html>" > dist/index.html

# 3. Initialiser Capacitor
echo -e "${GREEN}Initialisation de Capacitor...${NC}"
# Supprimer la configuration existante si présente
if [ -f "capacitor.config.ts" ]; then
    rm capacitor.config.ts
fi
if [ -f "capacitor.config.json" ]; then
    rm capacitor.config.json
fi

npx cap init "Centralisation des Cours" "fr.centralisation.cours" --web-dir=dist

# 4. Modifier la configuration Vite pour assurer la compatibilité avec Capacitor
echo -e "${GREEN}Mise à jour de la configuration Vite...${NC}"
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
EOL

# 5. Mettre à jour le fichier package.json pour ajouter les scripts Capacitor
echo -e "${GREEN}Mise à jour du fichier package.json...${NC}"
# Sauvegarde du package.json original
cp package.json package.json.bak

# Mettre à jour les scripts
npm pkg set scripts.build:web="vite build"
npm pkg set scripts.build:android="npm run build:web && npx cap sync android"
npm pkg set scripts.open:android="npx cap open android"

# 6. Mettre à jour l'API pour prendre en charge l'URL du serveur distant
echo -e "${GREEN}Configuration de l'API pour Android...${NC}"
cat > src/services/api-android.js << 'EOL'
/**
 * API Service
 * Handles communication with the server
 */

// Base API URL - change this to the server's address in production
const API_URL = 'https://your-server-url.com/api';

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// API service object
const apiService = {
  /**
   * Authentication endpoints
   */
  auth: {
    // Login user
    login: async (username, password) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la connexion');
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    // Logout user
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    
    // Check if user is logged in
    isLoggedIn: () => {
      return !!getToken();
    },
    
    // Get current user
    getCurrentUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },
  
  /**
   * Document endpoints
   */
  documents: {
    // Get all documents with optional filters
    getAll: async (filters = {}) => {
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.search) queryParams.append('search', filters.search);
        
        const queryString = queryParams.toString();
        const url = `${API_URL}/documents${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des documents');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
    },
    
    // Get document by ID
    getById: async (id) => {
      try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération du document');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
    },
    
    // Upload document
    upload: async (formData) => {
      try {
        const response = await fetch(`${API_URL}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },
          body: formData // FormData already has the correct content type
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors du téléversement du document');
        }
        
        return data;
      } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
      }
    },
    
    // Get download URL for a document
    getDownloadUrl: (id) => {
      return `${API_URL}/documents/download/${id}?token=${getToken()}`;
    },
    
    // Delete document
    delete: async (id) => {
      try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la suppression du document');
        }
        
        return data;
      } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    }
  },
  
  /**
   * User endpoints
   */
  users: {
    // Get user profile
    getProfile: async () => {
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération du profil');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    
    // Get all users (admin only)
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }
  }
};

export default apiService;
EOL

# 7. Créer un point d'entrée pour Android
echo -e "${GREEN}Création d'un point d'entrée pour Android...${NC}"
cat > src/main-android.jsx << 'EOL'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import API service specific to Android
import apiService from './services/api-android';

// Thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
EOL

# 8. Créer un fichier index-android.html
echo -e "${GREEN}Création d'un fichier HTML pour Android...${NC}"
cat > index-android.html << 'EOL'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/courses.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Centralisation des Cours BUT</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main-android.jsx"></script>
  </body>
</html>
EOL

# 9. Compiler l'application pour Android
echo -e "${GREEN}Compilation de l'application pour Android...${NC}"
npx vite build --outDir dist --config vite.config.js

# 10. Ajouter la plateforme Android
echo -e "${GREEN}Ajout de la plateforme Android...${NC}"
npx cap add android

# 11. Synchroniser les fichiers
echo -e "${GREEN}Synchronisation des fichiers avec le projet Android...${NC}"
npx cap sync android

echo -e "${BLUE}=== Configuration terminée avec succès ! ===${NC}"
echo -e "${GREEN}Pour ouvrir le projet dans Android Studio et le finaliser, exécutez:${NC}"
echo -e "npm run open:android"
echo -e "${GREEN}Pensez à modifier l'URL du serveur dans src/services/api-android.js avant de générer l'APK final.${NC}"
echo -e "${GREEN}Note: Vous aurez besoin d'Android Studio installé pour finaliser la compilation.${NC}"