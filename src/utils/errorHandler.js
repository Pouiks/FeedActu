import { PublicationLogger } from './publicationLogger';

/**
 * Système de gestion d'erreurs robuste pour les publications
 * Gère les retry, la sauvegarde locale et les notifications utilisateur
 */
export class ErrorHandler {
  static maxRetries = 3;
  static retryDelay = 2000; // 2 secondes
  static retryBackoffFactor = 2; // Augmente le délai à chaque retry
  
  /**
   * Exécute une fonction avec gestion d'erreurs robuste
   */
  static async executeWithErrorHandling(operation, context = {}) {
    const { type, data, onSuccess, onError, onRetry } = context;
    
    let lastError = null;
    let retryCount = 0;
    
    while (retryCount <= this.maxRetries) {
      try {
                 // Log de tentative
         if (retryCount === 0) {
           PublicationLogger.logPublication(type, data, 'SENDING', context.userContext || {});
         } else {
           PublicationLogger.logPublication(type, data, 'RETRY', context.userContext || {}, {
             retryAttempt: retryCount,
             previousError: lastError?.message
           });
         }
        
        // Exécution de l'opération
        const result = await operation();
        
                 // Succès
         PublicationLogger.logPublication(type, data, 'SUCCESS', context.userContext || {}, {
           retriesUsed: retryCount,
           result: result
         });
        
        if (onSuccess) {
          onSuccess(result, retryCount);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        retryCount++;
        
                 // Log de l'erreur
         PublicationLogger.logPublication(type, data, 'ERROR', context.userContext || {}, {
           error: error.message,
           retryAttempt: retryCount,
           willRetry: retryCount <= this.maxRetries
         });
        
        // Si on a atteint le max de retry
        if (retryCount > this.maxRetries) {
          break;
        }
        
        // Callback de retry si fourni
        if (onRetry) {
          onRetry(error, retryCount);
        }
        
        // Attendre avant le prochain essai (avec backoff exponentiel)
        const delay = this.retryDelay * Math.pow(this.retryBackoffFactor, retryCount - 1);
        await this.sleep(delay);
      }
    }
    
    // Toutes les tentatives ont échoué
    const finalError = new Error(`Échec après ${this.maxRetries} tentatives: ${lastError?.message}`);
    finalError.originalError = lastError;
    finalError.retryCount = retryCount - 1;
    
    // Sauvegarde locale en dernier recours
    if (type && data) {
      this.saveToLocalStorage(type, data, lastError);
    }
    
    if (onError) {
      onError(finalError);
    }
    
    throw finalError;
  }
  
  /**
   * Sauvegarde locale d'une publication en cas d'échec
   */
  static saveToLocalStorage(type, data, error) {
    try {
      const timestamp = new Date().toISOString();
      const failedPublication = {
        type,
        data,
        error: error?.message,
        timestamp,
        retryCount: this.maxRetries,
        id: `failed_${type}_${Date.now()}`
      };
      
      // Récupérer les publications échouées existantes
      const existingFailed = JSON.parse(localStorage.getItem('failed_publications') || '[]');
      existingFailed.push(failedPublication);
      
      // Garder seulement les 50 dernières
      const limitedFailed = existingFailed.slice(-50);
      localStorage.setItem('failed_publications', JSON.stringify(limitedFailed));
      
             PublicationLogger.logPublication(type, data, 'OFFLINE_SAVE', {}, {
         savedToLocalStorage: true,
         failedPublicationId: failedPublication.id
       });
      
      console.log('💾 Publication sauvegardée localement:', failedPublication.id);
      
    } catch (saveError) {
      console.error('❌ Impossible de sauvegarder localement:', saveError);
    }
  }
  
  /**
   * Récupère les publications échouées sauvegardées localement
   */
  static getFailedPublications() {
    try {
      return JSON.parse(localStorage.getItem('failed_publications') || '[]');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des publications échouées:', error);
      return [];
    }
  }
  
  /**
   * Supprime une publication échouée de la sauvegarde locale
   */
  static removeFailedPublication(id) {
    try {
      const failed = this.getFailedPublications();
      const filtered = failed.filter(pub => pub.id !== id);
      localStorage.setItem('failed_publications', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return false;
    }
  }
  
  /**
   * Nettoie les anciennes publications échouées (plus de 7 jours)
   */
  static cleanupOldFailedPublications() {
    try {
      const failed = this.getFailedPublications();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recent = failed.filter(pub => new Date(pub.timestamp) > sevenDaysAgo);
      localStorage.setItem('failed_publications', JSON.stringify(recent));
      
      const cleanedCount = failed.length - recent.length;
      if (cleanedCount > 0) {
        console.log(`🧹 ${cleanedCount} publications échouées anciennes supprimées`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      return 0;
    }
  }
  
  /**
   * Détermine le type d'erreur et la stratégie appropriée
   */
  static categorizeError(error) {
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return 'auth';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('server') || error.status >= 500) {
      return 'server';
    }
    
    return 'unknown';
  }
  
  /**
   * Génère un message d'erreur user-friendly
   */
  static getUserFriendlyMessage(error, context = {}) {
    const category = this.categorizeError(error);
    const { type = 'publication' } = context;
    
    const messages = {
      network: `Problème de connexion. Votre ${type} a été sauvegardée localement et sera tentée à nouveau.`,
      auth: `Problème d'authentification. Veuillez vous reconnecter.`,
      validation: `Données invalides. Veuillez vérifier les informations saisies.`,
      server: `Problème serveur temporaire. Votre ${type} a été sauvegardée et sera retentée automatiquement.`,
      unknown: `Erreur inattendue lors de la ${type}. Elle a été sauvegardée localement.`
    };
    
    return messages[category] || messages.unknown;
  }
  
  /**
   * Utilitaire pour attendre
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Hook React pour utiliser le gestionnaire d'erreurs
   */
  static useErrorHandler() {
    return {
      executeWithErrorHandling: this.executeWithErrorHandling.bind(this),
      getFailedPublications: this.getFailedPublications.bind(this),
      removeFailedPublication: this.removeFailedPublication.bind(this),
      cleanupOldFailedPublications: this.cleanupOldFailedPublications.bind(this),
      getUserFriendlyMessage: this.getUserFriendlyMessage.bind(this)
    };
  }
}

/**
 * Hook React pour utiliser facilement la gestion d'erreurs
 */
export const useErrorHandler = () => {
  return ErrorHandler.useErrorHandler();
}; 