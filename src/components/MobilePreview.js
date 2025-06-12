import React from 'react';
import {
  Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, 
  Chip, Button, Avatar, Card, CardContent, Divider
} from '@mui/material';
import { Close, ThumbUp, Share, Event, Poll, Info } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MobilePreview({ 
  open = false, 
  onClose = () => {}, 
  data = {}, 
  type = '' 
}) {
  if (!data || Object.keys(data).length === 0) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'Événement': return <Event color="primary" />;
      case 'Sondage': return <Poll color="secondary" />;
      default: return <Info color="info" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'Événement': return 'primary';
      case 'Sondage': return 'secondary';
      default: return 'info';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatTimeValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      if (/^\d{2}:\d{2}$/.test(value)) return value;
      const date = new Date(value);
      if (!isNaN(date)) return format(date, 'HH:mm', { locale: fr });
      return value;
    }
    if (value instanceof Date && !isNaN(value)) {
      return format(value, 'HH:mm', { locale: fr });
    }
    return '';
  };

  // Utilitaire pour forcer l'affichage d'une string
  const safeString = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    if (val instanceof Date && !isNaN(val)) return format(val, 'dd/MM/yyyy HH:mm', { locale: fr });
    return val.toString ? val.toString() : '';
  };

  const renderContent = () => {
    switch (type) {
      case 'Événement':
        return (
          <Box>
            {/* En-tête événement */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getTypeIcon()}
              <Typography variant="subtitle2" color="primary" sx={{ ml: 1 }}>
                Événement
              </Typography>
            </Box>

            {/* Titre */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {safeString(data.title)}
            </Typography>

            {/* Informations clés */}
            <Card variant="outlined" sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  📅 {data.eventDate ? formatEventDate(data.eventDate) : ''}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  🕐 {formatTimeValue(data.startTime)}{data.endTime ? ` - ${formatTimeValue(data.endTime)}` : ''}
                </Typography>
                {data.location && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    📍 {safeString(data.location)}
                  </Typography>
                )}
                {data.hasParticipantLimit && data.maxParticipants && (
                  <Typography variant="body2" color="textSecondary">
                    👥 Limité à {safeString(data.maxParticipants)} participants
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {data.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" 
                  dangerouslySetInnerHTML={{ __html: safeString(data.description) }}
                  sx={{ lineHeight: 1.6 }}
                />
              </Box>
            )}

            {/* Document PDF */}
            {data.document && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: '#fff3e0' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    �� Document joint : {safeString(data.document)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Récurrence */}
            {data.recurrence && data.recurrence !== 'none' && (
              <Chip 
                size="small" 
                color="info" 
                variant="outlined"
                label={`Récurrence: ${safeString(data.recurrence === 'weekly' ? 'Hebdomadaire' : data.recurrence === 'monthly' ? 'Mensuelle' : 'Personnalisée')}`}
                sx={{ mb: 2 }}
              />
            )}

            {/* Boutons d'action */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" color="success" size="small" fullWidth sx={{ mb: 1 }}>
                ✓ Je participe
              </Button>
              <Button variant="outlined" color="error" size="small" fullWidth sx={{ mb: 1 }}>
                ✗ Je ne participe pas
              </Button>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Button variant="text" size="small" startIcon={<ThumbUp />} sx={{ flex: 1 }}>
                  J'aime
                </Button>
                <Button variant="text" size="small" startIcon={<Share />} sx={{ flex: 1 }}>
                  Partager
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 'Sondage':
        return (
          <Box>
            {/* En-tête sondage */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getTypeIcon()}
              <Typography variant="subtitle2" color="secondary" sx={{ ml: 1 }}>
                Sondage
              </Typography>
            </Box>

            {/* Image du sondage */}
            {data.imageUrl && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={safeString(data.imageUrl)} 
                  alt="Illustration du sondage"
                  style={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    objectFit: 'cover', 
                    borderRadius: 8 
                  }}
                />
              </Box>
            )}

            {/* Question */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Question du sondage
            </Typography>
            {data.question && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" 
                  dangerouslySetInnerHTML={{ __html: safeString(data.question) }}
                  sx={{ lineHeight: 1.6 }}
                />
              </Box>
            )}

            {/* Options sondage */}
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {data.allowMultipleAnswers ? 'Plusieurs réponses possibles :' : 'Choisissez une réponse :'}
            </Typography>

            {data.answers && data.answers.map((answer, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ 
                  mb: 1, 
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderColor: '#e0e0e0',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.main'
                  }
                }}
              >
                {data.allowMultipleAnswers ? '☐' : '○'} {safeString(answer)}
              </Button>
            ))}

            {/* Informations sondage */}
            <Card variant="outlined" sx={{ mt: 3, bgcolor: '#f8f9fa' }}>
              <CardContent sx={{ py: 1.5 }}>
                {data.hasDeadline && data.deadlineDate && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                    ⏰ Vote ouvert jusqu'au {data.deadlineDate ? formatDate(data.deadlineDate) : ''}
                  </Typography>
                )}
                {data.allowMultipleAnswers && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    ℹ️ Vous pouvez sélectionner plusieurs réponses
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button variant="contained" color="primary" size="small" fullWidth>
                Voter
              </Button>
              <Button variant="text" size="small" startIcon={<ThumbUp />}>
                J'aime
              </Button>
            </Box>
          </Box>
        );

      default: // Posts
        return (
          <Box>
            {/* En-tête post */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getTypeIcon()}
              <Typography variant="subtitle2" color="info" sx={{ ml: 1 }}>
                Publication
              </Typography>
              {data.category && (
                <Chip 
                  size="small" 
                  label={safeString(data.category)}
                  color={data.category === 'urgent' ? 'error' : 'default'}
                  sx={{ ml: 'auto' }}
                />
              )}
            </Box>

            {/* Titre */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {safeString(data.title)}
            </Typography>

            {/* Image */}
            {data.imageUrl && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={safeString(data.imageUrl)} 
                  alt="Illustration"
                  style={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    objectFit: 'cover', 
                    borderRadius: 8 
                  }}
                />
              </Box>
            )}

            {/* Message */}
            {data.message && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" 
                  dangerouslySetInnerHTML={{ __html: safeString(data.message) }}
                  sx={{ lineHeight: 1.6 }}
                />
              </Box>
            )}

            {/* Boutons d'action */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button variant="text" size="small" startIcon={<ThumbUp />} sx={{ flex: 1 }}>
                J'aime
              </Button>
              <Button variant="text" size="small" startIcon={<Share />} sx={{ flex: 1 }}>
                Partager
              </Button>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#f5f5f5',
          margin: 1,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: getTypeColor() + '.main' }}>
            📱
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Aperçu Mobile
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {type}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        bgcolor: 'white',
        p: 2,
        '&:first-of-type': { pt: 2 }
      }}>
        {/* Barre de statut simulée */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Typography variant="caption" color="textSecondary">
            Publié le {data.publicationDate ? formatDate(data.publicationDate) : 'maintenant'}
          </Typography>
          <Chip 
            size="small" 
            label={safeString(data.status) || 'Publié'}
            color={getTypeColor()}
            variant="outlined"
          />
        </Box>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 