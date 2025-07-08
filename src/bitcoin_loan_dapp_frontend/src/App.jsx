import React from 'react';
import './index.css';
import { AuthProvider, useAuth } from './AuthContext';

// Landing Page Component
function LandingPage({ onLogin }) {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="bitcoin-icon">₿</span>
            <span>Bitcoin Loan Platform</span>
          </div>
          <button className="cta-button" onClick={onLogin}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Bitcoin-Backed Loans.<br />
              <span className="highlight">Decentralized.</span><br />
              <span className="highlight">Non-Custodial.</span>
            </h1>
            <p className="hero-subtitle">
              Unlock the value of your Bitcoin without selling. Get instant loans 
              backed by your Bitcoin on the Internet Computer blockchain.
            </p>
            <button className="primary-button" onClick={onLogin}>
              <span className="button-icon">🆔</span>
              Login with Internet Identity
            </button>
          </div>
          <div className="hero-image">
            <div className="bitcoin-coin">₿</div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Non-Custodial</h3>
              <p>Your Bitcoin remains in your control. We never take custody of your assets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Liquidity</h3>
              <p>Get loans instantly without credit checks or lengthy approval processes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Fully Decentralized</h3>
              <p>Built on Internet Computer blockchain for maximum transparency and security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Wallet</h3>
              <p>Login with Internet Identity for secure authentication</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Link Bitcoin</h3>
              <p>Connect your Bitcoin address to use as collateral</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Receive Loan</h3>
              <p>Get instant loans while keeping your Bitcoin safe</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Dashboard Component
function Dashboard({ userPrincipal, onLogout, onConnectPlug, isPlugConnected, actor }) {
  const [health, setHealth] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleHealthCheck = async () => {
    if (!actor) {
      alert("Plug Wallet is not connected. Please connect it to make a transaction.");
      return;
    }
    
    setLoading(true);
    try {
      const healthStatus = await actor.health();
      setHealth(healthStatus);
      alert("Backend health check successful: " + healthStatus);
    } catch (error) {
      console.error("Health check failed:", error);
      alert("Health check failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="logo">
            <span className="bitcoin-icon">₿</span>
            <span>Dashboard</span>
          </div>
          <div className="user-info">
            <span className="user-principal">
              {userPrincipal?.toText().slice(0, 8)}...
            </span>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Wallet Connection Section */}
          <section className="wallet-section">
            <div className="card">
              <h3>Wallet Connection</h3>
              <div className="wallet-status">
                <div className="status-item">
                  <span className="status-label">Internet Identity:</span>
                  <span className="status-value connected">✅ Connected</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Plug Wallet:</span>
                  <span className={`status-value ${isPlugConnected ? 'connected' : 'disconnected'}`}>
                    {isPlugConnected ? '✅ Connected' : '❌ Not Connected'}
                  </span>
                </div>
              </div>
              
              {!isPlugConnected && (
                <button className="secondary-button" onClick={onConnectPlug}>
                  <span className="button-icon">🔌</span>
                  Connect Plug Wallet
                </button>
              )}
            </div>
          </section>

          {/* Actions Section */}
          <section className="actions-section">
            <div className="card">
              <h3>Available Actions</h3>
              <div className="action-buttons">
                <button 
                  className={`action-button ${!isPlugConnected ? 'disabled' : ''}`}
                  onClick={handleHealthCheck} 
                  disabled={!isPlugConnected || loading}
                >
                  <span className="button-icon">🏥</span>
                  {loading ? 'Checking...' : 'Health Check'}
                </button>
                
                <button 
                  className={`action-button ${!isPlugConnected ? 'disabled' : ''}`}
                  disabled={!isPlugConnected}
                >
                  <span className="button-icon">💰</span>
                  Create Loan
                </button>
                
                <button 
                  className={`action-button ${!isPlugConnected ? 'disabled' : ''}`}
                  disabled={!isPlugConnected}
                >
                  <span className="button-icon">📊</span>
                  View Loans
                </button>
              </div>
              
              {!isPlugConnected && (
                <p className="requirement-note">
                  * Plug Wallet connection required for transactions
                </p>
              )}
              
              {health && (
                <div className="health-status">
                  <span>Backend Status: {health}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Main App Component
function AppContent() {
  const { login, logout, connectPlug, isAuthenticated, isPlugConnected, actor, userPrincipal } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage onLogin={login} />;
  }

  return (
    <Dashboard 
      userPrincipal={userPrincipal}
      onLogout={logout}
      onConnectPlug={connectPlug}
      isPlugConnected={isPlugConnected}
      actor={actor}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;