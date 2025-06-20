import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Alert, 
  Button,
  Divider
} from '@mui/material';
import { 
  ErrorOutline as ErrorIcon,
  ContactSupport as ContactIcon 
} from '@mui/icons-material';

export default function UnauthorizedError({ userEmail, onRetry }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          textAlign: 'center' 
        }}
      >
        <ErrorIcon 
          sx={{ 
            fontSize: 64, 
            color: 'error.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h5" gutterBottom color="error">
          Accès refusé
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Votre compte <strong>{userEmail}</strong> n'est pas autorisé à accéder à cette application.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Que faire ?</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • Vérifiez que vous utilisez le bon compte<br/>
            • Contactez votre administrateur pour demander l'accès<br/>
            • Mentionnez votre adresse email : <code>{userEmail}</code>
          </Typography>
        </Alert>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={onRetry}
            startIcon={<ContactIcon />}
          >
            Réessayer avec un autre compte
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 