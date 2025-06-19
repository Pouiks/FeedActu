import React, { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';

export default function Polls() {
  const { ensureAuthenticated, authorizedResidences } = useAuth();
  const { currentResidenceName } = useResidence();
  const { getPublications, addPublication, publishDraft, updatePublication, deletePublication } = usePublications();
  const [openModal, setOpenModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null); // NOUVEAU : Pour l'édition
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const columns = [
    { id: 'question', label: 'Question', sortable: true, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  // Récupération des sondages via le contexte (filtrage automatique par résidence)
  const polls = getPublications('polls');

  const handleAddPoll = async (newPoll) => {
    try {
      ensureAuthenticated('créer un nouveau sondage');
      
      // Validation de sécurité des résidences
      if (!newPoll.targetResidences || newPoll.targetResidences.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = newPoll.targetResidences.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      // Utiliser le contexte pour la création - Expérience utilisateur immédiate
      await addPublication('polls', newPoll);
      
      setOpenModal(false);
      const residenceCount = newPoll.targetResidences.length;
      setNotification({
        open: true,
        message: `Sondage créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
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

  const handleEditPoll = (poll) => {
    setEditingPoll(poll);
    setOpenModal(true);
  };

  const handleRowClick = (poll) => {
    handleEditPoll(poll);
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
          { label: 'Sondages actifs', value: polls.filter(p => p.status === 'Publié').length.toString() },
          { label: 'Total sondages', value: polls.length.toString() }
        ]}
      />

      <DataTable 
        title="Sondages de ma résidence" 
        data={polls} 
        columns={columns} 
        onRowClick={handleRowClick}
        showActions={true}
        onPublishDraft={(poll) => publishDraft('polls', poll.id)}
        onEditItem={handleEditPoll}
        onDeleteItem={(poll) => { if(window.confirm(`Supprimer "${poll.question}" ?`)) deletePublication('polls', poll.id); }}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => { setOpenModal(false); setEditingPoll(null); }}
        onSubmit={editingPoll ? 
          (data) => updatePublication('polls', editingPoll.id, data) : 
          handleAddPoll
        }
        entityName="Sondage"
        fields={[
          { name: 'question', label: 'Question du sondage', type: 'wysiwyg', required: true },
          { name: 'pollAnswers', label: 'Réponses possibles', type: 'pollAnswers', required: true },
          { name: 'allowMultipleAnswers', label: 'Autoriser plusieurs réponses', type: 'checkbox' },
          { name: 'hasDeadline', label: 'Définir une date limite', type: 'checkbox' },
          { name: 'deadlineDate', label: 'Date limite de vote', type: 'datetime', showIf: 'hasDeadline' },
          { 
            name: 'imageUrl', 
            label: "Image du sondage", 
            type: 'image', 
            required: false,
            helperText: 'Chargez un fichier ou collez une URL d\'image'
          },
          { 
            name: 'publicationDate', 
            label: 'Date de publication', 
            type: 'datetime', 
            required: true,
            helperText: 'Date et heure de publication du sondage'
          }
        ]}
        initialValues={editingPoll || {}}
        isEditing={!!editingPoll}
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
