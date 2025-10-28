# 📊 Guide d'Utilisation des Logs Azure AD

## 🎯 Objectif

Ce document explique comment utiliser les logs Azure AD ajoutés pour préparer la migration vers Entra ID.

---

## 🚀 Comment Tester

### 1. Redémarrez le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm start
```

### 2. Connectez-vous à l'application

- Cliquez sur "Se connecter avec mon compte"
- Authentifiez-vous avec votre compte Azure AD

### 3. Ouvrez la Console du Navigateur

- Appuyez sur **F12**
- Allez dans l'onglet **Console**

---

## 📋 Ce Que Vous Verrez

### 1. 👤 PROFIL COMPLET

Contient toutes vos informations personnelles :

```json
{
  "id": "2ab9c558-448c-455a-805d-cdd8c1724fdc",
  "displayName": "Virgile JOINVILLE",
  "mail": "v.joinville@uxco-group.com",
  "userPrincipalName": "v.joinville@uxco-group.com",
  "jobTitle": "Web Tech Lead",
  "department": "IT",
  "officeLocation": "Paris",
  "mobilePhone": "+33...",
  "businessPhones": [...],
  "preferredLanguage": "fr-FR"
}
```

### 2. 🏢 GROUPES AZURE AD

**CRITIQUE pour la migration !** Liste des groupes dont vous êtes membre :

```javascript
// Nombre de groupes
📊 Nombre de groupes: 12

// Noms des groupes
📋 Noms des groupes: [
  "UXCO_IT_Team",
  "UXCO_Developers",
  "Azure_Users",
  ...
]

// Détail complet des groupes
🏢 GROUPES AZURE AD: [
  {
    "id": "abc123...",
    "displayName": "UXCO_IT_Team",
    "description": "Équipe IT UXCO",
    "mailNickname": "uxco-it"
  },
  ...
]
```

### 3. 🎫 TOKEN CLAIMS (RÔLES)

Contient les **App Roles** si déjà configurés :

```json
{
  "aud": "47b409d4-f5e2-...",
  "iss": "https://sts.windows.net/...",
  "roles": [],  // ← Vide pour le moment (normal)
  "email": "v.joinville@uxco-group.com",
  "groups": ["abc123...", "def456..."],  // ← IDs des groupes
  ...
}
```

### 4. 📦 RÉCAPITULATIF COMPLET

Un JSON structuré avec tout ce dont vous avez besoin :

```json
{
  "profile": { ... },
  "groups": [ ... ],
  "roles": [],
  "ids": {
    "objectId": "...",
    "homeAccountId": "...",
    "tenantId": "2cc00a3b-6eb2-..."
  },
  "tokenClaims": { ... }
}
```

---

## 🔍 Informations Critiques à Noter

### Pour la Migration Entra ID

| Information | Où la Trouver | Utilité |
|-------------|---------------|---------|
| **IDs des groupes existants** | `groups[].id` | Vérifier les groupes actuels |
| **Noms des groupes** | `groups[].displayName` | Convention de nommage |
| **App Roles assignés** | `roles[]` | Vérifier si déjà configuré |
| **Email utilisateur** | `profile.email` | Mapping utilisateurs |
| **Tenant ID** | `ids.tenantId` | Configuration Azure AD |

### Ce Qui Devrait Être Vide (Normal) :

- ✅ `roles: []` - Les App Roles ne sont pas encore configurés
- ✅ Aucun groupe commençant par `FEEDACTU_RES_` - Ils seront créés par l'infra

### Ce Qui Doit Être Rempli :

- ✅ `groups[]` - Devrait contenir au moins quelques groupes Azure AD
- ✅ `profile.*` - Toutes vos infos personnelles
- ✅ `ids.*` - Les identifiants uniques

---

## 📤 Partager avec l'Équipe Infrastructure

### 1. Copier le JSON Complet

Dans la console, faites **clic droit** sur le récapitulatif → **"Copy object"**

### 2. Créer un Fichier

Collez le contenu dans un fichier `mon-profil-azure-ad.json`

### 3. Envoyer à l'Équipe Infra

```
Bonjour,

Voici mon profil Azure AD actuel pour préparer la migration Entra ID.

Informations importantes :
- Email: v.joinville@uxco-group.com
- Nombre de groupes actuels: X
- App Roles assignés: Aucun (à configurer)

Voir fichier joint pour les détails complets.

Merci !
```

---

## 🎓 Utilisation pour la Migration

### Phase 1 : Audit

- [ ] Lister tous les utilisateurs actuels (`userResidenceMapping.js`)
- [ ] Demander à chaque utilisateur de se connecter et d'envoyer ses logs
- [ ] Compiler les données pour voir les groupes existants

### Phase 2 : Planification

- [ ] Décider de la convention de nommage des groupes résidences
- [ ] Créer le mapping `residenceId ↔ azureGroupId`
- [ ] Planifier les App Roles (Admin, Manager, AssistantManager)

### Phase 3 : Configuration

- [ ] L'infra crée les 70 groupes de sécurité
- [ ] L'infra crée les 3 App Roles
- [ ] L'infra assigne les utilisateurs aux groupes et rôles

### Phase 4 : Validation

- [ ] Re-tester la connexion
- [ ] Vérifier que les nouveaux groupes apparaissent dans les logs
- [ ] Vérifier que les rôles apparaissent dans `roles[]`

---

## 🐛 Troubleshooting

### Aucun groupe ne s'affiche

**Problème** : `groups: []` ou `Nombre de groupes: 0`

**Causes possibles** :
- Vous n'êtes membre d'aucun groupe Azure AD
- Les permissions API ne sont pas configurées
- Le scope `GroupMember.Read.All` n'est pas accordé

**Solution** :
1. Vérifier dans Azure Portal > Azure AD > Groups
2. Vérifier que vous êtes membre d'au moins un groupe
3. Contacter l'infra pour vérifier les permissions API

### Erreur "Access denied" lors de la récupération des groupes

**Problème** : `⚠️ Erreur Microsoft Graph (non bloquante)`

**Cause** : Permissions insuffisantes

**Solution** :
```env
# Dans .env, vérifier que les scopes sont corrects
# Les scopes sont définis dans AuthContext.js ligne 204
scopes: ['User.Read', 'GroupMember.Read.All']
```

Contacter l'admin Azure AD pour accorder le consentement administrateur.

### Les rôles sont vides

**Problème** : `roles: []`

**Cause** : C'est **normal** ! Les App Roles ne sont pas encore configurés.

**Solution** : Attendre la Phase 1 de la migration (création des App Roles par l'infra)

---

## 📞 Support

Pour toute question sur ces logs :
1. Vérifier ce guide
2. Consulter `identity.md` pour le plan de migration complet
3. Contacter l'équipe dev ou infra

---

**Dernière mise à jour** : 28 octobre 2025

