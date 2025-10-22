import React, { useState, useCallback } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';
import { getStandardColumns } from '../utils/publicationNormalizer';

const mockAlerts = [
  { 
    id: 1, 
    message: '<p><strong>🔧 Maintenance programmée</strong><br>Coupure électricité cage d\'escalier A demain de 8h à 10h. Éclairage de secours opérationnel.</p>', 
    type: 'maintenance', 
    priority: 'normal', 
    publicationDate: '2024-11-21T16:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    message: '<p><strong style="color: red;">🚨 ALERTE SÉCURITÉ</strong><br>Porte d\'entrée principale défaillante. Utilisez l\'entrée latérale. Réparation en cours.</p>', 
    type: 'security', 
    priority: 'critical', 
    publicationDate: '2024-11-22T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    message: '<p>⛈️ <strong>Alerte météo</strong><br>Vents violents prévus cette nuit (90 km/h). Sécurisez vos balcons et terrasses.</p>', 
    type: 'weather', 
    priority: 'high', 
    publicationDate: '2024-11-22T18:45:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    message: '<p>💧 <strong>Coupure d\'eau programmée</strong><br>Intervention sur le réseau principal vendredi 29/11 de 9h à 16h. Pensez à faire des réserves.</p>', 
    type: 'water', 
    priority: 'high', 
    publicationDate: '2024-11-25T10:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    message: '<p>📡 <strong>Perturbation réseau</strong><br>Problèmes d\'accès Internet signalés. Fournisseur prévenu, résolution en cours.</p>', 
    type: 'other', 
    priority: 'low', 
    publicationDate: '2024-11-20T11:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    message: '<p>🔐 <strong>Mise à jour vidéophone</strong><br>Test des nouveaux codes d\'accès ce weekend. En cas de problème, contactez le gardien.</p>', 
    type: 'security', 
    priority: 'normal', 
    publicationDate: '2024-11-19T09:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 7, 
    message: '<p>❄️ <strong>Alerte grand froid</strong><br>Températures négatives attendues. Pensez à protéger vos canalisations et à purger vos robinets extérieurs.</p>', 
    type: 'weather', 
    priority: 'normal', 
    publicationDate: '2024-12-01T07:00:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 8, 
    message: '<p>⚡ <strong>URGENT - Panne électrique</strong><br>Coupure généralisée bâtiment B. EDF intervient. Retour estimé dans 2h.</p>', 
    type: 'water', 
    priority: 'critical', 
    publicationDate: '2024-11-18T13:45:00', 
    status: 'Archivé', 
    residence_id: '1' 
  }
];

export default function Alerts() {
  const { ensureAuthenticated, authorizedResidences } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const { getNormalizedPublications, addPublication, publishDraft, updatePublication, deletePublication } = usePublications();
  const [openModal, setOpenModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });


  // Colonnes standardisées pour les alertes
  const columns = getStandardColumns('alerts');

  // Récupération des alertes normalisées
  const alerts = getNormalizedPublications('alerts', currentResidenceId);

  const handleAddAlert = async (newAlert) => {
    try {
      ensureAuthenticated('créer une nouvelle alerte');
      
      // Validation de sécurité des résidences (même logique que les autres types)
      const residenceIds = newAlert.residenceIds || newAlert.targetResidences || [];
      if (!residenceIds || residenceIds.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = residenceIds.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      await addPublication('alerts', newAlert);
      
      setOpenModal(false);
      const residenceCount = residenceIds.length;
      setNotification({
        open: true,
        message: `Alerte créée avec succès et publiée dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'alerte:', error);
      
      let errorMessage = 'Erreur lors de la création de l\'alerte';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer une alerte';
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

  const handleNewAlertClick = () => {
    try {
      ensureAuthenticated('créer une nouvelle alerte');
      setOpenModal(true);
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer une alerte',
        severity: 'error'
      });
    }
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setOpenModal(true);
  };

  const handleRowClick = (alert) => {
    handleEditAlert(alert);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <PageHeader
        title="Alertes de ma résidence"
        subtitle={`Gérez les alertes de ${currentResidenceName || 'votre résidence'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Alertes', href: '/alerts' }
        ]}
        actions={[
          {
            label: 'Nouvelle Alerte',
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewAlertClick
            }
          }
        ]}
        stats={[
          { label: 'Alertes actives', value: alerts.filter(a => a.status === 'Publié').length.toString() },
          { label: 'Alertes critiques', value: alerts.filter(a => a.priority === 'critical').length.toString() }
        ]}
      />

      <DataTable 
        title="Alertes de ma résidence" 
        data={alerts} 
        columns={columns} 
        onRowClick={handleRowClick}
        showActions={true}
        onPublishDraft={(alert) => publishDraft('alerts', alert.id)}
        onEditItem={handleEditAlert}
        onDeleteItem={(alert) => { if(window.confirm(`Supprimer cette alerte ?`)) deletePublication('alerts', alert.id); }}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => { setOpenModal(false); setEditingAlert(null); }}
        onSubmit={editingAlert ? 
          (data) => {
            updatePublication('alerts', editingAlert.id, data);
            setOpenModal(false);
            setEditingAlert(null);
            setNotification({ open: true, message: 'Alerte mise à jour avec succès !', severity: 'success' });
          } : 
          handleAddAlert
        }
        entityName="Alerte"
        fields={[
          { name: 'title', label: 'Titre de l\'alerte', type: 'text', required: true },
          { name: 'message', label: 'Message de l\'alerte', type: 'wysiwyg', required: true },
          {
            name: 'type',
            label: 'Type d\'alerte',
            type: 'select',
            required: true,
            options: [
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'security', label: 'Sécurité' },
              { value: 'weather', label: 'Météo' },
              { value: 'water', label: 'Eau/Gaz/Électricité' },
              { value: 'other', label: 'Autre' }
            ]
          },
          {
            name: 'priority',
            label: 'Priorité',
            type: 'select',
            required: true,
            options: [
              { value: 'low', label: 'Faible' },
              { value: 'normal', label: 'Normale' },
              { value: 'high', label: 'Élevée' },
              { value: 'critical', label: 'Critique' }
            ]
          },
          { 
            name: 'publicationDate', 
            label: 'Date de publication', 
            type: 'datetime', 
            required: true,
            helperText: 'Date et heure de publication de l\'alerte'
          }
        ]}
        initialValues={editingAlert || {}}
        isEditing={!!editingAlert}
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
