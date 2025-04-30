import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Pagination,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CloudDownload as DownloadIcon,
  Description as FileIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import apiService from '../services/api';

function Download() {
  // State for documents and UI
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    subject: ''
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  
  // Current user info for permission checking
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch documents when component mounts or filters change
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user info
        const user = apiService.auth.getCurrentUser();
        setCurrentUser(user);
        
        // Build filters for API request
        const apiFilters = {};
        if (filters.type) apiFilters.type = filters.type;
        if (filters.subject) apiFilters.subject = filters.subject;
        if (searchTerm) apiFilters.search = searchTerm;
        
        // Fetch documents from API
        const response = await apiService.documents.getAll(apiFilters);
        setDocuments(response.data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError(error.message || 'Erreur lors de la récupération des documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [filters.type, filters.subject, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // Reset to first page when filters change
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search is already being handled by the effect
  };

  // Pagination logic
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const displayedDocuments = documents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Download document
  const handleDownload = (doc) => {
    try {
      // Get download URL and open in new tab
      const downloadUrl = apiService.documents.getDownloadUrl(doc.id);
      window.open(downloadUrl, '_blank');
      
      // Show success notification
      // (This would be better with a proper notification system)
      alert(`Téléchargement de "${doc.title}" démarré.`);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };
  
  // Delete document
  const handleDelete = async (doc) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.title}" ?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await apiService.documents.delete(doc.id);
      
      // Remove document from state
      setDocuments(documents.filter(d => d.id !== doc.id));
      
      alert('Document supprimé avec succès');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Télécharger des documents
      </Typography>
      
      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  label="Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="TD">TD</MenuItem>
                  <MenuItem value="TP">TP</MenuItem>
                  <MenuItem value="Cours">Cours</MenuItem>
                  <MenuItem value="Examen">Examen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Matière</InputLabel>
                <Select
                  name="subject"
                  value={filters.subject}
                  label="Matière"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="Algorithmique">Algorithmique</MenuItem>
                  <MenuItem value="Base de données">Base de données</MenuItem>
                  <MenuItem value="Réseaux">Réseaux</MenuItem>
                  <MenuItem value="Programmation Web">Programmation Web</MenuItem>
                  <MenuItem value="Système">Système</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Results */}
      {!loading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            {documents.length} document(s) trouvé(s)
          </Typography>
          
          {displayedDocuments.length > 0 ? (
            <Grid container spacing={3}>
              {displayedDocuments.map((doc) => (
                <Grid item xs={12} sm={6} key={doc.id}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <FileIcon color="primary" />
                        <Chip label={doc.type} size="small" color="primary" variant="outlined" />
                        <Chip label={doc.subject} size="small" />
                      </Stack>
                      
                      <Typography variant="h6" component="div">
                        {doc.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                        <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography variant="body2">
                          {doc.downloads} téléchargements
                        </Typography>
                      </Box>
                      
                      {doc.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {doc.description.length > 100 
                            ? `${doc.description.substring(0, 100)}...` 
                            : doc.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<ViewIcon />}>
                        Détails
                      </Button>
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(doc)}
                      >
                        Télécharger
                      </Button>
                      
                      {/* Show delete button if user is admin or document owner */}
                      {currentUser && (currentUser.role === 'admin' || 
                        (doc.uploadedBy && doc.uploadedBy.id === currentUser.id)) && (
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(doc)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>
                Aucun document ne correspond à vos critères de recherche.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
}

export default Download;