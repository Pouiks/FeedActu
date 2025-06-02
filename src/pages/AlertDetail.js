import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, Button, Stack } from '@mui/material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (comme dans Alerts.js)
const mockAlerts = [
  { id: 1, message: '<p>Alerte A - <strong>Information importante</strong> pour tous les résidents</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Alerte B - Maintenance programmée</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function AlertDetail() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération de l'alerte par ID
    const foundAlert = mockAlerts.find(a => a.id === parseInt(id));
    if (foundAlert) {
      setAlert(foundAlert);
      setEditedAlert({ 
        message: foundAlert.message || ''
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!alert) return;
    
    const hasChanges = editedAlert.message !== alert.message;
    setIsDirty(hasChanges);
  }, [editedAlert, alert]);

  const handleFieldChange = (fieldName, value) => {
    setEditedAlert(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde de l\'alerte:', { ...alert, ...editedAlert });
    
    // Simule la sauvegarde
    const updatedAlert = { ...alert, ...editedAlert };
    setAlert(updatedAlert);
    setIsDirty(false);
    
    alert('Alerte sauvegardée avec succès !');
  };

  if (!alert) {
    return (
      <Box>
        <BackButton to="/alerts" label="Retour aux alertes" />
        <Typography>Alerte non trouvée</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Publié': return 'success';
      case 'Brouillon': return 'warning';
      case 'Archivé': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <BackButton to="/alerts" label="Retour aux alertes" />
      
      <Paper sx={{ p: 3, border: '2px solid #ff9800', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            🚨 Édition de l'alerte
          </Typography>
          <Chip 
            label={alert.status} 
            color={getStatusColor(alert.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(alert.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Stack spacing={3}>
          {/* Message d'alerte */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Message de l'alerte</Typography>
            <RichTextEditor
              value={editedAlert.message}
              onChange={(content) => handleFieldChange('message', content)}
            />
          </Box>

          {/* Bouton d'enregistrement */}
          {isDirty && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                size="large"
              >
                Enregistrer les modifications
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
} 