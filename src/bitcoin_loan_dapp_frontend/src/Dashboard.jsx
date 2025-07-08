import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getActor, healthCheck, CURRENT_ENV, CONFIG } from './actor';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    isAuthenticated, 
    user, 
    authMethod, 
    logout, 
    forceReconnect, 
    error: authError, 
    clearError 
  } = useAuth();
  
  const [linkedBitcoinAddress, setLinkedBitcoinAddress] = useState('');
  const [bitcoinAddressInput, setBitcoinAddressInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backendHealth, setBackendHealth] = useState(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);

  // PRODUCTION-READY BACKEND HEALTH CHECK
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await healthCheck();
        setBackendHealth(health);
        if (!health.success) {
          setError(`Backend health check failed: ${health.error}`);
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setBackendHealth({ success: false, error: err.message });
      }
    };

    checkBackendHealth();
  }, []);

  // PRODUCTION-READY LOAD LINKED ADDRESS
  useEffect(() => {
    const loadLinkedAddress = async () => {
      if (!isAuthenticated) return;
      
      try {
        console.log("📋 Loading linked Bitcoin address...");
        const actor = await getActor();
        const address = await actor.get_linked_btc_address();
        
        if (address && address.length > 0) {
          setLinkedBitcoinAddress(address);
          console.log("✅ Linked address loaded:", address);
        } else {
          console.log("ℹ️ No linked address found");
        }
      } catch (error) {
        console.error("Failed to load linked Bitcoin address:", error);
        setError(`Failed to load linked address: ${error.message}`);
      }
    };

    loadLinkedAddress();
  }, [isAuthenticated]);

  // PRODUCTION-READY LINK BITCOIN ADDRESS
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
      console.log("🔗 Linking Bitcoin address:", bitcoinAddressInput);
      const actor = await getActor();
      const result = await actor.link_btc_address(bitcoinAddressInput.trim());
      
      if (result.includes('successfully')) {
        setLinkedBitcoinAddress(bitcoinAddressInput.trim());
        setBitcoinAddressInput('');
        setSuccess('Bitcoin address linked successfully!');
        console.log("✅ Bitcoin address linked successfully");
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

  // PRODUCTION-READY DIRECT BACKEND TEST
  const testBackendConnection = async () => {
    setIsTestingBackend(true);
    setError('');
    
    try {
      console.log("🔍 Testing backend connection...");
      const actor = await getActor();
      console.log("✅ Actor obtained, calling whoami...");
      const result = await actor.whoami();
      console.log("✅ Backend test successful:", result.toString());
      setSuccess(`Backend test successful! Principal: ${result.toString()}`);
    } catch (error) {
      console.error("Backend connection failed:", error);
      setError(`Backend test failed: ${error.message}`);
    } finally {
      setIsTestingBackend(false);
    }
  };

  // PRODUCTION-READY CLEAR MESSAGES
  const clearMessages = () => {
    setError('');
    setSuccess('');
    clearError();
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <div className="auth-required">
          <h2>🔐 Authentication Required</h2>
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* PRODUCTION-READY HEADER */}
      <div className="dashboard-header">
        <div className="user-info">
          <h2>🏦 Bitcoin Loan Dashboard</h2>
          <div className="user-details">
            <p><strong>Environment:</strong> {CURRENT_ENV}</p>
            <p><strong>Host:</strong> {CONFIG.host}</p>
            <p><strong>User Principal:</strong> {user?.principal}</p>
            <p><strong>Auth Method:</strong> {authMethod}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={logout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* PRODUCTION-READY ERROR HANDLING */}
      {(error || authError) && (
        <div className="alert error">
          <div className="alert-content">
            <p>❌ {error || authError}</p>
            <div className="alert-actions">
              <button onClick={clearMessages} className="clear-btn">Clear</button>
              <button onClick={forceReconnect} className="reconnect-btn">
                🔄 Reconnect {authMethod === 'plug_wallet' ? 'Plug Wallet' : 'Internet Identity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGES */}
      {success && (
        <div className="alert success">
          <div className="alert-content">
            <p>✅ {success}</p>
            <button onClick={clearMessages} className="clear-btn">Clear</button>
          </div>
        </div>
      )}

      {/* PRODUCTION-READY BACKEND HEALTH STATUS */}
      <div className="health-section">
        <h3>🏥 Backend Health Status</h3>
        <div className={`health-indicator ${backendHealth?.success ? 'healthy' : 'unhealthy'}`}>
          {backendHealth?.success ? (
            <span>✅ Backend Healthy - Principal: {backendHealth.principal}</span>
          ) : (
            <span>❌ Backend Unhealthy - {backendHealth?.error}</span>
          )}
        </div>
        <button 
          onClick={testBackendConnection} 
          disabled={isTestingBackend}
          className="test-btn"
        >
          {isTestingBackend ? '🔄 Testing...' : '🧪 Test Direct'}
        </button>
      </div>

      {/* PRODUCTION-READY BITCOIN WALLET SECTION */}
      <div className="section">
        <div className="card">
          <h3>₿ Bitcoin Wallet</h3>
          
          {linkedBitcoinAddress ? (
            <div className="linked-address">
              <p><strong>Linked Address:</strong></p>
              <p className="address">{linkedBitcoinAddress}</p>
              <div className="address-actions">
                <button 
                  onClick={() => setLinkedBitcoinAddress('')}
                  className="unlink-btn"
                >
                  🔗 Unlink
                </button>
              </div>
            </div>
          ) : (
            <div className="link-address">
              <p>No Bitcoin address linked yet.</p>
              <input
                type="text"
                placeholder="Enter Bitcoin address (1... or 3... or bc1...)"
                value={bitcoinAddressInput}
                onChange={(e) => setBitcoinAddressInput(e.target.value)}
                className="address-input"
              />
              <button 
                onClick={handleLinkBitcoinAddress}
                disabled={isLinking}
                className="link-btn"
              >
                {isLinking ? '🔗 Linking...' : '🔗 Link Address'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCTION-READY TROUBLESHOOTING SECTION */}
      <div className="section">
        <div className="card troubleshooting">
          <h3>🔧 Troubleshooting</h3>
          <div className="troubleshooting-actions">
            <button onClick={forceReconnect} className="action-btn">
              🔄 Force Reconnect
            </button>
            <button onClick={testBackendConnection} className="action-btn">
              🧪 Test Backend
            </button>
            <button onClick={clearMessages} className="action-btn">
              🧹 Clear Messages
            </button>
          </div>
          
          <div className="troubleshooting-info">
            <h4>If you're experiencing issues:</h4>
            <ul>
              <li>🔄 Try force reconnecting your wallet</li>
              <li>🧪 Test backend connectivity</li>
              <li>🔑 Make sure DFX is running locally</li>
              <li>🌐 Check your internet connection</li>
              <li>🔌 Ensure Plug Wallet is properly connected</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PRODUCTION-READY DEVELOPMENT INFO */}
      {CURRENT_ENV === 'local' && (
        <div className="section">
          <div className="card dev-info">
            <h3>🛠️ Development Information</h3>
            <ul>
              <li><strong>Environment:</strong> {CURRENT_ENV}</li>
              <li><strong>Host:</strong> {CONFIG.host}</li>
              <li><strong>Identity Provider:</strong> {CONFIG.identityProvider}</li>
              <li><strong>Backend Health:</strong> {backendHealth?.success ? '✅ Healthy' : '❌ Unhealthy'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 