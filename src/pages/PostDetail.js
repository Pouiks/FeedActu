import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';
import { usePublications } from '../context/PublicationsContext';

// Données mockées (synchronisées avec Posts.js)
const mockPosts = [
  { 
    id: 1, 
    title: 'Informations importantes sur les travaux', 
    message: '<p>Les travaux de rénovation de la <strong>cage d\'escalier</strong> débuteront lundi prochain. Merci de votre compréhension.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/4CAF50/white?text=Travaux',
    category: 'info', 
    publicationDate: '2024-11-20T08:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    title: 'Fête des voisins 2024', 
    message: '<p>Rejoignez-nous pour la <em>fête des voisins</em> ! 🎉<br>Au programme : barbecue, jeux pour enfants et bonne ambiance !</p>',
    imageUrl: 'https://via.placeholder.com/400x200/2196F3/white?text=Fête+Voisins',
    category: 'event', 
    publicationDate: '2024-11-18T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    title: 'URGENT - Coupure d\'eau programmée', 
    message: '<p><strong style="color: red;">ATTENTION :</strong> Coupure d\'eau prévue demain de 9h à 16h pour maintenance du réseau.</p>',
    imageUrl: '',
    category: 'urgent', 
    publicationDate: '2024-11-21T18:45:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    title: 'Assemblée générale annuelle', 
    message: '<p>Convocation à l\'assemblée générale annuelle.<br><br>Ordre du jour :<br>- Vote du budget<br>- Élection du conseil syndical<br>- Travaux à prévoir</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-12-15T10:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    title: 'Soirée jeux de société', 
    message: '<p>Une soirée conviviale autour de jeux de société ! Apportez vos jeux préférés.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/9C27B0/white?text=Jeux+Société',
    category: 'event', 
    publicationDate: '2024-11-19T16:20:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    title: 'Règlement intérieur mis à jour', 
    message: '<p>Le nouveau règlement intérieur est disponible. Principales modifications concernant les horaires de tranquillité.</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-10-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '1' 
  }
];

export default function PostDetail() {
  const { id } = useParams();
  const { getPublicationById, updatePublication } = usePublications();
  const [post, setPost] = useState(null);
  const [editedPost, setEditedPost] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Récupération via le contexte
    const foundPost = getPublicationById('posts', id);
    if (foundPost) {
      setPost(foundPost);
      setEditedPost({ 
        title: foundPost.title || '',
        message: foundPost.message || '',
        imageUrl: foundPost.imageUrl || '',
        category: foundPost.category || '',
        publicationDate: foundPost.publicationDate || new Date().toISOString()
      });
    }
  }, [id, getPublicationById]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!post) return;
    
    const hasChanges = 
      editedPost.title !== post.title ||
      editedPost.message !== post.message ||
      editedPost.imageUrl !== post.imageUrl ||
      editedPost.category !== post.category ||
      editedPost.publicationDate !== post.publicationDate;
    
    setIsDirty(hasChanges);
  }, [editedPost, post]);

  const handleFieldChange = (fieldName, value) => {
    setEditedPost(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Mise à jour via le contexte
      await updatePublication('posts', post.id, editedPost);
      
      // Mise à jour locale de l'état
      const updatedPost = { ...post, ...editedPost };
      setPost(updatedPost);
      setIsDirty(false);
      
      alert('Post sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (!post) {
    return (
      <Box>
        <BackButton to="/posts" label="Retour aux posts" />
        <Typography>Post non trouvé</Typography>
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
      <BackButton to="/posts" label="Retour aux posts" />
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Édition du post
          </Typography>
          <Chip 
            label={post.status} 
            color={getStatusColor(post.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(post.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Stack spacing={3}>
          {/* Titre */}
          <TextField
            label="Titre"
            value={editedPost.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            fullWidth
            variant="outlined"
            required
          />

          {/* Sélecteur de catégorie */}
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={editedPost.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              label="Catégorie"
            >
              <MenuItem value="info">Information</MenuItem>
              <MenuItem value="event">Événement</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="community">Vie communautaire</MenuItem>
            </Select>
          </FormControl>

          {/* Date de publication modifiable */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label="Date de publication"
              value={editedPost.publicationDate ? new Date(editedPost.publicationDate) : null}
              onChange={(newValue) => handleFieldChange('publicationDate', newValue?.toISOString())}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true,
                  helperText: "Date et heure de publication du post"
                }
              }}
              ampm={false}
            />
          </LocalizationProvider>

          {/* URL d'image */}
          <TextField
            label="URL de l'image"
            value={editedPost.imageUrl}
            onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="https://exemple.com/image.jpg"
          />

          {/* Aperçu de l'image */}
          {editedPost.imageUrl && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Aperçu de l'image :</Typography>
              <img 
                src={editedPost.imageUrl} 
                alt="Aperçu"
                style={{ maxWidth: '100%', maxHeight: '300px', height: 'auto' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}

          {/* Message */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Message</Typography>
            <RichTextEditor
              value={editedPost.message}
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