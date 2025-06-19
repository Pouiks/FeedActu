import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/directus-theme.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResidenceProvider } from './context/ResidenceContext';
import './debug-import'; // LIGNE TEMPORAIRE - à supprimer

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
  <ResidenceProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </ResidenceProvider>
    </AuthProvider>
);
