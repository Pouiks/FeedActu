import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip } from '@mui/material';
import BackButton from '../components/BackButton';

// Données mockées (comme dans Alerts.js)
const mockAlerts = [
  { id: 1, message: '<p>Alerte A - <strong>Information importante</strong> pour tous les résidents</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Alerte B - Maintenance programmée</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function AlertDetail() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Simule la récupération de l'alerte par ID
    const foundAlert = mockAlerts.find(a => a.id === parseInt(id));
    setAlert(foundAlert);
  }, [id]);

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
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            🚨 Alerte
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

        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: '#fff3e0', 
            borderRadius: 1,
            '& p': { mb: 2 }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: alert.message }} />
        </Box>
      </Paper>
    </Box>
  );
} 