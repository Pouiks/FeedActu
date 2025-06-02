import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip } from '@mui/material';
import BackButton from '../components/BackButton';

// Données mockées (comme dans DailyMessages.js)
const mockDailyMessages = [
  { id: 1, message: '<p>Message du jour A avec du <strong>contenu important</strong></p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Message du jour B avec des informations utiles</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function DailyMessageDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Simule la récupération du message par ID
    const foundMessage = mockDailyMessages.find(m => m.id === parseInt(id));
    setMessage(foundMessage);
  }, [id]);

  if (!message) {
    return (
      <Box>
        <BackButton to="/daily-messages" label="Retour aux messages du jour" />
        <Typography>Message non trouvé</Typography>
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
      <BackButton to="/daily-messages" label="Retour aux messages du jour" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Message du jour
          </Typography>
          <Chip 
            label={message.status} 
            color={getStatusColor(message.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(message.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Box sx={{ '& p': { mb: 2 } }}>
          <div dangerouslySetInnerHTML={{ __html: message.message }} />
        </Box>
      </Paper>
    </Box>
  );
} 