import React, { useEffect, useState } from 'react';
import CreateLoanModal from './CreateLoanModal';
import './Dashboard.css';

export default function Dashboard({ actor, userPrincipal }) {
  const [loans, setLoans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLoans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await actor.get_loans(userPrincipal);
      setLoans(result || []);
    } catch (e) {
      setError('Failed to fetch loans.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLoans();
    const interval = setInterval(fetchLoans, 30000);
    return () => clearInterval(interval);
  }, [actor, userPrincipal]);

  const totalLoans = loans.length;
  const totalBorrowed = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalCollateral = loans.reduce((sum, l) => sum + (l.collateral || 0), 0);

  return (
    <div className="dashboard-container">
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Loans</h3>
              <p className="stat-value">{typeof totalLoans === 'number' ? totalLoans : 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Borrowed</h3>
              <p className="stat-value">{typeof totalBorrowed === 'number' ? totalBorrowed : 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>Total Collateral</h3>
              <p className="stat-value">{typeof totalCollateral === 'number' ? totalCollateral : 0}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="actions-section">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <div className="action-card">
            <h4>+ Create New Loan</h4>
            <p>Start a new Bitcoin-backed loan.</p>
            <button onClick={() => setIsModalOpen(true)} className="action-button primary">Create Loan</button>
          </div>
        </div>
      </section>
      <section className="loans-section">
        <h3>Your Loans</h3>
        {isLoading ? <div className="spinner" /> : error ? <div className="error">{error}</div> : (
          <table className="loans-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Collateral</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr><td colSpan="4">No loans found.</td></tr>
              ) : loans.map((loan, idx) => (
                <tr key={loan.id || idx}>
                  <td>{loan.id || idx + 1}</td>
                  <td>{loan.amount}</td>
                  <td>{loan.collateral}</td>
                  <td>{loan.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {isModalOpen && <CreateLoanModal onClose={() => setIsModalOpen(false)} actor={actor} userPrincipal={userPrincipal} onCreated={fetchLoans} />}
    </div>
  );
} 