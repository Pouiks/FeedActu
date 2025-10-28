# 🚀 Guide de Déploiement Azure App Service

## 📋 Configuration Azure Portal

### 1. Stack Settings (Configuration Générale)

Allez dans **Azure Portal** → **Votre App Service** → **Configuration** → **General settings**

```
Stack: Node
Version: Node 22 LTS
```

### 2. Startup Command

Dans **Azure Portal** → **Configuration** → **General settings** → **Startup Command** :

```bash
npm ci && npm run build && npm run start:prod
```

**Explication :**
- `npm ci` : Installe les dépendances de production (plus rapide et fiable que npm install)
- `npm run build` : Crée le build optimisé React dans le dossier `build/`
- `npm run start:prod` : Lance le serveur Express qui sert les fichiers statiques

### 3. Variables d'Environnement

Allez dans **Configuration** → **Application Settings** et ajoutez :

```
REACT_APP_AZURE_CLIENT_ID=votre-client-id
REACT_APP_AZURE_TENANT_ID=votre-tenant-id
NODE_ENV=production
```

⚠️ **IMPORTANT** : Les variables `REACT_APP_*` doivent être définies **avant** le build !

### 4. Port Configuration

- **En local** : Le serveur utilise le port **3001** (pour éviter les conflits avec d'autres services)
- **Sur Azure** : Azure définit automatiquement la variable `PORT` (généralement 8080 ou 80)
- Le serveur Express utilise automatiquement `process.env.PORT` s'il existe, sinon 3001

---

## 🧪 Tests en Local

### Mode Développement (comme d'habitude)

```bash
npm start
```
→ Lance react-scripts sur http://localhost:3000
→ Hot reload, DevTools, mode développement

### Tester le Build de Production Localement

**1. Builder l'application :**
```bash
npm run build
```

**2. Tester le serveur de production :**
```bash
npm run build:test
```
→ Build + démarre Express sur http://localhost:3001
→ Simule exactement l'environnement Azure

**Ou en 2 commandes séparées :**
```bash
npm run build       # Créer le build
npm run start:prod  # Lancer le serveur sur http://localhost:3001
```

---

## 📂 Structure des Fichiers

```
frontend/
├── build/              # 🏗️ Généré par npm run build (ignoré par git)
├── public/             # Fichiers publics
├── src/                # Code source React
├── server.js           # 🆕 Serveur Express pour production Azure
├── package.json        # 🆕 Modifié avec scripts + express
├── staticwebapp.config.json  # Non utilisé (App Service, pas Static Web App)
└── AZURE-DEPLOYMENT.md # Ce fichier
```

---

## 🔄 Workflow de Déploiement

### Option A : Déploiement depuis VS Code

1. Installer l'extension **Azure App Service**
2. Clic droit sur le projet → **Deploy to Web App**
3. Sélectionner votre App Service
4. Azure va automatiquement :
   - Détecter Node.js
   - Installer les dépendances
   - Exécuter la Startup Command

### Option B : GitHub Actions (Recommandé)

Créez `.github/workflows/azure-deploy.yml` :

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build React app
      run: npm run build
      env:
        REACT_APP_AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
        REACT_APP_AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
        
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'votre-app-name'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

### Option C : Déploiement ZIP

```bash
# 1. Créer le build
npm run build

# 2. Créer une archive avec tout sauf node_modules
zip -r deploy.zip . -x "node_modules/*" ".git/*"

# 3. Déployer via Azure CLI
az webapp deployment source config-zip \
  --resource-group votre-resource-group \
  --name votre-app-name \
  --src deploy.zip
```

---

## 🔍 Diagnostic et Debug

### Voir les Logs en Temps Réel

**Azure Portal** → **Log Stream**

Ou via Azure CLI :
```bash
az webapp log tail --name votre-app-name --resource-group votre-resource-group
```

### Console SSH

**Azure Portal** → **Development Tools** → **SSH** → **Go**

```bash
# Vérifier que le dossier build existe
ls -la build/

# Vérifier les variables d'environnement
printenv | grep REACT_APP

# Vérifier le processus Node
ps aux | grep node

# Voir les logs
cat /home/LogFiles/default_docker.log
```

### Problèmes Courants

**❌ "Cannot find module 'express'"**
→ Assurez-vous que `express` est dans `dependencies` (pas `devDependencies`)
→ Utilisez `npm ci` au lieu de `npm install --production`

**❌ "REACT_APP_* variables undefined"**
→ Les variables doivent être définies dans Azure App Settings
→ Elles doivent être présentes **avant** le build

**❌ "404 sur les routes React"**
→ Le serveur Express gère déjà toutes les routes (*)
→ Vérifiez que server.js est bien exécuté

**❌ "Application lente"**
→ Vérifiez que c'est le dossier `build/` qui est servi, pas `npm start`

---

## ✅ Checklist de Déploiement

- [ ] Express ajouté dans `dependencies`
- [ ] `server.js` présent à la racine
- [ ] Scripts `start:prod` et `build:test` dans `package.json`
- [ ] Variables `REACT_APP_*` configurées dans Azure
- [ ] Startup Command configurée dans Azure
- [ ] Test local avec `npm run build:test` réussi
- [ ] Dossier `build/` dans `.gitignore`
- [ ] Premier déploiement effectué
- [ ] Logs vérifiés dans Azure Log Stream
- [ ] Application accessible et fonctionnelle

---

## 📊 Performance

Avec cette configuration :
- ✅ Build optimisé React (minifié, tree-shaking)
- ✅ Fichiers statiques servis efficacement par Express
- ✅ Pas de serveur de développement en production
- ✅ Cache navigateur géré automatiquement

---

## 🆘 Support

- **Documentation React** : https://create-react-app.dev/docs/deployment/
- **Azure App Service** : https://learn.microsoft.com/en-us/azure/app-service/
- **Express.js** : https://expressjs.com/

---

**Dernière mise à jour :** 2025-10-28

