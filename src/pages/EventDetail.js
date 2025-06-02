import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip } from '@mui/material';
import BackButton from '../components/BackButton';

// Données mockées (comme dans Events.js)
const mockEvents = [
  { id: 1, title: 'Événement A', eventDateTime: '2024-06-10T18:00:00', description: '<p>Description de l\'événement A avec du <strong>HTML</strong></p>', publicationDate: '2024-05-10T10:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Événement B', eventDateTime: '2024-06-15T20:00:00', description: '<p>Description de l\'événement B</p>', publicationDate: '2024-05-12T10:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Simule la récupération de l'événement par ID
    const foundEvent = mockEvents.find(e => e.id === parseInt(id));
    setEvent(foundEvent);
  }, [id]);

  if (!event) {
    return (
      <Box>
        <BackButton to="/events" label="Retour aux événements" />
        <Typography>Événement non trouvé</Typography>
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
      <BackButton to="/events" label="Retour aux événements" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {event.title}
          </Typography>
          <Chip 
            label={event.status} 
            color={getStatusColor(event.status)}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            📅 {new Date(event.eventDateTime).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="h6" color="primary">
            🕐 {new Date(event.eventDateTime).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(event.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        {event.description && (
          <Box sx={{ '& p': { mb: 2 } }}>
            <Typography variant="h6" gutterBottom>Description :</Typography>
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
} 