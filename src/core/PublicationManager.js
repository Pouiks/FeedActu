/**
 * 🏗️ PUBLICATION MANAGER - FONCTION PRINCIPALE UNIFIÉE
 * 
 * Cette classe centralise TOUTE la logique de gestion des publications.
 * JAMAIS MODIFIER cette logique principale - seuls les templates peuvent changer.
 * 
 * ✅ Avantages :
 * - Code unifié et maintenable
 * - Logique de sécurité centralisée
 * - Gestion d'erreurs cohérente
 * - Extensibilité facile (nouveaux types)
 * - Tests centralisés
 */

import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../context/PublicationsContext';
import { normalizeStatus, statusToEnglish } from '../utils/publicationStatus';
import { PublicationLogger } from '../utils/publicationLogger';

/**
 * 📋 TEMPLATES DE PUBLICATION - Configuration par type
 */
export const PUBLICATION_TEMPLATES = {
  posts: {
    entityName: 'Post',
    apiEndpoint: 'posts',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Entrez le titre du post...' },
      { name: 'message', label: 'Message', type: 'wysiwyg', required: true },
      { name: 'imagesBase64', label: 'Images', type: 'images', required: false, helperText: 'Chargez des images pour le post' },
      { name: 'categoryId', label: 'Catégorie', type: 'select', required: true, options: [
        { value: 'CAT-001', label: 'Information' },
        { value: 'CAT-002', label: 'Événement' },
        { value: 'CAT-003', label: 'Urgent' },
        { value: 'CAT-004', label: 'Maintenance' },
        { value: 'CAT-005', label: 'Vie communautaire' }
      ]},
      { name: 'publishAt', label: 'Date de publication', type: 'datetime', required: true, helperText: 'Date et heure de publication du post' }
    ],
    validation: {
      required: ['title', 'message', 'categoryId', 'publishAt'],
      custom: null
    },
    contractMapping: (formData, context) => ({
      title: formData.title || '',
      messageHtml: formData.message || '',
      categoryId: formData.categoryId || 'CAT-001',
      imagesBase64: formData.imagesBase64 || [],
      publishAt: formData.publishAt || new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  },

  events: {
    entityName: 'Événement',
    apiEndpoint: 'events',
    fields: [
      { name: 'title', label: 'Titre de l\'événement', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'wysiwyg', required: true },
      { name: 'startAt', label: 'Date et heure de début', type: 'datetime', required: true, disablePast: true, helperText: 'Date et heure de début de l\'événement' },
      { name: 'endAt', label: 'Date et heure de fin', type: 'datetime', required: true, disablePast: true, helperText: 'Date et heure de fin de l\'événement' },
      { name: 'location', label: 'Lieu', type: 'text', required: true },
      { name: 'capacity', label: 'Capacité maximale', type: 'number', required: false, helperText: 'Nombre maximum de participants (optionnel)' },
      { name: 'imagesBase64', label: 'Images', type: 'images', required: false, helperText: 'Chargez des images pour l\'événement' },
      { name: 'publishAt', label: 'Date de publication', type: 'datetime', required: true, helperText: 'Date et heure de publication de l\'événement' }
    ],
    validation: {
      required: ['title', 'description', 'startAt', 'endAt', 'location', 'publishAt'],
      custom: (formData) => {
        const errors = {};
        const startDate = formData.startAt;
        const endDate = formData.endAt;
        
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
          errors.endAt = 'L\'heure de fin doit être après l\'heure de début';
        }
        
        return errors;
      }
    },
    contractMapping: (formData, context) => ({
      title: formData.title || '',
      descriptionHtml: formData.description || '',
      startAt: formData.startAt ? new Date(formData.startAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      endAt: formData.endAt ? new Date(formData.endAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      location: formData.location || '',
      capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      imagesBase64: formData.imagesBase64 || [],
      publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  },

  surveys: {
    entityName: 'Sondage',
    apiEndpoint: 'surveys',
    fields: [
      { name: 'question', label: 'Question du sondage', type: 'text', required: true },
      { name: 'options', label: 'Options de réponse', type: 'pollAnswers', required: true },
      { name: 'allowMultiple', label: 'Autoriser plusieurs réponses', type: 'checkbox' },
      { name: 'answerDeadline', label: 'Date limite de vote', type: 'datetime', required: false, helperText: 'Date limite pour voter (optionnel)' },
      { name: 'imagesBase64', label: 'Images', type: 'images', required: false, helperText: 'Chargez des images pour le sondage' },
      { name: 'publishAt', label: 'Date de publication', type: 'datetime', required: true, helperText: 'Date et heure de publication du sondage' }
    ],
    validation: {
      required: ['question', 'options', 'publishAt'],
      custom: (formData, pollAnswers) => {
        const errors = {};
        const validAnswers = pollAnswers?.filter(answer => answer.trim() !== '') || [];
        
        if (validAnswers.length < 2) {
          errors.options = 'Au moins 2 options sont requises';
        }
        
        return errors;
      }
    },
    contractMapping: (formData, context) => ({
      question: formData.question || '',
      options: context.pollAnswers?.filter(answer => answer.trim() !== '') || [],
      allowMultiple: formData.allowMultiple || false,
      answerDeadline: formData.answerDeadline ? new Date(formData.answerDeadline).toISOString().slice(0, 19).replace('T', ' ') : undefined,
      imagesBase64: formData.imagesBase64 || [],
      publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  },

  alerts: {
    entityName: 'Alerte',
    apiEndpoint: 'alerts',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'wysiwyg', required: true },
      { name: 'alertTypeId', label: 'Type d\'alerte', type: 'select', required: true, options: [
        { value: 'ALERT-TYPE-001', label: 'Information' },
        { value: 'ALERT-TYPE-002', label: 'Avertissement' },
        { value: 'ALERT-TYPE-003', label: 'Urgence' },
        { value: 'ALERT-TYPE-004', label: 'Maintenance' }
      ]},
      { name: 'priorityId', label: 'Priorité', type: 'select', required: true, options: [
        { value: 'PRIO-001', label: 'Faible' },
        { value: 'PRIO-002', label: 'Moyenne' },
        { value: 'PRIO-003', label: 'Élevée' },
        { value: 'PRIO-004', label: 'Critique' }
      ]},
      { name: 'publishAt', label: 'Date de publication', type: 'datetime', required: true, helperText: 'Date et heure de publication de l\'alerte' }
    ],
    validation: {
      required: ['title', 'message', 'alertTypeId', 'priorityId', 'publishAt'],
      custom: null
    },
    contractMapping: (formData, context) => ({
      title: formData.title || '',
      messageHtml: formData.message || '',
      alertTypeId: formData.alertTypeId || 'ALERT-TYPE-001',
      priorityId: formData.priorityId || 'PRIO-001',
      publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  },

  dailyAdvices: {
    entityName: 'Message du jour',
    apiEndpoint: 'daily-advices',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'wysiwyg', required: true },
      { name: 'priorityId', label: 'Priorité', type: 'select', required: true, options: [
        { value: 'PRIO-001', label: 'Faible' },
        { value: 'PRIO-002', label: 'Moyenne' },
        { value: 'PRIO-003', label: 'Élevée' },
        { value: 'PRIO-004', label: 'Critique' }
      ]},
      { name: 'publishAt', label: 'Date de publication', type: 'datetime', required: true, helperText: 'Date et heure de publication du message' }
    ],
    validation: {
      required: ['title', 'message', 'priorityId', 'publishAt'],
      custom: null
    },
    contractMapping: (formData, context) => ({
      title: formData.title || '',
      messageHtml: formData.message || '',
      priorityId: formData.priorityId || 'PRIO-001',
      publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  }
};

/**
 * 🏗️ CLASSE PRINCIPALE - PublicationManager
 * 
 * RÈGLE ABSOLUE : Cette classe ne doit JAMAIS être modifiée pour des besoins spécifiques.
 * Seuls les TEMPLATES ci-dessus peuvent être adaptés.
 */
export class PublicationManager {
  constructor() {
    this.auth = null;
    this.publications = null;
    this.initialized = false;
  }

  /**
   * 🔧 Initialisation avec les hooks React
   */
  initialize(authHook, publicationsHook) {
    this.auth = authHook;
    this.publications = publicationsHook;
    this.initialized = true;
  }

  /**
   * 🔒 VALIDATION DE SÉCURITÉ CENTRALISÉE
   * Cette fonction ne doit JAMAIS être modifiée
   */
  validateSecurity(residenceIds, action = 'publier') {
    if (!this.initialized) {
      throw new Error('PublicationManager non initialisé');
    }

    const { ensureAuthenticated, authorizedResidences } = this.auth;
    
    // Vérification d'authentification
    ensureAuthenticated(action);
    
    // Validation des résidences
    if (!residenceIds || residenceIds.length === 0) {
      throw new Error('Aucune résidence sélectionnée pour la publication');
    }

    const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
    const unauthorizedResidences = residenceIds.filter(id => !authorizedIds.includes(id));
    
    if (unauthorizedResidences.length > 0) {
      console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
      throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
    }

    return residenceIds; // Résidences validées
  }

  /**
   * 🔍 VALIDATION DES DONNÉES CENTRALISÉE
   */
  validateData(type, formData, additionalData = {}) {
    const template = PUBLICATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Type de publication non supporté: ${type}`);
    }

    const errors = {};

    // Validation des champs requis
    template.validation.required.forEach(fieldName => {
      if (!formData[fieldName] || formData[fieldName] === '') {
        const field = template.fields.find(f => f.name === fieldName);
        errors[fieldName] = `${field?.label || fieldName} est requis`;
      }
    });

    // Validation personnalisée si définie
    if (template.validation.custom) {
      const customErrors = template.validation.custom(formData, additionalData.pollAnswers);
      Object.assign(errors, customErrors);
    }

    if (Object.keys(errors).length > 0) {
      throw new Error('Données invalides');
    }

    return true;
  }

  /**
   * 📋 CONSTRUCTION DU PAYLOAD SELON LE CONTRAT
   */
  buildPayload(type, formData, context) {
    const template = PUBLICATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Type de publication non supporté: ${type}`);
    }

    // Format datetime pour le contrat : yyyy-MM-dd HH:mm:ss
    const formatDateTime = (date) => {
      if (!date) return undefined;
      const d = new Date(date);
      return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Champs communs à tous les types
    const basePayload = {
      residenceIds: context.residenceIds,
      status: statusToEnglish(normalizeStatus(context.status)),
      publishLater: context.publishLater || false,
      authorId: context.user?.userId || context.user?.email || 'current-user',
      createdAt: formatDateTime(formData.publicationDate || new Date())
    };

    // Ajouter publishAt si publishLater est true
    if (context.publishLater && context.publishDateTime) {
      basePayload.publishAt = formatDateTime(context.publishDateTime);
    }

    // Mapping spécifique par type
    const specificPayload = template.contractMapping(formData, context);

    return {
      ...basePayload,
      ...specificPayload
    };
  }

  /**
   * 🚀 FONCTION PRINCIPALE DE CRÉATION/MISE À JOUR
   * Cette fonction ne doit JAMAIS être modifiée
   */
  async handleSubmission(type, formData, context) {
    try {
      console.log(`🚀 PublicationManager - Début soumission ${type}`);

      // 1. Validation de sécurité
      const validatedResidences = this.validateSecurity(context.residenceIds, 
        context.isEditing ? `modifier un ${type}` : `créer un nouveau ${type}`);

      // 2. Validation des données
      this.validateData(type, formData, {
        pollAnswers: context.pollAnswers
      });

      // 3. Construction du payload
      const payload = this.buildPayload(type, formData, {
        ...context,
        residenceIds: validatedResidences
      });

      // 4. Logging unifié
      const actionLabel = context.status === 'Publié' ? 'publish' : 'draft';
      console.log('publication_submit', { 
        type, 
        action: actionLabel, 
        status: context.status, 
        payload 
      });

      PublicationLogger.logPublication(type, payload, 'PREPARING', {
        user: context.user,
        authorizedResidences: this.auth.authorizedResidences
      });

      // 5. Soumission via le contexte
      if (context.isEditing) {
        await this.publications.updatePublication(type, context.editingId, payload);
      } else {
        await this.publications.addPublication(type, payload);
      }

      // 6. Notification de succès
      const residenceCount = validatedResidences.length;
      const template = PUBLICATION_TEMPLATES[type];
      const successMessage = context.isEditing 
        ? `${template.entityName} mis à jour avec succès !`
        : `${template.entityName} créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`;

      console.log(`✅ ${successMessage}`);
      return { success: true, message: successMessage };

    } catch (error) {
      console.error(`❌ Erreur PublicationManager - ${type}:`, error);
      
      // Gestion d'erreurs unifiée
      let friendlyMessage = `Erreur lors de ${context.isEditing ? 'la modification' : 'la création'} du ${type}`;
      
      if (error.code === 'UNAUTHENTICATED') {
        friendlyMessage = `Vous devez être connecté pour ${context.isEditing ? 'modifier' : 'créer'} un ${type}`;
      } else if (error.message) {
        friendlyMessage = error.message;
      }

      throw new Error(friendlyMessage);
    }
  }

  /**
   * 🎯 MÉTHODES D'ACCÈS RAPIDE PAR TYPE
   */
  getTemplate(type) {
    return PUBLICATION_TEMPLATES[type];
  }

  getFields(type) {
    return PUBLICATION_TEMPLATES[type]?.fields || [];
  }

  getEntityName(type) {
    return PUBLICATION_TEMPLATES[type]?.entityName || type;
  }
}

// Instance singleton
export const publicationManager = new PublicationManager();

/**
 * 🎣 HOOK REACT POUR UTILISER LE MANAGER
 */
export function usePublicationManager() {
  const auth = useAuth();
  const publications = usePublications();

  // Auto-initialisation
  if (!publicationManager.initialized) {
    publicationManager.initialize(auth, publications);
  }

  return {
    manager: publicationManager,
    handleSubmission: (type, formData, context) => 
      publicationManager.handleSubmission(type, formData, context),
    getTemplate: (type) => publicationManager.getTemplate(type),
    getFields: (type) => publicationManager.getFields(type),
    getEntityName: (type) => publicationManager.getEntityName(type)
  };
}
