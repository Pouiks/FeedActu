/**
 * Système de logging intelligent pour toutes les publications
 * Capture TOUS les champs, même vides, pour prévoir les requêtes API
 */
export class PublicationLogger {
  static logPublication(type, data, phase = 'PREPARING', userContext = {}, additionalData = {}) {
    const timestamp = new Date().toISOString();
    const { user, authorizedResidences } = userContext;
    
    // Construction des données complètes avec TOUS les champs
    const completeData = this.buildCompletePayload(type, data);
    
    // Validation de sécurité
    const securityCheck = this.validateSecurity(data, authorizedResidences);
    
    const logEntry = {
      // 📋 INFORMATIONS GÉNÉRALES
      timestamp,
      phase, // PREPARING, VALIDATING, SENDING, SUCCESS, ERROR, RETRY
      type,
      user: {
        email: user?.email || 'unknown',
        userId: user?.userId || 'unknown',
        currentResidence: user?.residenceId || 'unknown'
      },
      
      // 🎯 DONNÉES COMPLÈTES POUR L'API (tous les champs présents)
      apiPayload: completeData,
      
      // 🔒 VALIDATION DE SÉCURITÉ
      security: securityCheck,
      
      // 📊 MÉTADONNÉES
      metadata: {
        payloadSize: JSON.stringify(completeData).length,
        fieldCount: Object.keys(completeData).length,
        hasAttachments: !!(data.imageUrl || data.fileUrl || data.attachments),
        ...additionalData
      }
    };
    
    // Log avec emoji et couleur selon la phase
    const emoji = this.getPhaseEmoji(phase);
    const style = this.getPhaseStyle(phase);
    
    console.log(`${emoji} [${phase}] ${type.toUpperCase()}:`, logEntry);
    
    // Log spécial pour les erreurs
    if (phase === 'ERROR') {
      console.error(`🚨 ERREUR ${type.toUpperCase()}:`, logEntry);
    }
    
    return logEntry;
  }
  
  /**
   * Construit un payload complet avec TOUS les champs, même vides
   */
  static buildCompletePayload(type, data) {
    const basePayload = {
      // 🏠 RÉSIDENCES (toujours présent)
      targetResidences: data.targetResidences || [],
      targetResidenceNames: data.targetResidenceNames || [],
      
      // 📅 PUBLICATION (logique publishLater)
      publishLater: data.publishLater === true, // Toujours false ou true
      publicationDate: data.publishLater 
        ? (data.publicationDate || '') 
        : new Date().toISOString(),
      publishDateTime: data.publishLater 
        ? (data.publishDateTime || '') 
        : '', // Vide si publishLater = false
      
      // ⚙️ STATUT ET MÉTADONNÉES
      status: data.status || 'Brouillon',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'current-user',
      
      // 📋 DONNÉES COMMUNES
      title: data.title || '',
      description: data.description || '',
      message: data.message || '',
      content: data.content || data.message || '',
    };
    
    // Ajout des champs spécifiques par type
    switch (type) {
      case 'post':
        return {
          ...basePayload,
          category: data.category || '',
          imageUrl: data.imageUrl || '',
          tags: data.tags || [],
          priority: data.priority || 'normal'
        };
        
      case 'event':
        return {
          ...basePayload,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          location: data.location || '',
          capacity: data.capacity || null,
          registrationRequired: data.registrationRequired === true,
          category: data.category || '',
          recurring: data.recurring === true,
          recurrenceRule: data.recurrenceRule || ''
        };
        
      case 'poll':
        return {
          ...basePayload,
          question: data.question || data.title || '',
          answers: data.answers || [],
          multipleChoice: data.multipleChoice === true,
          anonymous: data.anonymous === true,
          endDate: data.endDate || '',
          showResults: data.showResults !== false // true par défaut
        };
        
      case 'alert':
        return {
          ...basePayload,
          alertType: data.alertType || 'info',
          priority: data.priority || 'normal',
          expiryDate: data.expiryDate || '',
          urgent: data.urgent === true,
          requiresAcknowledgment: data.requiresAcknowledgment === true
        };
        
      case 'dailyMessage':
        return {
          ...basePayload,
          displayDate: data.displayDate || '',
          mood: data.mood || '',
          weather: data.weather || '',
          tip: data.tip || '',
          quote: data.quote || ''
        };
        
      default:
        return basePayload;
    }
  }
  
  /**
   * Validation de sécurité des résidences
   */
  static validateSecurity(data, authorizedResidences) {
    const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
    const requestedIds = data.targetResidences || [];
    
    const unauthorizedIds = requestedIds.filter(id => !authorizedIds.includes(id));
    
    return {
      authorizedResidences: authorizedIds,
      requestedResidences: requestedIds,
      unauthorizedAttempt: unauthorizedIds,
      isValid: unauthorizedIds.length === 0 && requestedIds.length > 0,
      securityLevel: unauthorizedIds.length > 0 ? 'CRITICAL' : 'OK'
    };
  }
  
  /**
   * Emoji selon la phase
   */
  static getPhaseEmoji(phase) {
    const emojis = {
      PREPARING: '📋',
      VALIDATING: '🔍',
      SENDING: '📤',
      SUCCESS: '✅',
      ERROR: '❌',
      RETRY: '🔄',
      OFFLINE_SAVE: '💾'
    };
    return emojis[phase] || '📝';
  }
  
  /**
   * Style console selon la phase
   */
  static getPhaseStyle(phase) {
    const styles = {
      SUCCESS: 'color: green; font-weight: bold',
      ERROR: 'color: red; font-weight: bold',
      RETRY: 'color: orange; font-weight: bold',
      PREPARING: 'color: blue',
      VALIDATING: 'color: purple',
      SENDING: 'color: teal'
    };
    return styles[phase] || '';
  }
}

/**
 * Hook pour utiliser le logger facilement dans les composants
 */
export const usePublicationLogger = () => {
  return {
    logPublication: (type, data, phase, userContext, additionalData) => 
      PublicationLogger.logPublication(type, data, phase, userContext, additionalData)
  };
}; 