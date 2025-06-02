import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Stack, FormControlLabel, Checkbox
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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

export default function ModalPublicationForm({ open, handleClose, onSubmit, entityName, fields }) {
  const [formData, setFormData] = useState({});
  const [pollAnswers, setPollAnswers] = useState(['']);
  const [publishLater, setPublishLater] = useState(false);
  const [publishDateTime, setPublishDateTime] = useState(new Date());

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleAddPollAnswer = () => {
    setPollAnswers(prev => [...prev, '']);
  };

  const handlePollAnswerChange = (index, value) => {
    const newAnswers = [...pollAnswers];
    newAnswers[index] = value;
    setPollAnswers(newAnswers);
  };

  const isDateValid = () => {
    if (!publishLater) return true;
    return publishDateTime >= new Date();
  };

  const handleSave = (status) => {
    const finalPublicationDate = publishLater ? publishDateTime.toISOString() : new Date().toISOString();

    const newItem = {
      ...formData,
      ...(fields.some(f => f.type === 'pollAnswers') && { answers: pollAnswers }),
      publicationDate: finalPublicationDate,
      status
    };

    console.log('Submitting:', newItem);

    onSubmit(newItem);
    handleClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({});
    setPollAnswers(['']);
    setPublishLater(false);
    setPublishDateTime(new Date());
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

        <Stack spacing={2}>
          {fields.map(field => {
            if (field.type === 'text') {
              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              );
            }

            if (field.type === 'wysiwyg') {
              return (
                <div key={field.name}>
                  <Typography variant="subtitle1" gutterBottom>{field.label}</Typography>
                  <RichTextEditor
                    value={formData[field.name] || ''}
                    onChange={(content) => handleChange(field.name, content)}
                  />
                </div>
              );
            }

            if (field.type === 'datetime') {
              return (
                <LocalizationProvider key={field.name} dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={field.label}
                    value={formData[field.name] || new Date()}
                    onChange={(newValue) => handleChange(field.name, newValue)}
                    renderInput={(params) => <TextField {...params} required />}
                  />
                </LocalizationProvider>
              );
            }

            if (field.type === 'pollAnswers') {
              return (
                <div key={field.name}>
                  <Typography variant="subtitle1" gutterBottom>{field.label}</Typography>
                  {pollAnswers.map((answer, index) => (
                    <TextField
                      key={index}
                      label={`Réponse ${index + 1}`}
                      value={answer}
                      onChange={(e) => handlePollAnswerChange(index, e.target.value)}
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                  ))}
                  <Button variant="outlined" onClick={handleAddPollAnswer}>Ajouter une réponse</Button>
                </div>
              );
            }

            return null;
          })}

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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date et heure de publication"
                value={publishDateTime}
                onChange={(newValue) => setPublishDateTime(newValue)}
                disablePast
                renderInput={(params) => <TextField {...params} required />}
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
