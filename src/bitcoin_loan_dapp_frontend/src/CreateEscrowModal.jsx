import React, { useState } from 'react';
import { createEscrow } from './escrow-agent';
import './CreateLoanModal.css';
import { Principal } from '@dfinity/principal';

export const CreateEscrowModal = ({ isOpen, onClose, onEscrowCreated }) => {
  const [lenderPrincipal, setLenderPrincipal] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ltvRatio, setLtvRatio] = useState('N/A');

  // Calculate LTV ratio when collateral or loan amount changes
  const calculateLTV = (loan, collateral) => {
    if (!loan || !collateral || parseFloat(collateral) === 0) {
      return 'N/A';
    }
    const ltv = (parseFloat(loan) / parseFloat(collateral)) * 100;
    return ltv.toFixed(2) + '%';
  };

  // Update LTV when values change
  React.useEffect(() => {
    setLtvRatio(calculateLTV(loanAmount, collateralAmount));
  }, [loanAmount, collateralAmount]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!lenderPrincipal.trim()) {
      setError('Lender Principal ID is required');
      return;
    }
    
    if (!btcAddress.trim()) {
      setError('Bitcoin Collateral Address is required');
      return;
    }
    
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      setError('Collateral Amount must be greater than 0');
      return;
    }
    
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setError('Loan Amount must be greater than 0');
      return;
    }
    
    // Validate Principal format
    try {
      Principal.fromText(lenderPrincipal.trim());
    } catch (err) {
      setError('Invalid Principal ID format');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await createEscrow(
        lenderPrincipal.trim(),
        btcAddress.trim(),
        parseFloat(collateralAmount),
        parseFloat(loanAmount)
      );
      
      if ('Ok' in result) {
        if (onEscrowCreated) {
          onEscrowCreated(result.Ok);
        }
        onClose();
      } else if ('Err' in result) {
        setError(`Failed to create escrow: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error creating escrow:", error);
      setError(`Failed to create escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set sample values for demonstration
  const fillSampleValues = () => {
    setLenderPrincipal('rrkah-fqaaa-aaaaa-aaaaq-cai');
    setBtcAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    setCollateralAmount('0.1');
    setLoanAmount('0.05');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Escrow</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="lenderPrincipal">Lender Principal ID</label>
            <input
              type="text"
              id="lenderPrincipal"
              placeholder="e.g., rrkah-fqaaa-aaaaa-aaaaq-cai"
              value={lenderPrincipal}
              onChange={(e) => setLenderPrincipal(e.target.value)}
            />
            <small className="form-text">The principal ID of the lender who will manage the loan.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="btcAddress">Bitcoin Collateral Address</label>
            <input
              type="text"
              id="btcAddress"
              placeholder="e.g., bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              value={btcAddress}
              onChange={(e) => setBtcAddress(e.target.value)}
            />
            <small className="form-text">The Bitcoin address where collateral will be sent.</small>
          </div>
          
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
          
          <div className="form-note">
            <strong>Note:</strong> This creates an escrow agreement between you (borrower) and the lender. The lender will need to lock the escrow once they've verified your Bitcoin collateral.
          </div>
          
          <div className="form-stats">
            <div className="stat-item">
              <span className="stat-label">LTV Ratio:</span>
              <span className="stat-value">{ltvRatio}</span>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Escrow...' : 'Create Escrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 