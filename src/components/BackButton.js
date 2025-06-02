import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to, label = "Retour" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <IconButton 
        onClick={handleBack}
        sx={{ mr: 1 }}
        color="primary"
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={handleBack}>
        {label}
      </Typography>
    </Box>
  );
} 