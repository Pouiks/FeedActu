import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockPolls = [
  { id: 1, question: '<p>Question du sondage A</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1', answers: ['Oui', 'Non'] },
  { id: 2, question: '<p>Question du sondage C</p>', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1', answers: ['A', 'B', 'C'] },
];

export default function Polls() {
  const { residenceId } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [polls, setPolls] = useState(mockPolls);
  const navigate = useNavigate();

  const columns = [
    { id: 'question', label: 'Question', sortable: true, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredPolls = polls.filter(poll => poll.residence_id === residenceId);

  const handleAddPoll = (newPoll) => {
    const pollWithId = { ...newPoll, id: Date.now(), residence_id: residenceId };
    setPolls(prev => [...prev, pollWithId]);
  };

  const handleRowClick = (poll, navigate) => {
    navigate(`/polls/${poll.id}`);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Sondages de ma résidence</h2>
        <button onClick={() => setOpenModal(true)}>Nouveau</button>
      </div>

      <DataTable 
        title="Sondages de ma résidence" 
        data={filteredPolls} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddPoll}
        entityName="Sondage"
        fields={[
          { name: 'question', label: 'Question du sondage', type: 'wysiwyg', required: true },
          { name: 'answers', label: 'Réponses possibles', type: 'pollAnswers', required: true },
        ]}
      />
    </>
  );
}
