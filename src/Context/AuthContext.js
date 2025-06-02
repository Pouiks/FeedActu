import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    email: '',
    residenceId: null
  });

  const login = (email, password, residenceId) => {
    console.log('Login with', email, password, residenceId);

    setAuthData({
      isAuthenticated: true,
      email,
      residenceId
    });
  };

  const logout = () => {
    setAuthData({
      isAuthenticated: false,
      email: '',
      residenceId: null
    });
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
