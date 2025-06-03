import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Alert, CircularProgress, Divider } from '@mui/material';

export default function Login() {
  const { login, mockLogin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('✅ Utilisateur déjà connecté, redirection vers dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleAzureLogin = async () => {
    setLoginLoading(true);
    setError('');

    try {
      console.log('🔄 Tentative de connexion Azure AD...');
      await login();
      console.log('✅ Connexion réussie, redirection...');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      
      // Gestion des erreurs spécifiques
      if (error.errorCode === 'user_cancelled') {
        setError('Connexion annulée par l\'utilisateur');
      } else if (error.errorCode === 'access_denied') {
        setError('Accès refusé. Vérifiez vos permissions.');
      } else if (error.errorCode === 'popup_window_error') {
        setError('Erreur de popup. Vérifiez que les popups ne sont pas bloquées.');
      } else {
        setError(`Erreur de connexion: ${error.errorMessage || error.message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // === DÉBUT FONCTION DÉVELOPPEMENT - FACILEMENT SUPPRIMABLE ===
  const handleMockLogin = async () => {
    setLoginLoading(true);
    setError('');

    try {
      console.log('🧪 Connexion de test...');
      await mockLogin();
      console.log('✅ Connexion test réussie, redirection...');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Erreur lors de la connexion test:', error);
      setError(`Erreur de connexion test: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoginLoading(false);
    }
  };
  // === FIN FONCTION DÉVELOPPEMENT ===

  // Afficher un loader pendant la vérification de l'état d'auth
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Vérification de votre session...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          FeedActu
        </Typography>
        
        <Typography variant="h6" component="h2" gutterBottom align="center" color="textSecondary" sx={{ mb: 3 }}>
          Gestion de communication résidentielle
        </Typography>
        
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
          Connectez-vous avec votre compte Microsoft pour accéder à votre espace de gestion
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleAzureLogin}
          disabled={loginLoading}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              transform: 'none'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loginLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 2, color: 'white' }} />
              Connexion en cours...
            </>
          ) : (
            'Se connecter avec mon compte'
          )}
        </Button>

        {/* === DÉBUT BLOC DÉVELOPPEMENT - FACILEMENT SUPPRIMABLE === */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Mode développement
              </Typography>
            </Divider>
            
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              onClick={handleMockLogin}
              disabled={loginLoading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 500,
                mb: 2
              }}
            >
              {loginLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  Connexion test...
                </>
              ) : (
                '🧪 Connexion de test (Marie Dupont)'
              )}
            </Button>
          </>
        )}
        {/* === FIN BLOC DÉVELOPPEMENT === */}

        <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 3, display: 'block' }}>
          Authentification sécurisée via Azure Active Directory
        </Typography>
      </Paper>
    </Box>
  );
}
