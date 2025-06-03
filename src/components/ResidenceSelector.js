import React, { useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';

export default function ResidenceSelector() {
  const { authorizedResidences, residenceId } = useAuth();
  const { currentResidenceId, setCurrentResidenceId } = useResidence();

  // Initialiser le ResidenceContext avec la résidence de l'AuthContext
  useEffect(() => {
    if (residenceId && !currentResidenceId) {
      setCurrentResidenceId(residenceId);
    }
  }, [residenceId, currentResidenceId, setCurrentResidenceId]);

  const handleResidenceChange = (event) => {
    setCurrentResidenceId(event.target.value);
  };

  if (!authorizedResidences || authorizedResidences.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="error">
          Aucune résidence autorisée
        </Typography>
      </Box>
    );
  }

  if (authorizedResidences.length === 1) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Résidence :
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {authorizedResidences[0].residenceName}
        </Typography>
      </Box>
    );
  }

  const currentResidence = authorizedResidences.find(
    res => res.residenceId === currentResidenceId
  );

  return (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Résidence active</InputLabel>
        <Select
          value={currentResidenceId || ''}
          onChange={handleResidenceChange}
          label="Résidence active"
        >
          {authorizedResidences.map((residence) => (
            <MenuItem key={residence.residenceId} value={residence.residenceId}>
              {residence.residenceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="textSecondary">
          {authorizedResidences.length} résidence(s) autorisée(s)
        </Typography>
        {currentResidence && (
          <Chip 
            label="Actif" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
} 