# Plan de Migration - Gestion des Identités avec Microsoft Entra ID

**Projet:** FeedActu - Plateforme de communication résidentielle  
**Date de création:** 24 octobre 2025  
**Statut:** 📋 Plan d'action - En attente de validation infrastructure  
**Objectif:** Migrer la gestion des accès utilisateurs depuis un mapping JSON statique vers Microsoft Entra ID (Azure AD)

---

## 📊 Contexte Actuel

### Architecture Existante

**Authentification:** ✅ Déjà en place avec Azure AD via MSAL
- Bibliothèque: `@azure/msal-react` + `@azure/msal-browser`
- Configuration: `src/context/AuthContext.js`
- Scopes actuels: `User.Read`, `GroupMember.Read.All`

**Autorisation:** ⚠️ À migrer (fichier JSON statique)
- Fichier: `src/userResidenceMapping.js`
- Provider: `src/provider/residenceAccessProvider.js`
- Limitations: 
  - Nécessite un redéploiement pour chaque modification
  - Pas de gestion des rôles
  - Pas de traçabilité centralisée
  - ~15 utilisateurs actuellement mappés manuellement

### Statistiques Actuelles

```javascript
// Extrait de userResidenceMapping.js
Utilisateurs: 15+
Résidences: ~10 mappées (objectif: 70 résidences)
Profils identifiés:
  - Utilisateurs mono-résidence: ~60% (ex: 'ar.dasilva@uxco-management.com')
  - Utilisateurs multi-résidences: ~40% (ex: 'o.nottin@uxco-group.com' - 5 résidences)
```

### Besoins Métier

- **70 résidences** à gérer
- **3 niveaux de droits** : Admin, Manager, Assistant Manager
- **Support multi-résidences** : Un manager peut gérer plusieurs résidences
- **Gestion centralisée** : L'équipe infrastructure doit pouvoir gérer les accès sans redéploiement
- **Traçabilité** : Audit trail des accès et modifications

---

## 🎯 Architecture Cible Recommandée

### Option Retenue : Groupes de Sécurité Azure AD

**Pourquoi cette approche ?**

```
✅ Scalable pour 70+ résidences
✅ Gestion centralisée via Azure Portal
✅ L'infrastructure peut gérer facilement
✅ Pas besoin de base de données externe
✅ Audit trail natif Azure AD
✅ API Graph disponible pour automatisation future
✅ Permet des affectations temporaires
✅ Révocation immédiate en cas de besoin
```

### Modèle de Données

#### 1. App Roles (Rôles applicatifs)

```json
{
  "appRoles": [
    {
      "id": "guid-admin",
      "displayName": "Admin",
      "description": "Administrateur plateforme - accès toutes résidences",
      "value": "Admin",
      "allowedMemberTypes": ["User"]
    },
    {
      "id": "guid-manager", 
      "displayName": "Manager",
      "description": "Manager de résidence - gestion complète de publication",
      "value": "Manager",
      "allowedMemberTypes": ["User"]
    },
    {
      "id": "guid-assistant",
      "displayName": "AssistantManager", 
      "description": "Assistant Manager - gestion limitée",
      "value": "AssistantManager",
      "allowedMemberTypes": ["User"]
    }
  ]
}
```

**Matrice des permissions (à définir) :**

| Rôle | Publier | Modifier | Supprimer | Gestion Utilisateurs | Toutes Résidences |
|------|---------|----------|-----------|---------------------|-------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ | ❌ | Selon groupes |
| **AssistantManager** | ✅ | ⚠️ (ses publications) | ❌ | ❌ | Selon groupes |

#### 2. Groupes de Sécurité (Affectation résidences)

**Convention de nommage proposée :**

```
Format: FEEDACTU_RES_{CODE_RESIDENCE}

Exemples:
- FEEDACTU_RES_MASSY_PALAISEAU
- FEEDACTU_RES_NOISY_LE_GRAND
- FEEDACTU_RES_ALBERT_THOMAS
- FEEDACTU_RES_REDWOOD
- FEEDACTU_RES_ALL (groupe spécial pour les admins)
```

**Mapping Résidence ↔ Groupe Azure AD :**

