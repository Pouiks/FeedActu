/**
 * Normalisation des publications pour un affichage unifié
 * Tous les types de publications sont normalisés vers un format standard
 */

import { normalizeStatus } from './publicationStatus';

/**
 * Normalise une publication vers un format d'affichage standard
 * @param {string} type - Type de publication (posts, events, polls, alerts, dailyMessages)
 * @param {object} item - Publication brute
 * @returns {object} Publication normalisée
 */
export const normalizePublication = (type, item) => {
  if (!item) return null;

  // Titre selon le type
  let title = '';
  switch (type) {
    case 'posts':
      title = item.title || 'Post sans titre';
      break;
    case 'surveys': // Renommé de polls
      // Nettoyer le HTML de la question
      title = item.question ? item.question.replace(/<[^>]*>/g, '').trim() : 'Sondage sans question';
      break;
    case 'events':
      title = item.title || 'Événement sans titre';
      break;
    case 'alerts':
      title = item.title || 'Alerte sans titre';
      break;
    case 'dailyAdvices': // Renommé de dailyMessages
      title = item.title || 'Message sans titre';
      break;
    default:
      title = item.title || item.question || 'Publication sans titre';
  }

  // Date d'affichage selon le type et les champs disponibles
  let displayDate = null;
  
  if (type === 'events') {
    // Pour les événements : priorité aux dates d'événement
    if (item.startAt) {
      displayDate = item.startAt;
    } else if (item.startDate) {
      displayDate = item.startDate;
    } else if (item.eventDateTimeStart) {
      displayDate = item.eventDateTimeStart;
    } else if (item.eventDateRangeStart) {
      displayDate = item.eventDateRangeStart;
    } else if (item.eventDate && item.startTime) {
      displayDate = `${item.eventDate}T${item.startTime}:00`;
    } else if (item.eventDate) {
      displayDate = item.eventDate;
    } else {
      displayDate = item.publishAt || item.publicationDate || item.createdAt;
    }
  } else {
    // Pour les autres types : date de publication
    displayDate = item.publishAt || item.publicationDate || item.createdAt || new Date().toISOString();
  }

  // Statut normalisé
  const status = normalizeStatus(item.status);

  // Résidences (support des différents formats)
  const residenceIds = item.residenceIds || item.targetResidences || 
    (item.residence_id ? [item.residence_id] : []);
  
  const targetResidenceNames = item.targetResidenceNames || [];

  // Créer l'objet normalisé de base
  const normalized = {
    id: item.id,
    type: type,
    title: title.substring(0, 100), // Limiter la longueur pour l'affichage
    displayDate: displayDate,
    status: status,
    residenceIds: residenceIds,
    targetResidenceNames: targetResidenceNames,
    // Garder l'objet original pour les actions détaillées
    originalData: item
  };

  // Préserver les champs spécifiques selon le type pour l'affichage
  switch (type) {
    case 'posts':
      if (item.categoryId) normalized.category = item.categoryId;
      if (item.category) normalized.category = item.category; // Fallback pour compatibilité
      
      console.log('📝 DEBUG Normalizer - Post:', {
        originalCategoryId: item.categoryId,
        originalCategory: item.category,
        originalPublishAt: item.publishAt,
        originalPublicationDate: item.publicationDate,
        normalizedCategory: normalized.category,
        normalizedDisplayDate: normalized.displayDate,
        allFields: Object.keys(item)
      });
      break;
    case 'events':
      if (item.location) normalized.location = item.location;
      if (item.startAt) normalized.startAt = item.startAt;
      if (item.endAt) normalized.endAt = item.endAt;
      if (item.capacity) normalized.capacity = item.capacity;
      if (item.eventDate) normalized.eventDate = item.eventDate; // Fallback
      if (item.publishAt) normalized.publishAt = item.publishAt;
      if (item.publicationDate) normalized.publicationDate = item.publicationDate; // Fallback
      break;
    case 'alerts':
      if (item.priorityId) normalized.priority = item.priorityId;
      if (item.alertTypeId) normalized.category = item.alertTypeId;
      if (item.priority) normalized.priority = item.priority; // Fallback
      if (item.type) normalized.category = item.type; // Fallback
      
      console.log('🚨 DEBUG Normalizer - Alerte:', {
        originalPriorityId: item.priorityId,
        originalAlertTypeId: item.alertTypeId,
        originalPriority: item.priority,
        originalType: item.type,
        normalizedPriority: normalized.priority,
        normalizedCategory: normalized.category,
        allFields: Object.keys(item)
      });
      break;
    case 'surveys': // Renommé de polls
      if (item.allowMultiple) normalized.allowMultiple = item.allowMultiple;
      if (item.answerDeadline) normalized.answerDeadline = item.answerDeadline;
      // Les surveys n'ont pas d'autres champs spécifiques à préserver pour l'affichage
      break;
    case 'dailyAdvices': // Renommé de dailyMessages
      if (item.priorityId) normalized.priority = item.priorityId;
      if (item.priority) normalized.priority = item.priority; // Fallback
      // Les messages du jour n'ont pas d'autres champs spécifiques à préserver pour l'affichage
      break;
    default:
      // Cas par défaut pour les types non reconnus
      break;
  }

  return normalized;
};

