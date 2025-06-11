import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ResidenceContext = createContext();

export function ResidenceProvider({ children }) {
  const [currentResidenceId, setCurrentResidenceId] = useState(null);
  const [currentResidenceName, setCurrentResidenceName] = useState('');
  const [selectedResidenceIds, setSelectedResidenceIds] = useState([]);
  const { authorizedResidences, isAuthenticated } = useAuth();

  // Auto-sélection de la première résidence disponible
  useEffect(() => {
    if (isAuthenticated && authorizedResidences && authorizedResidences.length > 0) {
      // Si aucune résidence n'est sélectionnée, prendre la première
      if (!currentResidenceId) {
        const firstResidence = authorizedResidences[0];
        setCurrentResidenceId(firstResidence.residenceId);
        setCurrentResidenceName(firstResidence.residenceName);
        console.log('🏠 Auto-sélection de la première résidence:', firstResidence.residenceName);
      } else {
        // Vérifier que la résidence actuelle est toujours dans la liste
        const currentResidence = authorizedResidences.find(r => r.residenceId === currentResidenceId);
        if (currentResidence) {
          setCurrentResidenceName(currentResidence.residenceName);
        } else {
          // Si la résidence actuelle n'est plus disponible, prendre la première
          const firstResidence = authorizedResidences[0];
          setCurrentResidenceId(firstResidence.residenceId);
          setCurrentResidenceName(firstResidence.residenceName);
          console.log('🔄 Résidence actuelle non disponible, sélection de:', firstResidence.residenceName);
        }
      }
    }
  }, [isAuthenticated, authorizedResidences, currentResidenceId]);

  // Fonction pour changer de résidence
  const changeResidence = (residenceId) => {
    if (authorizedResidences) {
      const residence = authorizedResidences.find(r => r.residenceId === residenceId);
      if (residence) {
        setCurrentResidenceId(residenceId);
        setCurrentResidenceName(residence.residenceName);
        console.log('🏠 Résidence changée vers:', residence.residenceName);
      }
    }
  };

  return (
    <ResidenceContext.Provider value={{
      currentResidenceId,
      currentResidenceName,
      setCurrentResidenceId: changeResidence,
      selectedResidenceIds,
      setSelectedResidenceIds
    }}>
      {children}
    </ResidenceContext.Provider>
  );
}

export function useResidence() {
  const context = useContext(ResidenceContext);
  if (!context) {
    throw new Error('useResidence doit être utilisé dans un ResidenceProvider');
  }
  return context;
}

export default ResidenceProvider; 