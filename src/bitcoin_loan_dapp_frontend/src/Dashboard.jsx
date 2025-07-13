import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import './Dashboard.css';


const Dashboard = ({ openLoanModal, shouldRefresh, onRefreshed }) => {
  const { actor, userPrincipal } = useAuth();
  const [loans, setLoans] = useState([]);
  const [btcAddress, setBtcAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Load loans and BTC address
  const fetchData = useCallback(async () => {
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
      setLastRefreshTime(Date.now());
    }
  }, [actor]);

  // Load data on mount and when actor changes
  useEffect(() => {
    fetchData();
  }, [actor, fetchData]);

  // Handle refresh when shouldRefresh prop changes
  useEffect(() => {
    if (shouldRefresh) {
      fetchData();
      if (onRefreshed) onRefreshed();
    }
  }, [shouldRefresh, onRefreshed, fetchData]);

  // Set up polling for automatic refresh (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchData]);

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
      // Call the backend to link the address
      const result = await actor.link_btc_address(newAddress);
      
      // Handle the result - in Rust, this is a Result<(), String>
      // If it's successful, the result will be an object with an Ok property
      // If it failed, it will be an object with an Err property containing the error message
      if ('Err' in result) {
        // Extract the error message from the Result
        const errorMessage = result.Err;
        console.error("Bitcoin address validation failed:", errorMessage);
        setError(`Invalid Bitcoin address: ${errorMessage}`);
        return;
      }
      
      // If we get here, the address was successfully linked
      setBtcAddress(newAddress);
      setSuccess("Bitcoin address linked successfully!");
      e.target.reset();
      // Refresh data after linking
      fetchData();
    } catch (error) {
      console.error("Failed to link BTC address:", error);
      // Check if the error message contains validation information
      const errorMsg = error.message || "";
      if (errorMsg.includes("Invalid Bitcoin address") || 
          errorMsg.includes("Bitcoin address") || 
          errorMsg.includes("address format")) {
        setError(`Invalid Bitcoin address: ${errorMsg}`);
      } else {
        setError("Failed to link Bitcoin address. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Helper function to get loan status display
  const getLoanStatusDisplay = (loan) => {
    if (!loan || !loan.status) return { text: 'Active', class: 'status-active' };
    
    const status = loan.status?.toLowerCase ? loan.status.toLowerCase() : 'active';
    return { text: loan.status || 'Active', class: `status-${status}` };
  };

  // Generate a unique loan ID with prefix
  const formatLoanId = (id) => {
    return `BL-${id.toString().padStart(6, '0')}`;
  };

  // Calculate stats
  const totalLoans = loans.length;
  const totalBorrowed = loans.reduce((acc, loan) => acc + Number(loan.loan_amount || 0), 0);
  const totalCollateral = loans.reduce((acc, loan) => acc + Number(loan.collateral_amount || 0), 0);

  return (
    <div className="dashboard-content">
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Loan Dashboard</h2>
          <p>Manage your Bitcoin-backed loans on the Internet Computer.</p>
          <small className="last-updated">Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}</small>
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
              <h4>Refresh Data</h4>
              <p>Update your loan information.</p>
              <button 
                className="action-button secondary"
                onClick={fetchData}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </section>

        {/* Loans Section */}
        <section className="activity-section">
          <h3>Your Loans</h3>
          {isLoading && loans.length === 0 ? (
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
              {loans.map((loan) => {
                const statusDisplay = getLoanStatusDisplay(loan);
                return (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-header">
                      <h4>{formatLoanId(loan.id)}</h4>
                      <span className={`loan-status ${statusDisplay.class}`}>
                        {statusDisplay.text || 'Active'}
                      </span>
                    </div>
                    <div className="loan-details">
                      <div className="loan-detail">
                        <span className="label">Loan Amount:</span>
                        <span className="value">{Number(loan.loan_amount || 0).toFixed(8)} ckBTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Collateral:</span>
                        <span className="value">{Number(loan.collateral_amount || 0).toFixed(8)} BTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Created:</span>
                        <span className="value">
                          {loan.created_at ? new Date(Number(loan.created_at) / 1000000).toLocaleDateString() : 'N/A'}
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
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 