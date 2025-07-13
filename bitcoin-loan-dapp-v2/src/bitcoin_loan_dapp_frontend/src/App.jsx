import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import EscrowDashboard from './EscrowDashboard';
import './index.css';

function MainApp() {
  const { isAuthenticated, isConnecting, error, actor, userPrincipal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('loans');

  if (isConnecting) return <div className="centered"><div className="spinner" /> Loading...</div>;
  if (error) return <div className="centered error">{error}</div>;
  if (!isAuthenticated) return <LandingPage />;
  if (!actor) return <div className="centered"><div className="spinner" /> Connecting to canister...</div>;

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="logo">Bitcoin Loan dApp</div>
        <div className="nav-tabs">
          <button className={activeTab === 'loans' ? 'active' : ''} onClick={() => setActiveTab('loans')}>Loans</button>
          <button className={activeTab === 'escrow' ? 'active' : ''} onClick={() => setActiveTab('escrow')}>Escrow</button>
        </div>
        <div className="nav-actions">
          <span className="principal">{userPrincipal}</span>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>
      </nav>
      <main>
        {activeTab === 'loans' ? <Dashboard actor={actor} userPrincipal={userPrincipal} /> : <EscrowDashboard actor={actor} userPrincipal={userPrincipal} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
} 