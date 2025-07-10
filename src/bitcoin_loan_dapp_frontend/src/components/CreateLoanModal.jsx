import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../CreateLoanModal.css';

export const CreateLoanModal = ({ isOpen, onClose }) => {
  const { actor } = useAuth();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Calculate LTV ratio
  const calculateLtv = () => {
    if (!collateralAmount || !loanAmount) return 'N/A';
    const ltv = (parseFloat(loanAmount) / parseFloat(collateralAmount)) * 100;
    return ltv.toFixed(2) + '%';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!collateralAmount || !loanAmount) {
      setError('Please fill in all fields');
      return;
    }

    const collateralValue = parseFloat(collateralAmount);
    const loanValue = parseFloat(loanAmount);

    if (isNaN(collateralValue) || isNaN(loanValue)) {
      setError('Please enter valid numbers');
      return;
    }

    if (collateralValue <= 0 || loanValue <= 0) {
      setError('Values must be greater than zero');
      return;
    }

    // Simple LTV validation (can be adjusted based on business rules)
    const ltv = loanValue / collateralValue;
    if (ltv > 0.7) {
      setError('Loan-to-value ratio is too high. Maximum LTV is 70%.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await actor.create_loan(collateralValue, loanValue);
      
      if ('Ok' in result) {
        setSuccess('Loan created successfully!');
        console.log("Loan created:", result.Ok);
        
        // Reset form
        setCollateralAmount('');
        setLoanAmount('');
        
        // Close modal after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if ('Err' in result) {
        setError(`Failed to create loan: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      setError(`Failed to create loan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Loan</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="collateralAmount">Bitcoin Collateral Amount (BTC)</label>
            <input
              type="number"
              id="collateralAmount"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="e.g., 0.1"
              step="0.00000001"
              min="0"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="loanAmount">Loan Amount (ckBTC)</label>
            <input
              type="number"
              id="loanAmount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g., 0.05"
              step="0.00000001"
              min="0"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="loan-info">
            <p>
              <strong>Note:</strong> This is a simulated loan. In a real-world scenario, 
              you would lock your BTC collateral in a smart contract and receive ckBTC (chain-key Bitcoin) in return.
            </p>
            <p>
              <strong>LTV Ratio:</strong> {calculateLtv()}
            </p>
          </div>
          
          <div className="form-footer">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 