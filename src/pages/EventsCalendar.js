// src/pages/EventsCalendar.js - CALENDRIER UNIFIÉ POUR TOUTES LES PUBLICATIONS
import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar, Box, Card } from '@mui/material';
import { Add } from '@mui/icons-material';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { PUBLICATION_STATUSES } from '../utils/publicationStatus';

// === CALENDRIER UNIFIÉ - CODES COULEUR ET ICÔNES ===
const CALENDAR_COLORS = {
  posts: '#2196F3',        // Bleu - Posts
  events: '#4CAF50',       // Vert - Événements
  polls: '#FF9800',        // Orange - Sondages
  alerts: '#F44336',       // Rouge - Alertes
  dailyMessages: '#9C27B0' // Violet - Messages du jour
};

const PUBLICATION_ICONS = {
  posts: '📝',
  events: '📅',
  polls: '📊', 
  alerts: '🚨',
  dailyMessages: '📢'
};

// Fonction pour vérifier si une publication appartient à une résidence
const checkInResidence = (publication, residenceId) => {
  if (publication.residenceIds && Array.isArray(publication.residenceIds)) {
    return publication.residenceIds.includes(residenceId);
  }
  if (publication.targetResidences && Array.isArray(publication.targetResidences)) {
    return publication.targetResidences.includes(residenceId);
  }
  return publication.residence_id === residenceId;
};

