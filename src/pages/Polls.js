import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockPolls = [
  { 
    id: 1, 
    question: '<p><strong>Quel horaire préférez-vous pour l\'assemblée générale ?</strong><br>Votre avis compte pour fixer la date qui convient au plus grand nombre.</p>', 
    answers: ['18h00 - 20h00', '19h00 - 21h00', '20h00 - 22h00', 'Weekend (samedi matin)'],
    publicationDate: '2024-11-18T10:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    question: '<p>Souhaitez-vous l\'installation de <em>bornes de recharge</em> pour véhicules électriques dans le parking ?</p>', 
    answers: ['Oui, absolument', 'Oui, mais seulement si peu coûteux', 'Non, pas prioritaire', 'Je n\'ai pas d\'avis'],
    publicationDate: '2024-11-20T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    question: '<p><strong>Quelle activité souhaiteriez-vous voir organisée ?</strong><br>Nous préparons le programme des activités 2025 ! 🎯</p>', 
    answers: ['Cours de sport collectif', 'Ateliers bricolage/jardinage', 'Soirées culturelles', 'Activités enfants', 'Repas partagés'],
    publicationDate: '2024-12-01T09:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    question: '<p>Êtes-vous satisfait de la <em>gestion des espaces verts</em> ?</p>', 
    answers: ['Très satisfait', 'Plutôt satisfait', 'Plutôt mécontent', 'Très mécontent'],
    publicationDate: '2024-11-15T16:45:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    question: '<p>Accepteriez-vous une <strong>légère augmentation</strong> des charges pour améliorer la sécurité (vidéophone, éclairage) ?</p>', 
    answers: ['Oui, tout à fait', 'Oui, selon le montant', 'Non, les charges sont déjà trop élevées'],
    publicationDate: '2024-10-20T11:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    question: '<p>Quel est votre <em>mode de transport principal</em> pour aller au travail ?</p>', 
    answers: ['Voiture', 'Transports en commun', 'Vélo', 'À pied', 'Télétravail', 'Autre'],
    publicationDate: '2024-11-25T08:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  }
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
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Nouveau Sondage
        </Button>
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
          { 
            name: 'question', 
            label: 'Question du sondage', 
            type: 'wysiwyg', 
            required: true 
          },
          { 
            name: 'answers', 
            label: 'Réponses possibles', 
            type: 'pollAnswers', 
            required: true 
          },
        ]}
      />
    </>
  );
}
