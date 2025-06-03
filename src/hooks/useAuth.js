import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  
  // Fonction middleware pour vérifier l'authentification avant toute action
  const ensureAuthenticated = (action = 'effectuer cette action') => {
    if (!context.isAuthenticated) {
      const error = new Error(`Vous devez être connecté pour ${action}`);
      error.code = 'UNAUTHENTICATED';
      throw error;
    }
    return true;
  };

  // Fonction middleware pour les requêtes nécessitant un token
  const withAuthToken = async (apiCall) => {
    ensureAuthenticated('effectuer cette requête');
    
    try {
      const token = await context.getValidToken();
      return await apiCall(token);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête authentifiée:', error);
      throw error;
    }
  };

  // Fonction utilitaire pour poster des données (utilisée dans les formulaires)
  const authenticatedPost = async (endpoint, data) => {
    return withAuthToken(async (token) => {
      console.log(`📤 Envoi authentifié vers ${endpoint}:`, data);
      console.log(`🔑 Token utilisé: ${token.substring(0, 20)}...`);
      
      // Ici vous pourrez faire vos vraies requêtes API
      // const response = await fetch(endpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // });
      // return response.json();
      
      // Pour l'instant, on simule une réponse
      return { success: true, data };
    });
  };

  return {
    ...context,
    ensureAuthenticated,
    withAuthToken,
    authenticatedPost
  };
}
