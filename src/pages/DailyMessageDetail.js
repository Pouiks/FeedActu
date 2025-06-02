import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, Button, Stack } from '@mui/material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (synchronisées avec DailyMessages.js)
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

export default function DailyMessageDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [editedMessage, setEditedMessage] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération du message par ID
    const foundMessage = mockDailyMessages.find(m => m.id === parseInt(id));
    if (foundMessage) {
      setMessage(foundMessage);
      setEditedMessage({ 
        message: foundMessage.message || ''
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!message) return;
    
    const hasChanges = editedMessage.message !== message.message;
    setIsDirty(hasChanges);
  }, [editedMessage, message]);

  const handleFieldChange = (fieldName, value) => {
    setEditedMessage(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde du message du jour:', { ...message, ...editedMessage });
    
    // Simule la sauvegarde
    const updatedMessage = { ...message, ...editedMessage };
    setMessage(updatedMessage);
    setIsDirty(false);
    
    alert('Message du jour sauvegardé avec succès !');
  };

  if (!message) {
    return (
      <Box>
        <BackButton to="/daily-messages" label="Retour aux messages du jour" />
        <Typography>Message non trouvé</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Publié': return 'success';
      case 'Brouillon': return 'warning';
      case 'Archivé': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <BackButton to="/daily-messages" label="Retour aux messages du jour" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Édition du message du jour
          </Typography>
          <Chip 
            label={message.status} 
            color={getStatusColor(message.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(message.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Stack spacing={3}>
          {/* Message */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Message</Typography>
            <RichTextEditor
              value={editedMessage.message}
              onChange={(content) => handleFieldChange('message', content)}
            />
          </Box>

          {/* Bouton d'enregistrement */}
          {isDirty && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                size="large"
              >
                Enregistrer les modifications
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
} 