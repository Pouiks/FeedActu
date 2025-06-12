import React from 'react';
import {
  Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, 
  Chip, Button, Avatar, Card, CardContent, Divider
} from '@mui/material';
import { Close, ThumbUp, Share, Event, Poll, Info } from '@mui/icons-material';
import { formatDate, formatEventDate, formatTimeValue, safeString } from '../utils/format';

function MobilePreviewEvent({ data }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Event color="primary" />
        <Typography variant="subtitle2" color="primary" sx={{ ml: 1 }}>
          Événement
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{safeString(data.title)}</Typography>
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
      {data.description && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: safeString(data.description) }} sx={{ lineHeight: 1.6 }} />
        </Box>
      )}
      {data.document && (
        <Card variant="outlined" sx={{ mb: 2, bgcolor: '#fff3e0' }}>
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              📎 Document joint : {safeString(data.document)}
            </Typography>
          </CardContent>
        </Card>
      )}
      {data.recurrence && data.recurrence !== 'none' && (
        <Chip 
          size="small" 
          color="info" 
          variant="outlined"
          label={`Récurrence: ${safeString(data.recurrence === 'weekly' ? 'Hebdomadaire' : data.recurrence === 'monthly' ? 'Mensuelle' : 'Personnalisée')}`}
          sx={{ mb: 2 }}
        />
      )}
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
}

function MobilePreviewPoll({ data }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Poll color="secondary" />
        <Typography variant="subtitle2" color="secondary" sx={{ ml: 1 }}>
          Sondage
        </Typography>
      </Box>
      {data.imageUrl && (
        <Box sx={{ mb: 2 }}>
          <img 
            src={safeString(data.imageUrl)} 
            alt="Illustration du sondage"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
          />
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Question du sondage</Typography>
      {data.question && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: safeString(data.question) }} sx={{ lineHeight: 1.6 }} />
        </Box>
      )}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {data.allowMultipleAnswers ? 'Plusieurs réponses possibles :' : 'Choisissez une réponse :'}
      </Typography>
      {data.answers && data.answers.map((answer, index) => (
        <Button
          key={index}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left', borderColor: '#e0e0e0', color: 'text.primary', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' } }}
        >
          {data.allowMultipleAnswers ? '☐' : '○'} {safeString(answer)}
        </Button>
      ))}
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
}

function MobilePreviewPost({ data }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Info color="info" />
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
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{safeString(data.title)}</Typography>
      {data.imageUrl && (
        <Box sx={{ mb: 2 }}>
          <img 
            src={safeString(data.imageUrl)} 
            alt="Illustration"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
          />
        </Box>
      )}
      {data.message && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: safeString(data.message) }} sx={{ lineHeight: 1.6 }} />
        </Box>
      )}
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

export default function MobilePreview({ 
  open = false, 
  onClose = () => {}, 
  data = {}, 
  type = '' 
}) {
  if (!data || Object.keys(data).length === 0) return null;

  const getTypeColor = () => {
    switch (type) {
      case 'Événement': return 'primary';
      case 'Sondage': return 'secondary';
      default: return 'info';
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

        {type === 'Événement' && <MobilePreviewEvent data={data} />}
        {type === 'Sondage' && <MobilePreviewPoll data={data} />}
        {type !== 'Événement' && type !== 'Sondage' && <MobilePreviewPost data={data} />}
      </DialogContent>
    </Dialog>
  );
} 