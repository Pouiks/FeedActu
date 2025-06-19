// Test temporaire - à supprimer après
console.log('Testing imports...');

try {
  const AuthStuff = require('./context/AuthContext');
  console.log('✅ require works:', AuthStuff);
} catch (e) {
  console.log('❌ require failed:', e.message);
}

try {
  import('./context/AuthContext').then(module => {
    console.log('✅ dynamic import works:', module);
  });
} catch (e) {
  console.log('❌ dynamic import failed:', e.message);
}