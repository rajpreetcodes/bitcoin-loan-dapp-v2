import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CreateLoanModal = ({ onClose, onLoanCreated }) => {
  const { actor } = useAuth();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateLoanToValueRatio = () => {
    if (!collateralAmount || !loanAmount) return 0;
    return ((parseFloat(loanAmount) / parseFloat(collateralAmount)) * 100).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!actor) {
        toast.error('Actor not available');
        return;
      }

      // This is a placeholder - replace with actual loan creation logic
      const newLoan = {
        id: Date.now().toString(),
        collateralAmount: parseFloat(collateralAmount),
        loanAmount: parseFloat(loanAmount),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Call the backend to create the loan
      // await actor.create_loan(newLoan);
      
      onLoanCreated(newLoan);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Loan</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Secure a loan by locking your Bitcoin as collateral. Your BTC remains under your control via smart contracts.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="collateralAmount">
              COLLATERAL AMOUNT
              <span className="currency-label">BTC</span>
            </label>
            <input
              id="collateralAmount"
              type="number"
              step="0.00000001"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="loanAmount">
              LOAN AMOUNT
              <span className="currency-label">ckBTC</span>
            </label>
            <input
              id="loanAmount"
              type="number"
              step="0.00000001"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {collateralAmount && loanAmount && (
            <div className="ratio-display">
              <span>Loan-to-Value Ratio: </span>
              <span className="ratio-value">{calculateLoanToValueRatio()}%</span>
            </div>
          )}



          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}; 