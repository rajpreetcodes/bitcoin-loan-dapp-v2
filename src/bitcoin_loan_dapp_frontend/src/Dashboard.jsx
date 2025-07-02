import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { getActor } from "./actor";
import CreateLoanModal from "./CreateLoanModal";
import "./Dashboard.css";

const Dashboard = () => {
  const { logout, principal, isLoading } = useAuth();
  const navigate = useNavigate();
  const [backendPrincipal, setBackendPrincipal] = useState(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);
  
  // Modal and loan state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const [totalBorrowedAmount, setTotalBorrowedAmount] = useState(0);
  const [totalCollateralAmount, setTotalCollateralAmount] = useState(0);
  
  // Bitcoin wallet state
  const [linkedBtcAddress, setLinkedBtcAddress] = useState(null);
  const [btcAddressInput, setBtcAddressInput] = useState('');
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [walletError, setWalletError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatPrincipal = (principal) => {
    if (!principal) return '';
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-8)}`;
  };

  const checkBackendConnection = async () => {
    setBackendLoading(true);
    setBackendError(null);
    
    try {
      const actor = await getActor();
      const result = await actor.whoami();
      setBackendPrincipal(result);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendError(error.message);
    } finally {
      setBackendLoading(false);
    }
  };

  // Handle opening the create loan modal
  const handleCreateLoan = () => {
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle successful loan creation
  const handleLoanSuccess = (loanId) => {
    console.log('Loan created with ID:', loanId);
    
    // Update dashboard stats
    setActiveLoansCount(prev => prev + 1);
    
    // Close modal
    setIsModalOpen(false);
    
    // Show success message
    setSuccessMessage(`🎉 Loan created successfully! Loan ID: ${loanId}`);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Convert satoshis back to BTC for display
  const fromSatoshis = (satoshis) => {
    return (satoshis / 100000000).toFixed(8);
  };

  // Load linked Bitcoin address on component mount
  const loadLinkedBtcAddress = async () => {
    try {
      const actor = await getActor();
      const address = await actor.get_linked_btc_address();
      setLinkedBtcAddress(address.length > 0 ? address[0] : null);
    } catch (error) {
      console.error('Failed to load linked Bitcoin address:', error);
    }
  };

  // Handle linking Bitcoin address
  const handleLinkBtcAddress = async () => {
    if (!btcAddressInput.trim()) {
      setWalletError('Please enter a Bitcoin address');
      return;
    }

    setIsLinkingWallet(true);
    setWalletError(null);

    try {
      const actor = await getActor();
      await actor.link_btc_address(btcAddressInput.trim());
      
      // Success - update the display
      setLinkedBtcAddress(btcAddressInput.trim());
      setBtcAddressInput('');
      
      // Show success message
      setSuccessMessage('✅ Bitcoin wallet linked successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Failed to link Bitcoin address:', error);
      setWalletError(error.message || 'Failed to link Bitcoin address');
    } finally {
      setIsLinkingWallet(false);
    }
  };

  // Load linked address when component mounts
  React.useEffect(() => {
    loadLinkedBtcAddress();
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="dashboard-title">Bitcoin Loan Dashboard</h1>
            <p className="dashboard-subtitle">Decentralized Bitcoin Lending Platform</p>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-label">Connected as</span>
                <span className="user-principal">{formatPrincipal(principal)}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="logout-button"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div className="success-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <span className="notification-text">{successMessage}</span>
            <button 
              className="notification-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-container">
          
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome to Your Dashboard</h2>
            <p className="welcome-text">
              Manage your Bitcoin-backed loans with complete transparency and security
            </p>
          </section>

          {/* Stats Grid */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card loans-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3 className="stat-title">Active Loans</h3>
                  <p className="stat-value">{activeLoansCount}</p>
                  <p className="stat-description">Currently active loan contracts</p>
                </div>
              </div>
              
              <div className="stat-card borrowed-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3 className="stat-title">Total Borrowed</h3>
                  <p className="stat-value">0.00 <span className="stat-unit">ckBTC</span></p>
                  <p className="stat-description">Total amount borrowed to date</p>
                </div>
              </div>
              
              <div className="stat-card collateral-card">
                <div className="stat-icon">🔒</div>
                <div className="stat-content">
                  <h3 className="stat-title">Collateral Locked</h3>
                  <p className="stat-value">0.00 <span className="stat-unit">BTC</span></p>
                  <p className="stat-description">Bitcoin secured as collateral</p>
                </div>
              </div>
              
              {/* Bitcoin Wallet Card */}
              <div className="stat-card wallet-card">
                <div className="stat-icon">₿</div>
                <div className="stat-content">
                  <h3 className="stat-title">Your Bitcoin Wallet</h3>
                  
                  {/* Display linked address or "Not linked" */}
                  <div className="wallet-address-display">
                    {linkedBtcAddress ? (
                      <div className="linked-address">
                        <p className="address-label">Linked Address:</p>
                        <p className="address-value" title={linkedBtcAddress}>
                          {linkedBtcAddress.length > 20 
                            ? `${linkedBtcAddress.slice(0, 8)}...${linkedBtcAddress.slice(-8)}`
                            : linkedBtcAddress
                          }
                        </p>
                      </div>
                    ) : (
                      <p className="no-address">No wallet linked</p>
                    )}
                  </div>
                  
                  {/* Input and button for linking address */}
                  <div className="wallet-input-section">
                    <input
                      type="text"
                      value={btcAddressInput}
                      onChange={(e) => setBtcAddressInput(e.target.value)}
                      placeholder="Enter Bitcoin address (bc1... or 1... or 3...)"
                      className="wallet-input"
                      disabled={isLinkingWallet}
                    />
                    
                    <button
                      onClick={handleLinkBtcAddress}
                      disabled={isLinkingWallet || !btcAddressInput.trim()}
                      className="wallet-save-button"
                    >
                      {isLinkingWallet ? (
                        <>
                          <span className="loading-spinner-small"></span>
                          Linking...
                        </>
                      ) : (
                        linkedBtcAddress ? 'Update Address' : 'Link Address'
                      )}
                    </button>
                  </div>
                  
                  {/* Error display */}
                  {walletError && (
                    <div className="wallet-error">
                      <span className="error-icon">⚠️</span>
                      <span className="error-text">{walletError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="actions-section">
            <div className="actions-container">
              <h3 className="actions-title">Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  onClick={handleCreateLoan}
                  className="action-button primary-action"
                >
                  <span className="action-icon">➕</span>
                  <span className="action-text">Create New Loan</span>
                  <span className="action-description">Start a new loan with your Bitcoin collateral</span>
                </button>
                
                <button className="action-button secondary-action">
                  <span className="action-icon">📋</span>
                  <span className="action-text">View Loan History</span>
                  <span className="action-description">Review your past and current loans</span>
                </button>
                
                <button 
                  onClick={checkBackendConnection}
                  disabled={backendLoading}
                  className="action-button test-action"
                >
                  <span className="action-icon">🔗</span>
                  <span className="action-text">
                    {backendLoading ? "Testing..." : "Test Connection"}
                  </span>
                  <span className="action-description">Verify backend connectivity</span>
                </button>
              </div>
            </div>
          </section>

          {/* Backend Connection Results */}
          {(backendPrincipal || backendError) && (
            <section className="connection-section">
              <div className="connection-card">
                <h3 className="connection-title">🔗 Backend Connection Test</h3>
                {backendError ? (
                  <div className="connection-result error">
                    <div className="result-status">❌ Connection Failed</div>
                    <div className="result-details">
                      <strong>Error:</strong> {backendError}
                    </div>
                  </div>
                ) : backendPrincipal ? (
                  <div className="connection-result success">
                    <div className="result-status">✅ Connection Successful!</div>
                    <div className="result-details">
                      <p><strong>Backend Principal:</strong> {formatPrincipal(backendPrincipal)}</p>
                      <p className="result-full-principal">{backendPrincipal.toString()}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* Loan History Table Placeholder */}
          <section className="history-section">
            <div className="history-card">
              <h3 className="history-title">Recent Loan Activity</h3>
              <div className="history-content">
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h4 className="empty-title">No loan history yet</h4>
                  <p className="empty-description">
                    Your loan transactions will appear here once you create your first loan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coming Soon Features */}
          <section className="features-section">
            <div className="features-card">
              <h3 className="features-title">🚀 More Features Coming Soon!</h3>
              <p className="features-description">
                We're continuously expanding our platform with new capabilities
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">Lightning-fast loan processing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Advanced analytics and insights</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span className="feature-text">Automated collateral management</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span className="feature-text">Mobile app for on-the-go access</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Create Loan Modal */}
      <CreateLoanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleLoanSuccess}
      />
    </div>
  );
};

export default Dashboard; 