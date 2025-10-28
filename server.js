const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques du dossier build
app.use(express.static(path.join(__dirname, 'build')));

// Gérer toutes les routes React (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Application React servie sur le port ${PORT}`);
  console.log(`🌐 Accessible sur http://localhost:${PORT}`);
});

