import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { createEscrow } from './escrow-agent';
import './CreateLoanModal.css'; // Reuse the existing modal styles

export const CreateEscrowModal = ({ isOpen, onClose }) => {
  const { userPrincipal } = useAuth();
  const [lenderPrincipal, setLenderPrincipal] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
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
    if (!lenderPrincipal || !btcAddress || !collateralAmount || !loanAmount) {
      setError('Please fill in all fields');
      return;
    }

    // Validate principal ID format
    if (!lenderPrincipal.match(/^[a-zA-Z0-9-]+$/)) {
      setError('Invalid principal ID format');
      return;
    }

    // Validate Bitcoin address
    const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-Z0-9]{8,100}$/;
    if (!bitcoinAddressRegex.test(btcAddress.trim())) {
      setError('Please enter a valid Bitcoin address (starting with 1, 3, or bc1)');
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
      const result = await createEscrow(
        lenderPrincipal,
        btcAddress,
        collateralValue,
        loanValue
      );
      
      if ('Ok' in result) {
        setSuccess(`Escrow created successfully with ID: ${result.Ok}`);
        console.log("Escrow created:", result.Ok);
        
        // Reset form
        setLenderPrincipal('');
        setBtcAddress('');
        setCollateralAmount('');
        setLoanAmount('');
        
        // Close modal after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Escrow</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="lenderPrincipal">Lender Principal ID</label>
            <input
              type="text"
              id="lenderPrincipal"
              value={lenderPrincipal}
              onChange={(e) => setLenderPrincipal(e.target.value)}
              placeholder="e.g., abc123-def456-ghi789"
              disabled={isSubmitting}
            />
            <small>The principal ID of the lender who will provide the loan</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="btcAddress">Bitcoin Collateral Address</label>
            <input
              type="text"
              id="btcAddress"
              value={btcAddress}
              onChange={(e) => setBtcAddress(e.target.value)}
              placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              disabled={isSubmitting}
            />
            <small>The Bitcoin address where collateral will be sent</small>
          </div>
          
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
              <strong>Note:</strong> This creates an escrow agreement between you (borrower) and the lender.
              The lender will need to lock the escrow once they've verified your Bitcoin collateral.
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
              {isSubmitting ? 'Creating...' : 'Create Escrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 