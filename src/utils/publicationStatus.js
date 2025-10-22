/**
 * Utilitaires pour la gestion unifiée des statuts de publications
 */

// Statuts standards pour chaque type de publication
export const PUBLICATION_STATUSES = {
  // Statuts communs à tous les types
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié', 
  SCHEDULED: 'Programmé',
  ARCHIVED: 'Archivé',
  
  // Statuts spécifiques par type
  POLL_CLOSED: 'Fermé',      // Sondages uniquement
  EVENT_CANCELLED: 'Annulé', // Événements uniquement  
  ALERT_RESOLVED: 'Résolu'   // Alertes uniquement
};

// Mapping des statuts par type de publication
export const STATUS_BY_TYPE = {
  posts: [
    PUBLICATION_STATUSES.DRAFT,
    PUBLICATION_STATUSES.PUBLISHED, 
    PUBLICATION_STATUSES.SCHEDULED,
    PUBLICATION_STATUSES.ARCHIVED
  ],
  polls: [
    PUBLICATION_STATUSES.DRAFT,
    PUBLICATION_STATUSES.PUBLISHED,
    PUBLICATION_STATUSES.SCHEDULED, 
    PUBLICATION_STATUSES.POLL_CLOSED,
    PUBLICATION_STATUSES.ARCHIVED
  ],
  events: [
    PUBLICATION_STATUSES.DRAFT,
    PUBLICATION_STATUSES.PUBLISHED,
    PUBLICATION_STATUSES.SCHEDULED,
    PUBLICATION_STATUSES.EVENT_CANCELLED, 
    PUBLICATION_STATUSES.ARCHIVED
  ],
  alerts: [
    PUBLICATION_STATUSES.DRAFT,
    PUBLICATION_STATUSES.PUBLISHED,
    PUBLICATION_STATUSES.SCHEDULED,
    PUBLICATION_STATUSES.ALERT_RESOLVED,
    PUBLICATION_STATUSES.ARCHIVED
  ],
  dailyMessages: [
    PUBLICATION_STATUSES.DRAFT,
    PUBLICATION_STATUSES.PUBLISHED,
    PUBLICATION_STATUSES.SCHEDULED, 
    PUBLICATION_STATUSES.ARCHIVED
  ]
};

// Couleurs Material-UI pour les statuts
export const STATUS_COLORS = {
  [PUBLICATION_STATUSES.DRAFT]: 'warning',
  [PUBLICATION_STATUSES.PUBLISHED]: 'success',
  [PUBLICATION_STATUSES.SCHEDULED]: 'info', 
  [PUBLICATION_STATUSES.ARCHIVED]: 'default',
  [PUBLICATION_STATUSES.POLL_CLOSED]: 'default',
  [PUBLICATION_STATUSES.EVENT_CANCELLED]: 'error',
  [PUBLICATION_STATUSES.ALERT_RESOLVED]: 'success'
};

/**
 * Normalise un statut vers le format standard français
 * @param {string} status - Statut à normaliser
 * @returns {string} Statut normalisé
 */
export function normalizeStatus(status) {
  if (!status) return PUBLICATION_STATUSES.DRAFT;
  
  // Mapping des variantes vers le standard
  const statusMap = {
    // Anglais vers français
    'draft': PUBLICATION_STATUSES.DRAFT,
    'published': PUBLICATION_STATUSES.PUBLISHED,
    'scheduled': PUBLICATION_STATUSES.SCHEDULED, 
    'archived': PUBLICATION_STATUSES.ARCHIVED,
    'closed': PUBLICATION_STATUSES.POLL_CLOSED,
    'cancelled': PUBLICATION_STATUSES.EVENT_CANCELLED,
    'resolved': PUBLICATION_STATUSES.ALERT_RESOLVED,
    
    // Variations françaises
    'brouillon': PUBLICATION_STATUSES.DRAFT,
    'publié': PUBLICATION_STATUSES.PUBLISHED,
    'publier': PUBLICATION_STATUSES.PUBLISHED,
    'programmé': PUBLICATION_STATUSES.SCHEDULED,
    'archivé': PUBLICATION_STATUSES.ARCHIVED,
    'fermé': PUBLICATION_STATUSES.POLL_CLOSED,
    'annulé': PUBLICATION_STATUSES.EVENT_CANCELLED,
    'résolu': PUBLICATION_STATUSES.ALERT_RESOLVED
  };
  
  const normalized = statusMap[status.toLowerCase()];
  return normalized || status; // Retourne le statut original si pas de mapping
}

/**
 * Obtient la couleur Material-UI pour un statut
 * @param {string} status - Statut de la publication
 * @returns {string} Couleur Material-UI
 */
export function getStatusColor(status) {
  const normalizedStatus = normalizeStatus(status);
  return STATUS_COLORS[normalizedStatus] || 'default';
}

/**
 * Vérifie si une publication peut être republiée
 * @param {string} status - Statut de la publication
 * @returns {boolean} True si republication possible
 */
export function canRepost(status) {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus === PUBLICATION_STATUSES.PUBLISHED;
}

/**
 * Obtient les statuts valides pour un type de publication
 * @param {string} publicationType - Type de publication (posts, polls, events, etc.)
 * @returns {string[]} Liste des statuts valides
 */
export function getValidStatuses(publicationType) {
  return STATUS_BY_TYPE[publicationType] || STATUS_BY_TYPE.posts;
}

/**
 * Convertit un statut français vers l'anglais (pour APIs)
 * @param {string} status - Statut en français
 * @returns {string} Statut en anglais
 */
export function statusToEnglish(status) {
  const frenchToEnglish = {
    [PUBLICATION_STATUSES.DRAFT]: 'draft',
    [PUBLICATION_STATUSES.PUBLISHED]: 'published',
    [PUBLICATION_STATUSES.SCHEDULED]: 'scheduled',
    [PUBLICATION_STATUSES.ARCHIVED]: 'archived',
    [PUBLICATION_STATUSES.POLL_CLOSED]: 'closed',
    [PUBLICATION_STATUSES.EVENT_CANCELLED]: 'cancelled', 
    [PUBLICATION_STATUSES.ALERT_RESOLVED]: 'resolved'
  };
  
  return frenchToEnglish[status] || status.toLowerCase();
}
