import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResidence } from '../context/ResidenceContext';

const mockEvents = [
  { 
    id: 1, 
    title: 'Assemblée générale extraordinaire', 
    description: '<p><strong>Ordre du jour :</strong><br>• Vote des travaux de réfection<br>• Budget exceptionnel<br>• Questions diverses</p>',
    eventDate: '2025-06-20', 
    startTime: '18:30', 
    endTime: '20:30',
    location: 'Salle de réunion (RDC)',
    maxParticipants: 50,
    publicationDate: '2025-06-22T09:00:00', 
    status: 'Publié', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1',
    targetResidences: ['19f2179b-7d14-f011-998a-6045bd1919a1'],
    targetResidenceNames: ['ECLA GENEVE ARCHAMPS']
  },
  { 
    id: 2, 
    title: 'Cours de yoga collectif', 
    description: '<p>Séance de yoga pour tous niveaux avec <em>Marie</em>, professeure certifiée.<br><br>Apportez votre tapis ! 🧘‍♀️</p>',
    eventDate: '2025-06-05', 
    startTime: '19:00', 
    endTime: '20:00',
    location: 'Jardin commun (si beau temps)',
    maxParticipants: 15,
    publicationDate: '2025-06-20T14:15:00', 
    status: 'Publié', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['195644a8-4fa7-ef11-b8e9-6045bd19a503', '1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA MASSY-PALAISEAU', 'ECLA NOISY-LE-GRAND']
  },
  { 
    id: 3, 
    title: 'Atelier cuisine enfants', 
    description: '<p>Les petits chefs en herbe vont préparer des <strong>cookies de Noël</strong> ! 👨‍🍳</p>',
    eventDate: '2025-06-18', 
    startTime: '14:00', 
    endTime: '16:30',
    location: 'Cuisine commune',
    maxParticipants: 8,
    publicationDate: '2025-06-10T10:00:00', 
    status: 'Programmé', 
    residence_id: '1b5644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA NOISY-LE-GRAND']
  },
  { 
    id: 4, 
    title: 'Soirée film en plein air', 
    description: '<p>Projection du film <em>"Le Grand Bleu"</em> dans le jardin.<br>Popcorn et boissons offerts ! 🍿</p>',
    eventDate: '2025-06-08', 
    startTime: '20:00', 
    endTime: '22:30',
    location: 'Jardin commun',
    maxParticipants: 30,
    publicationDate: '2025-06-25T16:45:00', 
    status: 'Brouillon', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['195644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA MASSY-PALAISEAU']
  },
  { 
    id: 5, 
    title: 'Vide-grenier des résidents', 
    description: '<p>Grande braderie entre voisins ! Livres, vêtements, objets de décoration...<br><br>Inscription obligatoire pour tenir un stand.</p>',
    eventDate: '2025-06-15', 
    startTime: '09:00', 
    endTime: '17:00',
    location: 'Parking sous-sol',
    maxParticipants: 100,
    publicationDate: '2025-06-30T08:00:00', 
    status: 'Brouillon', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1',
    targetResidences: ['19f2179b-7d14-f011-998a-6045bd1919a1', '195644a8-4fa7-ef11-b8e9-6045bd19a503', '1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA GENEVE ARCHAMPS', 'ECLA MASSY-PALAISEAU', 'ECLA NOISY-LE-GRAND']
  },
  { 
    id: 6, 
    title: 'Fête d\'Halloween 2025', 
    description: '<p>Soirée déguisée pour petits et grands ! 🎃<br>Concours du meilleur costume avec prix à la clé.</p>',
    eventDate: '2025-06-31', 
    startTime: '18:00', 
    endTime: '21:00',
    location: 'Hall d\'entrée',
    maxParticipants: 40,
    publicationDate: '2025-06-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '1b5644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA NOISY-LE-GRAND']
  },
  { 
    id: 7, 
    title: 'Maintenance collective vélos', 
    description: '<p>Atelier réparation et entretien vélos avec <strong>Pierre</strong>, mécanicien bénévole.</p>',
    eventDate: '2025-06-12', 
    startTime: '10:00', 
    endTime: '12:00',
    location: 'Local vélos',
    maxParticipants: 6,
    publicationDate: '2025-06-28T15:30:00', 
    status: 'Publié', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['195644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA MASSY-PALAISEAU']
  }
];

export default function Events() {
  const { ensureAuthenticated, authenticatedPost, authorizedResidences } = useAuth();
  const { currentResidenceId, currentResidenceName } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState(mockEvents);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'eventDate', label: 'Date de l\'événement', sortable: true, searchable: false },
    { id: 'targetResidenceNames', label: 'Résidences', sortable: false, searchable: false },
    { id: 'location', label: 'Lieu', sortable: false, searchable: true },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredEvents = events.filter(event => {
    return event.targetResidences && event.targetResidences.includes(currentResidenceId);
  });

  const handleAddEvent = async (newEvent) => {
    try {
      ensureAuthenticated('créer un nouvel événement');
      
      console.log('✅ Utilisateur authentifié, création de l\'événement...');
      console.log('📝 Données de l\'événement:', newEvent);
      
      if (!newEvent.targetResidences || newEvent.targetResidences.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = newEvent.targetResidences.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      const result = await authenticatedPost('/api/events', newEvent);
      
      console.log('✅ Événement créé avec succès:', result);
      
      const eventWithId = { 
        ...newEvent, 
        id: Date.now(),
        residence_id: currentResidenceId
      };
      setEvents(prev => [...prev, eventWithId]);
      
      setOpenModal(false);
      const residenceCount = newEvent.targetResidences.length;
      setNotification({
        open: true,
        message: `Événement créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      
      let errorMessage = 'Erreur lors de la création de l\'événement';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer un événement';
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

  const handleRowClick = (event, navigate) => {
    navigate(`/events/${event.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
          { label: 'Événements actifs', value: filteredEvents.filter(e => e.status === 'Publié').length.toString() },
          { label: 'Total événements', value: filteredEvents.length.toString() }
        ]}
      />

      <DataTable 
        title="Événements de ma résidence" 
        data={filteredEvents} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddEvent}
        entityName="Événement"
        fields={[
          { name: 'title', label: 'Titre de l\'événement', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'richtext', required: true },
          { name: 'eventDate', label: 'Date de l\'événement', type: 'date', required: true },
          { name: 'startTime', label: 'Heure de début', type: 'time', required: true },
          { name: 'endTime', label: 'Heure de fin', type: 'time' },
          { name: 'location', label: 'Lieu', type: 'text', required: true },
          { name: 'maxParticipants', label: 'Nombre max de participants', type: 'number' },
          { name: 'targetResidences', label: 'Résidences cibles', type: 'multiselect', required: true }
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
