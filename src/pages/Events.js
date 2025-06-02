import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockEvents = [
  { id: 1, title: 'Événement A', eventDateTime: '2024-06-10T18:00:00', publicationDate: '2024-05-10T10:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Événement B', eventDateTime: '2024-06-15T20:00:00', publicationDate: '2024-05-12T10:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function Events() {
  const { residenceId } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState(mockEvents);

  const columns = [
    { id: 'title', label: 'Nom de l\'événement', sortable: true, searchable: true },
    { id: 'eventDateTime', label: 'Date & Heure de l\'événement', sortable: true, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredEvents = events.filter(event => event.residence_id === residenceId);

  const handleAddEvent = (newEvent) => {
    const eventWithId = { ...newEvent, id: Date.now(), residence_id: residenceId };
    setEvents(prev => [...prev, eventWithId]);
  };

  const handleRowClick = (event, navigate) => {
    navigate(`/events/${event.id}`);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Événements de ma résidence</h2>
        <button onClick={() => setOpenModal(true)}>Nouveau</button>
      </div>

      <DataTable 
        title="Événements de ma résidence" 
        data={filteredEvents} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddEvent}
        entityName="Événement"
        fields={[
          { name: 'title', label: 'Nom de l\'événement', type: 'text', required: true },
          { name: 'eventDateTime', label: 'Date & Heure de l\'événement', type: 'datetime', required: true },
          { name: 'description', label: 'Description de l\'événement', type: 'wysiwyg', required: true },
        ]}
      />
    </>
  );
}
