import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper, Box, CircularProgress, Divider } from '@mui/material';
import apiAndroid from '../services/api-android';
import api from '../services/api';

const ConnectivityTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiType, setApiType] = useState('android');
  const [envInfo, setEnvInfo] = useState({
    location: window.location.href,
    origin: window.location.origin,
    hostname: window.location.hostname,
    androidApiUrl: apiAndroid.system.getApiUrl?.() || 'Not available'
  });

  const runConnectionTest = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (apiType === 'android') {
        result = await apiAndroid.system.testConnection();
      } else {
        // Use regular API for web testing
        result = await fetch('/api/test')
          .then(res => res.json());
      }
      setTestResult(result);
      console.log('Connection test successful:', result);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du test');
      console.error('Connection test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Test de Connectivité Android
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Cette page vous permet de tester la connexion au serveur depuis l'application Android.
          </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
            API utilisée: {apiType === 'android' ? 'API Android (pour mobiles)' : 'API Web (pour navigateur)'}
          </Typography>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setApiType(apiType === 'android' ? 'web' : 'android')}
            sx={{ mb: 2 }}
          >
            Basculer vers {apiType === 'android' ? 'API Web' : 'API Android'}
          </Button>
        </Box>
        
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>Informations d'environnement:</Typography>
          <Typography variant="body2">URL: {envInfo.location}</Typography>
          <Typography variant="body2">Origin: {envInfo.origin}</Typography>
          <Typography variant="body2">Hostname: {envInfo.hostname}</Typography>
          <Typography variant="body2">Android API URL: {envInfo.androidApiUrl}</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={runConnectionTest}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Tester la connexion'}
        </Button>
        
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography color="error">Erreur: {error}</Typography>
          </Box>
        )}
        
        {testResult && (
          <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="subtitle1">Résultat:</Typography>
            <Typography variant="body2">Message: {testResult.message}</Typography>
            <Typography variant="body2">Origin: {testResult.origin}</Typography>
            <Typography variant="body2">Timestamp: {testResult.timestamp}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ConnectivityTest;
