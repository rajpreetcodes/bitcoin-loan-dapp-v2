import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import './Dashboard.css';

const Dashboard = ({ openLoanModal }) => {
  const { actor, userPrincipal } = useAuth();
  const [loans, setLoans] = useState([]);
  const [btcAddress, setBtcAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load loans and BTC address
  useEffect(() => {
    const fetchData = async () => {
      if (!actor) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const [fetchedLoans, fetchedBtcAddressResult] = await Promise.all([
          actor.get_loans(),
          actor.get_btc_address()
        ]);
        
        setLoans(fetchedLoans || []);
        setBtcAddress(fetchedBtcAddressResult.length > 0 ? fetchedBtcAddressResult[0] : '');
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [actor]);

  // Handle BTC address linking
  const handleBtcAddressLink = async (e) => {
    e.preventDefault();
    
    const newAddress = e.target.elements.btcAddress.value;
    if (!newAddress) {
      setError("Please enter a Bitcoin address");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await actor.link_btc_address(newAddress);
      setBtcAddress(newAddress);
      setSuccess("Bitcoin address linked successfully!");
      e.target.reset();
    } catch (error) {
      console.error("Failed to link BTC address:", error);
      setError("Failed to link Bitcoin address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Calculate stats
  const totalLoans = loans.length;
  const totalBorrowed = loans.reduce((acc, loan) => acc + Number(loan.loan_amount), 0);
  const totalCollateral = loans.reduce((acc, loan) => acc + Number(loan.collateral_amount), 0);

  return (
    <div className="dashboard-content">
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Loan Dashboard</h2>
          <p>Manage your Bitcoin-backed loans on the Internet Computer.</p>
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
                <h3>Total Loans</h3>
                <p className="stat-value">{totalLoans}</p>
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
                <h3>Total Collateral</h3>
                <p className="stat-value">{totalCollateral.toFixed(8)} BTC</p>
              </div>
            </div>
          </div>
        </section>

        {/* BTC Address Section */}
        <section className="btc-address-section">
          <h3>Your Bitcoin Address</h3>
          {btcAddress ? (
            <div className="address-display">
              <p>Your linked Bitcoin address: <strong>{btcAddress}</strong></p>
              <form onSubmit={handleBtcAddressLink} className="address-form">
                <input
                  type="text"
                  name="btcAddress"
                  placeholder="Update your Bitcoin address"
                  className="address-input"
                />
                <button 
                  type="submit" 
                  className="action-button primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Address'}
                </button>
              </form>
            </div>
          ) : (
            <div className="address-empty">
              <p>You haven't linked a Bitcoin address yet.</p>
              <form onSubmit={handleBtcAddressLink} className="address-form">
                <input
                  type="text"
                  name="btcAddress"
                  placeholder="Enter your Bitcoin address"
                  className="address-input"
                />
                <button 
                  type="submit" 
                  className="action-button primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Linking...' : 'Link Address'}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card">
              <h4>+ Create New Loan</h4>
              <p>Start a new Bitcoin-backed loan.</p>
              <button 
                onClick={openLoanModal}
                className="action-button primary"
              >
                Create Loan
              </button>
            </div>

            <div className="action-card">
              <h4>View Loan History</h4>
              <p>See your past loan transactions.</p>
              <button className="action-button secondary">
                View History
              </button>
            </div>
          </div>
        </section>

        {/* Loans Section */}
        <section className="activity-section">
          <h3>Your Loans</h3>
          {isLoading ? (
            <p>Loading loans...</p>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any active loans.</p>
              <button 
                onClick={openLoanModal}
                className="action-button primary"
              >
                Create Your First Loan
              </button>
            </div>
          ) : (
            <div className="loans-grid">
              {loans.map((loan) => (
                <div key={loan.id} className="loan-card">
                  <div className="loan-header">
                    <h4>Loan #{loan.id}</h4>
                    <span className={`loan-status status-${loan.status.toLowerCase()}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="loan-details">
                    <div className="loan-detail">
                      <span className="label">Loan Amount:</span>
                      <span className="value">{Number(loan.loan_amount).toFixed(8)} ckBTC</span>
                    </div>
                    <div className="loan-detail">
                      <span className="label">Collateral:</span>
                      <span className="value">{Number(loan.collateral_amount).toFixed(8)} BTC</span>
                    </div>
                    <div className="loan-detail">
                      <span className="label">Created:</span>
                      <span className="value">
                        {new Date(Number(loan.created_at) / 1000000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="loan-detail">
                      <span className="label">Repay By:</span>
                      <span className="value">
                        {loan.due_date ? new Date(Number(loan.due_date) / 1000000).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="loan-actions">
                    <button className="action-button primary">View Details</button>
                    <button className="action-button secondary">Repay Loan</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 