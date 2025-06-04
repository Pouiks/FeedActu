import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  FormHelperText 
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function ResidenceTagSelector({ 
  value = [], 
  onChange, 
  label = "Résidences de publication",
  required = false,
  error = false,
  helperText = ""
}) {
  const { authorizedResidences } = useAuth();

  // Validation de sécurité : s'assurer que les résidences sélectionnées sont autorisées
  const validateSecureSelection = (selectedIds) => {
    if (!authorizedResidences || selectedIds.length === 0) return selectedIds;
    
    const authorizedIds = authorizedResidences.map(res => res.residenceId);
    const validIds = selectedIds.filter(id => authorizedIds.includes(id));
    
    if (validIds.length !== selectedIds.length) {
      console.warn('🚨 Tentative de sélection de résidences non autorisées détectée');
    }
    
    return validIds;
  };

  // Si l'utilisateur n'a qu'une résidence, la présélectionner automatiquement
  React.useEffect(() => {
    if (authorizedResidences?.length === 1 && value.length === 0) {
      const secureSelection = validateSecureSelection([authorizedResidences[0].residenceId]);
      onChange(secureSelection);
    }
  }, [authorizedResidences, value, onChange]);

  const handleToggleResidence = (residenceId) => {
    // Validation de sécurité : vérifier que la résidence est autorisée
    const isAuthorized = authorizedResidences?.some(res => res.residenceId === residenceId);
    if (!isAuthorized) {
      console.error('🚨 Tentative d\'accès à une résidence non autorisée:', residenceId);
      return;
    }

    const newValue = value.includes(residenceId)
      ? value.filter(id => id !== residenceId)
      : [...value, residenceId];
    
    // Double validation de sécurité avant envoi
    const secureValue = validateSecureSelection(newValue);
    onChange(secureValue);
  };

  if (!authorizedResidences || authorizedResidences.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle1" color="error">
          ⚠️ Aucune résidence autorisée
        </Typography>
        <FormHelperText error>
          Contactez votre administrateur pour obtenir des accès aux résidences
        </FormHelperText>
      </Box>
    );
  }

  // Si une seule résidence, affichage informatif seulement
  if (authorizedResidences.length === 1) {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {label} {required && <span style={{color: 'red'}}>*</span>}
        </Typography>
        <Chip 
          label={`✓ ${authorizedResidences[0].residenceName}`}
          color="primary"
          variant="filled"
          sx={{ 
            fontWeight: 600,
            '& .MuiChip-label': { px: 2 }
          }}
        />
        <FormHelperText>
          Publication automatique dans votre résidence unique
        </FormHelperText>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label} {required && <span style={{color: 'red'}}>*</span>}
      </Typography>
      
      <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
        Cliquez sur les résidences pour sélectionner où publier ce contenu ({value.length} sélectionnée{value.length > 1 ? 's' : ''})
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1.5,
        p: 2,
        border: error ? '2px solid #d32f2f' : '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: error ? '#ffeaea' : '#fafafa',
        minHeight: 70,
        alignItems: 'center',
        transition: 'all 0.2s ease-in-out'
      }}>
        {authorizedResidences.map((residence) => {
          const isSelected = value.includes(residence.residenceId);
          return (
            <Chip
              key={residence.residenceId}
              label={residence.residenceName}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              clickable
              onClick={() => handleToggleResidence(residence.residenceId)}
              sx={{
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.9rem',
                height: 38,
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: isSelected ? 3 : 2,
                  backgroundColor: isSelected ? 'primary.dark' : 'action.hover'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                },
                '& .MuiChip-label': {
                  px: 2
                }
              }}
            />
          );
        })}
      </Box>

      {value.length > 0 && (
        <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
          ✓ Sera publié dans {value.length} résidence{value.length > 1 ? 's' : ''}
        </Typography>
      )}

      {value.length === 0 && required && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          ⚠️ Sélectionnez au moins une résidence pour publier
        </Typography>
      )}

      {error && helperText && (
        <FormHelperText error sx={{ mt: 1 }}>{helperText}</FormHelperText>
      )}
      
      {!error && helperText && (
        <FormHelperText sx={{ mt: 1 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
} 