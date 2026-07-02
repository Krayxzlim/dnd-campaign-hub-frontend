import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignPage from './pages/CampaignPage';
import UsersPage from './pages/UsersPage';
import './App.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-icon">⚔️</div>
      <div className="loading-text">Cargando el reino...</div>
    </div>
  );

  if (!user) return <LoginPage />;

  const navigate = (p, extra) => {
    if (p === 'campaign' && extra) setSelectedCampaignId(extra);
    setPage(p);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('dashboard')}>
          <span className="brand-icon">⚔️</span>
          <span className="brand-name">D&D Campaign Hub</span>
        </div>
        <div className="navbar-links">
          <button
            className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('dashboard')}
          >🗺️ Campañas</button>
          {user.role === 'dm' && (
            <button
              className={`nav-btn ${page === 'users' ? 'active' : ''}`}
              onClick={() => navigate('users')}
            >👥 Usuarios</button>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-avatar">{user.avatar}</span>
          <span className="user-name">{user.username}</span>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'dm' ? '🧙 DM' : '⚔️ Player'}
          </span>
          <button className="logout-btn" onClick={logout}>Salir</button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'dashboard' && <DashboardPage navigate={navigate} />}
        {page === 'campaign' && selectedCampaignId && (
          <CampaignPage campaignId={selectedCampaignId} navigate={navigate} />
        )}
        {page === 'users' && user.role === 'dm' && <UsersPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
