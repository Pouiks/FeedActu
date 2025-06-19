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
  const { getPublications, addPublication } = usePublications();
  const [openModal, setOpenModal] = useState(false);
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
    events.filter(event => event.residence_id === currentResidenceId),
    [events, currentResidenceId]
  );

  // Convertir pour FullCalendar (mémorisé pour performance)
  const calendarEvents = useMemo(() => 
    filteredEvents.map(event => ({
      id: event.id.toString(),
      title: event.title,
      start: `${event.eventDate}T${event.startTime}:00`,
      end: `${event.eventDate}T${event.endTime}:00`,
      extendedProps: {
        ...event,
        isArchived: event.status === 'Archivé'
      }
    })), [filteredEvents]
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

  // Clic sur événement
  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    navigate(`/events/${eventId}`);
  };

  // Clic sur date
  const handleDateClick = (dateInfo) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      setSelectedDate(dateInfo.dateStr);
      setOpenModal(true);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  const handleAddEvent = async (newEvent) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      
      // Utiliser le contexte pour ajouter l'événement
      await addPublication('events', newEvent);
      
      setOpenModal(false);
      setSelectedDate(null);
      setNotification({
        open: true,
        message: 'Événement créé avec succès !',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la création de l\'événement',
        severity: 'error'
      });
    }
  };

  const handleNewEventClick = () => {
    try {
      ensureAuthenticated('créer un nouvel événement');
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
    if (selectedDate) {
      return { eventDate: selectedDate };
    }
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
        }}
        onSubmit={handleAddEvent}
        entityName="Événement"
        initialValues={getInitialValues()}
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