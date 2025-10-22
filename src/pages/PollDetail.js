import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack, IconButton, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import { Add, Delete, Repeat } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';
import ModalRepostForm from '../components/ModalRepostForm';
import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../context/PublicationsContext';
import { getStatusColor, canRepost, normalizeStatus } from '../utils/publicationStatus';

// Données mockées (synchronisées avec Polls.js)
const mockPolls = [
  { 
    id: 1, 
    question: '<p><strong>Quel horaire préférez-vous pour l\'assemblée générale ?</strong><br>Votre avis compte pour fixer la date qui convient au plus grand nombre.</p>', 
    answers: ['18h00 - 20h00', '19h00 - 21h00', '20h00 - 22h00', 'Weekend (samedi matin)'],
    publicationDate: '2024-11-18T10:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    question: '<p>Souhaitez-vous l\'installation de <em>bornes de recharge</em> pour véhicules électriques dans le parking ?</p>', 
    answers: ['Oui, absolument', 'Oui, mais seulement si peu coûteux', 'Non, pas prioritaire', 'Je n\'ai pas d\'avis'],
    publicationDate: '2024-11-20T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    question: '<p><strong>Quelle activité souhaiteriez-vous voir organisée ?</strong><br>Nous préparons le programme des activités 2025 ! 🎯</p>', 
    answers: ['Cours de sport collectif', 'Ateliers bricolage/jardinage', 'Soirées culturelles', 'Activités enfants', 'Repas partagés'],
    publicationDate: '2024-12-01T09:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    question: '<p>Êtes-vous satisfait de la <em>gestion des espaces verts</em> ?</p>', 
    answers: ['Très satisfait', 'Plutôt satisfait', 'Plutôt mécontent', 'Très mécontent'],
    publicationDate: '2024-11-15T16:45:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    question: '<p>Accepteriez-vous une <strong>légère augmentation</strong> des charges pour améliorer la sécurité (vidéophone, éclairage) ?</p>', 
    answers: ['Oui, tout à fait', 'Oui, selon le montant', 'Non, les charges sont déjà trop élevées'],
    publicationDate: '2024-10-20T11:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    question: '<p>Quel est votre <em>mode de transport principal</em> pour aller au travail ?</p>', 
    answers: ['Voiture', 'Transports en commun', 'Vélo', 'À pied', 'Télétravail', 'Autre'],
    publicationDate: '2024-11-25T08:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  }
];

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getPublicationById, updatePublication } = usePublications();
  const [poll, setPoll] = useState(null);
  const [editedPoll, setEditedPoll] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [openRepostModal, setOpenRepostModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Récupération du sondage par ID depuis le contexte
    const foundPoll = getPublicationById('polls', id);
    console.log('🔍 DEBUG PollDetail - Recherche sondage ID:', id);
    console.log('🔍 DEBUG PollDetail - Sondage trouvé:', foundPoll);
    
    if (foundPoll) {
      setPoll(foundPoll);
      
      // Adapter les champs selon la structure des données du contexte
      setEditedPoll({
        question: foundPoll.question || foundPoll.title || '',
        answers: foundPoll.answers || foundPoll.options || [''],
        allowMultipleAnswers: foundPoll.allowMultipleAnswers || foundPoll.allowMultiple || false,
        hasDeadline: foundPoll.hasDeadline || !!foundPoll.answerDeadline || false,
        deadlineDate: foundPoll.deadlineDate || foundPoll.answerDeadline || new Date().toISOString(),
        publicationDate: foundPoll.publicationDate || foundPoll.createdAt || new Date().toISOString()
      });
    } else {
      console.warn('⚠️ Sondage non trouvé avec ID:', id);
    }
  }, [id, getPublicationById]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!poll) return;
    
    const hasChanges = 
      editedPoll.question !== poll.question ||
      JSON.stringify(editedPoll.answers) !== JSON.stringify(poll.answers) ||
      editedPoll.allowMultipleAnswers !== poll.allowMultipleAnswers ||
      editedPoll.hasDeadline !== poll.hasDeadline ||
      editedPoll.deadlineDate !== poll.deadlineDate ||
      editedPoll.publicationDate !== poll.publicationDate;
    
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

  const handleSave = async () => {
    try {
      const updatedData = {
        question: editedPoll.question,
        answers: editedPoll.answers.filter(answer => answer.trim() !== ''),
        allowMultipleAnswers: editedPoll.allowMultipleAnswers,
        hasDeadline: editedPoll.hasDeadline,
        deadlineDate: editedPoll.deadlineDate,
        publicationDate: editedPoll.publicationDate
      };
      
      console.log('Sauvegarde du sondage:', { ...poll, ...updatedData });
      
      // Sauvegarde via le contexte
      await updatePublication('polls', poll.id, updatedData);
      
      // Mettre à jour l'état local
      const updatedPoll = { ...poll, ...updatedData };
      setPoll(updatedPoll);
      setIsDirty(false);
      
      setNotification({
        open: true,
        message: 'Sondage sauvegardé avec succès !',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la sauvegarde du sondage',
        severity: 'error'
      });
    }
  };

  const handleRepostClick = () => {
    console.log('🔍 DEBUG PollDetail - Ouverture modal republication pour sondage:', poll);
    setOpenRepostModal(true);
  };

  const handleSubmitRepost = async (payload) => {
    try {
      console.log('🔍 DEBUG PollDetail - Soumission republication sondage:', payload);
      
      // TODO: Remplacer par l'appel API réel
      // await repostPublication('poll', payload);
      
      setNotification({
        open: true,
        message: `Sondage "${poll.question?.replace(/<[^>]*>/g, '').substring(0, 50)}..." republié avec succès !`,
        severity: 'success'
      });
      
      setOpenRepostModal(false);
    } catch (error) {
      console.error('❌ Erreur lors de la republication du sondage:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la republication du sondage',
        severity: 'error'
      });
    }
  };

  if (!poll) {
    return (
      <Box>
        <BackButton to="/polls" label="Retour aux sondages" />
        <Typography>Sondage non trouvé</Typography>
      </Box>
    );
  }

  // Fonction getStatusColor supprimée - utilise maintenant l'utilitaire unifié

  return (
    <Box>
      <BackButton to="/polls" label="Retour aux sondages" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Édition du sondage
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<Repeat />}
              onClick={handleRepostClick}
              disabled={!canRepost(poll.status)}
              size="small"
            >
              Republier (TEST)
            </Button>
            <Chip 
              label={poll.status} 
              color={getStatusColor(poll.status)}
              variant="outlined"
            />
          </Stack>
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
            <Button variant="outlined" size="small" onClick={addAnswer}>
              Ajouter une réponse
            </Button>
          </Box>

          {/* Option réponses multiples */}
          <FormControlLabel
            control={
              <Checkbox
                checked={editedPoll.allowMultipleAnswers || false}
                onChange={(e) => handleFieldChange('allowMultipleAnswers', e.target.checked)}
              />
            }
            label="Autoriser les réponses multiples"
          />

          {/* Option deadline */}
          <FormControlLabel
            control={
              <Checkbox
                checked={editedPoll.hasDeadline || false}
                onChange={(e) => handleFieldChange('hasDeadline', e.target.checked)}
              />
            }
            label="Définir une date limite de réponse"
          />

          {/* Date limite conditionnelle */}
          {editedPoll.hasDeadline && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DateTimePicker
                label="Date limite de réponse"
                value={editedPoll.deadlineDate ? new Date(editedPoll.deadlineDate) : null}
                onChange={(newValue) => handleFieldChange('deadlineDate', newValue?.toISOString())}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    helperText: "Date et heure limite pour répondre au sondage"
                  }
                }}
                ampm={false}
                disablePast
              />
            </LocalizationProvider>
          )}

          {/* Date de publication modifiable */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label="Date de publication"
              value={editedPoll.publicationDate ? new Date(editedPoll.publicationDate) : null}
              onChange={(newValue) => handleFieldChange('publicationDate', newValue?.toISOString())}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true,
                  helperText: "Date et heure de publication du sondage"
                }
              }}
              ampm={false}
            />
          </LocalizationProvider>

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

      {/* Modal de republication */}
      <ModalRepostForm
        open={openRepostModal}
        handleClose={() => setOpenRepostModal(false)}
        onSubmit={handleSubmitRepost}
        originalPost={poll}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 