| Residence ID | Nom Résidence | Groupe Azure AD | Azure Group ID |
|--------------|---------------|-----------------|----------------|
| `19f2179b-7d14-f011-998a-6045bd1919a1` | ECLA GENEVE ARCHAMPS | FEEDACTU_RES_GENEVE_ARCHAMPS | *à compléter* |
| `195644a8-4fa7-ef11-b8e9-6045bd19a503` | ECLA MASSY-PALAISEAU | FEEDACTU_RES_MASSY_PALAISEAU | *à compléter* |
| `1b5644a8-4fa7-ef11-b8e9-6045bd19a503` | ECLA NOISY-LE-GRAND | FEEDACTU_RES_NOISY_LE_GRAND | *à compléter* |
| `1d5644a8-4fa7-ef11-b8e9-6045bd19a503` | ECLA MASSY-PALAISEAU EXTENSION OPCO | FEEDACTU_RES_MASSY_EXTENSION | *à compléter* |
| `1f5644a8-4fa7-ef11-b8e9-6045bd19a503` | ECLA VILLEJUIF | FEEDACTU_RES_VILLEJUIF | *à compléter* |
| `b0a2d617-fa0e-f011-998a-0022483a5b4d` | REDWOOD | FEEDACTU_RES_REDWOOD | *à compléter* |
| `ff5544a8-4fa7-ef11-b8e9-6045bd19a503` | ALBERT THOMAS | FEEDACTU_RES_ALBERT_THOMAS | *à compléter* |
| `045644a8-4fa7-ef11-b8e9-6045bd19a503` | ANDROMAQUE | FEEDACTU_RES_ANDROMAQUE | *à compléter* |
| `065644a8-4fa7-ef11-b8e9-6045bd19a503` | AQUITAINE | FEEDACTU_RES_AQUITAINE | *à compléter* |
| `085644a8-4fa7-ef11-b8e9-6045bd19a503` | ARC EN CIEL | FEEDACTU_RES_ARC_EN_CIEL | *à compléter* |
| `0a5644a8-4fa7-ef11-b8e9-6045bd19a503` | AVIGNON EXPRESS | FEEDACTU_RES_AVIGNON_EXPRESS | *à compléter* |
| `0c5644a8-4fa7-ef11-b8e9-6045bd19a503` | BABYLONE | FEEDACTU_RES_BABYLONE | *à compléter* |
| `0e5644a8-4fa7-ef11-b8e9-6045bd19a503` | CARRE VILLON | FEEDACTU_RES_CARRE_VILLON | *à compléter* |
| `105644a8-4fa7-ef11-b8e9-6045bd19a503` | CITADELLE | FEEDACTU_RES_CITADELLE | *à compléter* |

> ⚠️ **TODO:** Compléter cette table avec les 70 résidences et les Azure Group IDs une fois créés

#### 3. Exemple d'Assignation Utilisateur

```yaml
# Exemple: Manager multi-résidences (o.nottin@uxco-group.com)
App Role: Manager
Groupes Azure AD:
  - FEEDACTU_RES_GENEVE_ARCHAMPS
  - FEEDACTU_RES_MASSY_PALAISEAU
  - FEEDACTU_RES_NOISY_LE_GRAND
  - FEEDACTU_RES_MASSY_EXTENSION
  - FEEDACTU_RES_VILLEJUIF
→ Accès à 5 résidences en publication

# Exemple: Manager mono-résidence (ar.dasilva@uxco-management.com)
App Role: Manager
Groupes Azure AD:
  - FEEDACTU_RES_REDWOOD
→ Accès à 1 résidence uniquement

# Exemple: Administrateur plateforme
App Role: Admin
Groupes Azure AD:
  - FEEDACTU_RES_ALL
→ Accès automatique à toutes les résidences (70)
```

---

## 📋 Plan de Migration en 5 Phases

### **PHASE 1 : Préparation Infrastructure** ⏱️ Estimation: 1-2 semaines

#### Actions Azure AD (Équipe Infrastructure)

- [ ] **Créer les App Roles dans l'App Registration**
  - [ ] Rôle "Admin"
  - [ ] Rôle "Manager" 
  - [ ] Rôle "AssistantManager"

- [ ] **Créer les groupes de sécurité Azure AD** (~70 groupes)
  - [ ] Valider la convention de nommage avec l'équipe
  - [ ] Script de création automatique (PowerShell/Azure CLI) ?
  - [ ] Créer le groupe spécial `FEEDACTU_RES_ALL`
  - [ ] Documenter chaque groupe avec description

- [ ] **Configurer les permissions API**
  - [ ] `User.Read` (déjà configuré ✅)
  - [ ] `GroupMember.Read.All` (déjà configuré ✅)
  - [ ] `Directory.Read.All` (NOUVEAU - requis pour lire les groupes)
  - [ ] Obtenir le consentement administrateur

- [ ] **Configurer les Optional Claims**
  ```json
  {
    "optionalClaims": {
      "idToken": [
        {"name": "groups", "essential": false},
        {"name": "email", "essential": true}
      ],
      "accessToken": [
        {"name": "groups", "essential": false}
      ]
    }
  }
  ```

- [ ] **Créer le mapping complet residenceId ↔ azureGroupId**
  - Format: Fichier Excel/CSV partagé
  - Colonnes: Residence ID | Nom | Code Groupe | Azure Group ID | Date Création

