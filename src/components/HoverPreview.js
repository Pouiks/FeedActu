import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Divider
} from '@mui/material';
import { 
  Event as EventIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Repeat as RepeatIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

const HoverPreview = ({ event, position, visible }) => {
  if (!visible || !event) return null;

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Publié': return '#4CAF50';
      case 'Programmé': return '#2196F3';
      case 'Brouillon': return '#FF9800';
      case 'Archivé': return '#757575';
      default: return '#757575';
    }
  };

  const getRecurrenceText = (recurrence, interval) => {
    switch(recurrence) {
      case 'daily': return `Tous les ${interval || 1} jour(s)`;
      case 'weekly': return 'Chaque semaine';
      case 'monthly': return 'Chaque mois';
      default: return 'Événement unique';
    }
  };

  // Calcul intelligent de la position pour éviter les débordements
  const calculatePosition = () => {
    const previewWidth = 350; // maxWidth du composant
    const previewHeight = 400; // Estimation de la hauteur maximale
    const offset = 10;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = position.x + offset;
    let y = position.y - offset;
    
    // Ajustement horizontal - si la preview dépasse à droite
    if (x + previewWidth > windowWidth) {
      x = position.x - previewWidth - offset;
    }
    
    // Ajustement horizontal - si la preview dépasse à gauche
    if (x < 0) {
      x = offset;
    }
    
    // Ajustement vertical - si la preview dépasse en bas
    if (y + previewHeight > windowHeight) {
      y = windowHeight - previewHeight - offset;
    }
    
    // Ajustement vertical - si la preview dépasse en haut
    if (y < 0) {
      y = offset;
    }
    
    return { x, y };
  };

  const adjustedPosition = calculatePosition();

  const style = {
    position: 'fixed',
    left: adjustedPosition.x,
    top: adjustedPosition.y,
    zIndex: 9999,
    maxWidth: 350,
    minWidth: 280,
    pointerEvents: 'none', // Pour éviter les interférences avec le hover
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid rgba(0,0,0,0.08)'
  };

  return (
    <Paper
      elevation={8}
      style={style}
      sx={{
        padding: 2,
        backgroundColor: 'white',
        borderRadius: 2
      }}
    >
      {/* Header avec titre et statut */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
        <Typography variant="h6" component="h3" style={{ 
          fontWeight: 600, 
          color: '#1976d2',
          fontSize: '16px',
          lineHeight: 1.3,
          marginRight: 8
        }}>
          {event.title}
        </Typography>
        <Chip
          label={event.status}
          size="small"
          style={{
            backgroundColor: getStatusColor(event.status),
            color: 'white',
            fontSize: '11px',
            fontWeight: 500
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Date et horaires */}
      <Box display="flex" alignItems="center" mb={1}>
        <EventIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
        <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
          {formatDate(event.eventDate)}
        </Typography>
      </Box>

      {(event.startTime || event.endTime) && (
        <Box display="flex" alignItems="center" mb={1}>
          <ScheduleIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Typography>
        </Box>
      )}

      {/* Lieu */}
      {event.location && (
        <Box display="flex" alignItems="center" mb={1}>
          <LocationIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
            {event.location}
          </Typography>
        </Box>
      )}

      {/* Participants */}
      {event.hasParticipantLimit && event.maxParticipants && (
        <Box display="flex" alignItems="center" mb={1}>
          <GroupIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
            Limité à {event.maxParticipants} participants
          </Typography>
        </Box>
      )}

      {/* Récurrence */}
      {event.recurrence && event.recurrence !== 'none' && (
        <Box display="flex" alignItems="center" mb={1}>
          <RepeatIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
            {getRecurrenceText(event.recurrence, event.recurrenceInterval)}
          </Typography>
        </Box>
      )}

      {/* Document attaché */}
      {event.document && (
        <Box display="flex" alignItems="center" mb={1}>
          <AttachFileIcon style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Typography variant="body2" style={{ fontSize: '14px', color: '#333' }}>
            Document PDF joint
          </Typography>
        </Box>
      )}

      {/* Description (tronquée) */}
      {event.description && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography 
            variant="body2" 
            style={{ 
              fontSize: '13px', 
              color: '#666',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            dangerouslySetInnerHTML={{ 
              __html: event.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
            }}
          />
        </>
      )}

      {/* Footer avec indicateur d'interaction */}
      <Box mt={1.5} pt={1} borderTop="1px solid #f0f0f0">
        <Typography 
          variant="caption" 
          style={{ 
            fontSize: '11px', 
            color: '#999',
            fontStyle: 'italic' 
          }}
        >
          💡 Cliquez pour plus de détails • Glissez pour déplacer
        </Typography>
      </Box>
    </Paper>
  );
};

export default HoverPreview; 