import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { CreateLoanModal } from './components/CreateLoanModal';
import toast, { Toaster } from 'react-hot-toast';
import './index.css'; // This is the stylesheet we will create next

function App() {
  const { login, logout, connectPlug, isAuthenticated, isPlugConnected, actor, userPrincipal } = useAuth();

  const [loans, setLoans] = useState([]);
  const [btcAddress, setBtcAddress] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
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
    };

    fetchUserData();
  }, [actor]); // The dependency array is now just [actor]

  const handleBtcAddressLink = async (e) => {
    e.preventDefault();
    const newAddress = e.target.elements.btcAddress.value;
    if (actor && newAddress) {
      await actor.link_btc_address(newAddress);
      setBtcAddress(newAddress);
      toast.success("Bitcoin address linked successfully!");
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
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

  // Calculate dynamic stats from loans array
  const totalBorrowed = loans.reduce((acc, loan) => acc + Number(loan.loan_amount), 0);
  const totalCollateral = loans.reduce((acc, loan) => acc + Number(loan.collateral_amount), 0);

  // The main dashboard
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {isModalOpen && 
        <CreateLoanModal 
          onClose={() => setIsModalOpen(false)} 
          onLoanCreated={(newLoan) => {
            setLoans(prevLoans => [...prevLoans, newLoan]);
            toast.success("Loan created successfully!");
          }} 
        />
      }
      <div className="app-container">
        <header className="dashboard-header">
          <div className="logo">
            <h2>Bitcoin Loan Dashboard</h2>
            <p>Decentralized lending platform</p>
          </div>
          <div className="user-info">
            <span>{userPrincipal?.toText().substring(0, 5)}...{userPrincipal?.toText().slice(-3)}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-main">
          <h2>Welcome to Your Dashboard</h2>
          <p className="subtitle">Manage your bitcoin-backed loans with complete transparency and security.</p>

          {/* Temporarily hide Plug connect banner - working with II for now */}

          <div className="stats-grid">
            {isLoading ? (
              <>
                <div className="stat-card"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-text"></div></div>
                <div className="stat-card"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-text"></div></div>
                <div className="stat-card"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-text"></div></div>
                <div className="stat-card"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-text"></div></div>
              </>
            ) : (
              <>
                <div className="stat-card"><h4>ACTIVE LOANS</h4><span>{loans.length}</span></div>
                <div className="stat-card">
                  <h4>TOTAL BORROWED</h4>
                  <span>{totalBorrowed.toFixed(2)} <small>ckBTC</small></span>
                </div>
                <div className="stat-card">
                  <h4>COLLATERAL LOCKED</h4>
                  <span>{totalCollateral.toFixed(2)} <small>BTC</small></span>
                </div>
                <div className="stat-card wallet-card">
                  <h4>YOUR BITCOIN WALLET</h4>
                  {btcAddress ? (
                    <p className="address-display">{btcAddress}</p>
                  ) : (
                    <form onSubmit={handleBtcAddressLink}>
                      <input name="btcAddress" type="text" placeholder="Enter Bitcoin address..."/>
                      <button type="submit" disabled={!isAuthenticated}>Link Address</button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-cards">
              <div className="action-card" onClick={() => isAuthenticated && setIsModalOpen(true)}>
                <h4>+ Create New Loan</h4>
                <p>Start a new loan with your Bitcoin collateral.</p>
              </div>
              <div className="action-card">
                <h4>View Loan History</h4>
                <p>Review your past and current loans.</p>
              </div>
            </div>
          </div>

          <div className="loan-history">
            <h3>Recent Loan Activity</h3>
            {isLoading ? (
              <p>Loading loan history...</p>
            ) : loans.length > 0 ? (
              <ul>
                {loans.map(loan => (
                  <li key={loan.id}>
                    Loan of {loan.loan_amount} against {loan.collateral_amount} BTC
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>You have no active loans.</p>
                <span>Create a new loan to get started!</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default App;