import React, { useState } from 'react';
import { getActor } from './actor';
import './CreateLoanModal.css';

const CreateLoanModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    collateralAmount: '',
    loanAmount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow positive numbers with up to 8 decimal places
    if (value === '' || /^\d*\.?\d{0,8}$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear validation error when user starts typing
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    // Validate collateral amount
    if (!formData.collateralAmount || parseFloat(formData.collateralAmount) <= 0) {
      errors.collateralAmount = 'Collateral amount must be greater than 0';
    } else if (parseFloat(formData.collateralAmount) > 100) {
      errors.collateralAmount = 'Collateral amount seems too high (max 100 BTC)';
    }
    
    // Validate loan amount
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      errors.loanAmount = 'Loan amount must be greater than 0';
    } else if (parseFloat(formData.loanAmount) > 50) {
      errors.loanAmount = 'Loan amount seems too high (max 50 ckBTC)';
    }
    
    // Check loan-to-collateral ratio (simple validation)
    if (formData.collateralAmount && formData.loanAmount) {
      const collateral = parseFloat(formData.collateralAmount);
      const loan = parseFloat(formData.loanAmount);
      const ratio = loan / collateral;
      
      if (ratio > 0.7) {
        errors.loanAmount = 'Loan amount too high relative to collateral (max 70% LTV)';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const actor = await getActor();
      
      // Use floating point values directly as the backend expects float64
      const collateralAmount = parseFloat(formData.collateralAmount);
      const loanAmount = parseFloat(formData.loanAmount);
      
      console.log('Creating loan with:', {
        collateral: collateralAmount,
        loan: loanAmount
      });
      
      // Call the backend canister with float values
      const result = await actor.create_loan(collateralAmount, loanAmount);
      
      console.log('Loan created successfully:', result);
      
      // Reset form and close modal
      setFormData({ collateralAmount: '', loanAmount: '' });
      setValidationErrors({});
      
      // Call success callback with loan ID
      onSuccess(result);
      
    } catch (error) {
      console.error('Failed to create loan:', error);
      setError(error.message || 'Failed to create loan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setFormData({ collateralAmount: '', loanAmount: '' });
      setValidationErrors({});
      setError(null);
      onClose();
    }
  };

  // Calculate loan-to-value ratio for display
  const calculateLTV = () => {
    if (formData.collateralAmount && formData.loanAmount) {
      const collateral = parseFloat(formData.collateralAmount);
      const loan = parseFloat(formData.loanAmount);
      return ((loan / collateral) * 100).toFixed(1);
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Loan</h2>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Secure a loan by locking your Bitcoin as collateral. Your BTC remains under your control via smart contracts.
          </p>

          <form onSubmit={handleSubmit} className="loan-form">
            {/* Collateral Amount Field */}
            <div className="form-group">
              <label htmlFor="collateralAmount" className="form-label">
                Collateral Amount
                <span className="currency-label">BTC</span>
              </label>
              <input
                type="text"
                id="collateralAmount"
                name="collateralAmount"
                value={formData.collateralAmount}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.collateralAmount ? 'error' : ''}`}
                placeholder="0.00000000"
                disabled={isLoading}
                autoComplete="off"
              />
              {validationErrors.collateralAmount && (
                <span className="error-message">{validationErrors.collateralAmount}</span>
              )}
            </div>

            {/* Loan Amount Field */}
            <div className="form-group">
              <label htmlFor="loanAmount" className="form-label">
                Loan Amount
                <span className="currency-label">ckBTC</span>
              </label>
              <input
                type="text"
                id="loanAmount"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.loanAmount ? 'error' : ''}`}
                placeholder="0.00000000"
                disabled={isLoading}
                autoComplete="off"
              />
              {validationErrors.loanAmount && (
                <span className="error-message">{validationErrors.loanAmount}</span>
              )}
            </div>

            {/* Loan-to-Value Ratio Display */}
            {calculateLTV() && (
              <div className="ltv-display">
                <span className="ltv-label">Loan-to-Value Ratio:</span>
                <span className={`ltv-value ${parseFloat(calculateLTV()) > 70 ? 'high' : ''}`}>
                  {calculateLTV()}%
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !formData.collateralAmount || !formData.loanAmount}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Loan...
                  </>
                ) : (
                  'Create Loan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLoanModal; 