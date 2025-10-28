# 📝 Commandes Disponibles

## 🛠️ Développement Local

### Lancer le serveur de développement
```bash
npm start
```
→ Ouvre http://localhost:3000  
→ Hot reload activé  
→ DevTools React disponibles  
→ **Utilisez cette commande pour votre travail quotidien**

### Lancer les tests
```bash
npm test
```

---

## 🏗️ Production

### Créer le build de production
```bash
npm run build
```
→ Crée le dossier `build/` avec les fichiers optimisés  
→ Minification, tree-shaking, optimisations appliquées

### Tester le build en local (avant déploiement Azure)
```bash
npm run build:test
```
→ Build + lance le serveur Express sur http://localhost:3001  
→ Simule exactement l'environnement Azure  
→ **Utilisez cette commande pour tester avant de déployer**

### Lancer uniquement le serveur de production (si build existe déjà)
```bash
npm run start:prod
```
→ Lance Express sur http://localhost:3001  
→ Nécessite que `npm run build` ait été exécuté avant

---

## 🚀 Déploiement Azure

**Configuration Azure App Service nécessaire :**

1. **Stack** : Node 22 LTS
2. **Startup Command** : `npm ci && npm run build && npm run start:prod`
3. **Variables d'environnement** : Configurez `REACT_APP_*` dans Azure Portal

**Documentation complète** : Voir `AZURE-DEPLOYMENT.md`

---

## 📂 Fichiers Modifiés/Créés

### Nouveaux fichiers
- ✅ `server.js` - Serveur Express pour production
- ✅ `AZURE-DEPLOYMENT.md` - Guide complet Azure
- ✅ `README-COMMANDES.md` - Ce fichier

### Fichiers modifiés
- ✅ `package.json` - Ajout d'express + scripts prod
- ✅ `.gitignore` - Ajout de `/build`

---

## ⚡ Résumé Rapide

| Commande | Quand l'utiliser |
|----------|------------------|
| `npm start` | 👨‍💻 Développement quotidien |
| `npm run build` | 🏗️ Créer le build |
| `npm run build:test` | 🧪 Tester avant déploiement |
| `npm run start:prod` | 🚀 Serveur prod (si build existe) |

---

**💡 Tip** : Votre workflow de développement n'a pas changé ! Utilisez toujours `npm start` comme avant.

