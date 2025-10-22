import React, { createContext, useState, useContext, useEffect } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { getAuthorizedResidencesForUser } from '../provider/residenceAccessProvider';

const AuthContext = createContext();

// Configuration MSAL centralisée
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
    redirectUri:  window.location.origin // Adaptatif dev/prod
  },
  cache: {
    cacheLocation: 'localStorage', // Persistance entre sessions
    storeAuthStateInCookie: false
  }
};

// Scopes pour Microsoft Graph
const loginRequest = {
  scopes: ['User.Read','GroupMember.Read.All']
};

// Instance MSAL unique
const msalInstance = new PublicClientApplication(msalConfig);

// Composant interne qui utilise useMsal()
function AuthProviderInternal({ children }) {
  const { instance, inProgress, accounts } = useMsal();
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    email: '',
    name: '',
    userId: '',
    tenantId: '',
    residenceId: null,
    authorizedResidences: [],
    accessToken: null,
    isLoading: true // Important pour éviter les redirections prématurées
  });

  // Vérifier l'état d'authentification au démarrage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fonction d'initialisation robuste
  const initializeAuth = async () => {
    try {
      console.log('🔄 Initialisation de l\'authentification MSAL...');
      
      // Vérifier si une interaction est déjà en cours
      if (inProgress === InteractionStatus.InteractionInProgress) {
        console.warn('⚠️ Une interaction est déjà en cours. Initialisation différée temporairement.');
        return;
      }
      
      // Attendre que MSAL soit complètement initialisé
      await instance.initialize();      
      // Récupérer les comptes de manière sécurisée
      const allAccounts = instance.getAllAccounts();
      
      // Si aucun compte valide
      if (!allAccounts || allAccounts.length === 0) {
        setAuthData({
          isAuthenticated: false,
          email: '',
          name: '',
          userId: '',
          tenantId: '',
          residenceId: null,
          authorizedResidences: [],
          accessToken: null,
          isLoading: false
        });
        return;
      }
      
      // Prendre le premier compte
      const account = allAccounts[0];
      console.log(`👤 Utilisation du compte: ${account.username}`);
      
      try {        
        const tokenRequest = {
          scopes: ['User.Read','GroupMember.Read.All'],
          account: account
        };
        
        const response = await instance.acquireTokenSilent(tokenRequest);
        
        // Récupérer les résidences autorisées
        const userEmail = account.username;
        let userResidences = [];
        
        try {
          userResidences = await getAuthorizedResidencesForUser(userEmail);
        } catch (residenceError) {
          console.error('🚨 UTILISATEUR NON AUTORISÉ lors de l\'initialisation:', residenceError.message);
          
          // ❌ BLOQUER L'ACCÈS : Déconnecter immédiatement
          await instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin
          });
          
          // Nettoyer l'état avant la redirection
          setAuthData({
            isAuthenticated: false,
            email: '',
            name: '',
            userId: '',
            tenantId: '',
            residenceId: null,
            authorizedResidences: [],
            accessToken: null,
            isLoading: false
          });
          
          return; // Arrêter l'exécution
        }
        
        // Récupérer les infos utilisateur via Microsoft Graph
        let userInfo = null;
        try {
          const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              'Authorization': `Bearer ${response.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (graphResponse.ok) {
            userInfo = await graphResponse.json();
          }
        } catch (graphError) {
          console.log('⚠️ Erreur Microsoft Graph (non bloquante):', graphError.message);
        }
        
        // Restaurer l'état d'authentification
        setAuthData({
          isAuthenticated: true,
          email: account.username,
          name: userInfo?.displayName || account.name || account.username,
          userId: account.homeAccountId,
          tenantId: account.tenantId,
          residenceId: userResidences?.length === 1 
            ? userResidences[0].residenceId 
            : (localStorage.getItem('residenceId') || '1'),
          authorizedResidences: userResidences,
          accessToken: response.accessToken,
          isLoading: false
        });
        
        
      } catch (tokenError) {
        console.log(`⚠️ Impossible de récupérer le token: ${tokenError.errorCode || tokenError.message}`);
        
        // Token expiré ou invalide - nettoyer l'état
        setAuthData({
          isAuthenticated: false,
          email: '',
          name: '',
          userId: '',
          tenantId: '',
          residenceId: null,
          authorizedResidences: [],
          accessToken: null,
          isLoading: false
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation MSAL:', error);
      
      // En cas d'erreur critique, s'assurer que l'état est propre
      setAuthData({
        isAuthenticated: false,
        email: '',
        name: '',
        userId: '',
        tenantId: '',
        residenceId: null,
        authorizedResidences: [],
        accessToken: null,
        isLoading: false
      });
    }
  };

  // Fonction de login robuste
  const login = async () => {
    try {
      console.log('🔄 Tentative de connexion...');
      
      // Vérifier si une interaction est déjà en cours
      if (inProgress === InteractionStatus.InteractionInProgress) {
        console.warn('⚠️ Interaction en cours, login() annulé pour éviter une erreur.');
        return;
      }
      
      // Configuration de la requête de login
      const loginRequestConfig = {
        scopes: ['User.Read','GroupMember.Read.All']
      };
      
      console.log('🔄 Ouverture du popup de connexion...');
      
      // Effectuer le login popup
      const response = await instance.loginPopup(loginRequestConfig);
      
      console.log('✅ Connexion Azure AD réussie');
      console.log(`👤 Utilisateur connecté: ${response.account.username}`);
      console.log('🎯 Access token récupéré');
      
      // Récupérer les résidences autorisées
      const userEmail = response.account.username;
      let userResidences = [];
      
      try {
        userResidences = await getAuthorizedResidencesForUser(userEmail);
        console.log('🏠 Résidences autorisées après login:', userResidences);
      } catch (residenceError) {
        console.error('🚨 UTILISATEUR NON AUTORISÉ lors du login:', residenceError.message);
        
        // ❌ BLOQUER L'ACCÈS : Déconnecter immédiatement
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin
        });
        
        // Lever l'erreur pour que le composant Login puisse l'afficher
        throw new Error(`Accès refusé. Votre compte n'est pas autorisé à accéder à cette application.`);
      }
      
      // Récupérer les infos utilisateur via Microsoft Graph
      let userInfo = null;
      try {
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,jobTitle,department', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (graphResponse.ok) {
          userInfo = await graphResponse.json();
          console.log("USERINFO: ",userInfo)
        }
      } catch (graphError) {
        console.log('⚠️ Erreur Microsoft Graph après login (non bloquante):', graphError.message);
      }
      
      // Mettre à jour l'état d'authentification
      setAuthData({
        isAuthenticated: true,
        email: response.account.username,
        name: userInfo?.displayName || response.account.name || response.account.username,
        userId: response.account.homeAccountId,
        tenantId: response.account.tenantId,
        residenceId: userResidences?.length === 1 
          ? userResidences[0].residenceId 
          : '1', // Valeur par défaut préservée
        authorizedResidences: userResidences,
        accessToken: response.accessToken,
        isLoading: false
      });
      
      // Persister la résidence
      if (userResidences?.length === 1) {
        localStorage.setItem('residenceId', userResidences[0].residenceId);
      } else {
        localStorage.setItem('residenceId', '1');
      }
      
      console.log('✅ État d\'authentification mis à jour');
      return response;
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      
      // S'assurer que le loading est désactivé en cas d'erreur
      setAuthData(prev => ({ ...prev, authorizedResidences: [], isLoading: false }));
      
      // Relancer l'erreur pour que les composants puissent la gérer
      throw error;
    }
  };

  // === DÉBUT BLOC DÉVELOPPEMENT - FACILEMENT SUPPRIMABLE ===
  // Fonction de mock login pour développement uniquement
  const mockLogin = async (mockUserData = null) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('🚫 Mock login désactivé en production');
      return;
    }

    try {
      console.log('🧪 Simulation de connexion en mode développement...');
      
      // Données utilisateur fictives par défaut
      const defaultMockUser = {
        email: 'marie.dupont@residence-example.com',
        name: 'Marie Dupont',
        userId: 'mock-user-123456',
        tenantId: 'mock-tenant-789',
        residenceId: '2',
        accessToken: 'mock-access-token-dev',
        department: 'Résidence Les Jardins',
        officeLocation: 'Bâtiment A - Apt 205',
        jobTitle: 'Résidente'
      };

      const userData = mockUserData || defaultMockUser;
      
      // Récupération des résidences pour l'utilisateur mock
      let mockResidences = [];
      try {
        mockResidences = await getAuthorizedResidencesForUser(userData.email);
        if (mockResidences.length === 0) {
          // Si pas de mapping, créer des résidences fictives
          mockResidences = [
            { residenceId: userData.residenceId, residenceName: 'Résidence Test Mock' }
          ];
        }
        console.log('🏠 Résidences mock récupérées:', mockResidences);
      } catch (error) {
        console.log('⚠️ Mapping mock - utilisation résidence par défaut');
        mockResidences = [
          { residenceId: userData.residenceId, residenceName: 'Résidence Test Mock' }
        ];
      }
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'état d'authentification
      setAuthData({
        isAuthenticated: true,
        email: userData.email,
        name: userData.name,
        userId: userData.userId,
        tenantId: userData.tenantId,
        residenceId: userData.residenceId,
        authorizedResidences: mockResidences,
        accessToken: userData.accessToken,
        isLoading: false
      });
      
      // Persister la résidence pour le mock
      localStorage.setItem('residenceId', userData.residenceId);
      localStorage.setItem('mockUser', 'true'); // Flag pour indiquer un utilisateur mock
      
      console.log('✅ Connexion simulée réussie');
      console.log('👤 Utilisateur simulé:', userData.name);
      console.log('🏠 Résidence:', userData.residenceId);
      
      return { account: userData, accessToken: userData.accessToken };
      
    } catch (error) {
      console.error('❌ Erreur lors de la simulation:', error);
      setAuthData(prev => ({ ...prev, authorizedResidences: [], isLoading: false }));
      throw error;
    }
  };
  // === FIN BLOC DÉVELOPPEMENT ===

  // Fonction de déconnexion
  const logout = async () => {
    try {
      console.log('🔄 Déconnexion en cours...');
      
      // === DÉBUT MODIFICATION DÉVELOPPEMENT ===
      // Vérifier si c'est un utilisateur mock
      const isMockUser = localStorage.getItem('mockUser') === 'true';
      
      if (isMockUser) {
        console.log('🧪 Déconnexion utilisateur simulé');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('residenceId');
        
        setAuthData({
          isAuthenticated: false,
          email: '',
          name: '',
          userId: '',
          tenantId: '',
          residenceId: null,
          authorizedResidences: [],
          accessToken: null,
          isLoading: false
        });
        
        return;
      }
      // === FIN MODIFICATION DÉVELOPPEMENT ===
      
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin
      });
      
      // ⚠️ Le setAuthData ne sera pas exécuté car le navigateur sera redirigé
      // Il faut juste s'assurer que au retour la page fait bien un "initializeAuth" propre
      
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Fallback au cas où
      setAuthData({
        isAuthenticated: false,
        email: '',
        name: '',
        userId: '',
        tenantId: '',
        residenceId: null,
        authorizedResidences: [],
        accessToken: null,
        isLoading: false
      });
    }
  };
  

  // Fonction getValidToken mise à jour
  const getValidToken = async () => {
    if (!authData.isAuthenticated) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const allAccounts = instance.getAllAccounts();
      if (!allAccounts || allAccounts.length === 0) {
        throw new Error('Aucun compte MSAL trouvé');
      }

      const account = instance.getActiveAccount() || allAccounts[0];
      
      const tokenRequest = {
        scopes: ['User.Read','GroupMember.Read.All'],
        account: account
      };

      const response = await instance.acquireTokenSilent(tokenRequest);

      // Mettre à jour le token dans l'état si nécessaire
      if (response.accessToken !== authData.accessToken) {
        setAuthData(prev => ({ ...prev, accessToken: response.accessToken }));
      }

      return response.accessToken;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      throw error;
    }
  };

  const contextValue = {
    ...authData,
    login,
    mockLogin,
    logout,
    getValidToken,
    msalInstance: instance
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// AuthProvider principal qui wrappe avec MsalProvider
export function AuthProvider({ children }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInternal>
        {children}
      </AuthProviderInternal>
    </MsalProvider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }
  return context;
}
