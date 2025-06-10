// src/pages/EventsCalendar.js - VERSION SIMPLE QUI FONCTIONNE
import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useResidence } from '../context/ResidenceContext';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

// Données mockées avec GUIDs corrects
const mockEvents = [
  { 
    id: 1, 
    title: 'Assemblée générale extraordinaire', 
    description: '<p><strong>Ordre du jour :</strong><br>• Vote des travaux de réfection<br>• Budget exceptionnel<br>• Questions diverses</p>',
    eventDate: '2025-06-20', 
    startTime: '18:30', 
    endTime: '20:30',
    location: 'Salle de réunion (RDC)',
    document: 'ordre-du-jour-ag-2025.pdf',
    hasParticipantLimit: true,
    maxParticipants: 50,
    recurrence: 'none',
    publicationDate: '2025-06-22T09:00:00', 
    status: 'Publié', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1' 
  },
  { 
    id: 2, 
    title: 'Cours de yoga collectif', 
    description: '<p>Séance de yoga pour tous niveaux avec <em>Marie</em>, professeure certifiée.<br><br>Apportez votre tapis ! 🧘‍♀️</p>',
    eventDate: '2025-06-05', 
    startTime: '19:00', 
    endTime: '20:00',
    location: 'Jardin commun (si beau temps)',
    hasParticipantLimit: true,
    maxParticipants: 15,
    recurrence: 'weekly',
    recurrenceInterval: 7,
    recurrenceEnd: '2025-09-30',
    publicationDate: '2025-06-20T14:15:00', 
    status: 'Publié', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503' 
  },
  { 
    id: 3, 
    title: 'Atelier cuisine enfants', 
    description: '<p>Les petits chefs en herbe vont préparer des <strong>cookies de Noël</strong> ! 👨‍🍳</p>',
    eventDate: '2025-06-18', 
    startTime: '14:00', 
    endTime: '16:30',
    location: 'Cuisine commune',
    hasParticipantLimit: true,
    maxParticipants: 8,
    recurrence: 'none',
    publicationDate: '2025-06-10T10:00:00', 
    status: 'Programmé', 
    residence_id: '1b5644a8-4fa7-ef11-b8e9-6045bd19a503' 
  },
  { 
    id: 4, 
    title: 'Soirée film en plein air', 
    description: '<p>Projection du film <em>"Le Grand Bleu"</em> dans le jardin.<br>Popcorn et boissons offerts ! 🍿</p>',
    eventDate: '2025-06-08', 
    startTime: '20:00', 
    endTime: '22:30',
    location: 'Jardin commun',
    hasParticipantLimit: true,
    maxParticipants: 30,
    recurrence: 'monthly',
    recurrenceInterval: 30,
    recurrenceEnd: '2025-10-31',
    publicationDate: '2025-06-25T16:45:00', 
    status: 'Brouillon', 
    residence_id: '1d5644a8-4fa7-ef11-b8e9-6045bd19a503' 
  },
  { 
    id: 5, 
    title: 'Vide-grenier des résidents', 
    description: '<p>Grande braderie entre voisins ! Livres, vêtements, objets de décoration...<br><br>Inscription obligatoire pour tenir un stand.</p>',
    eventDate: '2025-06-15', 
    startTime: '09:00', 
    endTime: '17:00',
    location: 'Parking sous-sol',
    document: 'reglement-vide-grenier.pdf',
    hasParticipantLimit: true,
    maxParticipants: 100,
    recurrence: 'none',
    publicationDate: '2025-06-30T08:00:00', 
    status: 'Brouillon', 
    residence_id: '1f5644a8-4fa7-ef11-b8e9-6045bd19a503' 
  },
  { 
    id: 6, 
    title: 'Fête d\'Halloween 2025', 
    description: '<p>Soirée déguisée pour petits et grands ! 🎃<br>Concours du meilleur costume avec prix à la clé.</p>',
    eventDate: '2025-06-31', 
    startTime: '18:00', 
    endTime: '21:00',
    location: 'Hall d\'entrée',
    hasParticipantLimit: true,
    maxParticipants: 40,
    recurrence: 'none',
    publicationDate: '2025-06-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1' 
  },
  { 
    id: 7, 
    title: 'Maintenance collective vélos', 
    description: '<p>Atelier réparation et entretien vélos avec <strong>Pierre</strong>, mécanicien bénévole.</p>',
    eventDate: '2025-06-12', 
    startTime: '10:00', 
    endTime: '12:00',
    location: 'Local vélos',
    document: 'guide-entretien-velo.pdf',
    hasParticipantLimit: true,
    maxParticipants: 6,
    recurrence: 'monthly',
    recurrenceInterval: 30,
    recurrenceEnd: '2025-12-31',
    publicationDate: '2025-06-28T15:30:00', 
    status: 'Publié', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503' 
  }
];