#### Actions Développement (Équipe Projet)

- [ ] **Créer la documentation de migration**
  - [ ] Guide pour l'infrastructure
  - [ ] Processus d'ajout d'un nouvel utilisateur
  - [ ] Processus d'ajout d'une nouvelle résidence

- [ ] **Préparer les variables d'environnement**
  ```env
  # .env
  REACT_APP_AZURE_CLIENT_ID=existing-value
  REACT_APP_AZURE_TENANT_ID=existing-value
  REACT_APP_USE_ENTRA_ID=false  # Toggle migration progressive
  ```

- [ ] **Définir la matrice de permissions par rôle**

#### Livrable Phase 1
- ✅ 70 groupes Azure AD créés et documentés
- ✅ Mapping residenceId ↔ azureGroupId complet
- ✅ App Roles configurés et assignés à 3 utilisateurs pilotes
- ✅ Documentation complète pour l'équipe infra

---

### **PHASE 2 : Développement Backend** ⏱️ Estimation: 3-5 jours

#### Fichier 1 : `src/services/entraIdResidenceService.js`

```javascript
/**
 * Service de mapping résidences basé sur Microsoft Entra ID
 * Remplace le fichier JSON statique userResidenceMapping.js
 */

// Configuration du mapping résidence ↔ groupe Azure AD
export const RESIDENCE_GROUP_MAPPING = {
  // Format : residenceId → Azure AD Group Info
  '19f2179b-7d14-f011-998a-6045bd1919a1': {
    residenceName: 'ECLA GENEVE ARCHAMPS',
    azureGroupId: 'azure-group-id-1', // À remplir après création
    azureGroupName: 'FEEDACTU_RES_GENEVE_ARCHAMPS'
  },
  '195644a8-4fa7-ef11-b8e9-6045bd19a503': {
    residenceName: 'ECLA MASSY-PALAISEAU',
    azureGroupId: 'azure-group-id-2',
    azureGroupName: 'FEEDACTU_RES_MASSY_PALAISEAU'
  },
  // ... TODO: Compléter pour les 70 résidences
};

// Mapping inverse : Azure Group ID → Residence ID
export const GROUP_TO_RESIDENCE_MAPPING = Object.entries(RESIDENCE_GROUP_MAPPING)
  .reduce((acc, [residenceId, groupInfo]) => {
    acc[groupInfo.azureGroupId] = {
      residenceId,
      residenceName: groupInfo.residenceName
    };
    return acc;
  }, {});

// Groupe spécial pour les admins (accès à toutes les résidences)
export const ADMIN_GROUP_ID = 'admin-group-id-here'; // À remplir
export const ADMIN_GROUP_NAME = 'FEEDACTU_RES_ALL';

/**
 * Récupère les résidences autorisées depuis les groupes Azure AD
 * @param {string[]} userGroups - Liste des groupes Azure AD de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur (Admin, Manager, AssistantManager)
 * @returns {Array<{residenceId: string, residenceName: string}>}
 */
export function getAuthorizedResidencesFromGroups(userGroups, userRole = null) {
  console.log('🔍 Analyse des groupes utilisateur:', userGroups);
  console.log('👤 Rôle utilisateur:', userRole);

  // Si admin → accès à toutes les résidences
  if (userRole === 'Admin' || userGroups.includes(ADMIN_GROUP_ID)) {
    console.log('🔑 ADMIN détecté - Accès à toutes les résidences');
    return Object.entries(RESIDENCE_GROUP_MAPPING).map(([id, info]) => ({
      residenceId: id,
      residenceName: info.residenceName
    }));
  }

  // Filtrer les groupes qui correspondent à des résidences
  const authorizedResidences = userGroups
    .filter(groupId => GROUP_TO_RESIDENCE_MAPPING[groupId])
    .map(groupId => GROUP_TO_RESIDENCE_MAPPING[groupId]);

  console.log('🏠 Résidences autorisées trouvées:', authorizedResidences);
  return authorizedResidences;
}

/**
 * Récupère les groupes de l'utilisateur via Microsoft Graph API
 * @param {string} accessToken - Token d'accès Azure AD
 * @returns {Promise<string[]>} Liste des IDs de groupes
 */
export async function fetchUserGroups(accessToken) {
  try {
    console.log('📡 Récupération des groupes utilisateur via Graph API...');
    
    // Endpoint Microsoft Graph pour les groupes
    const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur Graph API: ${response.status}`);
    }

    const data = await response.json();
    
    // Extraire les IDs des groupes de sécurité uniquement
    const groupIds = data.value
      .filter(item => item['@odata.type'] === '#microsoft.graph.group')
      .map(group => group.id);

    console.log('✅ Groupes récupérés:', groupIds);
    return groupIds;
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des groupes:', error);
    throw error;
  }
}

