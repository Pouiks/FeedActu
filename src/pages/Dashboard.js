import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
