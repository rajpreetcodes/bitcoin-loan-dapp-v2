import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { CURRENT_ENV, CONFIG } from './actor';

const LandingPage = () => {
  const { 
    isAuthenticated, 
    loginWithInternetIdentity, 
    loginWithPlugWallet, 
    isConnecting, 
    error,
    clearError,
    environment
  } = useAuth();
  const navigate = useNavigate();

  // PRODUCTION-READY NAVIGATION
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // PRODUCTION-READY LOGIN HANDLERS
  const handleInternetIdentityLogin = async () => {
    try {
      clearError();
      await loginWithInternetIdentity();
    } catch (err) {
      console.error('Internet Identity login failed:', err);
    }
  };

  const handlePlugWalletLogin = async () => {
    try {
      clearError();
      await loginWithPlugWallet();
    } catch (err) {
      console.error('Plug Wallet login failed:', err);
    }
  };

  return (
    <div className="landing-page">
      <div className="container">
        {/* PRODUCTION-READY HEADER */}
        <header className="header">
          <div className="logo">
            <h1>₿ Bitcoin Loan DApp</h1>
            <p className="subtitle">Decentralized Bitcoin Lending Platform</p>
          </div>
          <div className="environment-info">
            <span className="env-badge">{CURRENT_ENV}</span>
          </div>
        </header>

        {/* PRODUCTION-READY HERO SECTION */}
      <section className="hero">
          <div className="hero-content">
            <h2 className="hero-title">
              Unlock Your Bitcoin's Potential
            </h2>
            <p className="hero-description">
              Use your Bitcoin as collateral to access instant loans on the Internet Computer blockchain. 
              Secure, transparent, and fully decentralized.
            </p>
            
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">Secure Collateral</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Instant Loans</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌐</span>
                <span className="feature-text">Decentralized</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <span className="feature-text">Transparent</span>
              </div>
            </div>
        </div>
      </section>

        {/* PRODUCTION-READY AUTHENTICATION SECTION */}
        <section className="auth-section">
          <div className="auth-container">
            <h3 className="auth-title">Connect Your Wallet</h3>
            <p className="auth-description">
              Choose your preferred authentication method to get started
            </p>

            {/* ERROR HANDLING */}
            {error && (
              <div className="alert error">
                <div className="alert-content">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-text">{error}</span>
                  <button onClick={clearError} className="alert-close">×</button>
                </div>
              </div>
            )}

            {/* AUTHENTICATION BUTTONS */}
            <div className="auth-buttons">
              {/* PRIMARY: Internet Identity */}
              <button
                onClick={handleInternetIdentityLogin}
                disabled={isConnecting}
                className="auth-button primary"
              >
                {isConnecting ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🆔</span>
                    <span className="button-text">
                      <span className="button-title">Internet Identity</span>
                      <span className="button-subtitle">Secure & Anonymous</span>
                    </span>
                  </>
                )}
              </button>

              {/* SECONDARY: Plug Wallet */}
              <button
                onClick={handlePlugWalletLogin}
                disabled={isConnecting}
                className="auth-button secondary"
              >
                {isConnecting ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔌</span>
                    <span className="button-text">
                      <span className="button-title">Plug Wallet</span>
                      <span className="button-subtitle">Browser Extension</span>
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* PRODUCTION-READY HELP SECTION */}
            <div className="auth-help">
              <h4>Need Help?</h4>
              <div className="help-links">
                <a 
                  href="https://identity.ic0.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  📖 Internet Identity Guide
                </a>
                <a 
                  href="https://plugwallet.ooo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  🔌 Install Plug Wallet
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTION-READY HOW IT WORKS */}
        <section className="how-it-works">
          <div className="how-it-works-content">
            <h3 className="section-title">How It Works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Connect Wallet</h4>
                  <p>Authenticate with Internet Identity or Plug Wallet</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Link Bitcoin Address</h4>
                  <p>Connect your Bitcoin wallet to use as collateral</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Create Loan</h4>
                  <p>Use your Bitcoin to secure instant loans</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Manage & Repay</h4>
                  <p>Track your loans and repay when ready</p>
                </div>
              </div>
          </div>
        </div>
      </section>

        {/* PRODUCTION-READY ENVIRONMENT STATUS */}
        {CURRENT_ENV === 'local' && (
          <section className="dev-info">
            <div className="dev-info-content">
              <h4>🛠️ Development Mode</h4>
              <div className="dev-details">
                <p><strong>Environment:</strong> {CURRENT_ENV}</p>
                <p><strong>Host:</strong> {CONFIG.host}</p>
                <p><strong>Identity Provider:</strong> {CONFIG.identityProvider}</p>
              </div>
              <p className="dev-warning">
                ⚠️ This is a development environment. Do not use real Bitcoin or sensitive data.
              </p>
            </div>
          </section>
        )}

        {/* PRODUCTION-READY FOOTER */}
      <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 Bitcoin Loan DApp. Built on Internet Computer.</p>
        <div className="footer-links">
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Support</a>
            </div>
          </div>
        </footer>
        </div>

      {/* PRODUCTION-READY STYLES */}
      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #2a2a3e;
        }

        .logo h1 {
          margin: 0;
          font-size: 2rem;
          color: #f7931a;
        }

        .subtitle {
          margin: 5px 0 0 0;
          color: #a0a0a0;
          font-size: 0.9rem;
        }

        .env-badge {
          background: #f7931a;
          color: #000;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .hero {
          padding: 60px 0;
          text-align: center;
        }

        .hero-title {
          font-size: 3rem;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #f7931a, #ffb84d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.2rem;
          color: #c0c0c0;
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-features {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(247, 147, 26, 0.1);
          border-radius: 25px;
          border: 1px solid rgba(247, 147, 26, 0.3);
        }

        .auth-section {
          padding: 60px 0;
        }

        .auth-container {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }

        .auth-title {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .auth-description {
          color: #a0a0a0;
          margin-bottom: 30px;
        }

        .alert {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-close {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 1.2rem;
          margin-left: auto;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .auth-button {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .auth-button.primary {
          background: linear-gradient(45deg, #f7931a, #ffb84d);
          color: #000;
        }

        .auth-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .auth-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-icon {
          font-size: 1.5rem;
        }

        .button-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .button-title {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .button-subtitle {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #333;
          border-top: 2px solid #f7931a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auth-help {
          margin-top: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .help-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
        }

        .help-link {
          color: #f7931a;
          text-decoration: none;
        }

        .help-link:hover {
          text-decoration: underline;
        }

        .how-it-works {
          padding: 60px 0;
          background: rgba(255, 255, 255, 0.02);
        }

        .section-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 40px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: #f7931a;
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .step-content h4 {
          margin: 0 0 8px 0;
          color: #f7931a;
        }

        .step-content p {
          margin: 0;
          color: #a0a0a0;
        }

        .dev-info {
          margin: 40px 0;
          padding: 20px;
          background: rgba(255, 165, 0, 0.1);
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
        }

        .dev-info-content {
          text-align: center;
        }

        .dev-details {
          margin: 15px 0;
          text-align: left;
          display: inline-block;
        }

        .dev-warning {
          color: #ffa500;
          font-weight: bold;
        }

        .footer {
          border-top: 1px solid #2a2a3e;
          padding: 40px 0;
          margin-top: 60px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-links {
          display: flex;
          gap: 20px;
        }

        .footer-link {
          color: #a0a0a0;
          text-decoration: none;
        }

        .footer-link:hover {
          color: #f7931a;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-features {
            flex-direction: column;
            align-items: center;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 