/**
 * API Service
 * Handles communication with the server
 */

// Configuration pour accéder au serveur depuis l'application Android
// On détecte si on est en local (localhost) ou sur une connexion externe (ngrok)
const isLocalhost = window.location.hostname === 'localhost';

// URL du serveur en fonction de l'environnement
const SERVER_URL = isLocalhost 
  ? 'http://10.0.2.2:5000'  // 10.0.2.2 est l'adresse IP spéciale pour accéder à localhost depuis l'émulateur Android
  : 'https://9be0-193-51-24-154.ngrok-free.app';  // URL ngrok ou votre serveur de production

const API_URL = `${SERVER_URL}/api`;

// Pour debug, afficher l'URL du serveur utilisée
console.log('Android API - Using server URL:', SERVER_URL, 'isLocalhost:', isLocalhost);

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// API service object
const apiService = {
  /**
   * System endpoints
   */
  system: {
    // Get the current API URL for debugging
    getApiUrl: () => API_URL,
    
    // Test connectivity to the server
    testConnection: async () => {
      try {
        console.log('Testing connection to:', `${API_URL}/test`);
        const response = await fetch(`${API_URL}/test`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur de connexion au serveur');
        }
        
        console.log('Connection test response:', data);
        return data;
      } catch (error) {
        console.error('Connection test error:', error);
        throw error;
      }
    }
  },

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
