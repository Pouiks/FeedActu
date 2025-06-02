import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, Button, Stack } from '@mui/material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (comme dans DailyMessages.js)
const mockDailyMessages = [
  { id: 1, message: '<p>Message du jour A avec du <strong>contenu important</strong></p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Message du jour B avec des informations utiles</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
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