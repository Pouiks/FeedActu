// src/pages/EventsCalendar.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ModalPublicationForm from '../components/ModalPublicationForm';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';

const mockEvents = [
  {
    id: 1,
    title: 'MATCH DE BASKET – FORME TON EQUIPE',
    start: '2025-06-26T19:30:00',
    end: '2025-06-26T21:00:00',
    residence_id: '1',
    status: 'Publié',
    description: 'Un match de basket organisé par la résidence.',
  },
  {
    id: 2,
    title: 'Happy Hour at the Sports Bar!',
    start: '2025-06-27T18:00:00',
    end: '2025-06-27T20:00:00',
    residence_id: '1',
    status: 'Publié',
    description: 'Venez nombreux au Happy Hour 🍻',
  },
  // Ajoute d’autres événements si besoin
];

export default function EventsCalendar() {
  const { residenceId } = useAuth();
  const [events, setEvents] = useState(mockEvents);
  const [openModal, setOpenModal] = useState(false);

  const handleAddEvent = (newEvent) => {
    const newFullEvent = {
      id: Date.now(),
      title: newEvent.title,
      start: newEvent.eventDate + 'T' + newEvent.startTime,
      end: newEvent.eventDate + 'T' + newEvent.endTime,
      description: newEvent.description,
      status: newEvent.status,
      residence_id: residenceId,
    };
    setEvents((prev) => [...prev, newFullEvent]);
  };

  const filteredEvents = events.filter(event => event.residence_id === residenceId);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Évènements</h2>
        <button onClick={() => setOpenModal(true)}>Nouvel événement</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        events={filteredEvents}
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
        height="auto"  // ✅ La hauteur s'adapte, plus de scroll inutile
        contentHeight={900} // ✅ si tu veux forcer par exemple 700px visibles
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddEvent}
        entityName="Événement"
        fields={[
          { name: 'title', label: "Nom de l'événement", type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'wysiwyg', required: false },
          { name: 'eventDate', label: "Date de l'événement", type: 'date', required: true },
          { name: 'startTime', label: "Heure de début", type: 'time', required: true },
          { name: 'endTime', label: "Heure de fin", type: 'time', required: true },
        ]}
      />
    </div>
  );
}
