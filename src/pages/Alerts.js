import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const { residenceId, ensureAuthenticated, authenticatedPost } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'message', label: 'Alerte', sortable: false, searchable: true },
    { id: 'type', label: 'Type', sortable: true, searchable: false },
    { id: 'priority', label: 'Priorité', sortable: true, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredAlerts = alerts.filter(alert => alert.residence_id === residenceId);

  const handleAddAlert = async (newAlert) => {
    try {
      // Vérifier l'authentification avant de procéder
      ensureAuthenticated('créer une nouvelle alerte');
      
      console.log('✅ Utilisateur authentifié, création de l\'alerte...');
      
      // Utiliser le middleware pour une action authentifiée
      const result = await authenticatedPost('/api/alerts', newAlert);
      
      console.log('✅ Alerte créée avec succès:', result);
      
      // Ajouter l'alerte à l'état local (simulation)
      const alertWithId = { 
        ...newAlert, 
        id: Date.now(), 
        residence_id: residenceId 
      };
      setAlerts(prev => [...prev, alertWithId]);
      
      // Fermer le modal et afficher une notification
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
      // Vérifier l'authentification avant d'ouvrir le modal
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Alertes de ma résidence</h2>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={handleNewAlertClick}
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
          Nouvelle Alerte
        </Button>
      </div>

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
          { 
            name: 'message', 
            label: 'Message de l\'alerte', 
            type: 'wysiwyg', 
            required: true 
          },
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
          }
        ]}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
