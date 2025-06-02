import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, TextField, Button, Stack } from '@mui/material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (comme dans Posts.js)
const mockPosts = [
  { id: 1, title: 'Post A', message: '<p>Contenu du message A avec du <strong>HTML</strong></p>', imageUrl: '', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Post C', message: '<p>Contenu du message C</p>', imageUrl: '', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1' },
];

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [editedPost, setEditedPost] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération du post par ID
    const foundPost = mockPosts.find(p => p.id === parseInt(id));
    if (foundPost) {
      setPost(foundPost);
      setEditedPost({ 
        title: foundPost.title || '',
        message: foundPost.message || '',
        imageUrl: foundPost.imageUrl || ''
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!post) return;
    
    const hasChanges = 
      editedPost.title !== post.title ||
      editedPost.message !== post.message ||
      editedPost.imageUrl !== post.imageUrl;
    
    setIsDirty(hasChanges);
  }, [editedPost, post]);

  const handleFieldChange = (fieldName, value) => {
    setEditedPost(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde du post:', { ...post, ...editedPost });
    
    // Simule la sauvegarde
    const updatedPost = { ...post, ...editedPost };
    setPost(updatedPost);
    setIsDirty(false);
    
    // Ici, on ferait l'appel API pour sauvegarder
    alert('Post sauvegardé avec succès !');
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
          />

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