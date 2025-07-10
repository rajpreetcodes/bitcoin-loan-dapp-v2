import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreateLoanModal } from './components/CreateLoanModal';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    isAuthenticated, 
    userPrincipal, 
    logout, 
    actor
  } = useAuth();
  
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [btcAddress, setBtcAddress] = useState('');
  const [bitcoinAddressInput, setBitcoinAddressInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
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
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [actor]);

  // Handle Bitcoin address linking
  const handleLinkBitcoinAddress = async () => {
    if (!bitcoinAddressInput.trim()) {
      setError('Please enter a Bitcoin address');
      return;
    }

    // Basic Bitcoin address validation
    const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    if (!bitcoinAddressRegex.test(bitcoinAddressInput.trim())) {
      setError('Please enter a valid Bitcoin address');
      return;
    }

    setIsLinking(true);
    setError('');
    setSuccess('');

    try {
      const result = await actor.link_btc_address(bitcoinAddressInput.trim());
      if (result.includes('successfully')) {
        setBtcAddress(bitcoinAddressInput.trim());
        setBitcoinAddressInput('');
        setSuccess('Bitcoin address linked successfully!');
      } else {
        setError(result);
      }
    } catch (error) {
      console.error("Failed to link Bitcoin address:", error);
      setError(`Failed to link Bitcoin address: ${error.message}`);
    } finally {
      setIsLinking(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Calculate stats
  const totalBorrowed = loans.reduce((acc, loan) => acc + Number(loan.loan_amount), 0);
  const totalCollateral = loans.reduce((acc, loan) => acc + Number(loan.collateral_amount), 0);
  const activeLoanCount = loans.length;

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Bitcoin Loan Dashboard</h1>
            <p>Decentralized lending platform</p>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-principal">
                {userPrincipal?.toText().substring(0, 8)}...{userPrincipal?.toText().slice(-4)}
              </span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome to Your Dashboard</h2>
          <p>Manage your bitcoin-backed loans with complete transparency and security.</p>
        </section>

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={clearMessages} className="alert-close">×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
            <button onClick={clearMessages} className="alert-close">×</button>
          </div>
        )}

        {/* Stats Grid */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Active Loans</h3>
                <p className="stat-value">{activeLoanCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Borrowed</h3>
                <p className="stat-value">{totalBorrowed.toFixed(8)} ckBTC</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Collateral Locked</h3>
                <p className="stat-value">{totalCollateral.toFixed(8)} BTC</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏦</div>
              <div className="stat-content">
                <h3>Your Bitcoin Wallet</h3>
                <p className="stat-value">
                  {btcAddress ? (
                    <span className="address-display">
                      {btcAddress.substring(0, 6)}...{btcAddress.slice(-4)}
                    </span>
                  ) : (
                    'Not linked'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card">
              <h4>+ Create New Loan</h4>
              <p>Start a new loan with your Bitcoin collateral.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="action-button primary"
                disabled={!btcAddress}
              >
                Create Loan
              </button>
            </div>

            <div className="action-card">
              <h4>View Loan History</h4>
              <p>Review your past and current loans.</p>
              <button className="action-button secondary">
                View History
              </button>
            </div>
          </div>
        </section>

        {/* Bitcoin Wallet Section */}
        {!btcAddress && (
          <section className="wallet-section">
            <div className="wallet-card">
              <h3>Link Your Bitcoin Wallet</h3>
              <p>Connect your Bitcoin address to start creating loans.</p>
              
              <div className="wallet-form">
                <input
                  type="text"
                  placeholder="Enter Bitcoin address (1... or 3... or bc1...)"
                  value={bitcoinAddressInput}
                  onChange={(e) => setBitcoinAddressInput(e.target.value)}
                  className="wallet-input"
                />
                <button 
                  onClick={handleLinkBitcoinAddress}
                  disabled={isLinking}
                  className="wallet-button"
                >
                  {isLinking ? 'Linking...' : 'Link Address'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recent Loan Activity */}
        <section className="activity-section">
          <h3>Recent Loan Activity</h3>
          {loans.length === 0 ? (
            <div className="empty-state">
              <p>You have no active loans.</p>
              <p>Create a new loan to get started!</p>
            </div>
          ) : (
            <div className="loans-grid">
              {loans.map((loan, index) => (
                <div key={index} className="loan-card">
                  <div className="loan-header">
                    <h4>Loan #{index + 1}</h4>
                    <span className="loan-status active">Active</span>
                  </div>
                  <div className="loan-details">
                    <div className="loan-detail">
                      <span className="label">Amount:</span>
                      <span className="value">{Number(loan.loan_amount).toFixed(8)} ckBTC</span>
                    </div>
                    <div className="loan-detail">
                      <span className="label">Collateral:</span>
                      <span className="value">{Number(loan.collateral_amount).toFixed(8)} BTC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Loan Modal */}
      {isModalOpen && (
        <CreateLoanModal 
          onClose={() => setIsModalOpen(false)} 
          onLoanCreated={(newLoan) => {
            setLoans(prevLoans => [...prevLoans, newLoan]);
            setSuccess("Loan created successfully!");
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard; 