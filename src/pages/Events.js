import React, { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';
import { getStandardColumns } from '../utils/publicationNormalizer';

export default function Events() {
  const { ensureAuthenticated, authorizedResidences } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const { getNormalizedPublications, addPublication, publishDraft, updatePublication, deletePublication } = usePublications();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // NOUVEAU : Pour l'édition
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Colonnes standardisées pour les événements
  const columns = getStandardColumns('events');

  // Récupération des événements normalisés
  const events = getNormalizedPublications('events', currentResidenceId);

  // NOUVEAU : Publier un brouillon
  const handlePublishDraft = async (event) => {
    try {
      ensureAuthenticated('publier un brouillon');
      
      await publishDraft('events', event.id);
      
      setNotification({
        open: true,
        message: `Brouillon "${event.title}" publié avec succès !`,
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la publication du brouillon:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la publication du brouillon',
        severity: 'error'
      });
    }
  };

  // NOUVEAU : Modifier un événement (réutilise le modal existant)
  const handleEditEvent = async (event) => {
    try {
      ensureAuthenticated('modifier un événement');
      setEditingEvent(event);
      setOpenModal(true);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour modifier un événement',
        severity: 'error'
      });
    }
  };

  // NOUVEAU : Supprimer un événement
  const handleDeleteEvent = async (event) => {
    try {
      ensureAuthenticated('supprimer un événement');
      
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${event.title}" ?`)) {
        await deletePublication('events', event.id);
        
        setNotification({
          open: true,
          message: `Événement "${event.title}" supprimé avec succès !`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la suppression',
        severity: 'error'
      });
    }
  };

  // Gérer la soumission du formulaire (création OU mise à jour)
  const handleSubmitEvent = async (eventData) => {
    try {
      ensureAuthenticated(editingEvent ? 'modifier un événement' : 'créer un nouvel événement');
      
      const residenceIds = eventData.residenceIds || eventData.targetResidences || [];
      if (!residenceIds || residenceIds.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = residenceIds.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      if (editingEvent) {
        // Mise à jour d'un événement existant
        await updatePublication('events', editingEvent.id, eventData);
        setNotification({
          open: true,
          message: `Événement "${eventData.title}" mis à jour avec succès !`,
          severity: 'success'
        });
      } else {
        // Création d'un nouvel événement (logique existante)
        await addPublication('events', eventData);
        const residenceCount = residenceIds.length;
        setNotification({
          open: true,
          message: `Événement créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
          severity: 'success'
        });
      }
      
      setOpenModal(false);
      setEditingEvent(null);
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      let errorMessage = editingEvent ? 'Erreur lors de la mise à jour de l\'événement' : 'Erreur lors de la création de l\'événement';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour effectuer cette action';
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
      ensureAuthenticated('créer un nouvel événement');
      
      if (!authorizedResidences || authorizedResidences.length === 0) {
        setNotification({
          open: true,
          message: 'Aucune résidence autorisée trouvée pour la création d\'événements',
          severity: 'warning'
        });
        return;
      }
      
      setEditingEvent(null); // S'assurer qu'on est en mode création
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
    setOpenModal(false);
    setEditingEvent(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleRowClick = (event) => {
    // Naviguer vers la page de détail au lieu d'ouvrir le modal d'édition
    navigate(`/events/${event.id}`);
  };

  return (
    <>
      <PageHeader
        title="Événements de ma résidence"
        subtitle={`Gérez les événements de ${currentResidenceName || 'votre résidence'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Événements', href: '/events' }
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
          { label: 'Événements actifs', value: events.filter(e => e.status === 'Publié').length.toString() },
          { label: 'Total événements', value: events.length.toString() }
        ]}
      />

      <DataTable 
        title="Événements de ma résidence" 
        data={events} 
        columns={columns} 
        onRowClick={handleRowClick}
        showActions={true}
        onPublishDraft={handlePublishDraft}
        onEditItem={handleEditEvent}
        onDeleteItem={handleDeleteEvent}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
        entityName="Événement"
        fields={[
          { name: 'title', label: 'Titre de l\'événement', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'wysiwyg', required: true },
          { 
            name: 'eventDateRange', 
            label: 'Date et heure de l\'événement', 
            type: 'daterange', 
            required: true,
            disablePast: true,
            helperText: 'Sélectionnez les dates et heures de début et de fin'
          },
          { name: 'location', label: 'Lieu', type: 'text', required: true },
          { name: 'maxParticipants', label: 'Nombre max de participants', type: 'number' },
          { 
            name: 'pinned', 
            label: 'Épingler cet événement', 
            type: 'checkbox',
            required: false,
            helperText: 'L\'événement apparaîtra en haut de la liste dans l\'app mobile'
          },
          { 
            name: 'imageUrl', 
            label: "Image de l'événement", 
            type: 'image', 
            required: false,
            placeholder: 'https://exemple.com/image.jpg',
            helperText: 'Chargez un fichier ou collez une URL d\'image'
          },
          { 
            name: 'publicationDate', 
            label: 'Date de publication', 
            type: 'datetime', 
            required: true,
            helperText: 'Date et heure de publication de l\'événement'
          }
        ]}
        initialValues={editingEvent || {}}
        isEditing={!!editingEvent}
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
