import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { normalizeList } from '../utils/publicationNormalizer';

const PublicationsContext = createContext();

function publicationsReducer(state, action) {
  switch (action.type) {
    case 'ADD_PUBLICATION': {
      const { type, data } = action.payload;
      const publication = {
        ...data,
        id: data.id || Date.now(), // ID unique simple
        createdAt: data.createdAt || new Date().toISOString(),
        publicationDate: data.publicationDate || new Date().toISOString(),
        // Harmonisation : ajouter targetResidences pour compatibilité avec l'affichage
        targetResidences: data.targetResidences || data.residenceIds || [],
        // Ajouter les noms des résidences si disponibles
        targetResidenceNames: data.targetResidenceNames || [],
        _isLocal: !data.id // Marqueur interne invisible
      };
      
      console.log(`🔄 DEBUG Reducer - ADD_PUBLICATION:`, {
        type,
        publicationId: publication.id,
        beforeCount: state[type]?.length || 0,
        afterCount: (state[type]?.length || 0) + 1,
        publication: {
          id: publication.id,
          title: publication.title || publication.question || 'Sans titre',
          residenceIds: publication.residenceIds,
          targetResidences: publication.targetResidences
        }
      });

      
      return {
        ...state,
        [type]: [...state[type], publication]
      };
    }

    case 'LOAD_PUBLICATIONS': {
      const { type, publications } = action.payload;
      return {
        ...state,
        [type]: publications
      };
    }

    case 'UPDATE_PUBLICATION': {
      const { type, id, updates } = action.payload;
      return {
        ...state,
        [type]: state[type].map(pub => 
          pub.id === id ? { ...pub, ...updates } : pub
        )
      };
    }

    case 'DELETE_PUBLICATION': {
      const { type, id } = action.payload;
      return {
        ...state,
        [type]: state[type].filter(pub => pub.id !== id)
      };
    }

    default:
      return state;
  }
}

const initialState = {
  posts: [],
  events: [],
  surveys: [], // Renommé de polls vers surveys
  alerts: [],
  dailyAdvices: [] // Renommé de dailyMessages vers dailyAdvices
};

