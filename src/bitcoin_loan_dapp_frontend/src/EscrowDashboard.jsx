import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { 
  getBorrowerEscrows, 
  getLenderEscrows, 
  lockEscrow, 
  releaseEscrow, 
  refundEscrow 
} from './escrow-agent';
import { CreateEscrowModal } from './CreateEscrowModal';
import './Dashboard.css'; // Reuse dashboard styles
import './EscrowDashboard.css'; // Escrow-specific styles

const EscrowDashboard = ({ openEscrowModal }) => {
  const { isAuthenticated, userPrincipal } = useAuth();
  const [borrowerEscrows, setBorrowerEscrows] = useState([]);
  const [lenderEscrows, setLenderEscrows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load escrow data
  const fetchEscrowData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [borrowerData, lenderData] = await Promise.all([
        getBorrowerEscrows(),
        getLenderEscrows()
      ]);
      
      setBorrowerEscrows(borrowerData || []);
      setLenderEscrows(lenderData || []);
    } catch (error) {
      console.error("Failed to fetch escrow data:", error);
      setError("Failed to load escrow data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchEscrowData();
    }
  }, [isAuthenticated]);
  
  // Handle escrow actions
  const handleLockEscrow = async (escrowId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await lockEscrow(escrowId);
      if ('Ok' in result) {
        setSuccess(`Escrow #${escrowId} locked successfully!`);
        fetchEscrowData(); // Refresh data
      } else if ('Err' in result) {
        setError(`Failed to lock escrow: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error locking escrow:", error);
      setError(`Failed to lock escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReleaseEscrow = async (escrowId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await releaseEscrow(escrowId);
      if ('Ok' in result) {
        setSuccess(`Escrow #${escrowId} released successfully!`);
        fetchEscrowData(); // Refresh data
      } else if ('Err' in result) {
        setError(`Failed to release escrow: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error releasing escrow:", error);
      setError(`Failed to release escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefundEscrow = async (escrowId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await refundEscrow(escrowId);
      if ('Ok' in result) {
        setSuccess(`Escrow #${escrowId} refunded successfully!`);
        fetchEscrowData(); // Refresh data
      } else if ('Err' in result) {
        setError(`Failed to refund escrow: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error refunding escrow:", error);
      setError(`Failed to refund escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get status display
  const getStatusDisplay = (status) => {
    if ('Pending' in status) return { text: 'Pending', class: 'status-pending' };
    if ('Locked' in status) return { text: 'Locked', class: 'status-locked' };
    if ('Released' in status) return { text: 'Released', class: 'status-released' };
    if ('Refunded' in status) return { text: 'Refunded', class: 'status-refunded' };
    return { text: 'Unknown', class: 'status-unknown' };
  };
  
  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };
  
  // Calculate stats
  const totalEscrows = borrowerEscrows.length + lenderEscrows.length;
  const totalCollateral = [...borrowerEscrows, ...lenderEscrows]
    .reduce((acc, escrow) => acc + Number(escrow.collateral_amount), 0);
  const totalLoans = [...borrowerEscrows, ...lenderEscrows]
    .reduce((acc, escrow) => acc + Number(escrow.loan_amount), 0);
  
  return (
    <div className="dashboard-content">
      {/* Create Escrow Modal */}
      {isModalOpen && (
        <CreateEscrowModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchEscrowData(); // Refresh data when modal closes
          }}
        />
      )}
      
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Escrow Management</h2>
          <p>Manage your Bitcoin escrow transactions securely on the Internet Computer.</p>
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
                <h3>Total Escrows</h3>
                <p className="stat-value">{totalEscrows}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Loans</h3>
                <p className="stat-value">{totalLoans.toFixed(8)} ckBTC</p>
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

        {/* Quick Actions */}
        <section className="actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card">
              <h4>+ Create New Escrow</h4>
              <p>Start a new escrow agreement with a lender.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="action-button primary"
              >
                Create Escrow
              </button>
            </div>

            <div className="action-card">
              <h4>Refresh Escrow Data</h4>
              <p>Update your escrow information.</p>
              <button 
                className="action-button secondary"
                onClick={fetchEscrowData}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </section>

        {/* Borrower Escrows Section */}
        <section className="activity-section">
          <h3>Your Borrower Escrows</h3>
          {isLoading ? (
            <p>Loading escrow data...</p>
          ) : borrowerEscrows.length === 0 ? (
            <div className="empty-state">
              <p>You have no escrows as a borrower.</p>
            </div>
          ) : (
            <div className="loans-grid">
              {borrowerEscrows.map((escrow) => {
                const statusDisplay = getStatusDisplay(escrow.status);
                return (
                  <div key={escrow.id} className="loan-card">
                    <div className="loan-header">
                      <h4>Escrow #{escrow.id}</h4>
                      <span className={`loan-status ${statusDisplay.class}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                    <div className="loan-details">
                      <div className="loan-detail">
                        <span className="label">Loan Amount:</span>
                        <span className="value">{Number(escrow.loan_amount).toFixed(8)} ckBTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Collateral:</span>
                        <span className="value">{Number(escrow.collateral_amount).toFixed(8)} BTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Created:</span>
                        <span className="value">
                          {new Date(Number(escrow.created_at) / 1000000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">BTC Address:</span>
                        <span className="value">
                          {escrow.btc_collateral_address.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="loan-actions">
                      {('Locked' in escrow.status) && (
                        <button 
                          onClick={() => handleReleaseEscrow(escrow.id)}
                          disabled={isLoading}
                          className="action-button primary"
                        >
                          Release Escrow
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Lender Escrows Section */}
        <section className="activity-section">
          <h3>Your Lender Escrows</h3>
          {isLoading ? (
            <p>Loading escrow data...</p>
          ) : lenderEscrows.length === 0 ? (
            <div className="empty-state">
              <p>You have no escrows as a lender.</p>
            </div>
          ) : (
            <div className="loans-grid">
              {lenderEscrows.map((escrow) => {
                const statusDisplay = getStatusDisplay(escrow.status);
                return (
                  <div key={escrow.id} className="loan-card">
                    <div className="loan-header">
                      <h4>Escrow #{escrow.id}</h4>
                      <span className={`loan-status ${statusDisplay.class}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                    <div className="loan-details">
                      <div className="loan-detail">
                        <span className="label">Loan Amount:</span>
                        <span className="value">{Number(escrow.loan_amount).toFixed(8)} ckBTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Collateral:</span>
                        <span className="value">{Number(escrow.collateral_amount).toFixed(8)} BTC</span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">Created:</span>
                        <span className="value">
                          {new Date(Number(escrow.created_at) / 1000000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="loan-detail">
                        <span className="label">BTC Address:</span>
                        <span className="value">
                          {escrow.btc_collateral_address.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="loan-actions">
                      {('Pending' in escrow.status) && (
                        <button 
                          onClick={() => handleLockEscrow(escrow.id)}
                          disabled={isLoading}
                          className="action-button primary"
                        >
                          Lock Escrow
                        </button>
                      )}
                      {('Locked' in escrow.status) && (
                        <button 
                          onClick={() => handleRefundEscrow(escrow.id)}
                          disabled={isLoading}
                          className="action-button secondary"
                        >
                          Refund Escrow
                        </button>
                      )}
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

export default EscrowDashboard; 