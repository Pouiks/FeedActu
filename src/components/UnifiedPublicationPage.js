/**
 * 📄 COMPOSANT UNIFIÉ POUR TOUTES LES PUBLICATIONS
 * 
 * Ce composant remplace TOUS les fichiers individuels (Posts.js, Events.js, etc.)
 * Il s'adapte automatiquement selon le type de publication.
 * 
 * ✅ Avantages :
 * - Un seul fichier à maintenir
 * - Logique identique pour tous les types
 * - Pas de duplication de code
 * - Extensibilité automatique
 */

import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import DataTable from './DataTable';
import ModalPublicationForm from './ModalPublicationForm';
import PageHeader from './PageHeader';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';
import { usePublicationManager } from '../core/PublicationManager';
import { getStandardColumns } from '../utils/publicationNormalizer';

/**
 * 🎯 COMPOSANT PRINCIPAL UNIFIÉ
 */
export default function UnifiedPublicationPage({ type }) {
  const navigate = useNavigate();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const { getNormalizedPublications, publishDraft, deletePublication } = usePublications();
  const { manager, handleSubmission, getTemplate, getFields, getEntityName } = usePublicationManager();

  // États locaux
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Configuration dynamique selon le type
  const template = getTemplate(type);
  const entityName = getEntityName(type);
  const fields = getFields(type);

  // Données normalisées
  const publications = getNormalizedPublications(type, currentResidenceId);
  const columns = getStandardColumns(type);

  if (!template) {
    return (
      <Alert severity="error">
        Type de publication non supporté: {type}
      </Alert>
    );
  }

  /**
   * 🔄 GESTION UNIFIÉE DES ACTIONS
   */
  const handleNewClick = () => {
    setEditingItem(null);
    setOpenModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const handleRowClick = (item) => {
    // Navigation vers la page de détail si elle existe
    const detailRoutes = {
      posts: `/posts/${item.id}`,
      events: `/events/${item.id}`,
      polls: `/polls/${item.id}`
    };

    if (detailRoutes[type]) {
      navigate(detailRoutes[type]);
    } else {
      // Sinon, ouvrir en édition
      handleEditItem(item);
    }
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Supprimer "${item.title || 'cette publication'}" ?`)) {
      try {
        await deletePublication(type, item.id);
        setNotification({
          open: true,
          message: `${entityName} supprimé avec succès !`,
          severity: 'success'
        });
      } catch (error) {
        console.error(`Erreur lors de la suppression:`, error);
        setNotification({
          open: true,
          message: `Erreur lors de la suppression`,
          severity: 'error'
        });
      }
    }
  };

  const handlePublishDraft = async (item) => {
    try {
      await publishDraft(type, item.id);
      setNotification({
        open: true,
        message: `${entityName} publié avec succès !`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Erreur lors de la publication:`, error);
      setNotification({
        open: true,
        message: `Erreur lors de la publication`,
        severity: 'error'
      });
    }
  };

  /**
   * 🚀 SOUMISSION UNIFIÉE
   */
  const handleSubmit = async (formData, additionalContext = {}) => {
    try {
      const context = {
        isEditing: !!editingItem,
        editingId: editingItem?.id,
        residenceIds: formData.residenceIds || formData.targetResidences || [],
        status: formData.status || 'Publié',
        publishLater: formData.publishLater || false,
        publishDateTime: formData.publishDateTime,
        pollAnswers: additionalContext.pollAnswers,
        user: manager.auth?.user
      };

      const result = await handleSubmission(type, formData, context);
      
      setNotification({
        open: true,
        message: result.message,
        severity: 'success'
      });

      setOpenModal(false);
      setEditingItem(null);

    } catch (error) {
      console.error(`Erreur lors de la soumission:`, error);
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  /**
   * 📊 STATISTIQUES DYNAMIQUES
   */
  const getStats = () => {
    const publishedCount = publications.filter(p => p.status === 'Publié').length;
    const draftCount = publications.filter(p => p.status === 'Brouillon').length;
    const scheduledCount = publications.filter(p => p.status === 'Programmé').length;

    const baseStats = [
      { label: `${entityName}s actifs`, value: publishedCount.toString() },
      { label: `Brouillons`, value: draftCount.toString() }
    ];

    // Ajouter des stats spécifiques selon le type
    switch (type) {
      case 'alerts':
        const criticalCount = publications.filter(p => p.priority === 'critical').length;
        return [
          ...baseStats,
          { label: `${entityName}s critiques`, value: criticalCount.toString() }
        ];
      case 'events':
        const upcomingCount = publications.filter(p => {
          const eventDate = new Date(p.displayDate);
          return eventDate > new Date();
        }).length;
        return [
          ...baseStats,
          { label: 'Événements à venir', value: upcomingCount.toString() }
        ];
      default:
        if (scheduledCount > 0) {
          return [
            ...baseStats,
            { label: `${entityName}s programmés`, value: scheduledCount.toString() }
          ];
        }
        return baseStats;
    }
  };

  /**
   * 🎨 RENDU UNIFIÉ
   */
  return (
    <>
      <PageHeader
        title={`${entityName}s de ma résidence`}
        subtitle={`Gérez les ${entityName.toLowerCase()}s de ${currentResidenceName || 'votre résidence'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: `${entityName}s`, href: `/${type}` }
        ]}
        actions={[
          {
            label: `Nouveau ${entityName}`,
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewClick
            }
          }
        ]}
        stats={getStats()}
      />

      <DataTable 
        title={`${entityName}s de ma résidence`}
        data={publications}
        columns={columns}
        onRowClick={handleRowClick}
        showActions={true}
        onPublishDraft={handlePublishDraft}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={handleCloseModal}
        onSubmit={handleSubmit}
        entityName={entityName}
        fields={fields}
        initialValues={editingItem || {}}
        isEditing={!!editingItem}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
