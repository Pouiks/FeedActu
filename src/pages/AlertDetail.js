import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Chip, Button, Stack } from '@mui/material';
import BackButton from '../components/BackButton';
import RichTextEditor from '../components/RichTextEditor';

// Données mockées (synchronisées avec Alerts.js)
const mockAlerts = [
  { 
    id: 1, 
    message: '<p><strong>🔧 Maintenance programmée</strong><br>Coupure électricité cage d\'escalier A demain de 8h à 10h. Éclairage de secours opérationnel.</p>', 
    type: 'maintenance', 
    priority: 'normal', 
    publicationDate: '2024-11-21T16:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    message: '<p><strong style="color: red;">🚨 ALERTE SÉCURITÉ</strong><br>Porte d\'entrée principale défaillante. Utilisez l\'entrée latérale. Réparation en cours.</p>', 
    type: 'security', 
    priority: 'critical', 
    publicationDate: '2024-11-22T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    message: '<p>⛈️ <strong>Alerte météo</strong><br>Vents violents prévus cette nuit (90 km/h). Sécurisez vos balcons et terrasses.</p>', 
    type: 'weather', 
    priority: 'high', 
    publicationDate: '2024-11-22T18:45:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    message: '<p>💧 <strong>Coupure d\'eau programmée</strong><br>Intervention sur le réseau principal vendredi 29/11 de 9h à 16h. Pensez à faire des réserves.</p>', 
    type: 'water', 
    priority: 'high', 
    publicationDate: '2024-11-25T10:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    message: '<p>📡 <strong>Perturbation réseau</strong><br>Problèmes d\'accès Internet signalés. Fournisseur prévenu, résolution en cours.</p>', 
    type: 'other', 
    priority: 'low', 
    publicationDate: '2024-11-20T11:15:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    message: '<p>🔐 <strong>Mise à jour vidéophone</strong><br>Test des nouveaux codes d\'accès ce weekend. En cas de problème, contactez le gardien.</p>', 
    type: 'security', 
    priority: 'normal', 
    publicationDate: '2024-11-19T09:30:00', 
    status: 'Archivé', 
    residence_id: '1' 
  },
  { 
    id: 7, 
    message: '<p>❄️ <strong>Alerte grand froid</strong><br>Températures négatives attendues. Pensez à protéger vos canalisations et à purger vos robinets extérieurs.</p>', 
    type: 'weather', 
    priority: 'normal', 
    publicationDate: '2024-12-01T07:00:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 8, 
    message: '<p>⚡ <strong>URGENT - Panne électrique</strong><br>Coupure généralisée bâtiment B. EDF intervient. Retour estimé dans 2h.</p>', 
    type: 'water', 
    priority: 'critical', 
    publicationDate: '2024-11-18T13:45:00', 
    status: 'Archivé', 
    residence_id: '1' 
  }
];

export default function AlertDetail() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simule la récupération de l'alerte par ID
    const foundAlert = mockAlerts.find(a => a.id === parseInt(id));
    if (foundAlert) {
      setAlert(foundAlert);
      setEditedAlert({ 
        message: foundAlert.message || ''
      });
    }
  }, [id]);

  // Vérifie si des modifications ont été faites
  useEffect(() => {
    if (!alert) return;
    
    const hasChanges = editedAlert.message !== alert.message;
    setIsDirty(hasChanges);
  }, [editedAlert, alert]);

  const handleFieldChange = (fieldName, value) => {
    setEditedAlert(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde de l\'alerte:', { ...alert, ...editedAlert });
    
    // Simule la sauvegarde
    const updatedAlert = { ...alert, ...editedAlert };
    setAlert(updatedAlert);
    setIsDirty(false);
    
    alert('Alerte sauvegardée avec succès !');
  };

  if (!alert) {
    return (
      <Box>
        <BackButton to="/alerts" label="Retour aux alertes" />
        <Typography>Alerte non trouvée</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Publié': return 'success';
      case 'Brouillon': return 'warning';
      case 'Archivé': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <BackButton to="/alerts" label="Retour aux alertes" />
      
      <Paper sx={{ p: 3, border: '2px solid #ff9800', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            🚨 Édition de l'alerte
          </Typography>
          <Chip 
            label={alert.status} 
            color={getStatusColor(alert.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Publié le : {new Date(alert.publicationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>

        <Stack spacing={3}>
          {/* Message d'alerte */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Message de l'alerte</Typography>
            <RichTextEditor
              value={editedAlert.message}
              onChange={(content) => handleFieldChange('message', content)}
            />
          </Box>

          {/* Bouton d'enregistrement */}
          {isDirty && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                size="large"
              >
                Enregistrer les modifications
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
} 