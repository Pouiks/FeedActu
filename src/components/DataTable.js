import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  TextField, Paper, Chip, Box, Typography, IconButton, Menu, MenuItem
} from '@mui/material';
import { MoreVert, Publish, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { userResidenceMapping } from '../userResidenceMapping';

export default function DataTable({ 
  title, 
  data = [], 
  columns = [], 
  onRowClick,
  // NOUVEAU : Actions par ligne
  onPublishDraft,
  onEditItem,
  onDeleteItem,
  showActions = false 
}) {
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  // Fonction utilitaire pour récupérer le nom d'une résidence par son ID
  const getResidenceName = (residenceId) => {
    // Parcourir le mapping pour trouver le nom de la résidence
    for (const userEmail in userResidenceMapping) {
      const residences = userResidenceMapping[userEmail];
      const residence = residences.find(r => r.residenceId === residenceId);
      if (residence) {
        return residence.residenceName;
      }
    }
    // Fallback: afficher les derniers caractères de l'ID
    return `Résidence ${residenceId.slice(-4)}`;
  };

  const handleSort = (columnId) => {
    if (orderBy === columnId) {
      setOrderDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(columnId);
      setOrderDirection('asc');
    }
  };

  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item, navigate);
    }
  };

  const handleActionsClick = (event, item) => {
    event.stopPropagation(); // Empêcher le clic sur la ligne
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handlePublishDraft = () => {
    if (onPublishDraft && selectedItem) {
      onPublishDraft(selectedItem);
    }
    handleActionsClose();
  };

  const handleEdit = () => {
    if (onEditItem && selectedItem) {
      onEditItem(selectedItem);
    }
    handleActionsClose();
  };

  const handleDelete = () => {
    if (onDeleteItem && selectedItem) {
      onDeleteItem(selectedItem);
    }
    handleActionsClose();
  };

  // Ajouter la colonne Actions si nécessaire
  const effectiveColumns = useMemo(() => {
    if (!showActions) return columns;
    
    return [
      ...columns,
      { id: 'actions', label: 'Actions', sortable: false, searchable: false }
    ];
  }, [columns, showActions]);

  const formatCellValue = (item, column) => {
    const value = item[column.id];
    
    // NOUVEAU : Actions pour les brouillons
    if (column.id === 'actions') {
      return (
        <IconButton
          size="small"
          onClick={(e) => handleActionsClick(e, item)}
          sx={{ ml: 1 }}
        >
          <MoreVert />
        </IconButton>
      );
    }
    
    if (!value) return '-';

    // Formatage des résidences de publication - NOUVELLE FONCTIONNALITÉ
    if (column.id === 'targetResidences' && Array.isArray(value)) {
      if (value.length === 0) return '-';
      
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
          {value.map((residenceId, index) => {
            const residenceName = getResidenceName(residenceId);
            
            return (
              <Chip 
                key={`${residenceId}-${index}`}
                label={residenceName}
                size="small"
                color="info"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            );
          })}
          {value.length > 3 && (
            <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center', ml: 0.5 }}>
              +{value.length - 3}
            </Typography>
          )}
        </Box>
      );
    }

    // Formatage alternatif si on utilise targetResidenceNames directement
    if (column.id === 'targetResidenceNames' && Array.isArray(value)) {
      if (value.length === 0) return '-';
      
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
          {value.slice(0, 3).map((residenceName, index) => (
            <Chip 
              key={`${residenceName}-${index}`}
              label={residenceName}
              size="small"
              color="info"
              variant="outlined"
              sx={{ 
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          ))}
          {value.length > 3 && (
            <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center', ml: 0.5 }}>
              +{value.length - 3}
            </Typography>
          )}
        </Box>
      );
    }

    // Formatage des statuts avec chips colorés
    if (column.id === 'status') {
      const getStatusColor = (status) => {
        switch (status) {
          case 'Publié': return 'success';
          case 'Brouillon': return 'warning';
          case 'Archivé': return 'default';
          case 'Programmé': return 'info';
          default: return 'default';
        }
      };

      return (
        <Chip 
          label={value} 
          color={getStatusColor(value)}
          size="small"
          variant="outlined"
        />
      );
    }

    // Formatage des priorités avec couleurs
    if (column.id === 'priority') {
      const getPriorityColor = (priority) => {
        switch (priority) {
          case 'low': return 'default';
          case 'normal': return 'info';
          case 'high': return 'warning';
          case 'urgent': return 'error';
          case 'critical': return 'error';
          default: return 'default';
        }
      };

      const getPriorityLabel = (priority) => {
        switch (priority) {
          case 'low': return 'Faible';
          case 'normal': return 'Normale';
          case 'high': return 'Élevée';
          case 'urgent': return 'Urgente';
          case 'critical': return 'Critique';
          default: return priority;
        }
      };

      return (
        <Chip 
          label={getPriorityLabel(value)} 
          color={getPriorityColor(value)}
          size="small"
          variant="filled"
        />
      );
    }

    // Formatage des types d'alertes
    if (column.id === 'type') {
      const getTypeColor = (type) => {
        switch (type) {
          case 'maintenance': return 'warning';
          case 'security': return 'error';
          case 'weather': return 'info';
          case 'water': return 'primary';
          case 'other': return 'default';
          default: return 'default';
        }
      };

      const getTypeLabel = (type) => {
        switch (type) {
          case 'maintenance': return 'Maintenance';
          case 'security': return 'Sécurité';
          case 'weather': return 'Météo';
          case 'water': return 'Eau/Gaz/Élec.';
          case 'other': return 'Autre';
          default: return type;
        }
      };

      return (
        <Chip 
          label={getTypeLabel(value)} 
          color={getTypeColor(value)}
          size="small"
          variant="outlined"
        />
      );
    }

    // Formatage des catégories avec couleurs
    if (column.id === 'category') {
      const getCategoryColor = (category) => {
        switch (category) {
          case 'info': return 'info';
          case 'event': return 'primary';
          case 'urgent': return 'error';
          default: return 'default';
        }
      };

      const getCategoryLabel = (category) => {
        switch (category) {
          case 'info': return 'Information';
          case 'event': return 'Événement';
          case 'urgent': return 'Urgent';
          default: return category;
        }
      };

      return (
        <Chip 
          label={getCategoryLabel(value)} 
          color={getCategoryColor(value)}
          size="small"
          variant="filled"
        />
      );
    }

    // Formatage des dates
    if (column.id.includes('Date') && column.id !== 'eventDate') {
      try {
        const date = new Date(value);
        return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
      } catch {
        return value;
      }
    }

    // Formatage de la date d'événement (sans heure)
    if (column.id === 'eventDate') {
      try {
        const date = new Date(value);
        return format(date, 'dd/MM/yyyy', { locale: fr });
      } catch {
        return value;
      }
    }

    // Formatage des heures
    if (column.id === 'startTime' || column.id === 'endTime') {
      return value;
    }

    // Contenu HTML (messages, questions) avec aperçu
    if (column.id === 'message' || column.id === 'question') {
      const cleanText = value.replace(/<[^>]*>/g, '');
      const truncated = cleanText.length > 80 ? cleanText.substring(0, 80) + '...' : cleanText;
      
      return (
        <Box sx={{ maxWidth: 300 }}>
          <Typography variant="body2" noWrap title={cleanText}>
            {truncated}
          </Typography>
        </Box>
      );
    }

    // URLs d'images avec aperçu
    if (column.id === 'imageUrl' && value) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src={value} 
            alt="Aperçu" 
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <Typography variant="caption" color="textSecondary">
            Image
          </Typography>
        </Box>
      );
    }

    // Nombres avec formatage
    if (column.id === 'maxParticipants' && value) {
      return `${value} max`;
    }

    return value;
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      return effectiveColumns.some(col => {
        if (col.searchable && item[col.id]) {
          const searchValue = item[col.id].toString().toLowerCase();
          return searchValue.includes(searchQuery.toLowerCase());
        }
        return false;
      });
    });
  }, [data, effectiveColumns, searchQuery]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, orderBy, orderDirection]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>

      {effectiveColumns.some(col => col.searchable) && (
        <TextField
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {effectiveColumns.map(col => (
                <TableCell key={col.id}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? orderDirection : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map(item => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item)}
                sx={{ 
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  } : {}
                }}
              >
                {effectiveColumns.map(col => (
                  <TableCell key={col.id}>
                    {formatCellValue(item, col)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu d'actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
      >
        {selectedItem?.status === 'Brouillon' && onPublishDraft && (
          <MenuItem onClick={handlePublishDraft}>
            <Publish sx={{ mr: 1 }} />
            Publier maintenant
          </MenuItem>
        )}
        {onEditItem && (
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
        )}
        {onDeleteItem && (
          <MenuItem onClick={handleDelete}>
            <Delete sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
}
