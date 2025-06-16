import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResidence } from '../context/ResidenceContext';

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
  const { ensureAuthenticated, authenticatedPost } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'priority', label: 'Priorité', sortable: true, searchable: false },
    { id: 'category', label: 'Catégorie', sortable: true, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredAlerts = alerts.filter(alert => alert.residence_id === currentResidenceId);

  const handleAddAlert = async (newAlert) => {
    try {
      ensureAuthenticated('créer une nouvelle alerte');
      
      console.log('✅ Utilisateur authentifié, création de l\'alerte...');
      
      const result = await authenticatedPost('/api/alerts', newAlert);
      
      console.log('✅ Alerte créée avec succès:', result);
      
      const alertWithId = { 
        ...newAlert, 
        id: Date.now(), 
        residence_id: currentResidenceId
      };
      setAlerts(prev => [...prev, alertWithId]);
      
      setOpenModal(false);
      setNotification({
        open: true,
        message: 'Alerte créée avec succès !',
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

  const handleRowClick = (alert, navigate) => {
    navigate(`/alerts/${alert.id}`);
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
          { label: 'Alertes actives', value: filteredAlerts.filter(a => a.status === 'Publié').length.toString() },
          { label: 'Alertes critiques', value: filteredAlerts.filter(a => a.priority === 'critical').length.toString() }
        ]}
      />

      <DataTable 
        title="Alertes de ma résidence" 
        data={filteredAlerts} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddAlert}
        entityName="Alerte"
        fields={[
          { name: 'alertType', label: 'Type d\'alerte', type: 'select', required: true, options: [
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'security', label: 'Sécurité' },
            { value: 'emergency', label: 'Urgence' },
            { value: 'service', label: 'Service' },
            { value: 'weather', label: 'Météo' },
            { value: 'other', label: 'Autre' }
          ]},
          { name: 'message', label: 'Message d\'alerte', type: 'wysiwyg', required: true }
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
