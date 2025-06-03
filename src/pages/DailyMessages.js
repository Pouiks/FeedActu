import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockDailyMessages = [
  { 
    id: 1, 
    message: '<p>🌟 <strong>Bonne journée à tous !</strong><br>N\'oubliez pas : le tri sélectif, c\'est tous les jours. Merci pour vos efforts ! ♻️</p>', 
    priority: 'normal', 
    publicationDate: '2024-11-22T07:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    message: '<p><strong style="color: red;">ATTENTION :</strong> Travaux de maintenance de l\'ascenseur aujourd\'hui de 9h à 12h.<br>Merci d\'utiliser les escaliers. 🔧</p>', 
    priority: 'high', 
    publicationDate: '2024-11-22T08:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    message: '<p>📅 <em>Rappel :</em> Assemblée générale <strong>demain 20 décembre à 18h30</strong>.<br>Votre présence ou votre pouvoir est indispensable !</p>', 
    priority: 'urgent', 
    publicationDate: '2024-12-19T08:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    message: '<p>🎉 Félicitations à <strong>Marie et Pierre</strong> pour leur initiative du jardin partagé !<br>Les premières récoltes arrivent bientôt.</p>', 
    priority: 'low', 
    publicationDate: '2024-11-21T10:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    message: '<p>☀️ Prévisions météo : <em>journée ensoleillée</em> ! Parfait pour aérer les appartements.<br>Température max : 18°C.</p>', 
    priority: 'low', 
    publicationDate: '2024-11-20T07:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    message: '<p><strong>🚨 URGENT - Fuite d\'eau détectée</strong><br>Parking niveau -1. Évitez la zone. Plombier en route.</p>', 
    priority: 'urgent', 
    publicationDate: '2024-11-19T14:20:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 7, 
    message: '<p>📦 <em>Colis en attente</em> dans le local gardien pour :<br>• Appartement 2A (M. Durand)<br>• Appartement 5C (Mme Martin)</p>', 
    priority: 'normal', 
    publicationDate: '2024-11-23T09:00:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  }
];

export default function DailyMessage() {
  const { residenceId, ensureAuthenticated, authenticatedPost } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [messages, setMessages] = useState(mockDailyMessages);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'message', label: 'Message', sortable: false, searchable: true },
    { id: 'priority', label: 'Priorité', sortable: true, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredMessages = messages.filter(msg => msg.residence_id === residenceId);

  const handleAddMessage = async (newMessage) => {
    try {
      // Vérifier l'authentification avant de procéder
      ensureAuthenticated('créer un nouveau message');
      
      console.log('✅ Utilisateur authentifié, création du message...');
      
      // Utiliser le middleware pour une action authentifiée
      const result = await authenticatedPost('/api/daily-messages', newMessage);
      
      console.log('✅ Message créé avec succès:', result);
      
      // Ajouter le message à l'état local (simulation)
      const messageWithId = { 
        ...newMessage, 
        id: Date.now(), 
        residence_id: residenceId 
      };
      setMessages(prev => [...prev, messageWithId]);
      
      // Fermer le modal et afficher une notification
      setOpenModal(false);
      setNotification({
        open: true,
        message: 'Message du jour créé avec succès !',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du message:', error);
      
      let errorMessage = 'Erreur lors de la création du message';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer un message';
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

  const handleNewMessageClick = () => {
    try {
      // Vérifier l'authentification avant d'ouvrir le modal
      ensureAuthenticated('créer un nouveau message');
      setOpenModal(true);
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un message',
        severity: 'error'
      });
    }
  };

  const handleRowClick = (message, navigate) => {
    navigate(`/daily-messages/${message.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Messages du jour de ma résidence</h2>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={handleNewMessageClick}
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
          Nouveau Message
        </Button>
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
          { 
            name: 'message', 
            label: 'Message', 
            type: 'wysiwyg', 
            required: true 
          },
          {
            name: 'priority',
            label: 'Priorité',
            type: 'select',
            required: false,
            options: [
              { value: 'low', label: 'Faible' },
              { value: 'normal', label: 'Normale' },
              { value: 'high', label: 'Élevée' },
              { value: 'urgent', label: 'Urgente' }
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
