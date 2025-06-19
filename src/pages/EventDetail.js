import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack } from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (synchronisées avec Events.js)
const mockEvents = [
  { 
    id: 1, 
    title: 'Assemblée générale extraordinaire', 
    description: '<p><strong>Ordre du jour :</strong><br>• Vote des travaux de réfection<br>• Budget exceptionnel<br>• Questions diverses</p>',
    eventDate: '2025-06-20', 
    startTime: '18:30', 
    endTime: '20:30',
    location: 'Salle de réunion (RDC)',
    maxParticipants: 50,
    publicationDate: '2025-06-22T09:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    title: 'Cours de yoga collectif', 
    description: '<p>Séance de yoga pour tous niveaux avec <em>Marie</em>, professeure certifiée.<br><br>Apportez votre tapis ! 🧘‍♀️</p>',
    eventDate: '2025-06-05', 
    startTime: '19:00', 
    endTime: '20:00',
    location: 'Jardin commun (si beau temps)',
    maxParticipants: 15,
    publicationDate: '2025-06-20T14:15:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    title: 'Atelier cuisine enfants', 
    description: '<p>Les petits chefs en herbe vont préparer des <strong>cookies de Noël</strong> ! 👨‍🍳</p>',
    eventDate: '2025-06-18', 
    startTime: '14:00', 
    endTime: '16:30',
    location: 'Cuisine commune',
    maxParticipants: 8,
    publicationDate: '2025-06-10T10:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    title: 'Soirée film en plein air', 
    description: '<p>Projection du film <em>"Le Grand Bleu"</em> dans le jardin.<br>Popcorn et boissons offerts ! 🍿</p>',
    eventDate: '2025-06-08', 
    startTime: '20:00', 
    endTime: '22:30',
    location: 'Jardin commun',
    maxParticipants: 30,
    publicationDate: '2025-06-25T16:45:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    title: 'Vide-grenier des résidents', 
    description: '<p>Grande braderie entre voisins ! Livres, vêtements, objets de décoration...<br><br>Inscription obligatoire pour tenir un stand.</p>',
    eventDate: '2025-06-15', 
    startTime: '09:00', 
    endTime: '17:00',
    location: 'Parking sous-sol',
    maxParticipants: 100,
    publicationDate: '2025-06-30T08:00:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    title: 'Fête d\'Halloween 2025', 
    description: '<p>Soirée déguisée pour petits et grands ! 🎃<br>Concours du meilleur costume avec prix à la clé.</p>',
    eventDate: '2025-06-31', 
    startTime: '18:00', 
    endTime: '21:00',
    location: 'Hall d\'entrée',
    maxParticipants: 40,
    publicationDate: '2025-06-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 7, 
    title: 'Maintenance collective vélos', 
    description: '<p>Atelier réparation et entretien vélos avec <strong>Pierre</strong>, mécanicien bénévole.</p>',
    eventDate: '2025-07-12', 
    startTime: '10:00', 
    endTime: '12:00',
    location: 'Local vélos',
    maxParticipants: 6,
    publicationDate: '2025-07-28T15:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  }
];

export default function EventDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Déterminer la page de retour en fonction du paramètre 'from'
  const fromPage = searchParams.get('from');
  const backTo = fromPage === 'calendar' ? '/events-calendar' : '/events';
  const backLabel = fromPage === 'calendar' ? 'Retour au calendrier' : 'Retour aux événements';

  useEffect(() => {
    // Simule la récupération de l'événement par ID
    const foundEvent = mockEvents.find(e => e.id === parseInt(id));
    if (foundEvent) {
      setEvent(foundEvent);
      setEditedEvent({ 
        title: foundEvent.title || '',
        eventDate: new Date(foundEvent.eventDate),
        startTime: new Date(`2000-01-01T${foundEvent.startTime}:00`),
        endTime: new Date(`2000-01-01T${foundEvent.endTime}:00`),
        location: foundEvent.location || '',
        maxParticipants: foundEvent.maxParticipants || '',
        description: foundEvent.description || '',
        publicationDate: foundEvent.publicationDate || new Date().toISOString()
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!event) return;
    
    const hasChanges = 
      editedEvent.title !== event.title ||
      editedEvent.eventDate?.toISOString().split('T')[0] !== event.eventDate ||
      editedEvent.startTime?.toTimeString().slice(0, 5) !== event.startTime ||
      editedEvent.endTime?.toTimeString().slice(0, 5) !== event.endTime ||
      editedEvent.location !== event.location ||
      editedEvent.maxParticipants !== event.maxParticipants ||
      editedEvent.description !== event.description ||
      editedEvent.publicationDate !== event.publicationDate;
    
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
      eventDate: editedEvent.eventDate.toISOString().split('T')[0],
      startTime: editedEvent.startTime.toTimeString().slice(0, 5),
      endTime: editedEvent.endTime.toTimeString().slice(0, 5)
    });
    
    // Simule la sauvegarde
    const updatedEvent = { 
      ...event, 
      title: editedEvent.title,
      eventDate: editedEvent.eventDate.toISOString().split('T')[0],
      startTime: editedEvent.startTime.toTimeString().slice(0, 5),
      endTime: editedEvent.endTime.toTimeString().slice(0, 5),
      location: editedEvent.location,
      maxParticipants: editedEvent.maxParticipants,
      description: editedEvent.description,
      publicationDate: editedEvent.publicationDate
    };
    setEvent(updatedEvent);
    setIsDirty(false);
    
    alert('Événement sauvegardé avec succès !');
  };

  if (!event) {
    return (
      <Box>
        <BackButton to={backTo} label={backLabel} />
        <Typography>Événement non trouvé</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Publié': return 'success';
      case 'Programmé': return 'info';
      case 'Brouillon': return 'warning';
      case 'Archivé': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <BackButton to={backTo} label={backLabel} />
      
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

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            {/* Date */}
            <DatePicker
              label="Date de l'événement"
              value={editedEvent.eventDate}
              onChange={(newValue) => handleFieldChange('eventDate', newValue)}
              slotProps={{ 
                textField: { 
                  fullWidth: true
                }
              }}
              disablePast
            />

            {/* Heures */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TimePicker
                label="Heure de début"
                value={editedEvent.startTime}
                onChange={(newValue) => handleFieldChange('startTime', newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true
                  }
                }}
                ampm={false}
              />
              <TimePicker
                label="Heure de fin"
                value={editedEvent.endTime}
                onChange={(newValue) => handleFieldChange('endTime', newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true
                  }
                }}
                ampm={false}
              />
            </Box>
          </LocalizationProvider>

          {/* Lieu */}
          <TextField
            label="Lieu"
            value={editedEvent.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Salle commune, Jardin, Hall d'entrée..."
          />

          {/* Participants max */}
          <TextField
            label="Nombre maximum de participants"
            type="number"
            value={editedEvent.maxParticipants}
            onChange={(e) => handleFieldChange('maxParticipants', parseInt(e.target.value) || '')}
            fullWidth
            variant="outlined"
            placeholder="Laisser vide si pas de limite"
          />

          {/* Date de publication modifiable */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label="Date de publication"
              value={editedEvent.publicationDate ? new Date(editedEvent.publicationDate) : null}
              onChange={(newValue) => handleFieldChange('publicationDate', newValue?.toISOString())}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true,
                  helperText: "Date et heure de publication de l'événement"
                }
              }}
              ampm={false}
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