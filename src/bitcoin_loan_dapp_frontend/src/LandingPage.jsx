import React from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const { 
    isAuthenticated, 
    login,
    connectPlug,
    isPlugConnected
  } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handlePlugConnect = async () => {
    try {
      await connectPlug();
    } catch (err) {
      console.error('Plug connection failed:', err);
    }
  };

  return (
    <div className="landing-page">
      {/* Environment Badge */}
      <div className="environment-badge">
        100% on-chain INTERNET COMPUTER
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bitcoin-Backed Loans.<br />
            Decentralized.<br />
            Non-Custodial.
          </h1>
          <p className="hero-subtitle">
            Get liquidity without selling your BTC — on-chain, secure,
            and trustless.
          </p>
          <div className="auth-buttons">
            <button
              onClick={handleLogin}
              className="login-button primary"
            >
              Login with Internet Identity
            </button>
            <button
              onClick={handlePlugConnect}
              className="login-button secondary"
            >
              Connect Plug Wallet
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Key Features</h2>
          <p className="section-description">
            Explore the innovative features that make our platform the premier choice for Bitcoin-backed loans.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3 className="feature-title">Non-Custodial Vaults</h3>
            <p className="feature-description">
              Your Bitcoin remains under your control, secured by smart contracts.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3 className="feature-title">Instant, Flexible Loans</h3>
            <p className="feature-description">
              Access liquidity with loan terms tailored to your needs.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3 className="feature-title">Smart-Contract Driven</h3>
            <p className="feature-description">
              Security and transparency via our smart contract system.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🌐</span>
            <h3 className="feature-title">Runs on Internet Computer</h3>
            <p className="feature-description">
              Decentralized and scalable platform powered by ICP.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Get liquidity from your Bitcoin in four simple steps. Our streamlined process
            ensures you can access funds quickly while maintaining full control of your assets.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Connect Wallet</h4>
              <p>Link your Bitcoin wallet and authenticate with Internet Identity</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Deposit Collateral</h4>
              <p>Lock your Bitcoin as collateral in our secure smart contracts</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Receive Loan</h4>
              <p>Get instant liquidity in ckBTC based on your collateral value</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Manage & Repay</h4>
              <p>Track your active loans and repay them at any time</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 