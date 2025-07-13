import React from 'react';
import { useAuth } from './context/AuthContext';
import './index.css';

export default function LandingPage() {
  const { login, isConnecting, error } = useAuth();
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>Welcome to Bitcoin Loan dApp</h1>
        <p>Sign in with Internet Identity to get started.</p>
        {error && <div className="error">{error}</div>}
        <button className="login-button primary" onClick={login} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Login with Internet Identity'}
        </button>
      </div>
    </div>
  );
} 