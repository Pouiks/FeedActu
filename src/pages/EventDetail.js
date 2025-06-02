import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (comme dans Events.js)
const mockEvents = [
  { id: 1, title: 'Événement A', eventDateTime: '2024-06-10T18:00:00', description: '<p>Description de l\'événement A avec du <strong>HTML</strong></p>', publicationDate: '2024-05-10T10:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Événement B', eventDateTime: '2024-06-15T20:00:00', description: '<p>Description de l\'événement B</p>', publicationDate: '2024-05-12T10:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération de l'événement par ID
    const foundEvent = mockEvents.find(e => e.id === parseInt(id));
    if (foundEvent) {
      setEvent(foundEvent);
      setEditedEvent({ 
        title: foundEvent.title || '',
        eventDateTime: new Date(foundEvent.eventDateTime),
        description: foundEvent.description || ''
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!event) return;
    
    const hasChanges = 
      editedEvent.title !== event.title ||
      editedEvent.eventDateTime?.toISOString() !== new Date(event.eventDateTime).toISOString() ||
      editedEvent.description !== event.description;
    
    setIsDirty(hasChanges);
  }, [editedEvent, event]);

  const handleFieldChange = (fieldName, value) => {
    setEditedEvent(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde de l\'événement:', { 
      ...event, 
      ...editedEvent,
      eventDateTime: editedEvent.eventDateTime.toISOString()
    });
    
    // Simule la sauvegarde
    const updatedEvent = { 
      ...event, 
      ...editedEvent,
      eventDateTime: editedEvent.eventDateTime.toISOString()
    };
    setEvent(updatedEvent);
    setIsDirty(false);
    
    alert('Événement sauvegardé avec succès !');
  };

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
          <Typography variant="h6" color="text.secondary">
            Édition de l'événement
          </Typography>
          <Chip 
            label={event.status} 
            color={getStatusColor(event.status)}
            variant="outlined"
          />
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

        <Stack spacing={3}>
          {/* Titre */}
          <TextField
            label="Nom de l'événement"
            value={editedEvent.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            fullWidth
            variant="outlined"
          />

          {/* Date et heure */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date & Heure de l'événement"
              value={editedEvent.eventDateTime}
              onChange={(newValue) => handleFieldChange('eventDateTime', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          {/* Description */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Description de l'événement</Typography>
            <RichTextEditor
              value={editedEvent.description}
              onChange={(content) => handleFieldChange('description', content)}
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