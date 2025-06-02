import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Stack, FormControlLabel, 
  Checkbox, Alert, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';
import RichTextEditor from './RichTextEditor';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '1000px',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export default function ModalPublicationForm({ open, handleClose, onSubmit, entityName, fields, initialValues = {} }) {
  const [formData, setFormData] = useState({});
  const [pollAnswers, setPollAnswers] = useState(['']);
  const [publishLater, setPublishLater] = useState(false);
  const [publishDateTime, setPublishDateTime] = useState(new Date());
  const [errors, setErrors] = useState({});

  // Initialiser le formulaire avec les valeurs initiales quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
    }
  }, [open, initialValues]);

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Nettoyer l'erreur quand l'utilisateur corrige
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleAddPollAnswer = () => {
    setPollAnswers(prev => [...prev, '']);
  };

  const handlePollAnswerChange = (index, value) => {
    const newAnswers = [...pollAnswers];
    newAnswers[index] = value;
    setPollAnswers(newAnswers);
  };

  const removePollAnswer = (index) => {
    if (pollAnswers.length > 1) {
      const newAnswers = pollAnswers.filter((_, i) => i !== index);
      setPollAnswers(newAnswers);
    }
  };

  // Validation des champs requis
  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} est requis`;
      }
    });

    // Validation spéciale pour les réponses de sondage
    if (fields.some(f => f.type === 'pollAnswers')) {
      const validAnswers = pollAnswers.filter(answer => answer.trim() !== '');
      if (validAnswers.length < 2) {
        newErrors.pollAnswers = 'Au moins 2 réponses sont requises';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isDateValid = () => {
    if (!publishLater) return true;
    return publishDateTime >= new Date();
  };

  const handleSave = (status) => {
    if (!validateForm()) return;

    const finalPublicationDate = publishLater ? publishDateTime.toISOString() : new Date().toISOString();

    const newItem = {
      ...formData,
      ...(fields.some(f => f.type === 'pollAnswers') && { 
        answers: pollAnswers.filter(answer => answer.trim() !== '') 
      }),
      publicationDate: finalPublicationDate,
      status,
      createdAt: new Date().toISOString()
    };

    console.log('Submitting:', newItem);

    onSubmit(newItem);
    handleClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData(initialValues);
    setPollAnswers(['']);
    setPublishLater(false);
    setPublishDateTime(new Date());
    setErrors({});
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        return (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            placeholder={field.placeholder}
            multiline={field.multiline}
            rows={field.rows || 1}
            fullWidth
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth required={field.required} error={!!errors[field.name]}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={field.label}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors[field.name]}
              </Typography>
            )}
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label={field.label}
              value={formData[field.name] || null}
              onChange={(newValue) => handleChange(field.name, newValue)}
              slotProps={{ 
                textField: { 
                  required: field.required,
                  error: !!errors[field.name],
                  helperText: errors[field.name],
                  fullWidth: true
                }
              }}
              disablePast={field.disablePast}
            />
          </LocalizationProvider>
        );

      case 'time':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TimePicker
              label={field.label}
              value={formData[field.name] || null}
              onChange={(newValue) => handleChange(field.name, newValue)}
              slotProps={{ 
                textField: { 
                  required: field.required,
                  error: !!errors[field.name],
                  helperText: errors[field.name],
                  fullWidth: true
                }
              }}
              ampm={false}
            />
          </LocalizationProvider>
        );

      case 'datetime':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label={field.label}
              value={formData[field.name] || new Date()}
              onChange={(newValue) => handleChange(field.name, newValue)}
              slotProps={{ 
                textField: { 
                  required: field.required,
                  error: !!errors[field.name],
                  helperText: errors[field.name],
                  fullWidth: true
                }
              }}
              ampm={false}
              disablePast={field.disablePast}
            />
          </LocalizationProvider>
        );

      case 'wysiwyg':
        return (
          <div key={field.name}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </Typography>
            <RichTextEditor
              value={formData[field.name] || ''}
              onChange={(content) => handleChange(field.name, content)}
            />
            {errors[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors[field.name]}
              </Typography>
            )}
          </div>
        );

      case 'pollAnswers':
        return (
          <div key={field.name}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </Typography>
            {pollAnswers.map((answer, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label={`Réponse ${index + 1}`}
                  value={answer}
                  onChange={(e) => handlePollAnswerChange(index, e.target.value)}
                  fullWidth
                  size="small"
                />
                {pollAnswers.length > 1 && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removePollAnswer(index)}
                    sx={{ ml: 1, minWidth: 'auto' }}
                  >
                    ✕
                  </Button>
                )}
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={handleAddPollAnswer}>
              Ajouter une réponse
            </Button>
            {errors.pollAnswers && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.pollAnswers}
              </Typography>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-publication-title"
    >
      <Box sx={style}>
        <Typography id="modal-publication-title" variant="h6" component="h2" gutterBottom>
          Nouveau {entityName}
        </Typography>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Veuillez corriger les erreurs avant de continuer
          </Alert>
        )}

        <Stack spacing={2}>
          {fields.map(renderField)}

          <FormControlLabel
            control={
              <Checkbox
                checked={publishLater}
                onChange={(e) => setPublishLater(e.target.checked)}
              />
            }
            label="Publier plus tard"
          />

          {publishLater && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DateTimePicker
                label="Date et heure de publication"
                value={publishDateTime}
                onChange={(newValue) => setPublishDateTime(newValue)}
                disablePast
                ampm={false}
                slotProps={{ 
                  textField: { 
                    required: true,
                    helperText: "Doit être dans le futur",
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          )}

          {!isDateValid() && (
            <Typography color="error">La date et l'heure doivent être postérieures à maintenant.</Typography>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => handleSave('Brouillon')}>
              Enregistrer comme Brouillon
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSave('Publié')}
              disabled={publishLater && !isDateValid()}
            >
              Publier
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
