import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (comme dans Polls.js)
const mockPolls = [
  { id: 1, question: '<p>Question du sondage A</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1', answers: ['Oui', 'Non'] },
  { id: 2, question: '<p>Question du sondage C</p>', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1', answers: ['A', 'B', 'C'] },
];

export default function PollDetail() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [editedPoll, setEditedPoll] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération du sondage par ID
    const foundPoll = mockPolls.find(p => p.id === parseInt(id));
    if (foundPoll) {
      setPoll(foundPoll);
      setEditedPoll({ 
        question: foundPoll.question || '',
        answers: [...(foundPoll.answers || [''])]
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!poll) return;
    
    const hasChanges = 
      editedPoll.question !== poll.question ||
      JSON.stringify(editedPoll.answers) !== JSON.stringify(poll.answers);
    
    setIsDirty(hasChanges);
  }, [editedPoll, poll]);

  const handleFieldChange = (fieldName, value) => {
    setEditedPoll(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...editedPoll.answers];
    newAnswers[index] = value;
    setEditedPoll(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const addAnswer = () => {
    setEditedPoll(prev => ({
      ...prev,
      answers: [...prev.answers, '']
    }));
  };

  const removeAnswer = (index) => {
    if (editedPoll.answers.length > 1) {
      const newAnswers = editedPoll.answers.filter((_, i) => i !== index);
      setEditedPoll(prev => ({
        ...prev,
        answers: newAnswers
      }));
    }
  };

  const handleSave = () => {
    console.log('Sauvegarde du sondage:', { ...poll, ...editedPoll });
    
    // Simule la sauvegarde
    const updatedPoll = { ...poll, ...editedPoll };
    setPoll(updatedPoll);
    setIsDirty(false);
    
    alert('Sondage sauvegardé avec succès !');
  };

  if (!poll) {
    return (
      <Box>
        <BackButton to="/polls" label="Retour aux sondages" />
        <Typography>Sondage non trouvé</Typography>
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
      <BackButton to="/polls" label="Retour aux sondages" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Édition du sondage
          </Typography>
          <Chip 
            label={poll.status} 
            color={getStatusColor(poll.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(poll.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Stack spacing={3}>
          {/* Question */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Question du sondage</Typography>
            <RichTextEditor
              value={editedPoll.question}
              onChange={(content) => handleFieldChange('question', content)}
            />
          </Box>

          {/* Réponses */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Réponses possibles</Typography>
            {editedPoll.answers?.map((answer, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label={`Réponse ${index + 1}`}
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <IconButton 
                  onClick={() => removeAnswer(index)}
                  disabled={editedPoll.answers.length <= 1}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<Add />}
              onClick={addAnswer}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Ajouter une réponse
            </Button>
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