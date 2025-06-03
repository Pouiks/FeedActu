import { userResidenceMapping } from '../userResidenceMapping';

export async function getAuthorizedResidencesForUser(userEmail) {
  return userResidenceMapping[userEmail.toLowerCase()] || [];
}