export function PublicationsProvider({ children }) {
  const [state, dispatch] = useReducer(publicationsReducer, initialState, (initial) => {
    // Charger silencieusement depuis localStorage
    try {
      const saved = localStorage.getItem('user_publications');
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  const { isAuthenticated, authenticatedPost } = useAuth();

  // Sauvegarde automatique transparente
  useEffect(() => {
    localStorage.setItem('user_publications', JSON.stringify(state));
  }, [state]);

  const syncWithServerQuietly = async () => {
    // Synchronisation silencieuse en arrière-plan
    try {
      const localItems = Object.entries(state)
        .filter(([_, items]) => items.some(item => item._isLocal))
        .map(([type, items]) => ({ type, items: items.filter(item => item._isLocal) }));

      for (const { type, items } of localItems) {
        for (const item of items) {
          try {
            const serverResponse = await authenticatedPost(`/api/${type}`, item);
            // Marquer comme synchronisé silencieusement
            dispatch({
              type: 'UPDATE_PUBLICATION',
              payload: { 
                type, 
                id: item.id, 
                updates: { 
                  id: serverResponse.id, 
                  _isLocal: false 
                } 
              }
            });
          } catch (error) {
            // Échec silencieux - l'utilisateur garde sa publication locale
            console.log(`Sync ${type} différée:`, error.message);
          }
        }
      }
    } catch (error) {
      // Échec global silencieux
      console.log('Sync différée:', error.message);
    }
  };

  // Synchronisation en arrière-plan (invisible)
  useEffect(() => {
    if (isAuthenticated && navigator.onLine) {
      syncWithServerQuietly();
    }
  }, [isAuthenticated]);

  // API simple pour l'utilisateur métier
  const createPublication = async (type, data) => {
    // Générer un ID temporaire unique
    const tempId = data.id || Date.now();
    const publicationData = { ...data, id: tempId };
    
    console.log(`🔄 DEBUG PublicationsContext - Création ${type}:`, {
      type,
      tempId,
      publicationData,
      stateBefore: state[type]?.length || 0
    });
    
    // 1. Ajout immédiat - L'utilisateur voit sa publication instantanément
    dispatch({
      type: 'ADD_PUBLICATION',
      payload: { type, data: publicationData }
    });

    console.log(`✅ ${type} créé avec succès ! ID: ${tempId}`);

    // 2. Tentative de synchronisation en arrière-plan (invisible)
    if (navigator.onLine && isAuthenticated) {
      try {
        // Nouveau format : envoi en array selon le contrat d'API
        const apiPayload = [publicationData];
        await authenticatedPost(`/api/${type}`, apiPayload);
        // Succès serveur - marquer silencieusement
        dispatch({
          type: 'UPDATE_PUBLICATION',
          payload: { 
            type, 
            id: tempId, 
            updates: { _isLocal: false } 
          }
        });
        // Synchronisation serveur réussie silencieusement
      } catch (error) {
        // Échec serveur - l'utilisateur garde sa publication locale
        // Retry automatique plus tard
      }
    }
  };

  const updatePublication = async (type, id, updates) => {
    // Mise à jour immédiate
    dispatch({
      type: 'UPDATE_PUBLICATION',
      payload: { type, id, updates }
    });

    // Synchronisation serveur en arrière-plan
    if (navigator.onLine && isAuthenticated) {
      try {
        // Nouveau format : envoi en array selon le contrat d'API
        const apiPayload = [updates];
        await authenticatedPost(`/api/${type}/${id}`, apiPayload);
      } catch (error) {
        // Échec silencieux
        console.log(`Update ${type} différée:`, error.message);
      }
    }
  };

  // NOUVELLE FONCTION : Publier un brouillon
  const publishDraft = async (type, id) => {
    try {
      const publication = getPublicationById(type, id);
      if (!publication) {
        throw new Error('Publication introuvable');
      }

      if (publication.status !== 'Brouillon') {
        throw new Error('Seuls les brouillons peuvent être publiés');
      }

      // Mise à jour immédiate du statut
      const updates = {
        status: 'Publié',
        publicationDate: new Date().toISOString(),
        publishLater: false,
        publishDateTime: ''
      };

      await updatePublication(type, id, updates);
      
      console.log(`✅ Brouillon ${type} publié avec succès ! ID: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la publication du brouillon ${type}:`, error);
      throw error;
    }
  };

  const deletePublication = async (type, id) => {
    // Suppression immédiate
    dispatch({
      type: 'DELETE_PUBLICATION',
      payload: { type, id }
    });

    // Synchronisation serveur en arrière-plan
    if (navigator.onLine && isAuthenticated) {
      try {
        await authenticatedPost(`/api/${type}/${id}`, { _deleted: true });
      } catch (error) {
        // Échec silencieux
        console.log(`Delete ${type} différée:`, error.message);
      }
    }
  };

  const getPublications = (type, residenceId = null) => {
    let publications = state[type] || [];
    
    console.log(`🔍 DEBUG getPublications - ${type}:`, {
      residenceId,
      totalCount: publications.length,
      publications: publications.map(p => ({
        id: p.id,
        title: p.title || p.question || 'Sans titre',
        residenceIds: p.residenceIds,
        targetResidences: p.targetResidences
      }))
    });
    
    if (residenceId) {
      publications = publications.filter(pub => {
        // Support des deux formats : residenceIds (nouveau) et targetResidences (legacy)
        const hasNewFormat = pub.residenceIds && pub.residenceIds.includes(residenceId);
        const hasLegacyFormat = pub.targetResidences && pub.targetResidences.includes(residenceId);
        const hasDirectMatch = pub.residence_id === residenceId;
        
        return hasNewFormat || hasLegacyFormat || hasDirectMatch;
      });
      
      console.log(`🔍 DEBUG getPublications - Après filtrage ${type}:`, {
        filteredCount: publications.length,
        filtered: publications.map(p => ({
          id: p.id,
          title: p.title || p.question || 'Sans titre'
        }))
      });
    }
    
    return publications.sort((a, b) => 
      new Date(b.publicationDate || b.createdAt || 0) - new Date(a.publicationDate || a.createdAt || 0)
    );
  };

  const getPublicationById = (type, id) => {
    const publications = state[type] || [];
    return publications.find(pub => pub.id === parseInt(id) || pub.id === id);
  };

  // NOUVELLE MÉTHODE : Récupération normalisée pour l'affichage unifié
  const getNormalizedPublications = (type, residenceId = null) => {
    const rawPublications = getPublications(type, residenceId);
    const normalized = normalizeList(type, rawPublications);
    
    console.log(`📋 DEBUG getNormalizedPublications - ${type}:`, {
      residenceId,
      rawCount: rawPublications.length,
      normalizedCount: normalized.length,
      sample: normalized[0] || 'Aucune publication'
    });
    
    return normalized;
  };

  const value = {
    createPublication,
    addPublication: createPublication, // Alias pour compatibilité
    updatePublication,
    deletePublication,
    publishDraft, // NOUVEAU : Publier un brouillon
    getPublications,
    getPublicationById,
    getNormalizedPublications, // NOUVEAU : Récupération normalisée
    // Statistiques pour les dashboards
    getStats: () => ({
      posts: state.posts.length,
      events: state.events.length,
      surveys: state.surveys.length,
      alerts: state.alerts.length,
      dailyAdvices: state.dailyAdvices.length,
      total: Object.values(state).reduce((acc, items) => acc + items.length, 0)
    })
  };

  return (
    <PublicationsContext.Provider value={value}>
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (!context) {
    throw new Error('usePublications doit être utilisé dans PublicationsProvider');
  }
  return context;
} 