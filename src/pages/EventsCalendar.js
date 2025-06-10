// src/pages/EventsCalendar.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useResidence } from '../context/ResidenceContext';
import HoverPreview from '../components/HoverPreview';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

// Mêmes données exactes que Events.js
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
    hasParticipantLimit: true,
    maxParticipants: 15,
    recurrence: 'weekly',
    recurrenceInterval: 7,
    recurrenceEnd: '2025-09-30',
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
    hasParticipantLimit: true,
    maxParticipants: 8,
    recurrence: 'none',
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
    hasParticipantLimit: true,
    maxParticipants: 30,
    recurrence: 'monthly',
    recurrenceInterval: 30,
    recurrenceEnd: '2025-10-31',
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
    document: 'reglement-vide-grenier.pdf',
    hasParticipantLimit: true,
    maxParticipants: 100,
    recurrence: 'none',
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
    hasParticipantLimit: true,
    maxParticipants: 40,
    recurrence: 'none',
    publicationDate: '2025-06-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '1' 
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
    residence_id: '1' 
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

  // États pour le hover preview
  const [hoverPreview, setHoverPreview] = useState({
    visible: false,
    event: null,
    position: { x: 0, y: 0 }
  });
  const [hoverTimeout, setHoverTimeout] = useState(null);

  console.log('🔄 EventsCalendar rendu - openModal:', openModal, 'selectedDate:', selectedDate);

  const filteredEvents = events.filter(event => event.residence_id === currentResidenceId);

  // Convertir les données Events.js vers le format FullCalendar
  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: `${event.eventDate}T${event.startTime}:00`,
    end: `${event.eventDate}T${event.endTime}:00`,
    extendedProps: {
      description: event.description,
      location: event.location,
      maxParticipants: event.maxParticipants,
      status: event.status,
      originalEvent: event
    }
  }));

  const handleEventClick = (clickInfo) => {
    console.log('🎯 Clic sur événement:', clickInfo.event.title);
    const eventId = clickInfo.event.id;
    navigate(`/events/${eventId}?from=calendar`);
  };

  // Gérer le clic sur une date pour créer un événement
  const handleDateClick = (dateInfo) => {
    try {
      // Vérifier l'authentification avant d'ouvrir le modal
      ensureAuthenticated('créer un nouvel événement');
      
      console.log('📅 CLIC SUR DATE DÉTECTÉ !');
      console.log('📅 dateInfo complet:', dateInfo);
      console.log('📅 dateStr:', dateInfo.dateStr);
      console.log('📅 date:', dateInfo.date);
      
      setSelectedDate(dateInfo.dateStr);
      setOpenModal(true);
      
      console.log('📅 État mis à jour: selectedDate=', dateInfo.dateStr, 'openModal=true');
      
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  // Gérer le drag & drop des événements
  const handleEventDrop = (dropInfo) => {
    try {
      ensureAuthenticated('déplacer un événement');
      
      console.log('🎯 DRAG & DROP détecté !');
      console.log('📅 Événement déplacé:', dropInfo.event.title);
      console.log('📅 Ancienne date:', dropInfo.oldEvent.start);
      console.log('📅 Nouvelle date:', dropInfo.event.start);
      
      const eventId = dropInfo.event.id;
      const newDate = dropInfo.event.start;
      
      // Formatage de la nouvelle date
      const newDateStr = newDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Mise à jour de l'événement dans l'état local
      setEvents(prevEvents => {
        return prevEvents.map(event => {
          if (event.id.toString() === eventId) {
            console.log(`✅ Mise à jour événement ${eventId}: ${event.eventDate} → ${newDateStr}`);
            return {
              ...event,
              eventDate: newDateStr
            };
          }
          return event;
        });
      });
      
      // Afficher une notification de succès
      setNotification({
        open: true,
        message: `Événement "${dropInfo.event.title}" déplacé avec succès !`,
        severity: 'success'
      });
      
      console.log('✅ Événement mis à jour dans l\'état local');
      
      // TODO: Ici vous pourrez plus tard faire l'appel API pour sauvegarder
      // await updateEventDate(eventId, newDateStr);
      
    } catch (error) {
      console.error('❌ Erreur lors du déplacement:', error);
      
      // Annuler le déplacement en cas d'erreur
      dropInfo.revert();
      
      setNotification({
        open: true,
        message: 'Erreur lors du déplacement de l\'événement',
        severity: 'error'
      });
    }
  };

  // Gérer l'affichage du hover preview
  const handleEventMouseEnter = (mouseEnterInfo) => {
    // Annuler le timeout de masquage s'il existe
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    const eventId = mouseEnterInfo.event.id;
    const eventData = events.find(event => event.id.toString() === eventId);
    
    if (eventData) {
      console.log('🎯 HOVER IN:', eventData.title);
      
      setHoverPreview({
        visible: true,
        event: eventData,
        position: {
          x: mouseEnterInfo.jsEvent.clientX,
          y: mouseEnterInfo.jsEvent.clientY
        }
      });

      // Ajouter un listener pour suivre le mouvement de la souris
      const handleMouseMove = (e) => {
        setHoverPreview(prev => ({
          ...prev,
          position: {
            x: e.clientX,
            y: e.clientY
          }
        }));
      };

      // Ajouter le listener
      document.addEventListener('mousemove', handleMouseMove);
      
      // Stocker la fonction de nettoyage
      mouseEnterInfo.el._cleanupMouseMove = () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  };

  // Gérer le masquage du hover preview
  const handleEventMouseLeave = (mouseLeaveInfo) => {
    console.log('🎯 HOVER OUT:', mouseLeaveInfo.event.title);
    
    // Nettoyer le listener de mouvement
    if (mouseLeaveInfo.el._cleanupMouseMove) {
      mouseLeaveInfo.el._cleanupMouseMove();
      delete mouseLeaveInfo.el._cleanupMouseMove;
    }
    
    // Délai avant masquage pour éviter les scintillements
    const timeout = setTimeout(() => {
      setHoverPreview({
        visible: false,
        event: null,
        position: { x: 0, y: 0 }
      });
    }, 300);
    
    setHoverTimeout(timeout);
  };

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleAddEvent = async (newEvent) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      
      console.log('✅ Utilisateur authentifié, création de l\'événement...');
      
      const result = await authenticatedPost('/api/events', newEvent);
      
      console.log('✅ Événement créé avec succès:', result);
      
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
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      
      let errorMessage = 'Erreur lors de la création de l\'événement';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer un événement';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleNewEventClick = () => {
    try {
      // Vérifier l'authentification avant d'ouvrir le modal
      ensureAuthenticated('créer un nouvel événement');
      setOpenModal(true);
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    console.log('❌ Fermeture modal');
    setOpenModal(false);
    setSelectedDate(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleTestClick = () => {
    try {
      ensureAuthenticated('tester la création d\'événement');
      console.log('🧪 Test modal');
      setSelectedDate('2025-12-25');
      setOpenModal(true);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un événement',
        severity: 'error'
      });
    }
  };

  // Valeurs initiales si une date est sélectionnée
  const getInitialValues = () => {
    console.log('🔧 getInitialValues - selectedDate:', selectedDate);
    if (selectedDate) {
      const date = new Date(selectedDate);
      const startTime = new Date();
      startTime.setHours(19, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(20, 0, 0, 0);
      
      const values = {
        eventDate: date,
        startTime: startTime,
        endTime: endTime
      };
      console.log('🔧 Valeurs initiales:', values);
      return values;
    }
    return {};
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Calendrier des événements</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleNewEventClick}>Nouvel événement</button>
          <button onClick={handleTestClick} style={{ backgroundColor: '#ff9800', color: 'white' }}>
            Test Modal
          </button>
          <button onClick={() => navigate('/events')}>Gérer les événements</button>
        </div>
      </div>

      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          💡 <strong>Astuce :</strong> Cliquez sur une date pour créer un événement directement à cette date
        </p>
      </div>

      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>
          🎯 <strong>Nouveau :</strong> Survolez les événements pour voir les détails • Glissez-déposez pour les déplacer ! 
          <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
            (Les événements archivés ne peuvent pas être déplacés)
          </span>
        </p>
      </div>

      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#e3f2fd', borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#1976d2' }}>
          🐛 <strong>Debug :</strong> openModal: {openModal.toString()}, selectedDate: {selectedDate || 'null'}
        </p>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        events={calendarEvents}
        dateClick={handleDateClick}
        selectable={true}
        selectMirror={true}
        editable={true}
        eventDrop={handleEventDrop}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        height="auto"
        contentHeight={900}
        eventClick={handleEventClick}
        dayMaxEvents={3}
        moreLinkText="autre(s)"
        eventDisplay="block"
        eventDidMount={(info) => {
          const status = info.event.extendedProps.status;
          switch(status) {
            case 'Publié':
              info.el.style.backgroundColor = '#4CAF50';
              break;
            case 'Programmé':
              info.el.style.backgroundColor = '#2196F3';
              break;
            case 'Brouillon':
              info.el.style.backgroundColor = '#FF9800';
              break;
            case 'Archivé':
              info.el.style.backgroundColor = '#757575';
              break;
            default:
              break;
          }
          info.el.style.cursor = 'pointer';
          
          // Ajouter un indicateur visuel pour le drag & drop
          if (status !== 'Archivé') {
            info.el.style.cursor = 'move';
            info.el.title = `${info.event.title} - Glissez pour déplacer • Survolez pour plus d'infos`;
          } else {
            info.el.style.opacity = '0.7';
            info.el.title = `${info.event.title} - Archivé (non déplaçable) • Survolez pour plus d'infos`;
          }
        }}
        dayCellDidMount={(info) => {
          info.el.style.cursor = 'pointer';
          info.el.style.transition = 'background-color 0.2s';
          
          info.el.addEventListener('mouseenter', () => {
            info.el.style.backgroundColor = '#e3f2fd';
            console.log('📅 Survol date:', info.date);
          });
          
          info.el.addEventListener('mouseleave', () => {
            info.el.style.backgroundColor = '';
          });
        }}
      />

      {/* Hover Preview */}
      <HoverPreview
        event={hoverPreview.event}
        position={hoverPreview.position}
        visible={hoverPreview.visible}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={handleCloseModal}
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
          },
          {
            name: 'document',
            label: 'Document PDF (optionnel)',
            type: 'file',
            required: false,
            accept: '.pdf',
            helperText: 'Ajoutez un document PDF pour plus d\'informations (règlement, plan, etc.)'
          },
          {
            name: 'hasParticipantLimit',
            label: 'Limiter le nombre de participants',
            type: 'checkbox',
            required: false
          },
          {
            name: 'maxParticipants',
            label: 'Nombre maximum de participants',
            type: 'number',
            required: false,
            placeholder: '20',
            conditionalOn: 'hasParticipantLimit',
            helperText: 'Une fois cette limite atteinte, les inscriptions seront fermées'
          },
          {
            name: 'recurrence',
            label: 'Récurrence de l\'événement',
            type: 'select',
            required: false,
            options: [
              { value: 'none', label: 'Événement unique' },
              { value: 'daily', label: 'Répéter tous les X jours' },
              { value: 'weekly', label: 'Répéter chaque semaine' },
              { value: 'monthly', label: 'Répéter chaque mois' }
            ]
          },
          {
            name: 'recurrenceInterval',
            label: 'Répéter tous les (nombre de jours)',
            type: 'number',
            required: false,
            placeholder: '7',
            conditionalOn: 'recurrence',
            helperText: 'Pour "tous les X jours", indiquez le nombre de jours entre chaque occurrence'
          },
          {
            name: 'recurrenceEnd',
            label: 'Date de fin de récurrence',
            type: 'date',
            required: false,
            conditionalOn: 'recurrence',
            disablePast: true,
            helperText: 'Jusqu\'à quelle date répéter cet événement ?'
          }
        ]}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}