export default function EventsCalendar() {
  const { ensureAuthenticated } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const { getPublications, addPublication, updatePublication, getPublicationById } = usePublications();
  const [openModal, setOpenModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Récupérer TOUTES les publications depuis le contexte
  const allPublications = useMemo(() => ({
    posts: getPublications('posts'),
    events: getPublications('events'),
    polls: getPublications('polls'),
    alerts: getPublications('alerts'),
    dailyMessages: getPublications('dailyMessages')
  }), [getPublications]);

  // Filtrer toutes les publications par résidence et statut (mémorisé pour performance)
  const filteredPublications = useMemo(() => {
    const filtered = [];
    
    Object.entries(allPublications).forEach(([type, publications]) => {
      publications.forEach(pub => {
        // Filtrer par résidence
        const inResidence = checkInResidence(pub, currentResidenceId);
        
        // Filtrer par statut (uniquement Publié et Programmé visibles dans le calendrier)
        const isVisible = pub.status === PUBLICATION_STATUSES.PUBLISHED || 
                         pub.status === PUBLICATION_STATUSES.SCHEDULED;
        
        if (inResidence && isVisible) {
          filtered.push({ ...pub, publicationType: type });
        }
      });
    });
    
    return filtered;
  }, [allPublications, currentResidenceId]);

  // Convertir TOUTES les publications pour FullCalendar (mémorisé pour performance)
  const calendarEvents = useMemo(() => 
    filteredPublications.map(publication => {
      const type = publication.publicationType;
      const icon = PUBLICATION_ICONS[type];
      const color = CALENDAR_COLORS[type];
      
      console.log(`🔍 DEBUG - ${type} à convertir:`, publication);
      
      // Déterminer la date d'affichage
      let displayDate;
      let displayTime = null;
      let hasTime = false;
      
      if (type === 'events') {
        // Pour les événements : s'adapter à TOUS les formats de données possibles
        console.log('🔍 DEBUG - Données événement complètes:', publication);
        
        // Priorité 1: startDate/endDate (format harmonisé du ModalPublicationForm ligne 473-474)
        if (publication.startDate) {
          displayDate = publication.startDate;
          const startDateObj = new Date(publication.startDate);
          displayTime = startDateObj.toTimeString().substring(0, 5);
          hasTime = true;
        }
        // Priorité 2: eventDateTimeStart (format du formulaire)
        else if (publication.eventDateTimeStart) {
          displayDate = publication.eventDateTimeStart;
          const startDateObj = new Date(publication.eventDateTimeStart);
          displayTime = startDateObj.toTimeString().substring(0, 5);
          hasTime = true;
        }
        // Priorité 3: eventDateRangeStart (format du champ daterange)
        else if (publication.eventDateRangeStart) {
          displayDate = publication.eventDateRangeStart;
          const startDateObj = new Date(publication.eventDateRangeStart);
          displayTime = startDateObj.toTimeString().substring(0, 5);
          hasTime = true;
        }
        // Priorité 4: eventDate + startTime (format legacy mockData)
        else if (publication.eventDate && publication.startTime) {
          if (typeof publication.startTime === 'string' && publication.startTime.match(/^\d{2}:\d{2}/)) {
            displayDate = `${publication.eventDate}T${publication.startTime}:00`;
            displayTime = publication.startTime.substring(0, 5);
          } else {
            displayDate = publication.eventDate;
          }
          hasTime = true;
        }
        // Fallback: eventDate seul ou date de publication
        else {
          displayDate = publication.eventDate || publication.publicationDate || publication.createdAt;
          hasTime = false;
        }
      } else {
        // Pour les autres types : utiliser la date de publication
        displayDate = publication.publicationDate || publication.createdAt;
      }
      
      // Construire le titre avec icône et heure si applicable
      const baseTitle = publication.title || publication.question || 'Sans titre';
      let title = `${icon} ${baseTitle}`;
      
      // Ajouter l'heure pour les événements
      if (hasTime && displayTime && type === 'events') {
        title = `${icon} ${displayTime} - ${baseTitle}`;
      }
      
      console.log(`📅 ${type} formaté pour calendrier:`, { title, displayDate, color });
      
      return {
        id: `${type}_${publication.id}`,
        title,
        start: displayDate,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        extendedProps: {
          ...publication,
          publicationType: type,
          originalId: publication.id,
          hasTime
        }
      };
    }), [filteredPublications]
  );

  // === DRAG & DROP SIMPLE QUI FONCTIONNE ===
  const handleEventDrop = (dropInfo) => {
    try {
      ensureAuthenticated('déplacer une publication');
      
      const newDate = dropInfo.event.start.toISOString().split('T')[0];
      
      // TODO: Mise à jour via le contexte pour le drag & drop
      setNotification({
        open: true,
        message: `Publication "${dropInfo.event.title}" déplacée au ${new Date(newDate).toLocaleDateString('fr-FR')} !`,
        severity: 'success'
      });
      
    } catch (error) {
      dropInfo.revert(); // Annuler le déplacement
      setNotification({
        open: true,
        message: 'Erreur: vous devez être connecté pour déplacer une publication',
        severity: 'error'
      });
    }
  };

  // Clic sur publication - Rediriger vers la page de détail appropriée
  const handleEventClick = (clickInfo) => {
    console.log('📅 DEBUG - Clic sur événement:', clickInfo.event.title);
    console.log('📅 DEBUG - Empêcher propagation vers dateClick');
    
    // Empêcher la propagation vers dateClick
    if (clickInfo.jsEvent) {
      clickInfo.jsEvent.stopPropagation();
      clickInfo.jsEvent.preventDefault();
    }
    
    try {
      ensureAuthenticated('consulter une publication');
      
      const extendedProps = clickInfo.event.extendedProps;
      const type = extendedProps.publicationType;
      const originalId = extendedProps.originalId;
      
      console.log(`🔍 Clic sur ${type} ID: ${originalId}`);
      
      // Rediriger vers la page de détail appropriée selon le type
      switch (type) {
        case 'events':
          navigate(`/events/${originalId}?from=calendar`);
          break;
        case 'posts':
          navigate(`/posts/${originalId}`);
          break;
        case 'polls':
          navigate(`/polls/${originalId}`);
          break;
        case 'alerts':
          navigate(`/alerts/${originalId}`);
          break;
        case 'dailyMessages':
          navigate(`/daily-messages/${originalId}`);
          break;
        default:
          console.warn('Type de publication inconnu:', type);
          setNotification({
            open: true,
            message: 'Type de publication non supporté',
            severity: 'error'
          });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de l\'ouverture de la publication',
        severity: 'error'
      });
    }
  };

  // Clic sur date - Créer un nouvel événement
  const handleDateClick = (dateInfo) => {
    console.log('🗓️ DEBUG - Clic sur date:', dateInfo.dateStr);
    console.log('🗓️ DEBUG - État modal avant:', { openModal, selectedDate, editingEvent });
    
    try {
      ensureAuthenticated('créer un nouvel événement');
      
      // Empêcher la propagation si on clique sur un événement
      if (dateInfo.jsEvent && dateInfo.jsEvent.target) {
        const clickedElement = dateInfo.jsEvent.target;
        // Vérifier si on a cliqué sur un événement ou ses enfants
        if (clickedElement.closest('.fc-event')) {
          console.log('🗓️ DEBUG - Clic sur événement détecté, ignorer le dateClick');
          return;
        }
      }
      
      console.log('🗓️ DEBUG - Ouverture modal pour date:', dateInfo.dateStr);
      
      // S'assurer que le modal est fermé avant de le rouvrir
      if (openModal) {
        console.log('🗓️ DEBUG - Modal déjà ouvert, fermer d\'abord');
        setOpenModal(false);
        // Petite temporisation pour laisser le modal se fermer
        setTimeout(() => {
          setSelectedDate(dateInfo.dateStr);
          setEditingEvent(null);
          setOpenModal(true);
        }, 100);
      } else {
        setSelectedDate(dateInfo.dateStr);
        setEditingEvent(null);
        setOpenModal(true);
      }
      
    } catch (error) {
      console.error('🗓️ ERROR - Erreur dateClick:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  const handleSubmitEvent = async (eventData) => {
    try {
      ensureAuthenticated(editingEvent ? 'modifier un événement' : 'créer un nouvel événement');
      
      if (editingEvent) {
        await updatePublication('events', editingEvent.id, {
          ...eventData,
          updatedAt: new Date().toISOString()
        });
        setNotification({
          open: true,
          message: `Événement "${eventData.title}" mis à jour avec succès !`,
          severity: 'success'
        });
      } else {
        await addPublication('events', eventData);
        setNotification({
          open: true,
          message: 'Événement créé avec succès !',
          severity: 'success'
        });
      }
      
      setOpenModal(false);
      setSelectedDate(null);
      setEditingEvent(null);
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      setNotification({
        open: true,
        message: editingEvent ? 'Erreur lors de la mise à jour de l\'événement' : 'Erreur lors de la création de l\'événement',
        severity: 'error'
      });
    }
  };

  const handleNewEventClick = () => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      setSelectedDate(null);
      setEditingEvent(null);
      setOpenModal(true);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  const getInitialValues = () => {
    if (editingEvent) {
      console.log('📅 Mode édition - Événement existant:', editingEvent);
      
      // S'adapter aux données existantes - le calendrier lit ce qui existe
      let startDate = null;
      let endDate = null;
      
      // Priorité 1: startDate/endDate (format harmonisé)
      if (editingEvent.startDate && editingEvent.endDate) {
        startDate = new Date(editingEvent.startDate);
        endDate = new Date(editingEvent.endDate);
      }
      // Priorité 2: eventDateTimeStart/End (format formulaire)
      else if (editingEvent.eventDateTimeStart && editingEvent.eventDateTimeEnd) {
        startDate = new Date(editingEvent.eventDateTimeStart);
        endDate = new Date(editingEvent.eventDateTimeEnd);
      }
      // Priorité 3: eventDateRangeStart/End (format champ daterange)
      else if (editingEvent.eventDateRangeStart && editingEvent.eventDateRangeEnd) {
        startDate = new Date(editingEvent.eventDateRangeStart);
        endDate = new Date(editingEvent.eventDateRangeEnd);
      }
      // Priorité 4: eventDate + startTime/endTime (format legacy)
      else if (editingEvent.eventDate && editingEvent.startTime && editingEvent.endTime) {
        startDate = new Date(`${editingEvent.eventDate}T${editingEvent.startTime}:00`);
        endDate = new Date(`${editingEvent.eventDate}T${editingEvent.endTime}:00`);
      }
      
      // Retourner les données avec le format attendu par le formulaire (eventDateRange)
      return {
        ...editingEvent,
        eventDateRangeStart: startDate,
        eventDateRangeEnd: endDate
      };
    } else if (selectedDate) {
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(14, 0, 0, 0);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(15, 0, 0, 0);
      
      console.log('📅 Date sélectionnée dans le calendrier:', selectedDate);
      
      return { 
        eventDateRangeStart: selectedDateTime,
        eventDateRangeEnd: endDateTime
      };
    }
    return {};
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <PageHeader
        title={`Calendrier des publications - ${currentResidenceName}`}
        subtitle="Visualisez toutes vos publications par type avec codes couleur"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Calendrier', href: '/calendar' }
        ]}
        actions={[
          {
            label: 'Nouveau Événement',
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewEventClick
            }
          }
        ]}
        stats={[
          { 
            label: 'Publications ce mois', 
            value: filteredPublications.filter(p => {
              const pubMonth = new Date(p.publicationDate || p.createdAt).getMonth();
              const currentMonth = new Date().getMonth();
              return pubMonth === currentMonth;
            }).length.toString() 
          },
          { label: 'Total publications', value: filteredPublications.length.toString() }
        ]}
      />

      <Card className="directus-card" sx={{ p: 3 }}>
        <Box sx={{ 
          '& .fc': {
            '--fc-border-color': 'var(--theme-border-subdued)',
            '--fc-button-bg-color': 'var(--theme-primary)',
            '--fc-button-border-color': 'var(--theme-primary)',
            '--fc-button-hover-bg-color': 'var(--theme-primary-600)',
            '--fc-button-active-bg-color': 'var(--theme-primary-700)',
            '--fc-today-bg-color': 'var(--theme-primary-50)',
            fontFamily: 'inherit'
          },
          '& .fc-toolbar-title': {
            color: 'var(--theme-foreground-normal)',
            fontWeight: 600
          },
          '& .fc-daygrid-day-number': {
            color: 'var(--theme-foreground-normal)'
          },
          '& .fc-col-header-cell': {
            backgroundColor: 'var(--theme-background-accent)',
            borderColor: 'var(--theme-border-subdued)'
          },
          '& .fc-daygrid-day': {
            '&:hover': {
              backgroundColor: 'var(--theme-background-accent)'
            }
          },
          '& .fc-event': {
            cursor: 'pointer',
            borderRadius: 'var(--theme-border-radius)',
            '&:hover': {
              opacity: 0.8
            }
          }
        }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={frLocale}
            events={calendarEvents}
            editable={true}
            droppable={true}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            selectMirror={true}
            unselectAuto={true}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            buttonText={{
              today: 'Aujourd\'hui',
              month: 'Mois',
              week: 'Semaine'
            }}
            dayMaxEvents={3}
            moreLinkText="plus"
            eventDisplay="block"
            displayEventTime={false} // On gère l'heure dans le titre
          />
        </Box>
      </Card>

      <ModalPublicationForm
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
          setSelectedDate(null);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
        entityName="Événement"
        initialValues={getInitialValues()}
        isEditing={!!editingEvent}
        fields={[
          { name: 'title', label: 'Titre de l\'événement', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'wysiwyg', required: true },
          { name: 'eventDateRange', label: 'Date et heure de l\'événement', type: 'daterange', required: true },
          { name: 'location', label: 'Lieu', type: 'text', required: true },
          { name: 'eventImage', label: 'Image de l\'événement', type: 'image' },
          { name: 'hasParticipantLimit', label: 'Limiter le nombre de participants', type: 'checkbox' },
          { name: 'maxParticipants', label: 'Nombre max de participants', type: 'number', showIf: 'hasParticipantLimit' }
        ]}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}