import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Button,
  Grid,
  Collapse,
  IconButton,
  Autocomplete,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

const CalendarFilters = ({ events, onFiltersChange, onResetFilters }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    status: [],
    dateRange: {
      start: null,
      end: null
    },
    locations: [],
    recurrence: [],
    hasDocument: null,
    hasParticipantLimit: null
  });

  // Extraire les valeurs uniques des événements pour les autocompletes
  const uniqueLocations = [...new Set(events.filter(e => e.location).map(e => e.location))];
  const statusOptions = ['Publié', 'Programmé', 'Brouillon', 'Archivé'];
  const recurrenceOptions = [
    { value: 'none', label: 'Événement unique' },
    { value: 'daily', label: 'Récurrence quotidienne' },
    { value: 'weekly', label: 'Récurrence hebdomadaire' },
    { value: 'monthly', label: 'Récurrence mensuelle' }
  ];

  // Compteur de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText.trim()) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.locations.length > 0) count++;
    if (filters.recurrence.length > 0) count++;
    if (filters.hasDocument !== null) count++;
    if (filters.hasParticipantLimit !== null) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Mettre à jour les filtres
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Gérer la recherche textuelle
  const handleSearchChange = (event) => {
    const newFilters = {
      ...filters,
      searchText: event.target.value
    };
    updateFilters(newFilters);
  };

  // Gérer les filtres de statut
  const handleStatusChange = (status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    const newFilters = {
      ...filters,
      status: newStatus
    };
    updateFilters(newFilters);
  };

  // Gérer les plages de dates
  const handleDateRangeChange = (field, value) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    };
    updateFilters(newFilters);
  };

  // Gérer les filtres de lieu
  const handleLocationsChange = (event, newValue) => {
    const newFilters = {
      ...filters,
      locations: newValue
    };
    updateFilters(newFilters);
  };

  // Gérer les filtres de récurrence
  const handleRecurrenceChange = (recurrenceValue) => {
    const newRecurrence = filters.recurrence.includes(recurrenceValue)
      ? filters.recurrence.filter(r => r !== recurrenceValue)
      : [...filters.recurrence, recurrenceValue];
    
    const newFilters = {
      ...filters,
      recurrence: newRecurrence
    };
    updateFilters(newFilters);
  };

  // Gérer les filtres booléens
  const handleBooleanFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: filters[field] === value ? null : value
    };
    updateFilters(newFilters);
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    const resetFilters = {
      searchText: '',
      status: [],
      dateRange: {
        start: null,
        end: null
      },
      locations: [],
      recurrence: [],
      hasDocument: null,
      hasParticipantLimit: null
    };
    setFilters(resetFilters);
    onResetFilters();
    setExpanded(false);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2, 
          overflow: 'hidden',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Header des filtres */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon color="primary" />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Filtres avancés
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} actif${activeFiltersCount > 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {activeFiltersCount > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleResetFilters}
                size="small"
                color="error"
                variant="outlined"
              >
                Réinitialiser
              </Button>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Barre de recherche toujours visible */}
        <Box sx={{ p: 2, pb: expanded ? 1 : 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un événement..."
            value={filters.searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
              endAdornment: filters.searchText && (
                <IconButton
                  onClick={() => updateFilters({ ...filters, searchText: '' })}
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>

        {/* Filtres avancés (collapsibles) */}
        <Collapse in={expanded}>
          <Box sx={{ p: 2, pt: 0 }}>
            <Grid container spacing={3}>
              
              {/* Filtres par statut */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Statut des événements
                </Typography>
                <FormGroup row>
                  {statusOptions.map((status) => (
                    <FormControlLabel
                      key={status}
                      control={
                        <Checkbox
                          checked={filters.status.includes(status)}
                          onChange={() => handleStatusChange(status)}
                          sx={{ 
                            color: getStatusColor(status),
                            '&.Mui-checked': {
                              color: getStatusColor(status)
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(status)
                            }}
                          />
                          {status}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* Plage de dates */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Période
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="Date de début"
                      value={filters.dateRange.start}
                      onChange={(value) => handleDateRangeChange('start', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="Date de fin"
                      value={filters.dateRange.end}
                      onChange={(value) => handleDateRangeChange('end', value)}
                      minDate={filters.dateRange.start}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Filtres par lieu */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Lieux
                </Typography>
                <Autocomplete
                  multiple
                  options={uniqueLocations}
                  value={filters.locations}
                  onChange={handleLocationsChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Sélectionner des lieux..."
                      size="small"
                    />
                  )}
                />
              </Grid>

              {/* Filtres par récurrence */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Type de récurrence
                </Typography>
                <FormGroup>
                  {recurrenceOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={filters.recurrence.includes(option.value)}
                          onChange={() => handleRecurrenceChange(option.value)}
                          size="small"
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* Filtres avancés */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Filtres avancés
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasDocument === true}
                            onChange={() => handleBooleanFilterChange('hasDocument', true)}
                            size="small"
                          />
                        }
                        label="Avec document PDF"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasDocument === false}
                            onChange={() => handleBooleanFilterChange('hasDocument', false)}
                            size="small"
                          />
                        }
                        label="Sans document PDF"
                      />
                    </FormGroup>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasParticipantLimit === true}
                            onChange={() => handleBooleanFilterChange('hasParticipantLimit', true)}
                            size="small"
                          />
                        }
                        label="Avec limite de participants"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasParticipantLimit === false}
                            onChange={() => handleBooleanFilterChange('hasParticipantLimit', false)}
                            size="small"
                          />
                        }
                        label="Sans limite de participants"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          </Box>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default CalendarFilters; 