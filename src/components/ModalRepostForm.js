import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Stack, Alert
} from '@mui/material';
import ResidenceTagSelector from './ResidenceTagSelector';
import { useAuth } from '../hooks/useAuth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export default function ModalRepostForm({ 
  open = false, 
  handleClose = () => {}, 
  onSubmit = () => {}, 
  originalPost = null
}) {
  const { authorizedResidences, user } = useAuth();
  const [repostComment, setRepostComment] = useState('');
  const [selectedResidences, setSelectedResidences] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_COMMENT_LENGTH = 500;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      console.log('🔍 DEBUG ModalRepostForm - Modal ouverte');
      console.log('🔍 DEBUG - originalPost:', originalPost);
      console.log('🔍 DEBUG - authorizedResidences:', authorizedResidences);
      
      setRepostComment('');
      setSelectedResidences([]);
      setErrors({});
      setIsSubmitting(false);
      
      // Auto-sélection de la résidence unique si applicable
      if (authorizedResidences?.length === 1) {
        setSelectedResidences([authorizedResidences[0].residenceId]);
        console.log('🔍 DEBUG - Auto-sélection résidence:', authorizedResidences[0].residenceId);
      }
    }
  }, [open, authorizedResidences, originalPost]);

  // Validation de sécurité pour les résidences
  const validateResidencesSecurity = (residenceIds) => {
    if (!authorizedResidences || !residenceIds || residenceIds.length === 0) {
      return [];
    }
    
    const authorizedIds = authorizedResidences.map(res => res.residenceId);
    const validIds = residenceIds.filter(id => authorizedIds.includes(id));
    
    if (validIds.length !== residenceIds.length) {
      console.warn('🚨 SÉCURITÉ: Tentative de republication dans des résidences non autorisées détectée');
    }
    
    return validIds;
  };

  const handleResidenceChange = (newResidences) => {
    const secureResidences = validateResidencesSecurity(newResidences);
    setSelectedResidences(secureResidences);
    
    // Nettoyer l'erreur de résidences
    if (errors.residences) {
      setErrors(prev => ({ ...prev, residences: null }));
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setRepostComment(value);
      
      // Nettoyer l'erreur de commentaire
      if (errors.comment) {
        setErrors(prev => ({ ...prev, comment: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    console.log('🔍 DEBUG - Validation form');
    console.log('🔍 DEBUG - selectedResidences:', selectedResidences);
    console.log('🔍 DEBUG - originalPost?.id:', originalPost?.id);
    
    // Validation des résidences (obligatoire)
    const secureResidences = validateResidencesSecurity(selectedResidences);
    console.log('🔍 DEBUG - secureResidences après validation:', secureResidences);
    
    if (secureResidences.length === 0) {
      newErrors.residences = 'Vous devez sélectionner au moins une résidence autorisée';
      console.log('❌ DEBUG - Erreur: Aucune résidence sélectionnée');
    } else if (secureResidences.length !== selectedResidences.length) {
      newErrors.residences = 'Certaines résidences sélectionnées ne sont pas autorisées';
      console.log('❌ DEBUG - Erreur: Résidences non autorisées');
    }
    
    // Le commentaire est optionnel, pas de validation nécessaire
    
    setErrors(newErrors);
    console.log('🔍 DEBUG - Erreurs de validation:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        console.warn('🚨 Validation échouée pour la republication');
        return;
      }
      
      if (!originalPost?.id) {
        throw new Error('Post original introuvable');
      }
      
      console.log('✅ Validation réussie, création de la republication...');

      // Validation finale de sécurité
      const finalSecureResidences = validateResidencesSecurity(selectedResidences);
      if (finalSecureResidences.length === 0) {
        console.error('🚨 SÉCURITÉ CRITIQUE: Aucune résidence autorisée pour la republication');
        setErrors({ residences: 'Erreur de sécurité: aucune résidence autorisée' });
        return;
      }

      // Déterminer le type de publication
      const publicationType = originalPost.question ? 'poll' : 
                             originalPost.eventDate ? 'event' : 'post';
      
      // Construire le payload de republication
      const repostPayload = {
        residenceIds: finalSecureResidences,
        repostComment: repostComment.trim() || '', // Commentaire optionnel
        isRepost: true,
        status: 'published',
        authorId: user?.userId || user?.email || 'current-user',
        createdAt: new Date().toISOString()
      };

      // Ajouter l'ID original selon le type
      switch (publicationType) {
        case 'poll':
          repostPayload.originalPollId = originalPost.id;
          break;
        case 'event':
          repostPayload.originalEventId = originalPost.id;
          break;
        default:
          repostPayload.originalPostId = originalPost.id;
      }

      // LOG de la republication
      const originalTitle = originalPost.title || 
                           originalPost.question?.replace(/<[^>]*>/g, '').substring(0, 50) || 
                           'Sans titre';
      
      console.log('repost_submit', { 
        type: `repost_${publicationType}`, 
        action: 'publish',
        originalId: originalPost.id,
        originalTitle,
        payload: repostPayload
      });

      // Appel du handler de soumission
      await onSubmit(repostPayload);
      
      console.log('✅ Republication réussie');
      handleClose();
      
    } catch (error) {
      console.error('❌ Erreur lors de la republication:', error);
      
      let errorMessage = 'Erreur lors de la republication';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ 
        submit: errorMessage 
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Protection contre les props manquants
  if (!originalPost) {
    return null;
  }

  return (
    <Modal
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="modal-repost-title"
    >
      <Box sx={style}>
              <Typography id="modal-repost-title" variant="h6" component="h2" gutterBottom>
                {(() => {
                  const publicationType = originalPost.question ? 'poll' : 
                                         originalPost.eventDate ? 'event' : 'post';
                  const typeLabel = publicationType === 'poll' ? 'ce sondage' : 
                                   publicationType === 'event' ? 'cet événement' : 'ce post';
                  return `Republier ${typeLabel}`;
                })()}
              </Typography>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Veuillez corriger les erreurs avant de continuer
            {errors.submit && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                • {errors.submit}
              </Typography>
            )}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Commentaire de republication */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              💬 Votre commentaire (optionnel)
            </Typography>
            <TextField
              multiline
              rows={4}
              value={repostComment}
              onChange={handleCommentChange}
              placeholder="Ajoutez un commentaire à votre republication..."
              fullWidth
              helperText={`${repostComment.length}/${MAX_COMMENT_LENGTH} caractères`}
              error={!!errors.comment}
            />
            {errors.comment && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.comment}
              </Typography>
            )}
          </Box>

          {/* Aperçu du post original */}
          <Box sx={{ 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            p: 2, 
            backgroundColor: '#f9f9f9' 
          }}>
            {(() => {
              // Déterminer le type et l'icône
              const publicationType = originalPost.question ? 'poll' : 
                                     originalPost.eventDate ? 'event' : 'post';
              const typeIcon = publicationType === 'poll' ? '📊' : 
                              publicationType === 'event' ? '📅' : '📋';
              const typeLabel = publicationType === 'poll' ? 'Sondage' : 
                               publicationType === 'event' ? 'Événement' : 'Post';
              
              // Titre selon le type
              const displayTitle = originalPost.title || 
                                  (originalPost.question?.replace(/<[^>]*>/g, '').substring(0, 100) + '...') ||
                                  'Sans titre';

              return (
                <>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {typeIcon} {typeLabel} à republier
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {displayTitle}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {originalPost.id}
                  </Typography>
                  {originalPost.publicationDate && (
                    <Typography variant="caption" color="textSecondary">
                      Publié le {new Date(originalPost.publicationDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}
                  {publicationType === 'event' && originalPost.eventDate && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Événement le {new Date(originalPost.eventDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}
                </>
              );
            })()}
          </Box>

          {/* Sélecteur de résidences */}
          <ResidenceTagSelector
            value={selectedResidences}
            onChange={handleResidenceChange}
            label="Republier dans les résidences"
            required={true}
            error={!!errors.residences}
            helperText={errors.residences || "Sélectionnez les résidences où republier ce post"}
          />

          {/* Boutons d'action */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Republication...' : `Republier${selectedResidences.length > 1 ? ` dans ${selectedResidences.length} résidences` : ''}`}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
