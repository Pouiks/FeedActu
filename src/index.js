import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResidenceProvider } from './context/ResidenceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ResidenceProvider>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </ResidenceProvider>
);
