import React, { useEffect, useState } from 'react';
import './EscrowDashboard.css';

export default function EscrowDashboard({ actor, userPrincipal }) {
  const [escrows, setEscrows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEscrows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await actor.get_escrows(userPrincipal);
      setEscrows(result || []);
    } catch (e) {
      setError('Failed to fetch escrows.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEscrows();
    const interval = setInterval(fetchEscrows, 30000);
    return () => clearInterval(interval);
  }, [actor, userPrincipal]);

  const totalEscrows = escrows.length;
  const totalLoans = escrows.reduce((sum, e) => sum + (e.loan_count || 0), 0);

  return (
    <div className="escrow-dashboard-container">
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>Total Escrows</h3>
              <p className="stat-value">{typeof totalEscrows === 'number' ? totalEscrows : 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Loans</h3>
              <p className="stat-value">{typeof totalLoans === 'number' ? totalLoans : 0}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="escrows-section">
        <h3>Your Escrows</h3>
        {isLoading ? <div className="spinner" /> : error ? <div className="error">{error}</div> : (
          <table className="escrows-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loan Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {escrows.length === 0 ? (
                <tr><td colSpan="3">No escrows found.</td></tr>
              ) : escrows.map((escrow, idx) => (
                <tr key={escrow.id || idx}>
                  <td>{escrow.id || idx + 1}</td>
                  <td>{escrow.loan_count}</td>
                  <td>{escrow.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
} 