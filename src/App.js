import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { PublicationsProvider } from './context/PublicationsContext';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import Polls from './pages/Polls';
import PollDetail from './pages/PollDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import DailyMessages from './pages/DailyMessages';
import DailyMessageDetail from './pages/DailyMessageDetail';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import EventsCalendar from './pages/EventsCalendar';


function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wrapper pour protéger les routes avec middleware de vérification
  const ProtectedRoute = ({ children }) => {
    
    // Pendant le chargement, afficher un loader
    if (isLoading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="#f5f5f5"
        >
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Chargement de votre session...
          </Typography>
        </Box>
      );
    }
    
    // Si pas authentifié après chargement, rediriger vers login
    if (!isAuthenticated) {
      console.log('🚫 Utilisateur non authentifié, redirection vers /login');
      return <Navigate to="/login" replace />;
    }
        return children;
  };


  return (
    <PublicationsProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/polls/:id" element={<PollDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/daily-messages" element={<DailyMessages />} />
          <Route path="/daily-messages/:id" element={<DailyMessageDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetail />} />
          <Route path="/events-calendar" element={<EventsCalendar />} />
        </Route>
      </Routes>
    </PublicationsProvider>
  );
}

export default App;
