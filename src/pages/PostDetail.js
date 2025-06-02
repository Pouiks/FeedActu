import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip } from '@mui/material';
import BackButton from '../components/BackButton';

// Données mockées (comme dans Posts.js)
const mockPosts = [
  { id: 1, title: 'Post A', message: '<p>Contenu du message A avec du <strong>HTML</strong></p>', imageUrl: '', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Post C', message: '<p>Contenu du message C</p>', imageUrl: '', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1' },
];

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    // Simule la récupération du post par ID
    const foundPost = mockPosts.find(p => p.id === parseInt(id));
    setPost(foundPost);
  }, [id]);

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
          <Typography variant="h4" component="h1">
            {post.title}
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

        {post.imageUrl && (
          <Box sx={{ mb: 3 }}>
            <img 
              src={post.imageUrl} 
              alt={post.title}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        )}

        <Box sx={{ '& p': { mb: 2 } }}>
          <div dangerouslySetInnerHTML={{ __html: post.message }} />
        </Box>
      </Paper>
    </Box>
  );
} 