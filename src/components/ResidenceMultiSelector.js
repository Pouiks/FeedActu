import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText,
  Box,
  Chip,
  Typography
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';

export default function ResidenceMultiSelector({ 
  value = [], 
  onChange, 
  label = "Résidences cibles",
  required = false,
  error = false,
  helperText = ""
}) {
  const { authorizedResidences } = useAuth();
  const { selectedResidenceIds, setSelectedResidenceIds } = useResidence();

  const currentValue = value.length > 0 ? value : selectedResidenceIds;

  const handleChange = (event) => {
    const selectedIds = event.target.value;
    setSelectedResidenceIds(selectedIds);
    if (onChange) {
      onChange(selectedIds);
    }
  };

  if (!authorizedResidences || authorizedResidences.length === 0) {
    return null;
  }

  return (
    <FormControl fullWidth margin="normal" required={required} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={currentValue}
        onChange={handleChange}
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((id) => {
              const residence = authorizedResidences.find(r => r.residenceId === id);
              return (
                <Chip 
                  key={id} 
                  label={residence?.residenceName || id} 
                  size="small" 
                />
              );
            })}
          </Box>
        )}
      >
        {authorizedResidences.map((residence) => (
          <MenuItem key={residence.residenceId} value={residence.residenceId}>
            <Checkbox checked={currentValue.indexOf(residence.residenceId) > -1} />
            <ListItemText primary={residence.residenceName} />
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ mt: 0.5, ml: 2 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
} 