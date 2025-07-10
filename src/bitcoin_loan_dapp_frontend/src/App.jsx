import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { CreateLoanModal } from './components/CreateLoanModal';
import Dashboard from './Dashboard';
import EscrowDashboard from './EscrowDashboard';
import { CreateEscrowModal } from './CreateEscrowModal';
import toast, { Toaster } from 'react-hot-toast';
import './index.css'; // This is the stylesheet we will create next

function App() {
  const { login, logout, connectPlug, isAuthenticated, isPlugConnected, actor, userPrincipal, walletBalances, isConnecting } = useAuth();

  const [loans, setLoans] = useState([]);
  const [btcAddress, setBtcAddress] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' or 'escrow'
  const [shouldRefreshLoans, setShouldRefreshLoans] = useState(false);
  const [shouldRefreshEscrows, setShouldRefreshEscrows] = useState(false);

  // Fetch user data function
  const fetchUserData = useCallback(async () => {
    // Only run if the actor is available
    if (!actor) return;

    setIsLoading(true);
    try {
      const [fetchedLoans, fetchedBtcAddressResult] = await Promise.all([
        actor.get_loans(),
        actor.get_btc_address()
      ]);
      setLoans(fetchedLoans || []);
      setBtcAddress(fetchedBtcAddressResult.length > 0 ? fetchedBtcAddressResult[0] : '');
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("API mismatch. Could not fetch user data from the backend.");
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  // Load data on mount and when actor changes
  useEffect(() => {
    if (isAuthenticated && actor) {
      fetchUserData();
    }
  }, [isAuthenticated, actor, fetchUserData]);

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Trigger refresh when switching to a tab
    if (tab === 'loans') {
      setShouldRefreshLoans(true);
    } else if (tab === 'escrow') {
      setShouldRefreshEscrows(true);
    }
  };

  // Reset refresh flags after they're consumed
  const handleLoansRefreshed = () => {
    setShouldRefreshLoans(false);
  };

  const handleEscrowsRefreshed = () => {
    setShouldRefreshEscrows(false);
  };

  const handleBtcAddressLink = async (e) => {
    e.preventDefault();
    const newAddress = e.target.elements.btcAddress.value;
    if (actor && newAddress) {
      await actor.link_btc_address(newAddress);
      setBtcAddress(newAddress);
      toast.success("Bitcoin address linked successfully!");
      // Refresh data after linking
      fetchUserData();
    }
  };

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Handle loan creation
  const handleLoanCreated = () => {
    toast.success("Loan created successfully!");
    // Refresh data after creating a loan
    fetchUserData();
    // Set flag to refresh loans in the Dashboard
    setShouldRefreshLoans(true);
  };

  // Handle escrow creation
  const handleEscrowCreated = () => {
    toast.success("Escrow created successfully!");
    // Set flag to refresh escrows
    setShouldRefreshEscrows(true);
  };

  // The landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="ic-logo-container">
            <div className="ic-logo">
              <div className="infinity-symbol">∞</div>
              <div className="ic-text">
                <span className="percentage">100% on-chain</span>
                <span className="brand">INTERNET COMPUTER</span>
              </div>
            </div>
          </div>
          
          <h1 className="hero-title">Bitcoin-Backed Loans. Decentralized. Non-Custodial.</h1>
          <p className="hero-subtitle">
            Get liquidity without selling your BTC — on-chain, secure, 
            <br />and trustless.
          </p>
          
          <button 
            className="connect-button" 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Login with Internet Identity'}
          </button>
        </div>

        {/* Key Features Section */}
        <div className="features-section">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Explore the innovative features that make our platform the premier choice for Bitcoin-backed loans.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Non-Custodial Vaults</h3>
              <p>Your Bitcoin remains under your control, secured by smart contracts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant, Flexible Loans</h3>
              <p>Access liquidity with loan terms tailored to your needs.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Smart-Contract Driven</h3>
              <p>Security and transparency via our smart contract system.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Runs on Internet Computer</h3>
              <p>Decentralized and scalable platform powered by ICP.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get liquidity from your Bitcoin in four simple steps. Our streamlined process
            <br />ensures you can access funds quickly while maintaining full control of your assets.
          </p>
          
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Wallet</h3>
              <p>Link your Bitcoin wallet and authenticate with Internet Identity</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Deposit Collateral</h3>
              <p>Lock your Bitcoin as collateral in our secure smart contracts</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Receive Loan</h3>
              <p>Get instant liquidity in ckBTC based on your collateral value</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Repay & Withdraw</h3>
              <p>Repay the loan to unlock and withdraw your Bitcoin collateral</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The main authenticated application with tabs instead of routing
  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Modals */}
      {isModalOpen && 
        <CreateLoanModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Refresh data after modal closes
            fetchUserData();
            // Set flag to refresh loans in the Dashboard
            setShouldRefreshLoans(true);
          }}
          onLoanCreated={handleLoanCreated}
        />
      }
      
      {isEscrowModalOpen && 
        <CreateEscrowModal 
          isOpen={isEscrowModalOpen}
          onClose={() => {
            setIsEscrowModalOpen(false);
            // Set flag to refresh escrows
            setShouldRefreshEscrows(true);
          }}
          onEscrowCreated={handleEscrowCreated}
        />
      }
      
      {/* Navigation */}
      <nav className="app-navigation">
        <div className="nav-logo">
          <h2>Bitcoin Loan dApp</h2>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-tab ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => handleTabChange('loans')}
          >
            Loans
          </button>
          <button 
            className={`nav-tab ${activeTab === 'escrow' ? 'active' : ''}`}
            onClick={() => handleTabChange('escrow')}
          >
            Escrow
          </button>
        </div>
        <div className="nav-actions">
          {isPlugConnected ? (
            <div className="wallet-status">
              <div className="wallet-indicator connected">
                <span className="wallet-dot"></span>
                <span className="wallet-text">Wallet Connected</span>
              </div>
              {isPlugConnected && walletBalances && (
                <div className="wallet-balance">
                  <span>{walletBalances.BTC?.toFixed(4)} BTC <small style={{opacity: 0.7}}>(Demo)</small></span>
                  <span>{walletBalances.ckBTC?.toFixed(4)} ckBTC <small style={{opacity: 0.7}}>(Demo)</small></span>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="connect-wallet-button"
              onClick={connectPlug}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
      
      {/* Content */}
      <div className="app-content">
        {activeTab === 'loans' && (
          <Dashboard 
            openLoanModal={() => setIsModalOpen(true)}
            shouldRefresh={shouldRefreshLoans}
            onRefreshed={handleLoansRefreshed}
          />
        )}
        
        {activeTab === 'escrow' && (
          <EscrowDashboard 
            openEscrowModal={() => setIsEscrowModalOpen(true)}
            shouldRefresh={shouldRefreshEscrows}
            onRefreshed={handleEscrowsRefreshed}
          />
        )}
      </div>
    </div>
  );
}

export default App;