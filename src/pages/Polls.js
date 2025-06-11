import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResidence } from '../context/ResidenceContext';

const mockPolls = [
  { 
    id: 1, 
    question: '<p>Préférez-vous organiser la <strong>fête des voisins</strong> en mai ou en juin ?</p>', 
    imageUrl: 'https://via.placeholder.com/400x200/4CAF50/white?text=Fête+des+Voisins',
    answers: ['En mai (plus frais)', 'En juin (plus d\'activités possibles)', 'Les deux mois me conviennent', 'Je ne participe pas'],
    allowMultipleAnswers: false,
    hasDeadline: true,
    deadlineDate: '2025-03-15T23:59:00',
    publicationDate: '2024-11-15T10:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    question: '<p>Souhaitez-vous l\'installation de <em>bornes de recharge</em> pour véhicules électriques dans le parking ?</p>', 
    answers: ['Oui, absolument', 'Oui, mais seulement si peu coûteux', 'Non, pas prioritaire', 'Je n\'ai pas d\'avis'],
    allowMultipleAnswers: false,
    hasDeadline: false,
    publicationDate: '2024-11-20T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    question: '<p><strong>Quelle activité souhaiteriez-vous voir organisée ?</strong><br>Nous préparons le programme des activités 2025 ! 🎯</p>', 
    imageUrl: 'https://via.placeholder.com/400x200/2196F3/white?text=Activités+2025',
    answers: ['Cours de sport collectif', 'Ateliers bricolage/jardinage', 'Soirées culturelles', 'Activités enfants', 'Repas partagés'],
    allowMultipleAnswers: true,
    hasDeadline: true,
    deadlineDate: '2025-01-31T23:59:00',
    publicationDate: '2024-12-01T09:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    question: '<p>Êtes-vous satisfait de la <em>gestion des espaces verts</em> ?</p>', 
    answers: ['Très satisfait', 'Plutôt satisfait', 'Plutôt mécontent', 'Très mécontent'],
    allowMultipleAnswers: false,
    hasDeadline: false,
    publicationDate: '2024-11-15T16:45:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    question: '<p>Accepteriez-vous une <strong>légère augmentation</strong> des charges pour améliorer la sécurité (vidéophone, éclairage) ?</p>', 
    answers: ['Oui, tout à fait', 'Oui, selon le montant', 'Non, les charges sont déjà trop élevées'],
    allowMultipleAnswers: false,
    hasDeadline: true,
    deadlineDate: '2024-12-31T23:59:00',
    publicationDate: '2024-10-20T11:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    question: '<p>Quel est votre <em>mode de transport principal</em> pour aller au travail ?</p>', 
    imageUrl: 'https://via.placeholder.com/400x200/9C27B0/white?text=Transport',
    answers: ['Voiture', 'Transports en commun', 'Vélo', 'À pied', 'Télétravail', 'Autre'],
    allowMultipleAnswers: false,
    hasDeadline: false,
    publicationDate: '2024-11-25T08:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  }
];

export default function Polls() {
  const { ensureAuthenticated, authenticatedPost } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [polls, setPolls] = useState(mockPolls);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'question', label: 'Question', sortable: true, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredPolls = polls.filter(poll => poll.residence_id === currentResidenceId);

  const handleAddPoll = async (newPoll) => {
    try {
      ensureAuthenticated('créer un nouveau sondage');
      
      console.log('✅ Utilisateur authentifié, création du sondage...');
      
      const result = await authenticatedPost('/api/polls', newPoll);
      
      console.log('✅ Sondage créé avec succès:', result);
      
      const pollWithId = { 
        ...newPoll, 
        id: Date.now(), 
        residence_id: currentResidenceId 
      };
      setPolls(prev => [...prev, pollWithId]);
      
      setOpenModal(false);
      setNotification({
        open: true,
        message: 'Sondage créé avec succès !',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du sondage:', error);
      
      let errorMessage = 'Erreur lors de la création du sondage';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer un sondage';
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

  const handleNewPollClick = () => {
    try {
      ensureAuthenticated('créer un nouveau sondage');
      setOpenModal(true);
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un sondage',
        severity: 'error'
      });
    }
  };

  const handleRowClick = (poll, navigate) => {
    navigate(`/polls/${poll.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <PageHeader
        title="Sondages de ma résidence"
        subtitle={`Gérez les sondages de ${currentResidenceName || 'votre résidence'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Sondages', href: '/polls' }
        ]}
        actions={[
          {
            label: 'Nouveau Sondage',
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewPollClick
            }
          }
        ]}
        stats={[
          { label: 'Sondages actifs', value: filteredPolls.filter(p => p.status === 'Publié').length.toString() },
          { label: 'Total sondages', value: filteredPolls.length.toString() }
        ]}
      />

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
          { name: 'question', label: 'Question du sondage', type: 'richtext', required: true },
          { name: 'answers', label: 'Réponses possibles', type: 'array', required: true },
          { name: 'allowMultipleAnswers', label: 'Autoriser plusieurs réponses', type: 'checkbox' },
          { name: 'hasDeadline', label: 'Définir une date limite', type: 'checkbox' },
          { name: 'deadlineDate', label: 'Date limite', type: 'datetime', conditional: 'hasDeadline' },
          { name: 'imageUrl', label: 'Image (optionnelle)', type: 'url' }
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
