import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import BackButton from '../components/BackButton';

// Données mockées (comme dans Polls.js)
const mockPolls = [
  { id: 1, question: '<p>Question du sondage A</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1', answers: ['Oui', 'Non'] },
  { id: 2, question: '<p>Question du sondage C</p>', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1', answers: ['A', 'B', 'C'] },
];

export default function PollDetail() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    // Simule la récupération du sondage par ID
    const foundPoll = mockPolls.find(p => p.id === parseInt(id));
    setPoll(foundPoll);
  }, [id]);

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
          <Typography variant="h4" component="h1">
            Sondage
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Question :</Typography>
          <div dangerouslySetInnerHTML={{ __html: poll.question }} />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Réponses possibles :</Typography>
          <List>
            {poll.answers?.map((answer, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText 
                  primary={`${index + 1}. ${answer}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
} 