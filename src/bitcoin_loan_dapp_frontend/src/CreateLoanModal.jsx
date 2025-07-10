import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import './CreateLoanModal.css';

const CreateLoanModal = ({ isOpen, onClose, onSuccess }) => {
  const { isPlugConnected, connectPlug, plugInitialized } = useAuth();
  const [formData, setFormData] = useState({
    collateralAmount: '',
    loanAmount: '',
    interestRate: '',
    duration: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (value === '' || /^\d*\.?\d{0,8}$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.collateralAmount || parseFloat(formData.collateralAmount) <= 0) {
      errors.collateralAmount = 'Collateral amount must be greater than 0';
    } else if (parseFloat(formData.collateralAmount) > 100) {
      errors.collateralAmount = 'Collateral amount seems too high (max 100 BTC)';
    }
    
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      errors.loanAmount = 'Loan amount must be greater than 0';
    } else if (parseFloat(formData.loanAmount) > 50) {
      errors.loanAmount = 'Loan amount seems too high (max 50 ckBTC)';
    }
    
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) {
      errors.interestRate = 'Interest rate must be greater than 0';
    } else if (parseFloat(formData.interestRate) > 100) {
      errors.interestRate = 'Interest rate cannot exceed 100%';
    }
    
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      errors.duration = 'Duration must be greater than 0';
    } else if (parseFloat(formData.duration) > 365) {
      errors.duration = 'Duration cannot exceed 365 days';
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPlugConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const actor = await getActor();
      
      const collateralAmount = parseFloat(formData.collateralAmount);
      const loanAmount = parseFloat(formData.loanAmount);
      const interestRate = parseFloat(formData.interestRate);
      const duration = parseInt(formData.duration);
      
      console.log('Creating loan with:', {
        collateral: collateralAmount,
        loan: loanAmount,
        rate: interestRate,
        days: duration
      });
      
      const result = await actor.create_loan(collateralAmount, loanAmount, interestRate, duration);
      
      console.log('Loan created successfully:', result);
      
      setFormData({
        collateralAmount: '',
        loanAmount: '',
        interestRate: '',
        duration: ''
      });
      setValidationErrors({});
      
      onSuccess(result);
      
    } catch (error) {
      console.error('Failed to create loan:', error);
      setError(error.message || 'Failed to create loan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        collateralAmount: '',
        loanAmount: '',
        interestRate: '',
        duration: ''
      });
      setValidationErrors({});
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Loan</h2>
          <button 
            className="btn-close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            Secure a loan by locking your Bitcoin as collateral. Your BTC remains under your control via smart contracts.
          </div>

          {!isPlugConnected && (
            <div className="wallet-connect-section">
              <p>Connect your wallet to create a loan</p>
              <button
                className="btn btn-primary"
                onClick={connectPlug}
                disabled={!plugInitialized}
              >
                {!plugInitialized ? 'Install Plug Wallet' : 'Connect Wallet'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="loan-form">
            <div className="form-group">
              <label htmlFor="collateralAmount" className="form-label">
                Bitcoin Collateral Amount
                <span className="currency-label">BTC</span>
              </label>
              <input
                type="text"
                id="collateralAmount"
                name="collateralAmount"
                value={formData.collateralAmount}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.collateralAmount ? 'error' : ''}`}
                placeholder="e.g., 0.1"
                disabled={isLoading || !isPlugConnected}
                autoComplete="off"
              />
              {validationErrors.collateralAmount && (
                <span className="error-message">{validationErrors.collateralAmount}</span>
              )}
            </div>

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
                placeholder="e.g., 0.05"
                disabled={isLoading || !isPlugConnected}
                autoComplete="off"
              />
              {validationErrors.loanAmount && (
                <span className="error-message">{validationErrors.loanAmount}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="interestRate" className="form-label">
                Interest Rate
                <span className="currency-label">%</span>
              </label>
              <input
                type="text"
                id="interestRate"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.interestRate ? 'error' : ''}`}
                placeholder="e.g., 5"
                disabled={isLoading || !isPlugConnected}
                autoComplete="off"
              />
              {validationErrors.interestRate && (
                <span className="error-message">{validationErrors.interestRate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration
                <span className="currency-label">Days</span>
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.duration ? 'error' : ''}`}
                placeholder="e.g., 30"
                disabled={isLoading || !isPlugConnected}
                autoComplete="off"
              />
              {validationErrors.duration && (
                <span className="error-message">{validationErrors.duration}</span>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !isPlugConnected}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner" />
                    Creating...
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