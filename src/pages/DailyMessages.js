import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResidence } from '../context/ResidenceContext';

const mockDailyMessages = [
  { 
    id: 1, 
    title: 'Bienvenue dans votre nouvelle résidence !', 
    content: '<p>Chers résidents,<br><br>Nous sommes ravis de vous accueillir dans votre nouveau chez-vous ! 🏠<br><br>N\'hésitez pas à nous contacter pour toute question.</p>',
    publicationDate: '2024-11-22T08:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    title: 'Rappel : Tri sélectif', 
    content: '<p>📦 <strong>Rappel important</strong><br><br>Pensez à bien trier vos déchets ! Les bacs jaunes sont collectés le mardi matin.</p>',
    publicationDate: '2024-11-21T18:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    title: 'Horaires d\'hiver du gardien', 
    content: '<p>🕐 <strong>Nouveaux horaires</strong><br><br>À partir du 1er décembre :<br>• Lundi-Vendredi : 8h-12h et 14h-18h<br>• Samedi : 9h-12h</p>',
    publicationDate: '2024-11-25T09:15:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    title: 'Bonne année 2025 !', 
    content: '<p>🎉 <strong>Meilleurs vœux</strong><br><br>Toute l\'équipe vous souhaite une excellente année 2025 !</p>',
    publicationDate: '2025-01-01T00:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    title: 'Travaux de peinture terminés', 
    content: '<p>✅ <strong>Travaux terminés</strong><br><br>Les travaux de peinture dans le hall sont terminés. Merci pour votre patience !</p>',
    publicationDate: '2024-11-15T16:00:00', 
    status: 'Archivé', 
    residence_id: '1' 
  }
];

export default function DailyMessages() {
  const { ensureAuthenticated, authenticatedPost } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [messages, setMessages] = useState(mockDailyMessages);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredMessages = messages.filter(message => message.residence_id === currentResidenceId);

  const handleAddMessage = async (newMessage) => {
    try {
      ensureAuthenticated('créer un nouveau message');
      
      console.log('✅ Utilisateur authentifié, création du message...');
      
      const result = await authenticatedPost('/api/daily-messages', newMessage);
      
      console.log('✅ Message créé avec succès:', result);
      
      const messageWithId = { 
        ...newMessage, 
        id: Date.now(), 
        residence_id: currentResidenceId 
      };
      setMessages(prev => [...prev, messageWithId]);
      
      setOpenModal(false);
      setNotification({
        open: true,
        message: 'Message créé avec succès !',
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
      <PageHeader
        title="Messages du jour"
        subtitle={`Gérez les messages quotidiens de ${currentResidenceName || 'votre résidence'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Messages du jour', href: '/daily-messages' }
        ]}
        actions={[
          {
            label: 'Nouveau Message',
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewMessageClick
            }
          }
        ]}
        stats={[
          { label: 'Messages actifs', value: filteredMessages.filter(m => m.status === 'Publié').length.toString() },
          { label: 'Messages programmés', value: filteredMessages.filter(m => m.status === 'Programmé').length.toString() }
        ]}
      />

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
          { name: 'title', label: 'Titre du message', type: 'text', required: true },
          { name: 'message', label: 'Message du jour', type: 'wysiwyg', required: true },
          {
            name: 'priority',
            label: 'Priorité',
            type: 'select',
            required: true,
            options: [
              { value: 'low', label: 'Faible' },
              { value: 'normal', label: 'Normale' },
              { value: 'high', label: 'Élevée' },
              { value: 'urgent', label: 'Urgente' }
            ]
          },
          { 
            name: 'publicationDate', 
            label: 'Date de publication', 
            type: 'datetime', 
            required: true
          }
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
