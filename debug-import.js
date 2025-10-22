// Test temporaire - à supprimer après
try {
  const AuthStuff = require('./context/AuthContext');
} catch (e) {
  console.log('❌ require failed:', e.message);
}

try {
  import('./context/AuthContext').then(module => {
  });
} catch (e) {
  console.log('❌ dynamic import failed:', e.message);
}