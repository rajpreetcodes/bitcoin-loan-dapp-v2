import React, { useState } from 'react';
import { createEscrow } from './escrow-agent';
import './CreateLoanModal.css';
import { Principal } from '@dfinity/principal';

export const CreateEscrowModal = ({ isOpen, onClose, onEscrowCreated }) => {
  const [formData, setFormData] = useState({
    lenderPrincipal: '',
    btcAddress: '',
    collateralAmount: '',
    loanAmount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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
  };

  const fillSampleData = () => {
    setFormData({
      lenderPrincipal: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      collateralAmount: '0.1',
      loanAmount: '0.05'
    });
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.lenderPrincipal.trim()) {
      errors.lenderPrincipal = 'Lender Principal ID is required';
    } else {
      try {
        Principal.fromText(formData.lenderPrincipal.trim());
      } catch (err) {
        errors.lenderPrincipal = 'Invalid Principal ID format';
      }
    }
    
    if (!formData.btcAddress.trim()) {
      errors.btcAddress = 'Bitcoin Collateral Address is required';
    }
    
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createEscrow(
        formData.lenderPrincipal.trim(),
        formData.btcAddress.trim(),
        parseFloat(formData.collateralAmount),
        parseFloat(formData.loanAmount)
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
      console.error("Failed to create escrow:", error);
      setError(error.message || 'Failed to create escrow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        lenderPrincipal: '',
        btcAddress: '',
        collateralAmount: '',
        loanAmount: ''
      });
      setValidationErrors({});
      setError(null);
      onClose();
    }
  };

  // Calculate LTV ratio
  const calculateLTV = () => {
    if (!formData.loanAmount || !formData.collateralAmount || parseFloat(formData.collateralAmount) === 0) {
      return null;
    }
    return (parseFloat(formData.loanAmount) / parseFloat(formData.collateralAmount)) * 100;
  };

  const ltvRatio = calculateLTV();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Escrow</h2>
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
            Create an escrow agreement between you (borrower) and a lender. The lender will need to lock the escrow once they've verified your Bitcoin collateral.
          </div>

          <form onSubmit={handleSubmit} className="loan-form">
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fillSampleData}
              >
                Fill Sample Data
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="lenderPrincipal" className="form-label">
                Lender Principal ID
              </label>
              <input
                type="text"
                id="lenderPrincipal"
                name="lenderPrincipal"
                value={formData.lenderPrincipal}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.lenderPrincipal ? 'error' : ''}`}
                placeholder="e.g., rrkah-fqaaa-aaaaa-aaaaq-cai"
                disabled={isLoading}
                autoComplete="off"
              />
              {validationErrors.lenderPrincipal && (
                <span className="error-message">{validationErrors.lenderPrincipal}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="btcAddress" className="form-label">
                Bitcoin Collateral Address
              </label>
              <input
                type="text"
                id="btcAddress"
                name="btcAddress"
                value={formData.btcAddress}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.btcAddress ? 'error' : ''}`}
                placeholder="e.g., bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                disabled={isLoading}
                autoComplete="off"
              />
              {validationErrors.btcAddress && (
                <span className="error-message">{validationErrors.btcAddress}</span>
              )}
            </div>

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
                disabled={isLoading}
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
                disabled={isLoading}
                autoComplete="off"
              />
              {validationErrors.loanAmount && (
                <span className="error-message">{validationErrors.loanAmount}</span>
              )}
            </div>

            {ltvRatio && (
              <div className="loan-summary">
                <h3>Escrow Summary</h3>
                <div className="summary-item">
                  <span>Collateral Amount:</span>
                  <span>{parseFloat(formData.collateralAmount).toFixed(4)} BTC</span>
                </div>
                <div className="summary-item">
                  <span>Loan Amount:</span>
                  <span>{parseFloat(formData.loanAmount).toFixed(4)} ckBTC</span>
                </div>
                <div className="summary-item total">
                  <span>Loan-to-Value Ratio:</span>
                  <span>{ltvRatio.toFixed(2)}%</span>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner" />
                    Creating...
                  </>
                ) : (
                  'Create Escrow'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 