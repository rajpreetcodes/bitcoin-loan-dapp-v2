import React, { useState, useEffect } from 'react';
import './CreateLoanModal.css';

export default function CreateLoanModal({ onClose, actor, userPrincipal, onCreated }) {
  const [formData, setFormData] = useState({
    userId: userPrincipal || '',
    loanAmount: '',
    interestRate: '',
    tenure: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [btcAddress, setBtcAddress] = useState('');

  // Sample values for easy testing
  const sampleValues = {
    userId: userPrincipal || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    loanAmount: '5000',
    interestRate: '8.5',
    tenure: '12'
  };

  // Calculate estimated total repayment
  const calculateTotalRepayment = () => {
    const amount = parseFloat(formData.loanAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const months = parseFloat(formData.tenure) || 0;
    
    if (amount > 0 && rate > 0 && months > 0) {
      const monthlyRate = rate / 100 / 12;
      const totalRepayment = amount * (1 + monthlyRate * months);
      return totalRepayment.toFixed(2);
    }
    return '0.00';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const fillSampleData = () => {
    setFormData(sampleValues);
    setError(null);
  };

  const validateForm = () => {
    if (!formData.userId.trim()) return 'User ID is required';
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) return 'Valid loan amount is required';
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) return 'Valid interest rate is required';
    if (!formData.tenure || parseFloat(formData.tenure) <= 0) return 'Valid tenure is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await actor.create_loan(
        formData.userId,
        Number(formData.loanAmount),
        Number(formData.interestRate),
        Number(formData.tenure)
      );
      setSuccess('Loan created successfully!');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        onCreated();
      }, 1500);
    } catch (e) {
      setError('Failed to create loan. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get BTC address for display
    if (actor && userPrincipal) {
      actor.get_btc_address(userPrincipal)
        .then(setBtcAddress)
        .catch(() => setBtcAddress('Unavailable'));
    }
  }, [actor, userPrincipal]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modern-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header modern-header">
          <h2 className="modal-title">Create New Loan</h2>
          <button 
            className="btn-close modern-close" 
            onClick={onClose} 
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* BTC Address Card */}
        <div className="btc-address-modern">
          <div className="btc-label">Linked Bitcoin Address</div>
          <div className="btc-value">{btcAddress || 'Loading...'}</div>
        </div>

        {/* Sample Data Button */}
        <div className="sample-data-section">
          <button 
            type="button" 
            onClick={fillSampleData}
            className="sample-data-btn"
            disabled={isLoading}
          >
            📝 Fill Sample Data
          </button>
        </div>

        {/* Form */}
        <form className="loan-form-modern" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="userId" className="form-label">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                placeholder="Enter user principal ID"
                className="form-input"
                disabled={isLoading}
                required
                aria-describedby="userId-help"
              />
              <div id="userId-help" className="form-hint">
                Principal ID of the loan recipient
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="loanAmount" className="form-label">
                Loan Amount (USD)
              </label>
              <input
                id="loanAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="Enter loan amount in USD"
                className="form-input"
                disabled={isLoading}
                required
                aria-describedby="loanAmount-help"
              />
              <div id="loanAmount-help" className="form-hint">
                Amount to be borrowed in USD
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="interestRate" className="form-label">
                Interest Rate (%)
              </label>
              <input
                id="interestRate"
                type="number"
                min="0"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="Enter annual interest rate"
                className="form-input"
                disabled={isLoading}
                required
                aria-describedby="interestRate-help"
              />
              <div id="interestRate-help" className="form-hint">
                Annual interest rate percentage
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tenure" className="form-label">
                Tenure (Months)
              </label>
              <input
                id="tenure"
                type="number"
                min="1"
                step="1"
                value={formData.tenure}
                onChange={(e) => handleInputChange('tenure', e.target.value)}
                placeholder="Enter loan duration in months"
                className="form-input"
                disabled={isLoading}
                required
                aria-describedby="tenure-help"
              />
              <div id="tenure-help" className="form-hint">
                Loan duration in months
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="preview-card">
            <h3 className="preview-title">📊 Loan Preview</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Principal Amount:</span>
                <span className="preview-value">${formData.loanAmount || '0.00'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Interest Rate:</span>
                <span className="preview-value">{formData.interestRate || '0'}%</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Duration:</span>
                <span className="preview-value">{formData.tenure || '0'} months</span>
              </div>
              <div className="preview-item total">
                <span className="preview-label">Estimated Total Repayment:</span>
                <span className="preview-value total-value">${calculateTotalRepayment()}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="success-message" role="alert">{success}</div>}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
            aria-describedby={error ? "error-message" : success ? "success-message" : undefined}
          >
            {isLoading ? (
              <>
                <div className="spinner-small"></div>
                Creating Loan...
              </>
            ) : (
              'Create Loan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 