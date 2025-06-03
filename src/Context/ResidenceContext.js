import React, { createContext, useContext, useState } from 'react';

const ResidenceContext = createContext();

export function ResidenceProvider({ children }) {
  const [currentResidenceId, setCurrentResidenceId] = useState(null);
  const [selectedResidenceIds, setSelectedResidenceIds] = useState([]);

  return (
    <ResidenceContext.Provider value={{
      currentResidenceId,
      setCurrentResidenceId,
      selectedResidenceIds,
      setSelectedResidenceIds
    }}>
      {children}
    </ResidenceContext.Provider>
  );
}

export function useResidence() {
  return useContext(ResidenceContext);
} 