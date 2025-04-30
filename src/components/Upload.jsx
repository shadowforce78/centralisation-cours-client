import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Stack
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  AttachFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import apiService from '../services/api';

function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    subject: '',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Form field change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // File selection handler
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  // Remove file handler
  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.subject || selectedFiles.length === 0) {
      setUploadStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires et sélectionner au moins un fichier.'
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Create FormData for file upload
      const fileFormData = new FormData();
      fileFormData.append('title', formData.title);
      fileFormData.append('type', formData.type);
      fileFormData.append('subject', formData.subject);
      fileFormData.append('description', formData.description || '');
      fileFormData.append('file', selectedFiles[0]); // For now, just upload the first file
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 300);
      
      // Upload file to server
      const response = await apiService.documents.upload(fileFormData);
      
      // Clear interval and set progress to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form and show success message
      setFormData({
        title: '',
        type: '',
        subject: '',
        description: '',
      });
      setSelectedFiles([]);
      
      setUploadStatus({
        type: 'success',
        message: 'Téléversement réussi ! Le document est maintenant disponible.'
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.message || 'Une erreur est survenue lors du téléversement.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Téléverser des documents
        </Typography>
        
        {uploadStatus && (
          <Alert 
            severity={uploadStatus.type} 
            sx={{ mb: 3 }}
            onClose={() => setUploadStatus(null)}
          >
            {uploadStatus.message}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={uploading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleInputChange}
                  disabled={uploading}
                >
                  <MenuItem value="TD">TD</MenuItem>
                  <MenuItem value="TP">TP</MenuItem>
                  <MenuItem value="Cours">Cours</MenuItem>
                  <MenuItem value="Examen">Examen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Matière</InputLabel>
                <Select
                  name="subject"
                  value={formData.subject}
                  label="Matière"
                  onChange={handleInputChange}
                  disabled={uploading}
                >
                  <MenuItem value="Algorithmique">Algorithmique</MenuItem>
                  <MenuItem value="Base de données">Base de données</MenuItem>
                  <MenuItem value="Réseaux">Réseaux</MenuItem>
                  <MenuItem value="Programmation Web">Programmation Web</MenuItem>
                  <MenuItem value="Système">Système</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                disabled={uploading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileIcon />}
                sx={{ mb: 2 }}
                disabled={uploading}
              >
                Sélectionner des fichiers
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Button>
              
              {selectedFiles.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fichiers sélectionnés ({selectedFiles.length}):
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => handleRemoveFile(index)}
                        deleteIcon={<DeleteIcon />}
                        disabled={uploading}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
            </Grid>
            
            {uploading && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<UploadIcon />}
                disabled={uploading}
                sx={{ mt: 2 }}
              >
                {uploading ? 'Téléversement en cours...' : 'Téléverser'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Upload;