/**
 * Extrait le rôle depuis les claims Azure AD
 * @param {object} account - Compte MSAL
 * @returns {string|null} Rôle de l'utilisateur
 */
export function extractUserRole(account) {
  // Les rôles sont dans les claims 'roles'
  const roles = account?.idTokenClaims?.roles || [];
  
  console.log('🔍 Rôles détectés dans les claims:', roles);

  // Priorité : Admin > Manager > AssistantManager
  if (roles.includes('Admin')) return 'Admin';
  if (roles.includes('Manager')) return 'Manager';
  if (roles.includes('AssistantManager')) return 'AssistantManager';
  
  return null;
}
```

#### Fichier 2 : `src/provider/entraIdResidenceProvider.js`

```javascript
/**
 * Provider de gestion des accès basé sur Entra ID
 * Remplace residenceAccessProvider.js
 */

import { 
  fetchUserGroups, 
  getAuthorizedResidencesFromGroups,
  extractUserRole 
} from '../services/entraIdResidenceService';

/**
 * Récupère les résidences autorisées depuis Entra ID
 * @param {string} accessToken - Token d'accès Azure AD  
 * @param {object} account - Compte MSAL avec claims
 * @returns {Promise<{residences: Array, role: string, metadata: object}>}
 */
export async function getAuthorizedResidencesForUser(accessToken, account) {
  try {
    console.log('🔐 Récupération des autorisations depuis Entra ID...');
    console.log('👤 Utilisateur:', account?.username);

    // 1. Extraire le rôle depuis les claims
    const userRole = extractUserRole(account);
    console.log('🎭 Rôle utilisateur:', userRole || 'Aucun rôle assigné');

    // 2. Récupérer les groupes de l'utilisateur via Graph API
    const userGroups = await fetchUserGroups(accessToken);

    // 3. Mapper les groupes vers les résidences
    const authorizedResidences = getAuthorizedResidencesFromGroups(userGroups, userRole);

    // 4. Vérifier qu'il y a au moins une résidence autorisée
    if (!authorizedResidences || authorizedResidences.length === 0) {
      console.error('🚨 ACCÈS REFUSÉ: Aucune résidence autorisée pour:', account?.username);
      throw new Error(
        `Accès refusé. Votre compte n'a accès à aucune résidence. ` +
        `Contactez votre administrateur pour obtenir les droits nécessaires.`
      );
    }

    console.log('✅ Autorisations validées:', {
      user: account?.username,
      role: userRole,
      residenceCount: authorizedResidences.length,
      residences: authorizedResidences
    });

    return {
      residences: authorizedResidences,
      role: userRole,
      metadata: {
        groupsCount: userGroups.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des autorisations:', error);
    throw error;
  }
}

/**
 * Vérifie si un utilisateur a accès à une résidence spécifique
 * @param {Array} authorizedResidences - Résidences autorisées
 * @param {string} residenceId - ID de la résidence à vérifier
 * @returns {boolean}
 */
export function hasAccessToResidence(authorizedResidences, residenceId) {
  return authorizedResidences.some(r => r.residenceId === residenceId);
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string[]} requiredRoles - Rôles requis
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRoles) {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}
```

#### Fichier 3 : `src/provider/hybridResidenceProvider.js` (Migration progressive)

```javascript
/**
 * Provider hybride pour migration progressive
 * Permet de basculer entre legacy (JSON) et Entra ID
 */

import { getAuthorizedResidencesForUser as getFromEntraId } from './entraIdResidenceProvider';
import { getAuthorizedResidencesForUser as getFromLegacy } from './residenceAccessProvider';

/**
 * Provider hybride avec fallback
 * @param {string} accessToken - Token Azure AD
 * @param {object} account - Compte MSAL
 * @param {string} userEmail - Email utilisateur (fallback legacy)
 * @returns {Promise<{residences: Array, role: string|null}>}
 */
export async function getAuthorizedResidencesForUser(accessToken, account, userEmail) {
  const USE_ENTRA_ID = process.env.REACT_APP_USE_ENTRA_ID === 'true';

  console.log(`🔧 Mode actif: ${USE_ENTRA_ID ? 'Entra ID' : 'Legacy (JSON)'}`);

  if (USE_ENTRA_ID) {
    try {
      console.log('🆕 Tentative avec Entra ID...');
      const result = await getFromEntraId(accessToken, account);
      
      // [PHASE PILOTE] Comparer avec legacy pour validation
      if (process.env.NODE_ENV === 'development') {
        try {
          const legacyResult = await getFromLegacy(userEmail);
          const legacyIds = legacyResult.map(r => r.residenceId).sort();
          const entraIds = result.residences.map(r => r.residenceId).sort();
          
          if (JSON.stringify(legacyIds) !== JSON.stringify(entraIds)) {
            console.warn('⚠️ DIFFÉRENCE DÉTECTÉE entre Entra ID et Legacy:', {
              entraId: entraIds,
              legacy: legacyIds,
              user: userEmail
            });
          } else {
            console.log('✅ Validation: Entra ID et Legacy identiques');
          }
        } catch (e) {
          console.log('ℹ️ Validation legacy ignorée:', e.message);
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur Entra ID, fallback vers Legacy:', error);
      
      // Fallback vers legacy en cas d'erreur
      const legacyResidences = await getFromLegacy(userEmail);
      return {
        residences: legacyResidences,
        role: null,
        metadata: { fallback: true }
      };
    }
  } else {
    // Mode Legacy
    console.log('📜 Utilisation du mode Legacy (JSON)');
    const legacyResidences = await getFromLegacy(userEmail);
    return {
      residences: legacyResidences,
      role: null,
      metadata: { legacy: true }
    };
  }
}
```

#### Checklist Développement Phase 2

- [ ] Créer `src/services/entraIdResidenceService.js`
- [ ] Créer `src/provider/entraIdResidenceProvider.js`
- [ ] Créer `src/provider/hybridResidenceProvider.js`
- [ ] Compléter `RESIDENCE_GROUP_MAPPING` avec les 70 résidences
- [ ] Ajouter les tests unitaires
- [ ] Code review

#### Livrable Phase 2
- ✅ 3 nouveaux fichiers créés et testés
- ✅ Tests unitaires passants
- ✅ Documentation technique à jour

---

### **PHASE 3 : Adaptations Frontend** ⏱️ Estimation: 2-3 jours

#### Modifications dans `src/context/AuthContext.js`

```javascript
// MODIFICATION 1: Import du nouveau provider
// Ligne 4 - AVANT
import { getAuthorizedResidencesForUser } from '../provider/residenceAccessProvider';

// Ligne 4 - APRÈS
import { getAuthorizedResidencesForUser } from '../provider/hybridResidenceProvider';

// MODIFICATION 2: Ajouter le champ 'role' dans l'état
// Ligne 32-42 - Ajouter role: null
const [authData, setAuthData] = useState({
  isAuthenticated: false,
  email: '',
  name: '',
  userId: '',
  tenantId: '',
  residenceId: null,
  authorizedResidences: [],
  accessToken: null,
  isLoading: true,
  role: null // NOUVEAU
});

// MODIFICATION 3: Modifier les scopes MSAL
// Ligne 22-24 - Ajouter Directory.Read.All
const loginRequest = {
  scopes: [
    'User.Read',
    'GroupMember.Read.All',
    'Directory.Read.All' // NOUVEAU
  ]
};

// MODIFICATION 4: Adapter l'appel au provider (ligne ~98 et ~221)
// AVANT
try {
  userResidences = await getAuthorizedResidencesForUser(userEmail);
} catch (residenceError) {
  // ...
}

// APRÈS
try {
  const authResult = await getAuthorizedResidencesForUser(
    response.accessToken, 
    account,
    userEmail
  );
  userResidences = authResult.residences;
  userRole = authResult.role;
} catch (residenceError) {
  // ...
}

// MODIFICATION 5: Mettre à jour tous les setAuthData pour inclure role
// Ajouter partout: role: userRole || null
```

#### Modifications dans `src/context/ResidenceContext.js`

```javascript
// Ajouter l'accès au rôle si nécessaire
const { authorizedResidences, isAuthenticated, role } = useAuth();

// Exemple: Filtrer selon le rôle
useEffect(() => {
  if (role === 'Admin') {
    console.log('🔑 Mode administrateur activé');
  }
}, [role]);
```

#### Checklist Frontend Phase 3

- [ ] Modifier `AuthContext.js` (import + state + scopes + appels)
- [ ] Tester le flow de connexion en mode Legacy (`REACT_APP_USE_ENTRA_ID=false`)
- [ ] Vérifier que rien ne régresse
- [ ] Ajouter variables d'environnement dans `.env`
- [ ] Mettre à jour `.env.example`

#### Livrable Phase 3
- ✅ Frontend adapté pour supporter Entra ID
- ✅ Mode Legacy fonctionnel (pas de régression)
- ✅ Tests manuels validés

---

### **PHASE 4 : Déploiement Progressif** ⏱️ Estimation: 3-4 semaines

#### Étape 4.1 : Pilote (Semaine 1)

**Objectif:** Tester avec 3-5 utilisateurs pilotes

```yaml
Configuration:
  - Environnement: Dev ou Preprod
  - Variable: REACT_APP_USE_ENTRA_ID=false (mode Legacy)
  - Utilisateurs pilotes: 3-5 personnes volontaires

Actions:
  □ Assigner les utilisateurs pilotes aux App Roles
  □ Ajouter les utilisateurs pilotes dans leurs groupes résidences
  □ Valider que les mappings sont corrects
  □ Déployer l'application (en mode Legacy)
  □ Basculer en mode Entra ID pour les pilotes uniquement
  □ Tests intensifs pendant 1 semaine
  □ Recueillir les feedbacks
  □ Corriger les bugs éventuels
```

**Profils pilotes recommandés:**
- 1 Admin (multi-résidences)
- 2 Managers mono-résidence
- 2 Managers multi-résidences

#### Étape 4.2 : Préparation Production (Semaine 2)

```yaml
Actions Infrastructure:
  □ Assigner TOUS les utilisateurs actuels aux App Roles
  □ Ajouter TOUS les utilisateurs dans les groupes résidences correspondants
  □ Double vérification du mapping avec le fichier legacy
  □ Créer une sauvegarde des configurations Azure AD

Actions Développement:
  □ Corriger les bugs identifiés en pilote
  □ Déployer la version finale en preprod
  □ Tests finaux en preprod (toujours en mode Legacy)
  □ Préparer la communication aux utilisateurs
  □ Planifier le créneau de bascule
```

#### Étape 4.3 : Bascule Production (Semaine 3)

```yaml
Jour J - Matin (09h00):
  □ Vérifier que tous les utilisateurs sont assignés dans Azure AD
  □ Backup de la base de données (si applicable)
  □ Déployer la nouvelle version (mode Legacy)
  □ Vérifier que tout fonctionne

Jour J - Après-midi (14h00):
  □ Basculer REACT_APP_USE_ENTRA_ID=true
  □ Redéployer l'application
  □ Tests de connexion avec plusieurs profils
  □ Monitoring actif (logs, erreurs)
  □ Support utilisateurs disponible

Jour J+1:
  □ Analyser les logs de connexion
  □ Résoudre les éventuels problèmes
  □ Recueillir les feedbacks utilisateurs
```

#### Étape 4.4 : Surveillance (Semaine 4)

```yaml
Surveillance quotidienne:
  □ Vérifier les logs de connexion
  □ Identifier les utilisateurs bloqués
  □ Temps de réponse Graph API
  □ Erreurs de permissions

Métriques à suivre:
  - Taux de connexion réussie: >99%
  - Temps de connexion moyen: <3 secondes
  - Erreurs d'autorisation: 0
  - Support tickets: tendance décroissante
```

#### Livrable Phase 4
- ✅ Déploiement en production réussi
- ✅ Tous les utilisateurs migrés sur Entra ID
- ✅ Aucun incident bloquant
- ✅ Documentation utilisateur disponible

---

### **PHASE 5 : Nettoyage & Optimisation** ⏱️ Estimation: 2 jours

**Après 2-3 semaines de stabilité en production**

#### Actions de Nettoyage

```yaml
Code:
  □ Supprimer src/userResidenceMapping.js
  □ Supprimer src/provider/residenceAccessProvider.js (legacy)
  □ Supprimer src/provider/hybridResidenceProvider.js
  □ Renommer entraIdResidenceProvider.js → residenceAccessProvider.js
  □ Supprimer la variable REACT_APP_USE_ENTRA_ID
  □ Nettoyer les logs de debug

Documentation:
  □ Mettre à jour README.md
  □ Archiver ce document (identity.md) dans docs/archives/
  □ Créer identity-v2.md avec la version finale
  □ Documenter le processus d'onboarding d'un nouvel utilisateur

Tests:
  □ Mettre à jour les tests unitaires
  □ Supprimer les tests legacy
  □ Ajouter tests pour les nouveaux helpers (hasRole, hasAccessToResidence)
```

#### Livrable Phase 5
- ✅ Code legacy supprimé
- ✅ Documentation à jour
- ✅ Tests nettoyés et passants
- ✅ Guide d'onboarding utilisateur créé

---

## 📚 Documentation pour l'Infrastructure

### Guide: Ajouter un Nouvel Utilisateur

```yaml
Étape 1: Identifier les informations
  - Email: exemple@uxco-group.com
  - Rôle: Manager / AssistantManager / Admin
  - Résidences: Liste des résidences à gérer

Étape 2: Assigner le rôle dans Azure AD
  1. Ouvrir Azure Portal
  2. Aller dans Azure Active Directory > App registrations
  3. Sélectionner l'application FeedActu
  4. Aller dans Enterprise Application > Users and groups
  5. Cliquer "Add user/group"
  6. Sélectionner l'utilisateur
  7. Assigner le rôle approprié (Admin/Manager/AssistantManager)
  8. Sauvegarder

Étape 3: Ajouter aux groupes résidences
  1. Aller dans Azure Active Directory > Groups
  2. Pour chaque résidence à gérer:
     - Rechercher le groupe FEEDACTU_RES_XXX
     - Aller dans Members
     - Cliquer "Add members"
     - Sélectionner l'utilisateur
     - Sauvegarder

Étape 4: Vérification
  - L'utilisateur peut se connecter dans les 5 minutes
  - Lui demander de tester la connexion
  - Vérifier qu'il voit les bonnes résidences
```

### Guide: Ajouter une Nouvelle Résidence

```yaml
Étape 1: Informations nécessaires
  - Nom de la résidence: ex. "ECLA BORDEAUX"
  - Residence ID: ex. "new-guid-xxxxx"
  - Managers assignés: Liste des emails

Étape 2: Créer le groupe Azure AD
  1. Azure Portal > Azure Active Directory > Groups
  2. Cliquer "New group"
  3. Group type: Security
  4. Group name: FEEDACTU_RES_BORDEAUX (suivre la convention)
  5. Description: "Accès résidence ECLA BORDEAUX pour FeedActu"
  6. Sauvegarder
  7. Noter l'Object ID du groupe

Étape 3: Ajouter les managers
  1. Dans le groupe créé > Members
  2. Ajouter tous les managers assignés

Étape 4: Informer l'équipe dev
  - Envoyer le mapping: Residence ID → Azure Group ID
  - L'équipe dev ajoutera le mapping dans le code
  - Prévoir un déploiement (< 30 min)

Étape 5: Tests
  - Les managers testent l'accès
  - Vérification que la résidence apparaît dans leur sélecteur
```

### Troubleshooting Courant

```yaml
Problème: Utilisateur ne peut pas se connecter
  Causes possibles:
    □ Pas d'App Role assigné
    □ Pas de groupe résidence assigné
    □ Token expiré (attendre 5 min ou vider le cache)
  Solution:
    1. Vérifier Enterprise Application > Users and groups
    2. Vérifier les groupes Azure AD
    3. Demander à l'utilisateur de vider le cache et réessayer

Problème: Utilisateur ne voit pas sa résidence
  Causes possibles:
    □ Pas membre du bon groupe Azure AD
    □ Mapping pas à jour dans le code
  Solution:
    1. Vérifier les groupes Azure AD de l'utilisateur
    2. Contacter l'équipe dev pour vérifier le mapping

Problème: Admin ne voit pas toutes les résidences
  Causes possibles:
    □ Pas membre du groupe FEEDACTU_RES_ALL
    □ App Role Admin pas assigné
  Solution:
    1. Assigner le rôle Admin
    2. Ajouter au groupe FEEDACTU_RES_ALL
```

---

## 🔧 Configuration Technique

### Variables d'Environnement

```bash
# .env (Development)
REACT_APP_AZURE_CLIENT_ID=your-client-id
REACT_APP_AZURE_TENANT_ID=your-tenant-id
REACT_APP_USE_ENTRA_ID=false  # true après migration

# .env.production
REACT_APP_AZURE_CLIENT_ID=prod-client-id
REACT_APP_AZURE_TENANT_ID=prod-tenant-id
REACT_APP_USE_ENTRA_ID=true
```

### Permissions API Microsoft Graph

```yaml
Permissions requises:
  - User.Read: Lecture profil utilisateur (Delegated) ✅
  - GroupMember.Read.All: Lecture groupes utilisateur (Delegated) ✅
  - Directory.Read.All: Lecture annuaire (Delegated) ⚠️ NOUVEAU

Note: Nécessite consentement administrateur pour Directory.Read.All
```

### Endpoints Microsoft Graph Utilisés

```javascript
// 1. Récupération profil utilisateur
GET https://graph.microsoft.com/v1.0/me
Response: { id, displayName, mail, userPrincipalName, jobTitle }

// 2. Récupération groupes de l'utilisateur
GET https://graph.microsoft.com/v1.0/me/memberOf
Response: { value: [{ id, displayName, @odata.type }] }

// 3. (Optionnel) Vérification appartenance à un groupe
GET https://graph.microsoft.com/v1.0/me/memberOf/{group-id}
Response: { id, displayName }
```

---

## ✅ Checklist Complète de Migration

### Pré-Migration

- [ ] ✅ Validation approche "groupes de sécurité" par l'infra
- [ ] ✅ Convention de nommage validée
- [ ] ✅ Liste complète des 70 résidences
- [ ] ✅ Mapping residenceId ↔ nom de résidence
- [ ] ✅ Liste utilisateurs actuels + résidences assignées

### Configuration Azure AD

- [ ] Créer 3 App Roles (Admin, Manager, AssistantManager)
- [ ] Créer ~70 groupes de sécurité
- [ ] Créer groupe spécial FEEDACTU_RES_ALL
- [ ] Configurer Optional Claims (groups, email)
- [ ] Ajouter permission Directory.Read.All
- [ ] Obtenir consentement administrateur
- [ ] Créer fichier mapping residenceId ↔ azureGroupId

### Développement

- [ ] Créer `entraIdResidenceService.js`
- [ ] Créer `entraIdResidenceProvider.js`
- [ ] Créer `hybridResidenceProvider.js`
- [ ] Compléter `RESIDENCE_GROUP_MAPPING`
- [ ] Modifier `AuthContext.js` (imports, state, scopes)
- [ ] Ajouter variable `REACT_APP_USE_ENTRA_ID`
- [ ] Tests unitaires
- [ ] Code review

### Tests

- [ ] Tests utilisateur Admin (toutes résidences)
- [ ] Tests utilisateur Manager mono-résidence
- [ ] Tests utilisateur Manager multi-résidences
- [ ] Tests utilisateur sans groupe (rejet)
- [ ] Tests utilisateur sans rôle (rejet)
- [ ] Tests Graph API (récupération groupes)
- [ ] Tests performances (temps de connexion)

### Pilote

- [ ] Sélectionner 3-5 utilisateurs pilotes
- [ ] Assigner aux App Roles
- [ ] Ajouter dans les groupes résidences
- [ ] Déployer en mode Legacy
- [ ] Activer Entra ID pour pilotes
- [ ] Tests pendant 1 semaine
- [ ] Recueillir feedbacks
- [ ] Corriger bugs

### Production

- [ ] Assigner TOUS les utilisateurs (App Roles + groupes)
- [ ] Déployer en mode Legacy
- [ ] Tests finaux
- [ ] Communication aux utilisateurs
- [ ] Basculer vers Entra ID
- [ ] Monitoring actif J-Day
- [ ] Surveillance 2-3 semaines

### Nettoyage

- [ ] Supprimer `userResidenceMapping.js`
- [ ] Supprimer `residenceAccessProvider.js` (legacy)
- [ ] Supprimer `hybridResidenceProvider.js`
- [ ] Supprimer variable `REACT_APP_USE_ENTRA_ID`
- [ ] Nettoyer logs de debug
- [ ] Mettre à jour documentation
- [ ] Créer guide onboarding utilisateur

---

## 📞 Contacts & Responsabilités

```yaml
Équipe Infrastructure:
  - Création groupes Azure AD
  - Assignation App Roles
  - Assignation groupes utilisateurs
  - Support permissions Azure AD

Équipe Développement:
  - Développement des services Entra ID
  - Tests et validation
  - Déploiements
  - Support technique utilisateurs

Équipe Métier:
  - Validation des mappings résidences
  - Tests utilisateurs
  - Formation des managers
  - Feedbacks et amélioration continue
```

---

## 📊 Métriques de Succès

```yaml
Post-Migration (Objectifs):
  - Taux de connexion réussie: >99%
  - Temps de connexion moyen: <3 secondes
  - Zéro erreur d'autorisation
  - Zéro incident bloquant
  - Satisfaction utilisateurs: >4/5
  - Temps d'ajout nouvel utilisateur: <15 minutes (vs redéploiement)
  - Temps d'ajout nouvelle résidence: <30 minutes
```

---

## 🔄 Historique des Versions

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 1.0 | 2025-10-24 | Équipe Dev | Plan initial de migration Entra ID |
| 1.1 | _À venir_ | - | Retours phase pilote |
| 2.0 | _À venir_ | - | Version finale post-migration |

---

## 📝 Notes & Décisions

### Questions en Attente

1. **Délai création groupes Azure AD** : Combien de temps pour créer 70 groupes ?
2. **Processus assignation** : Manuel via Portal ou script automatisé ?
3. **Gestion App Roles** : Qui assigne les rôles (infra ou auto-assignation) ?
4. **Permission Directory.Read.All** : Besoin validation admin tenant ?
5. **Environnements multiples** : Dupliquer config sur dev/preprod/prod ?

### Décisions Prises

- ✅ **Architecture** : Groupes de sécurité Azure AD (vs extension attributes)
- ✅ **Convention nommage** : `FEEDACTU_RES_{CODE_RESIDENCE}`
- ✅ **Migration** : Progressive en 5 phases avec période de pilote
- ✅ **Rôles** : 3 niveaux (Admin, Manager, AssistantManager)
- ✅ **Fallback** : Mode hybride pendant la migration

---

**Document vivant** - À mettre à jour au fur et à mesure de l'avancement du projet.