/**
 * Normalise une liste de publications
 * @param {string} type - Type de publication
 * @param {array} items - Liste des publications brutes
 * @returns {array} Liste des publications normalisées
 */
export const normalizeList = (type, items = []) => {
  return items
    .map(item => normalizePublication(type, item))
    .filter(item => item !== null)
    .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
};

/**
 * Obtient le nom d'affichage d'un type de publication
 * @param {string} type - Type de publication
 * @returns {string} Nom d'affichage
 */
export const getTypeDisplayName = (type) => {
  const names = {
    posts: 'Post',
    events: 'Événement',
    surveys: 'Sondage', // Renommé de polls
    alerts: 'Alerte',
    dailyAdvices: 'Message du jour' // Renommé de dailyMessages
  };
  return names[type] || 'Publication';
};

/**
 * Obtient les colonnes standard pour l'affichage en tableau
 * @param {string} type - Type de publication (pour les colonnes spécifiques)
 * @returns {array} Configuration des colonnes
 */
export const getStandardColumns = (type) => {
  const baseColumns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'displayDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  // Colonnes spécifiques selon le type
  const specificColumns = {
    posts: [
      { id: 'title', label: 'Titre', sortable: true, searchable: true },
      { id: 'category', label: 'Catégorie', sortable: true, searchable: false },
      { id: 'targetResidenceNames', label: 'Résidences', sortable: false, searchable: false },
      { id: 'displayDate', label: 'Date de publication', sortable: true, searchable: false },
      { id: 'status', label: 'Statut', sortable: true, searchable: false },
    ],
    events: [
      { id: 'title', label: 'Titre', sortable: true, searchable: true },
      { id: 'displayDate', label: 'Date de l\'événement', sortable: true, searchable: false },
      { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
      { id: 'targetResidenceNames', label: 'Résidences', sortable: false, searchable: false },
      { id: 'location', label: 'Lieu', sortable: false, searchable: true },
      { id: 'status', label: 'Statut', sortable: true, searchable: false },
    ],
    surveys: [ // Renommé de polls
      { id: 'title', label: 'Question', sortable: true, searchable: true },
      { id: 'displayDate', label: 'Date de publication', sortable: true, searchable: false },
      { id: 'status', label: 'Statut', sortable: true, searchable: false },
    ],
    alerts: [
      { id: 'title', label: 'Titre', sortable: true, searchable: true },
      { id: 'priority', label: 'Priorité', sortable: true, searchable: false },
      { id: 'category', label: 'Catégorie', sortable: true, searchable: false },
      { id: 'displayDate', label: 'Date de publication', sortable: true, searchable: false },
      { id: 'status', label: 'Statut', sortable: true, searchable: false },
    ],
    dailyAdvices: [ // Renommé de dailyMessages
      { id: 'title', label: 'Titre', sortable: true, searchable: true },
      { id: 'displayDate', label: 'Date de publication', sortable: true, searchable: false },
      { id: 'status', label: 'Statut', sortable: true, searchable: false },
    ]
  };

  return specificColumns[type] || baseColumns;
};
