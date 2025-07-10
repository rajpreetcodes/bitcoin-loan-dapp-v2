import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../CreateLoanModal.css';

export const CreateLoanModal = ({ isOpen, onClose, onLoanCreated }) => {
  const { actor } = useAuth();
  
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ltvRatio, setLtvRatio] = useState('N/A');
  const [btcAddress, setBtcAddress] = useState('');
  
  // Calculate LTV ratio when collateral or loan amount changes
  const calculateLTV = (loan, collateral) => {
    if (!loan || !collateral || parseFloat(collateral) === 0) {
      return 'N/A';
    }
    const ltv = (parseFloat(loan) / parseFloat(collateral)) * 100;
    return ltv.toFixed(2) + '%';
  };

  // Update LTV when values change
  useEffect(() => {
    setLtvRatio(calculateLTV(loanAmount, collateralAmount));
  }, [loanAmount, collateralAmount]);
  
  // Fetch BTC address on mount
  useEffect(() => {
    const fetchBtcAddress = async () => {
      if (!actor) return;
      
      try {
        const result = await actor.get_btc_address();
        if (result.length > 0) {
          setBtcAddress(result[0]);
        }
      } catch (error) {
        console.error("Failed to fetch BTC address:", error);
      }
    };
    
    fetchBtcAddress();
  }, [actor]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      setError('Collateral Amount must be greater than 0');
      return;
    }
    
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setError('Loan Amount must be greater than 0');
      return;
    }
    
    if (!interestRate || parseFloat(interestRate) < 0) {
      setError('Interest Rate must be a valid percentage');
      return;
    }
    
    if (!durationDays || parseInt(durationDays) <= 0) {
      setError('Duration must be at least 1 day');
      return;
    }
    
    // Check if BTC address is linked
    if (!btcAddress) {
      setError('You must link a Bitcoin address before creating a loan');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // The backend only expects two parameters: collateral and loan amount
      const result = await actor.create_loan(
        parseFloat(collateralAmount),
        parseFloat(loanAmount)
      );
      
      if ('Ok' in result) {
        if (onLoanCreated) {
          onLoanCreated(result.Ok);
        }
        onClose();
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
  
  // Set sample values for demonstration
  const fillSampleValues = () => {
    setCollateralAmount('0.1');
    setLoanAmount('0.05');
    setInterestRate('5');
    setDurationDays('30');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Loan</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="collateralAmount">Bitcoin Collateral Amount (BTC)</label>
            <input
              type="number"
              id="collateralAmount"
              placeholder="e.g., 0.1"
              min="0.001"
              step="0.001"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="loanAmount">Loan Amount (ckBTC)</label>
            <input
              type="number"
              id="loanAmount"
              placeholder="e.g., 0.05"
              min="0.001"
              step="0.001"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="interestRate">Interest Rate (%)</label>
            <input
              type="number"
              id="interestRate"
              placeholder="e.g., 5"
              min="0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="durationDays">Duration (Days)</label>
            <input
              type="number"
              id="durationDays"
              placeholder="e.g., 30"
              min="1"
              step="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
          
          <div className="form-note">
            <strong>Note:</strong> You will need to send {collateralAmount || '0'} BTC to your linked Bitcoin address as collateral.
            {!btcAddress && <p className="warning">You must link a Bitcoin address before creating a loan.</p>}
          </div>
          
          <div className="form-stats">
            <div className="stat-item">
              <span className="stat-label">LTV Ratio:</span>
              <span className="stat-value">{ltvRatio}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bitcoin Address:</span>
              <span className="stat-value">{btcAddress || 'Not linked'}</span>
            </div>
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={fillSampleValues}
            >
              Fill Sample Values
            </button>
            <button 
              type="button" 
              className="secondary-button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button"
              disabled={isSubmitting || !btcAddress}
            >
              {isSubmitting ? 'Creating Loan...' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 