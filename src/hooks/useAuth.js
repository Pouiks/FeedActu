import { useAuthContext } from '../Context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
