import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockDailyMessages = [
  { id: 1, message: '<p>Message du jour A</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Message du jour B</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function DailyMessage() {
  const { residenceId } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [messages, setMessages] = useState(mockDailyMessages);
  const navigate = useNavigate();

  const columns = [
    { id: 'message', label: 'Message', sortable: false, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredMessages = messages.filter(msg => msg.residence_id === residenceId);

  const handleAddMessage = (newMessage) => {
    const messageWithId = { ...newMessage, id: Date.now(), residence_id: residenceId };
    setMessages(prev => [...prev, messageWithId]);
  };

  const handleRowClick = (message, navigate) => {
    navigate(`/daily-messages/${message.id}`);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Messages du jour de ma résidence</h2>
        <button onClick={() => setOpenModal(true)}>Nouveau</button>
      </div>

      <DataTable 
        title="Messages du jour" 
        data={filteredMessages} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddMessage}
        entityName="Message du jour"
        fields={[
          { name: 'message', label: 'Message', type: 'wysiwyg', required: true },
        ]}
      />
    </>
  );
}