export default function EventsCalendar() {
  const { ensureAuthenticated, authenticatedPost } = useAuth();
  const { currentResidenceId } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState(mockEvents);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

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
      
      const eventId = parseInt(dropInfo.event.id);
      const newDate = dropInfo.event.start.toISOString().split('T')[0];
      
      // Mise à jour SIMPLE et DIRECTE
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, eventDate: newDate }
            : event
        )
      );
      
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
    navigate(`/events/${eventId}?from=calendar`);
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

  // Créer un événement
  const handleAddEvent = async (newEvent) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      
      await authenticatedPost('/api/events', newEvent);
      
      const eventWithId = { 
        ...newEvent, 
        id: Date.now(), 
        residence_id: currentResidenceId,
        status: 'Publié'
      };
      
      setEvents(prev => [...prev, eventWithId]);
      setOpenModal(false);
      setSelectedDate(null);
      
      setNotification({
        open: true,
        message: 'Événement créé avec succès !',
        severity: 'success'
      });
      
    } catch (error) {
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
      const date = new Date(selectedDate);
      const startTime = new Date();
      startTime.setHours(19, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(20, 0, 0, 0);
      
      return {
        eventDate: date,
        startTime: startTime,
        endTime: endTime
      };
    }
    return {};
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Calendrier des événements</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleNewEventClick}>Nouvel événement</button>
          <button onClick={() => navigate('/events')}>Gérer les événements</button>
        </div>
      </div>

      {/* Indicateur du nombre d'événements */}
      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#e3f2fd', borderRadius: 4, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#1976d2' }}>
          📊 <strong>{filteredEvents.length}</strong> événement{filteredEvents.length > 1 ? 's' : ''} affiché{filteredEvents.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* FULLCALENDAR NATIF - SIMPLE ET QUI FONCTIONNE */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        
        // ÉVÉNEMENTS
        events={calendarEvents}
        
        // DRAG & DROP NATIF
        editable={true}
        eventDrop={handleEventDrop}
        
        // INTERACTIONS
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        selectable={true}
        selectMirror={true}
        
        // CONFIGURATION
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        
        height="auto"
        contentHeight={600}
        dayMaxEvents={3}
        moreLinkText="autre(s)"
        
        // STYLING NATIF
        eventDidMount={(info) => {
          const status = info.event.extendedProps.status;
          const isArchived = info.event.extendedProps.isArchived;
          
          // Couleurs par statut
          switch(status) {
            case 'Publié':
              info.el.style.backgroundColor = '#4CAF50';
              info.el.style.borderColor = '#4CAF50';
              break;
            case 'Programmé':
              info.el.style.backgroundColor = '#2196F3';
              info.el.style.borderColor = '#2196F3';
              break;
            case 'Brouillon':
              info.el.style.backgroundColor = '#FF9800';
              info.el.style.borderColor = '#FF9800';
              break;
            case 'Archivé':
              info.el.style.backgroundColor = '#757575';
              info.el.style.borderColor = '#757575';
              info.el.style.opacity = '0.6';
              break;
          }
          
          // Curseur et tooltip
          info.el.style.cursor = isArchived ? 'not-allowed' : 'move';
          info.el.title = isArchived 
            ? `${info.event.title} - Archivé (non déplaçable)`
            : `${info.event.title} - Glissez pour déplacer`;
          
          // Désactiver le drag pour les événements archivés
          if (isArchived) {
            info.event.setProp('editable', false);
          }
        }}
        
        // HOVER NATIF SIMPLE
        eventMouseEnter={(info) => {
          if (!info.event.extendedProps.isArchived) {
            info.el.style.transform = 'scale(1.02)';
            info.el.style.transition = 'transform 0.1s ease';
            info.el.style.zIndex = '1000';
          }
        }}
        
        eventMouseLeave={(info) => {
          info.el.style.transform = 'scale(1)';
          info.el.style.zIndex = 'auto';
        }}
      />

      {/* Modal de création */}
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
          { 
            name: 'title', 
            label: 'Nom de l\'événement', 
            type: 'text', 
            required: true,
            placeholder: 'Ex: Assemblée générale, Fête des voisins...'
          },
          { 
            name: 'description', 
            label: 'Description', 
            type: 'wysiwyg', 
            required: true 
          },
          { 
            name: 'eventDate', 
            label: 'Date de l\'événement', 
            type: 'date', 
            required: true,
            disablePast: true
          },
          { 
            name: 'startTime', 
            label: 'Heure de début', 
            type: 'time', 
            required: true 
          },
          { 
            name: 'endTime', 
            label: 'Heure de fin', 
            type: 'time', 
            required: true 
          },
          {
            name: 'location',
            label: 'Lieu',
            type: 'text',
            required: false,
            placeholder: 'Salle commune, Jardin, Hall d\'entrée...'
          }
        ]}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}