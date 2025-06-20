// src/pages/EventsCalendar.js - VERSION SIMPLE QUI FONCTIONNE
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

export default function EventsCalendar() {
  const { ensureAuthenticated } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const { getPublications, addPublication, updatePublication, getPublicationById } = usePublications();
  const [openModal, setOpenModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // NOUVEAU : Pour l'édition
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Récupérer les événements depuis le contexte
  const events = getPublications('events');

  // Filtrer les événements par résidence (mémorisé pour performance)
  const filteredEvents = useMemo(() => 
    events.filter(event => {
      // Gérer les différents formats de résidence
      if (event.targetResidences && Array.isArray(event.targetResidences)) {
        return event.targetResidences.includes(currentResidenceId);
      }
      // Format legacy avec residence_id
      return event.residence_id === currentResidenceId;
    }),
    [events, currentResidenceId]
  );

  // Convertir pour FullCalendar (mémorisé pour performance)
  const calendarEvents = useMemo(() => 
    filteredEvents.map(event => {
      console.log('🔍 DEBUG - Événement à convertir:', event);
      
      // Format harmonisé : startDate/endDate (prioritaire)
      let startDateTime = event.startDate;
      let endDateTime = event.endDate;
      
      // Fallback pour les anciens formats (compatibilité)
      if (!startDateTime || !endDateTime) {
        if (event.eventDate && event.startTime && event.endTime) {
          // Format legacy mockData
          startDateTime = `${event.eventDate}T${event.startTime}:00`;
          endDateTime = `${event.eventDate}T${event.endTime}:00`;
        } else {
          // Format de fallback ultime
          const date = event.eventDate || event.publicationDate || new Date().toISOString().split('T')[0];
          startDateTime = `${date}T09:00:00`;
          endDateTime = `${date}T10:00:00`;
        }
      }
      
      console.log('📅 Dates harmonisées pour FullCalendar:', { startDateTime, endDateTime });
      
      return {
        id: event.id.toString(),
        title: event.title || 'Événement sans titre',
        start: startDateTime,
        end: endDateTime,
        extendedProps: {
          ...event,
          isArchived: event.status === 'Archivé'
        }
      };
    }), [filteredEvents]
  );

  // === DRAG & DROP SIMPLE QUI FONCTIONNE ===
  const handleEventDrop = (dropInfo) => {
    try {
      ensureAuthenticated('déplacer un événement');
      
      const newDate = dropInfo.event.start.toISOString().split('T')[0];
      
      // TODO: Mise à jour via le contexte pour le drag & drop
      // Pour l'instant on garde l'ancien système pour le drag & drop
      // setEvents(prevEvents => 
      //   prevEvents.map(event => 
      //     event.id === eventId 
      //       ? { ...event, eventDate: newDate }
      //       : event
      //   )
      // );
      
      setNotification({
        open: true,
        message: `Événement "${dropInfo.event.title}" déplacé au ${new Date(newDate).toLocaleDateString('fr-FR')} !`,
        severity: 'success'
      });
      
    } catch (error) {
      dropInfo.revert(); // Annuler le déplacement
      setNotification({
        open: true,
        message: 'Erreur: vous devez être connecté pour déplacer un événement',
        severity: 'error'
      });
    }
  };

  // Clic sur événement - Ouvrir popup de modification
  const handleEventClick = (clickInfo) => {
    try {
      ensureAuthenticated('modifier un événement');
      
      const eventId = clickInfo.event.id;
      const event = getPublicationById('events', eventId);
      
      if (event) {
        setEditingEvent(event);
        setSelectedDate(null); // Pas de date présélectionnée en mode édition
        setOpenModal(true);
      } else {
        setNotification({
          open: true,
          message: 'Événement introuvable',
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour modifier un événement',
        severity: 'error'
      });
    }
  };

  // Clic sur date
  const handleDateClick = (dateInfo) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      setSelectedDate(dateInfo.dateStr);
      setEditingEvent(null); // S'assurer qu'on n'est pas en mode édition
      setOpenModal(true);
    } catch (error) {
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
        // Mise à jour d'un événement existant
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
        // Création d'un nouvel événement
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
      setSelectedDate(null); // Pas de date présélectionnée
      setEditingEvent(null); // S'assurer qu'on n'est pas en mode édition
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
      // Mode édition - convertir vers le nouveau format harmonisé
      console.log('📅 Mode édition - Événement existant:', editingEvent);
      
      return {
        ...editingEvent,
        // Convertir les anciens formats vers le nouveau
        eventDateTimeStart: editingEvent.startDate ? new Date(editingEvent.startDate) : 
                           (editingEvent.eventDate && editingEvent.startTime ? 
                            new Date(`${editingEvent.eventDate}T${editingEvent.startTime}:00`) : null),
        eventDateTimeEnd: editingEvent.endDate ? new Date(editingEvent.endDate) : 
                         (editingEvent.eventDate && editingEvent.endTime ? 
                          new Date(`${editingEvent.eventDate}T${editingEvent.endTime}:00`) : null)
      };
    } else if (selectedDate) {
      // Mode création avec date présélectionnée
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(14, 0, 0, 0);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(15, 0, 0, 0);
      
      console.log('📅 Date sélectionnée dans le calendrier:', selectedDate);
      console.log('📅 Valeurs initiales harmonisées:', {
        eventDateTimeStart: selectedDateTime,
        eventDateTimeEnd: endDateTime
      });
      
      return { 
        eventDateTimeStart: selectedDateTime,
        eventDateTimeEnd: endDateTime
      };
    }
    // Mode création normale
    return {};
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <PageHeader
        title="Calendrier des événements"
        subtitle={`Visualisez et gérez les événements de ${currentResidenceName || 'votre résidence'}`}
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
          { label: 'Événements ce mois', value: filteredEvents.filter(e => {
            const eventMonth = new Date(e.eventDate).getMonth();
            const currentMonth = new Date().getMonth();
            return eventMonth === currentMonth && e.status === 'Publié';
          }).length.toString() },
          { label: 'Total événements', value: filteredEvents.length.toString() }
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
            '--fc-event-bg-color': 'var(--theme-primary)',
            '--fc-event-border-color': 'var(--theme-primary-600)',
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
            displayEventTime={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
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
          { name: 'eventDateTime', label: 'Date et heure de l\'événement', type: 'daterange', required: true },
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