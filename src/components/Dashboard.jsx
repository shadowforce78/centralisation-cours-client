import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  CloudDownload as DownloadIcon,
  Class as ClassIcon,
  School as SchoolIcon 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function Dashboard() {
  const [statistics, setStatistics] = useState({
    subjects: 0,
    documents: 0,
    downloads: 0
  });
  
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all documents
        const response = await apiService.documents.getAll();
        const documents = response.data || [];
        
        // Calculate statistics
        const uniqueSubjects = [...new Set(documents.map(doc => doc.subject))];
        const totalDownloads = documents.reduce((total, doc) => total + (doc.downloads || 0), 0);
        
        setStatistics({
          subjects: uniqueSubjects.length,
          documents: documents.length,
          downloads: totalDownloads
        });
        
        // Get recent uploads (sort by date, take most recent 3)
        const sortedDocuments = [...documents].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setRecentUploads(sortedDocuments.slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Function to download a document
  const handleDownload = (doc) => {
    try {
      const downloadUrl = apiService.documents.getDownloadUrl(doc.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mt: 4 }} />
        <Typography sx={{ mt: 2 }}>Chargement des données...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 4 }}>
        Tableau de bord
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              justifyContent: 'center'
            }}
            elevation={3}
          >
            <ClassIcon sx={{ fontSize: 40 }} color="primary" />
            <Typography component="h2" variant="h5" color="primary" gutterBottom>
              {statistics.subjects}
            </Typography>
            <Typography variant="body1">Matières</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              justifyContent: 'center'
            }}
            elevation={3}
          >
            <SchoolIcon sx={{ fontSize: 40 }} color="primary" />
            <Typography component="h2" variant="h5" color="primary" gutterBottom>
              {statistics.documents}
            </Typography>
            <Typography variant="body1">TD/TP</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              justifyContent: 'center'
            }}
            elevation={3}
          >
            <DownloadIcon sx={{ fontSize: 40 }} color="primary" />
            <Typography component="h2" variant="h5" color="primary" gutterBottom>
              {statistics.downloads}
            </Typography>
            <Typography variant="body1">Téléchargements</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Action Buttons */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/upload"
            fullWidth
            size="large"
            startIcon={<UploadIcon />}
            sx={{ py: 2 }}
          >
            Téléverser un document
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/download"
            fullWidth
            size="large"
            startIcon={<DownloadIcon />}
            sx={{ py: 2 }}
          >
            Parcourir les documents
          </Button>
        </Grid>
      </Grid>

      {/* Recent Uploads */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Ajouts récents
      </Typography>
      {recentUploads.length > 0 ? (
        <Grid container spacing={3}>
          {recentUploads.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {new Date(doc.createdAt).toLocaleDateString()} • {doc.type}
                  </Typography>
                  <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                    {doc.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doc.subject}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small" 
                    color="primary"
                    component={Link}
                    to={`/download?id=${doc.id}`}
                  >
                    Voir détails
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleDownload(doc)}
                  >
                    Télécharger
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            Aucun document n'a encore été ajouté.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default Dashboard;