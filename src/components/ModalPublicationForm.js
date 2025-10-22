import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Stack, FormControlLabel, 
  Checkbox, Alert, MenuItem, FormControl, InputLabel, Select, Input
} from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';
import RichTextEditor from './RichTextEditor';
import ResidenceTagSelector from './ResidenceTagSelector';
import MobilePreview from './MobilePreview';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import { PublicationLogger } from '../utils/publicationLogger';
import { normalizeStatus, statusToEnglish } from '../utils/publicationStatus';
import { useErrorHandler } from '../utils/errorHandler';

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

// Fonction pour construire le payload selon le contrat d'interface
const buildContractPayload = (entityName, context) => {
  const { 
    formData, 
    pollAnswers, 
    finalSecureResidences, 
    status
  } = context;

  // Format datetime pour le contrat : yyyy-MM-dd HH:mm:ss
  const formatDateTime = (date) => {
    if (!date) return undefined;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Champs communs à tous les types selon le nouveau contrat
  const basePayload = {
    residenceIds: finalSecureResidences,
    status: statusToEnglish(normalizeStatus(status))
  };

  // Note: processImageField supprimé car non utilisé dans le nouveau contrat

  // Construction spécifique par type selon le nouveau contrat d'API
  switch (entityName.toLowerCase()) {
    case 'post':
      return {
        ...basePayload,
        title: formData.title || '',
        messageHtml: formData.message || '',
        categoryId: formData.categoryId || 'CAT-001',
        imagesBase64: formData.imagesBase64 || [],
        publishAt: formatDateTime(formData.publishAt || new Date())
      };

    case 'sondage':
      return {
        ...basePayload,
        question: formData.question || '',
        options: pollAnswers?.filter(answer => answer.trim() !== '') || [],
        allowMultiple: formData.allowMultiple || false,
        answerDeadline: formData.answerDeadline ? formatDateTime(formData.answerDeadline) : undefined,
        imagesBase64: formData.imagesBase64 || [],
        publishAt: formatDateTime(formData.publishAt || new Date())
      };

    case 'événement':
      return {
        ...basePayload,
        title: formData.title || '',
        descriptionHtml: formData.description || '',
        startAt: formatDateTime(formData.startAt),
        endAt: formatDateTime(formData.endAt),
        location: formData.location || '',
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        imagesBase64: formData.imagesBase64 || [],
        publishAt: formatDateTime(formData.publishAt || new Date())
      };

    case 'message du jour':
      return {
        ...basePayload,
        title: formData.title || '',
        messageHtml: formData.message || '',
        priorityId: formData.priorityId || 'PRIO-001',
        publishAt: formatDateTime(formData.publishAt || new Date())
      };

    case 'alerte':
      return {
        ...basePayload,
        title: formData.title || '',
        messageHtml: formData.message || '',
        alertTypeId: formData.alertTypeId || 'ALERT-TYPE-001',
        priorityId: formData.priorityId || 'PRIO-001',
        publishAt: formatDateTime(formData.publishAt || new Date())
      };

    default:
      // Fallback : garder la structure actuelle
      return {
        ...basePayload,
        ...formData
      };
  }
};

export default function ModalPublicationForm({ 
  open = false, 
  handleClose = () => {}, 
  onSubmit = () => {}, 
  entityName = '', 
  fields = [], 
  initialValues = {},
  isEditing = false // NOUVEAU : Mode édition
}) {
  const { authorizedResidences, user } = useAuth();
  const { currentResidenceId } = useResidence();
  // useErrorHandler supprimé car non utilisé dans cette version
  const [formData, setFormData] = useState({});
  const [pollAnswers, setPollAnswers] = useState(['']);
  const [publishLater, setPublishLater] = useState(false);
  const [publishDateTime, setPublishDateTime] = useState(new Date());
  const [selectedResidences, setSelectedResidences] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFirstOpen = useRef(true);
  // États des DatePickers supprimés - laissons les composants gérer leur état naturellement

  // Modifier le titre du modal selon le mode
  const modalTitle = isEditing 
    ? `Modifier ${entityName.toLowerCase()}`
    : `Créer un nouveau ${entityName.toLowerCase()}`;

  // Validation de sécurité pour les résidences
  const validateResidencesSecurity = (residenceIds) => {
    if (!authorizedResidences || !residenceIds || residenceIds.length === 0) {
      return [];
    }
    
    const authorizedIds = authorizedResidences.map(res => res.residenceId);
    const validIds = residenceIds.filter(id => authorizedIds.includes(id));
    
    if (validIds.length !== residenceIds.length) {
      console.warn('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées détectée');
    }
    
    return validIds;
  };

  // Initialiser le formulaire avec les valeurs initiales quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      // Ne réinitialiser que si c'est la première ouverture ou si le modal était fermé
      if (isFirstOpen.current || !formData || Object.keys(formData).length === 0) {
        // Tenter de charger un brouillon existant
        let loadedFromDraft = false;
        
        if (entityName && user?.userId) {
          const draftKey = `draft_${entityName}_${user.userId}`;
          const savedDraft = localStorage.getItem(draftKey);
          
          if (savedDraft) {
            try {
              const draftData = JSON.parse(savedDraft);
              const timeDiff = Date.now() - draftData.lastSaved;
              
              // Si le brouillon a moins de 24h, le restaurer
              if (timeDiff < 24 * 60 * 60 * 1000) {
                setFormData(draftData);
                setSelectedResidences(draftData.selectedResidences || []);
                setPublishLater(draftData.publishLater || false);
                if (draftData.publishDateTime) {
                  setPublishDateTime(new Date(draftData.publishDateTime));
                }
                if (draftData.pollAnswers) {
                  setPollAnswers(draftData.pollAnswers);
                }
                loadedFromDraft = true;
                console.log('📄 Brouillon restauré silencieusement');
              }
            } catch (error) {
              console.warn('Erreur lors du chargement du brouillon:', error);
            }
          }
        }
        
        // Si pas de brouillon, initialiser normalement
        if (!loadedFromDraft) {
          const initialData = { ...initialValues };
          
          console.log('📅 DEBUG - initialValues reçues:', initialValues);
          console.log('📅 DEBUG - initialData avant traitement:', initialData);
          
          // Initialiser automatiquement les champs daterange
          fields.forEach(field => {
            if (field.type === 'daterange') {
              // Vérifier d'abord si des valeurs initiales existent
              const startKey = `${field.name}Start`;
              const endKey = `${field.name}End`;
              
              console.log(`🔍 Initialisation ${field.name}: startKey=${startKey}, endKey=${endKey}`);
              console.log(`🔍 Valeurs initiales: start=${initialData[startKey]}, end=${initialData[endKey]}`);
              
              if (!initialData[startKey] && !initialData[endKey]) {
                // Seulement si aucune valeur initiale n'est fournie, utiliser des valeurs par défaut
                const now = new Date();
                const endTime = new Date();
                endTime.setHours(endTime.getHours() + 1); // +1h par défaut
                
                initialData[startKey] = now;
                initialData[endKey] = endTime;
                
                console.log('📅 Aucune valeur initiale trouvée, utilisation des valeurs par défaut');
              } else {
                console.log('📅 Valeurs initiales trouvées, conservation des valeurs existantes');
              }
            }
            
            // Pour les champs datetime requis sans valeur initiale en mode création
            if (field.type === 'datetime' && field.required && !isEditing && !initialData[field.name]) {
              initialData[field.name] = new Date();
            }
          });
          
          console.log('📅 DEBUG - initialData après traitement:', initialData);
          setFormData(initialData);
          
          // NOUVEAU : Pour l'édition, pré-remplir les résidences et autres champs
          if (isEditing && initialValues) {
            if (initialValues.targetResidences) {
              setSelectedResidences(initialValues.targetResidences);
            }
            if (initialValues.publishLater) {
              setPublishLater(initialValues.publishLater);
            }
            if (initialValues.publishDateTime) {
              setPublishDateTime(new Date(initialValues.publishDateTime));
            }
            if (initialValues.answers) {
              setPollAnswers(initialValues.answers);
            }
            // Assurer que tous les champs sont pré-remplis avec les valeurs existantes
            Object.keys(initialValues).forEach(key => {
              if (!initialData.hasOwnProperty(key)) {
                initialData[key] = initialValues[key];
              }
            });
          } else {
            // Auto-sélection intelligente des résidences (mode création uniquement)
            if (authorizedResidences?.length === 1) {
              setSelectedResidences([authorizedResidences[0].residenceId]);
            } else if (currentResidenceId && authorizedResidences?.some(r => r.residenceId === currentResidenceId)) {
              // Pré-sélectionner la résidence active si elle est autorisée
              setSelectedResidences([currentResidenceId]);
              console.log('🏠 DEBUG - Pré-sélection résidence active:', currentResidenceId);
            } else {
              setSelectedResidences([]);
            }
          }
        }
        
        isFirstOpen.current = false;
      }
    } else {
      // Reset quand le modal se ferme pour la prochaine ouverture
      isFirstOpen.current = true;
    }
  }, [open, authorizedResidences, entityName, user, currentResidenceId, fields, formData, initialValues, isEditing]);

  const handleChange = (fieldName, value) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);
    
    // Auto-sauvegarde silencieuse du brouillon
    if (open && entityName && user?.userId) {
      const draftKey = `draft_${entityName}_${user.userId}`;
      const draftData = {
        ...updatedData,
        selectedResidences,
        publishLater,
        publishDateTime: publishDateTime.toISOString(),
        pollAnswers: pollAnswers,
        lastSaved: Date.now()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
    
    // Nettoyer l'erreur quand l'utilisateur corrige
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleResidenceChange = (newResidences) => {
    // Validation de sécurité avant mise à jour
    const secureResidences = validateResidencesSecurity(newResidences);
    setSelectedResidences(secureResidences);
    
    // Nettoyer l'erreur de résidences
    if (errors.residences) {
      setErrors(prev => ({ ...prev, residences: null }));
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
    
    console.log('🔍 Validation des champs...');
    console.log('🔍 DEBUG - formData:', formData);
    console.log('🔍 DEBUG - selectedResidences:', selectedResidences);
    console.log('🔍 DEBUG - fields:', fields);
    
    // Validation des champs de formulaire (sauf pollAnswers qui a sa propre validation)
    fields.forEach(field => {
      // Skip pollAnswers car ils ont leur propre validation spéciale
      if (field.type === 'pollAnswers') {
        return;
      }
      
      // Vérifier si le champ doit être affiché avant de le valider
      if (!shouldShowField(field)) {
        return;
      }
      
      // Validation spéciale pour daterange
      if (field.type === 'daterange') {
        if (field.required) {
          const startValue = formData[`${field.name}Start`];
          const endValue = formData[`${field.name}End`];
          
          console.log(`🔍 DEBUG - Daterange ${field.name}: start=${startValue}, end=${endValue}`);
          
          if (!startValue || !endValue) {
            newErrors[field.name] = `${field.label} est requis`;
          } else if (new Date(endValue) <= new Date(startValue)) {
            newErrors[field.name] = `L'heure de fin doit être après l'heure de début`;
          }
        }
        return;
      }
      
      // Validation normale des champs
      console.log(`🔍 DEBUG - Champ ${field.name} (${field.type}): required=${field.required}, value="${formData[field.name]}"`);
      
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} est requis`;
        console.log(`❌ Erreur: ${field.name} est requis mais vide`);
      }
    });

    // Validation spéciale pour les réponses de sondage
    if (fields.some(f => f.type === 'pollAnswers')) {
      const validAnswers = pollAnswers.filter(answer => answer.trim() !== '');
      
      console.log('🔍 DEBUG - pollAnswers:', pollAnswers, 'validAnswers:', validAnswers);
      
      if (validAnswers.length < 2) {
        newErrors.pollAnswers = 'Au moins 2 réponses sont requises';
      }
    }

    // Validation critique des résidences sélectionnées
    const secureResidences = validateResidencesSecurity(selectedResidences);
    
    console.log('🔍 DEBUG - Résidences: selected=', selectedResidences, 'secure=', secureResidences);
    
    if (secureResidences.length === 0) {
      newErrors.residences = 'Vous devez sélectionner au moins une résidence autorisée';
    } else if (secureResidences.length !== selectedResidences.length) {
      newErrors.residences = 'Certaines résidences sélectionnées ne sont pas autorisées';
    }
    
    console.log('🔍 DEBUG - newErrors AVANT setErrors:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 DEBUG - Validation result:', isValid);
    
    return isValid;
  };

  const isDateValid = () => {
    if (!publishLater) return true;
    return publishDateTime >= new Date();
  };

  const handleSave = async (status) => {
    if (isSubmitting) return; // Éviter les double-clics
    
    setIsSubmitting(true);
    
    try {
      const validationResult = validateForm();
      if (!validationResult) {
        console.warn('🚨 Validation échouée pour la publication');
        // Les erreurs détaillées sont déjà loggées dans validateForm()
        return;
      }
      
      console.log('✅ Validation réussie, création de la publication...');

      // Validation finale de sécurité
      const finalSecureResidences = validateResidencesSecurity(selectedResidences);
      if (finalSecureResidences.length === 0) {
        console.error('🚨 SÉCURITÉ CRITIQUE: Aucune résidence autorisée pour la publication');
        setErrors({ residences: 'Erreur de sécurité: aucune résidence autorisée' });
        return;
      }

      // Utiliser la date de publication du formulaire si disponible, sinon la date actuelle
      const finalPublicationDate = publishLater 
        ? publishDateTime.toISOString() 
        : (formData.publicationDate ? new Date(formData.publicationDate).toISOString() : new Date().toISOString());

      console.log('📅 DEBUG - Gestion dates publication:', {
        publishLater,
        publishDateTime,
        formDataPublicationDate: formData.publicationDate,
        finalPublicationDate
      });

      // Note: baseItem supprimé car non utilisé dans le nouveau contrat

      // 🔧 NORMALISATION selon le contrat d'interface
      const contractPayload = buildContractPayload(entityName, {
        formData,
        fields,
        pollAnswers,
        publishLater,
        publishDateTime,
        finalSecureResidences,
        authorizedResidences,
        status,
        user
      });

      const newItem = contractPayload;

      // LOG SIMPLE demandé: tracer la tentative de publication/brouillon avec toutes les données
      const actionLabel = status === 'Publié' ? 'publish' : 'draft';
      const publicationType = entityName.toLowerCase();
      console.log('publication_submit', { type: publicationType, action: actionLabel, status, payload: newItem });

      // 📋 Log de préparation avec TOUS les champs
      const userContext = { user, authorizedResidences };
      PublicationLogger.logPublication(publicationType, newItem, 'PREPARING', userContext);

      // 🚀 Exécution simplifiée pour débugger
      console.log('🔍 DEBUG - Tentative d\'appel onSubmit avec newItem:', newItem);
      
      try {
        const result = await onSubmit(newItem);
        console.log('✅ onSubmit réussi, résultat:', result);
        
        handleClose();
        resetForm();
        
      } catch (submitError) {
        console.error('❌ Erreur dans onSubmit:', submitError);
        
        // Message d'erreur utilisateur friendly
        let friendlyMessage = 'Erreur lors de la création du sondage';
        
        if (submitError.message) {
          friendlyMessage = submitError.message;
        } else if (typeof submitError === 'string') {
          friendlyMessage = submitError;
        }
        
        setErrors({ 
          submit: friendlyMessage 
        });
      }

    } catch (error) {
      console.error(`❌ Erreur finale lors de la création du ${entityName}:`, error);
      
      // Message d'erreur utilisateur friendly
      let friendlyMessage = `Erreur lors de la création du ${entityName.toLowerCase()}`;
      
      if (error.message) {
        friendlyMessage = error.message;
      } else if (typeof error === 'string') {
        friendlyMessage = error;
      }
      
      setErrors({ 
        submit: friendlyMessage 
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialValues || {});
    setPollAnswers(['']);
    setPublishLater(false);
    setPublishDateTime(new Date());
    setSelectedResidences([]);
    setErrors({});
    
    // Nettoyer le brouillon après reset
    if (entityName && user?.userId) {
      const draftKey = `draft_${entityName}_${user.userId}`;
      localStorage.removeItem(draftKey);
    }
  };

  // Générer les données pour la preview mobile
  const getPreviewData = () => {
    const previewData = {
      ...formData,
      ...(fields.some(f => f.type === 'pollAnswers') && { 
        answers: pollAnswers.filter(answer => answer.trim() !== '') 
      }),
      publicationDate: publishLater ? publishDateTime.toISOString() : new Date().toISOString(),
      status: 'Aperçu'
    };
    
    return previewData;
  };

  // Ouvrir l'aperçu mobile
  const handlePreview = () => {
    // Validation basique avant preview
    if (!formData.title && !formData.question && !formData.message) {
      setErrors({ 
        ...errors,
        preview: 'Veuillez remplir au moins le titre, la question ou le message pour voir l\'aperçu' 
      });
      return;
    }
    
    // Nettoyer l'erreur de preview si elle existe
    if (errors.preview) {
      const { preview, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
    
    setPreviewOpen(true);
  };

  // Modifier les boutons selon le mode
  const renderActionButtons = () => {
    if (isEditing) {
      return (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleSave('Brouillon')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder comme Brouillon'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave('Publié')}
            disabled={(publishLater && !isDateValid()) || isSubmitting}
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier'}
          </Button>
        </Stack>
      );
    }

    // Boutons existants pour la création
    return (
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button 
          variant="text" 
          onClick={handlePreview}
          sx={{ mr: 'auto' }}
        >
          📱 Aperçu mobile
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => handleSave('Brouillon')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sauvegarde...' : 'Enregistrer comme Brouillon'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSave('Publié')}
          disabled={(publishLater && !isDateValid()) || isSubmitting}
        >
          {isSubmitting ? 'Publication en cours...' : `Publier${selectedResidences.length > 1 ? ` dans ${selectedResidences.length} résidences` : ''}`}
        </Button>
      </Stack>
    );
  };

  // Fonction pour vérifier si un champ doit être affiché (logique conditionnelle)
  const shouldShowField = (field) => {
    // En mode édition, toujours afficher les champs essentiels
    if (isEditing && ['category', 'publicationDate', 'title', 'message'].includes(field.name)) {
      return true;
    }
    
    // Vérifier les deux types de conditions possibles
    const conditionField = field.conditionalOn || field.showIf;
    if (!conditionField) return true;
    
    const refField = fields.find(f => f.name === conditionField);
    if (!refField) return true;
    
    // Pour les checkboxes, vérifier si elle est cochée
    if (refField.type === 'checkbox') {
      return formData[conditionField] === true;
    }
    
    // Pour les selects, vérifier si la valeur n'est pas 'none' ou vide
    if (refField.type === 'select') {
      const value = formData[conditionField];
      return value && value !== 'none' && value !== '';
    }
    
    return true;
  };

  const renderField = (field) => {
    // Vérifier si le champ doit être affiché
    if (!shouldShowField(field)) {
      return null;
    }

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

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={formData[field.name] || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
            sx={{ alignItems: 'flex-start', mt: 1 }}
          />
        );

      case 'image':
        return (
          <Box key={field.name}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </Typography>
            
            {/* Mode URL - TextField classique */}
            <TextField
              label="URL de l'image"
              type="url"
              value={formData[field.name]?.type === 'url' ? formData[field.name].url : typeof formData[field.name] === 'string' ? formData[field.name] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleChange(field.name, {
                    url: e.target.value,
                    type: 'url'
                  });
                } else {
                  handleChange(field.name, null);
                }
              }}
              placeholder={field.placeholder}
              fullWidth
              sx={{ mb: 1 }}
            />
            
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
              ou
            </Typography>
            
            {/* Mode Upload - Input file */}
            <Input
              type="file"
              inputProps={{ 
                accept: 'image/*',
                style: { padding: '8px 0' }
              }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Stocker le fichier avec ses métadonnées pour traitement ultérieur
                  const fileData = {
                    file: file,
                    url: URL.createObjectURL(file),
                    type: 'file',
                    name: file.name,
                    size: file.size
                  };
                  handleChange(field.name, fileData);
                  console.log('📎 Image locale sélectionnée:', file.name, file.size, 'bytes');
                }
              }}
              fullWidth
              sx={{ mb: 1 }}
            />
            
            {/* Aperçu de l'image */}
            {formData[field.name] && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" gutterBottom>
                  Aperçu {formData[field.name].type === 'file' ? '(fichier local)' : '(URL)'} :
                </Typography>
                <Box
                  component="img"
                  src={formData[field.name].url || formData[field.name]}
                  alt="Aperçu"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    display: 'block',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {formData[field.name].type === 'file' && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                    ✓ Fichier sélectionné: {formData[field.name].name} ({Math.round(formData[field.name].size / 1024)} KB)
                  </Typography>
                )}
              </Box>
            )}
            
            {errors[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors[field.name]}
              </Typography>
            )}
            {field.helperText && !errors[field.name] && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {field.helperText}
              </Typography>
            )}
          </Box>
        );

      case 'file':
        return (
          <Box key={field.name}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </Typography>
            <Input
              type="file"
              inputProps={{ 
                accept: field.accept || '*',
                style: { padding: '8px 0' }
              }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Pour l'instant, on stocke juste le nom du fichier
                  // Plus tard, ça sera géré par l'upload vers l'API
                  handleChange(field.name, file.name);
                  console.log('📎 Fichier sélectionné:', file.name, file.size, 'bytes');
                }
              }}
              fullWidth
              error={!!errors[field.name]}
            />
            {formData[field.name] && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                ✓ Fichier sélectionné: {formData[field.name]}
              </Typography>
            )}
            {errors[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors[field.name]}
              </Typography>
            )}
            {field.helperText && !errors[field.name] && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {field.helperText}
              </Typography>
            )}
          </Box>
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
              value={formData[field.name] ? new Date(formData[field.name]) : null}
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
              value={formData[field.name] ? new Date(formData[field.name]) : null}
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
              value={formData[field.name] ? new Date(formData[field.name]) : null}
              onChange={(newValue) => handleChange(field.name, newValue)}
              slotProps={{ 
                textField: { 
                  required: field.required,
                  error: !!errors[field.name],
                  helperText: errors[field.name] || field.helperText,
                  fullWidth: true
                }
              }}
              ampm={false}
              disablePast={field.disablePast}
            />
          </LocalizationProvider>
        );

      case 'daterange':
        return (
          <Box key={field.name}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
            </Typography>
            
            {/* Deux champs côte à côte */}
            <Stack direction="row" spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DateTimePicker
                  label="Heure de début"
                  value={formData[`${field.name}Start`] ? new Date(formData[`${field.name}Start`]) : new Date()}
                  onChange={(newValue) => {
                    handleChange(`${field.name}Start`, newValue);
                    // Auto-ajuster la fin si nécessaire
                    if (formData[`${field.name}End`] && newValue >= new Date(formData[`${field.name}End`])) {
                      const endTime = new Date(newValue);
                      endTime.setHours(endTime.getHours() + 1); // +1h par défaut
                      handleChange(`${field.name}End`, endTime);
                    }
                  }}
                  slotProps={{ 
                    textField: { 
                      required: field.required,
                      error: !!errors[field.name],
                      fullWidth: true
                    }
                  }}
                  ampm={false}
                  disablePast={field.disablePast}
                  format="dd/MM/yyyy HH:mm"
                />
              </LocalizationProvider>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DateTimePicker
                  label="Heure de fin"
                  value={formData[`${field.name}End`] ? new Date(formData[`${field.name}End`]) : (() => {
                    const defaultEnd = new Date();
                    defaultEnd.setHours(defaultEnd.getHours() + 1);
                    return defaultEnd;
                  })()}
                  onChange={(newValue) => handleChange(`${field.name}End`, newValue)}
                  slotProps={{
                    textField: { 
                      required: field.required,
                      error: !!errors[field.name],
                      fullWidth: true
                    }
                  }}
                  ampm={false}
                  disablePast={field.disablePast}
                  format="dd/MM/yyyy HH:mm"
                  minDateTime={formData[`${field.name}Start`] ? new Date(formData[`${field.name}Start`]) : undefined}
                />
              </LocalizationProvider>
            </Stack>
            
            {errors[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors[field.name]}
              </Typography>
            )}
            {field.helperText && !errors[field.name] && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {field.helperText}
              </Typography>
            )}
          </Box>
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

  // Protection contre les props manquants
  if (!entityName || !Array.isArray(fields)) {
    console.warn('ModalPublicationForm: Props manquants ou invalides', { entityName, fields });
    return null;
  }

  return (
    <>
      <Modal
        open={Boolean(open)}
        onClose={handleClose}
        aria-labelledby="modal-publication-title"
        disableEnforceFocus
        disableAutoFocus
      >
        <Box sx={style}>
          <Typography id="modal-publication-title" variant="h6" component="h2" gutterBottom>
            {modalTitle}
          </Typography>

          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Veuillez corriger les erreurs avant de continuer
              {errors.preview && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • {errors.preview}
                </Typography>
              )}
              {errors.submit && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • {errors.submit}
                </Typography>
              )}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Sélecteur de résidences en premier - CRITIQUE POUR LA SÉCURITÉ */}
            <ResidenceTagSelector
              value={selectedResidences}
              onChange={handleResidenceChange}
              label="Publier dans les résidences"
              required={true}
              error={!!errors.residences}
              helperText={errors.residences || "Sélectionnez les résidences où publier ce contenu"}
            />

            {fields.map((field, index) => renderField(field))}

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

            {renderActionButtons()}
          </Stack>
        </Box>
      </Modal>

      {/* Composant Preview Mobile - EN DEHORS du Modal principal */}
      {previewOpen && (
        <MobilePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={getPreviewData()}
          type={entityName}
        />
      )}
    </>
  );
}
