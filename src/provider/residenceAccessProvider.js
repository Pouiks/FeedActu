import { userResidenceMapping } from '../userResidenceMapping';

export async function getAuthorizedResidencesForUser(userEmail) {
  const normalizedEmail = userEmail.toLowerCase();
  const userResidences = userResidenceMapping[normalizedEmail];
  
  // ❌ SÉCURITÉ : Bloquer les utilisateurs non autorisés
  if (!userResidences || userResidences.length === 0) {
    console.error('🚨 ACCÈS REFUSÉ: Utilisateur non autorisé:', normalizedEmail);
    throw new Error(`Accès refusé. L'utilisateur ${userEmail} n'est pas autorisé à accéder à cette application.`);
  }
  
  console.log('✅ Utilisateur autorisé:', normalizedEmail, 'Résidences:', userResidences);
  return userResidences;
}
