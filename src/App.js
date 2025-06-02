import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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
  const { isAuthenticated } = useAuth();

  // Wrapper pour protéger les routes
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
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
  );
}

export default App;
