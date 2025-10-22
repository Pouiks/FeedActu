import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack, Snackbar, Alert } from '@mui/material';
import { Repeat } from '@mui/icons-material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';
import ModalRepostForm from '../components/ModalRepostForm';
import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../context/PublicationsContext';
import { getStatusColor, canRepost, normalizeStatus } from '../utils/publicationStatus';

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
  const { user } = useAuth();
  const { getPublicationById, updatePublication } = usePublications();
  const [event, setEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [openRepostModal, setOpenRepostModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Déterminer la page de retour en fonction du paramètre 'from'
  const fromPage = searchParams.get('from');
  const backTo = fromPage === 'calendar' ? '/events-calendar' : '/events';
  const backLabel = fromPage === 'calendar' ? 'Retour au calendrier' : 'Retour aux événements';

  useEffect(() => {
    // Récupération de l'événement par ID depuis le contexte
    const foundEvent = getPublicationById('events', id);
    console.log('🔍 DEBUG EventDetail - Recherche événement ID:', id);
    console.log('🔍 DEBUG EventDetail - Événement trouvé:', foundEvent);
    
    if (foundEvent) {
      setEvent(foundEvent);
      
      // Adapter les champs selon la structure des données du contexte
      const eventDate = foundEvent.eventDate || foundEvent.startDate || foundEvent.eventDateTimeStart;
      
      // Récupération intelligente des heures
      let startTimeValue, endTimeValue;
      
      // Si on a des heures directes (format string "HH:mm")
      if (foundEvent.startTime && foundEvent.endTime) {
        startTimeValue = new Date(`2000-01-01T${foundEvent.startTime}:00`);
        endTimeValue = new Date(`2000-01-01T${foundEvent.endTime}:00`);
      }
      // Si on a des dates complètes, extraire les heures
      else if (foundEvent.startDate && foundEvent.endDate) {
        startTimeValue = new Date(foundEvent.startDate);
        endTimeValue = new Date(foundEvent.endDate);
      }
      else if (foundEvent.eventDateTimeStart && foundEvent.eventDateTimeEnd) {
        startTimeValue = new Date(foundEvent.eventDateTimeStart);
        endTimeValue = new Date(foundEvent.eventDateTimeEnd);
      }
      else if (foundEvent.eventDateRangeStart && foundEvent.eventDateRangeEnd) {
        startTimeValue = new Date(foundEvent.eventDateRangeStart);
        endTimeValue = new Date(foundEvent.eventDateRangeEnd);
      }
      // Valeurs par défaut
      else {
        startTimeValue = new Date(`2000-01-01T09:00:00`);
        endTimeValue = new Date(`2000-01-01T10:00:00`);
      }
      
      console.log('🕐 DEBUG EventDetail - Mapping des heures:', {
        foundEvent: {
          startTime: foundEvent.startTime,
          endTime: foundEvent.endTime,
          startDate: foundEvent.startDate,
          endDate: foundEvent.endDate,
          eventDateTimeStart: foundEvent.eventDateTimeStart,
          eventDateTimeEnd: foundEvent.eventDateTimeEnd
        },
        computed: {
          startTimeValue,
          endTimeValue
        }
      });
      
      setEditedEvent({
        title: foundEvent.title || '',
        description: foundEvent.description || foundEvent.message || '',
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        startTime: startTimeValue,
        endTime: endTimeValue,
        location: foundEvent.location || '',
        maxParticipants: foundEvent.maxParticipants || foundEvent.capacity || '',
        publicationDate: foundEvent.publicationDate || foundEvent.createdAt || new Date().toISOString()
      });
    } else {
      console.warn('⚠️ Événement non trouvé avec ID:', id);
    }
  }, [id, getPublicationById]);

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

  const handleSave = async () => {
    try {
      // Construire les dates complètes à partir de eventDate + startTime/endTime
      const eventDateStr = editedEvent.eventDate.toISOString().split('T')[0];
      const startTimeStr = editedEvent.startTime.toTimeString().slice(0, 5);
      const endTimeStr = editedEvent.endTime.toTimeString().slice(0, 5);
      
      const startDateTime = new Date(`${eventDateStr}T${startTimeStr}:00`);
      const endDateTime = new Date(`${eventDateStr}T${endTimeStr}:00`);
      
      const updatedData = {
        title: editedEvent.title,
        description: editedEvent.description,
        // Format legacy pour compatibilité affichage
        eventDate: eventDateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        // Format harmonisé pour le formulaire
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        // Format daterange pour ModalPublicationForm
        eventDateRangeStart: startDateTime.toISOString(),
        eventDateRangeEnd: endDateTime.toISOString(),
        location: editedEvent.location,
        maxParticipants: editedEvent.maxParticipants,
        publicationDate: editedEvent.publicationDate
      };
      
      console.log('💾 DEBUG EventDetail - Sauvegarde événement:', {
        original: event,
        edited: editedEvent,
        updatedData
      });
      
      // Sauvegarde via le contexte
      await updatePublication('events', event.id, updatedData);
      
      // Mettre à jour l'état local
      const updatedEvent = { ...event, ...updatedData };
      setEvent(updatedEvent);
      setIsDirty(false);
      
      setNotification({
        open: true,
        message: 'Événement sauvegardé avec succès !',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la sauvegarde de l\'événement',
        severity: 'error'
      });
    }
  };

  const handleRepostClick = () => {
    console.log('🔍 DEBUG EventDetail - Ouverture modal republication pour événement:', event);
    setOpenRepostModal(true);
  };

  const handleSubmitRepost = async (payload) => {
    try {
      console.log('🔍 DEBUG EventDetail - Soumission republication événement:', payload);
      
      // TODO: Remplacer par l'appel API réel
      // await repostPublication('event', payload);
      
      setNotification({
        open: true,
        message: `Événement "${event.title}" republié avec succès !`,
        severity: 'success'
      });
      
      setOpenRepostModal(false);
    } catch (error) {
      console.error('❌ Erreur lors de la republication de l\'événement:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la republication de l\'événement',
        severity: 'error'
      });
    }
  };

  if (!event) {
    return (
      <Box>
        <BackButton to={backTo} label={backLabel} />
        <Typography>Événement non trouvé</Typography>
      </Box>
    );
  }

  // Fonction getStatusColor supprimée - utilise maintenant l'utilitaire unifié

  return (
    <Box>
      <BackButton to={backTo} label={backLabel} />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Édition de l'événement
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<Repeat />}
              onClick={handleRepostClick}
              disabled={!canRepost(event.status)}
              size="small"
            >
              Republier (TEST)
            </Button>
            <Chip 
              label={event.status} 
              color={getStatusColor(event.status)}
              variant="outlined"
            />
          </Stack>
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

      {/* Modal de republication */}
      <ModalRepostForm
        open={openRepostModal}
        handleClose={() => setOpenRepostModal(false)}
        onSubmit={handleSubmitRepost}
        originalPost={event}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 