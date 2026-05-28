import { useState } from 'react';
import './TradeCard.css';

export default function TradeCard({ product, onPlaceTrade }) {
  // HOOKS DECLARED FIRST (Enforces strict React hook lifecycle call execution frames order)
  const [selectedOption, setSelectedOption] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(product?.initialThreshold || 0);
  const [showOrderSlip, setShowOrderSlip] = useState(false);
  const [inputError, setInputError] = useState("");

  if (!product) return null;

  const {
    _id,
    question,
    category,        
    subCategory,     
    options = [],
    initialThreshold = 0,
    endTime,
  } = product;

  const handleOptionSelect = (optionObj) => {
    setSelectedOption(optionObj);
    setInvestmentAmount(initialThreshold); 
    setInputError("");
    setShowOrderSlip(true);
  };

  const handleAmountChange = (e) => {
    const value = Number(e.target.value);
    setInvestmentAmount(value);
    
    if (value < initialThreshold) {
      setInputError(`Minimum required pool allocation stake is ₹${initialThreshold}`);
    } else {
      setInputError("");
    }
  };

  const handleCancel = () => {
    setShowOrderSlip(false);
    setSelectedOption(null);
    setInputError("");
  };

  const handleConfirmOrder = () => {
    if (!selectedOption) return;
    if (investmentAmount < initialThreshold) {
      setInputError(`You must invest at least ₹${initialThreshold} to place an execution order.`);
      return;
    }

    // 🚀 STABLE OBJECT-ID PARSING SWEEP: Safely extracts a clean 24-character hex string string token
    const parsedProductId = _id?.$oid || _id;
    const parsedOptionId = selectedOption._id?.$oid || selectedOption._id || selectedOption.id;

    if (!parsedOptionId || !parsedProductId) {
      setInputError("System parsing failure tracking choice data parameters. Please try again.");
      return;
    }

    // ✅ EMITS UNIFIED ATTRIBUTES TAILORED PERFECTLY TO MATCH YOUR NEW SUB-SCHEMAS KEYS
    if (onPlaceTrade) {
      onPlaceTrade({
        questionId: String(parsedProductId),
        question: question,               
        chosenOptionId: String(parsedOptionId), // 🚀 Feeds into your brand new schema requirement!
        option: selectedOption.optionText,     
        investmentAmount: Number(investmentAmount)
      });
    }
    
    setShowOrderSlip(false);
    setSelectedOption(null);
  };

  const formatEndTime = (dateString) => {
    if (!dateString) return "Soon";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="probo-trade-card">
      
      {/* HEADER MARKET CLASSIFICATION BADGES */}
      <div className="card-top-meta">
        <div className="meta-badge-tag">
          <span className="badge-text">{category} • {subCategory}</span>
        </div>
        <div className="meta-timer-tag">⏰ Approximate Ends near {formatEndTime(endTime)}</div>
      </div>

      {/* CORE OPINION TOPIC */}
      <h3 className="card-question-text">{question}</h3>

      {/* DYNAMIC MCQ CONFIGURABLE BUTTONS BLOCK */}
      <div className="mcq-options-stack">
        {options.map((opt) => {
          const optIdString = opt._id?.$oid || opt._id;
          return (
            <button 
              key={optIdString} 
              className="mcq-option-row-btn" 
              onClick={() => handleOptionSelect(opt)}
            >
              <span className="option-text-lbl">{opt.optionText}</span>
            </button>
          );
        })}
      </div>

      {/* MINIMUM ENTRY STATUS COMPLIANCE FOOTER */}
      <div className="card-bottom-volume-bar">
        <span>📋 Required Min Entry: ₹{initialThreshold}</span>
      </div>

      {/* OVERLAY ACTION CHECKOUT ORDER SLIP MODAL */}
      {showOrderSlip && (
        <div className="inline-order-slip-overlay">
          
          <div className="slip-header-row">
            <h4 className="slip-title">Set Pool Stake Allocation</h4>
            <button className="slip-dismiss-x" onClick={handleCancel}>×</button>
          </div>

          <div className="slip-stance-badge-row">
            <div className="stance-indicator">
              <span className="indicator-lbl">Selected Target</span>
              <span className="indicator-val text-purple">{selectedOption?.optionText}</span>
            </div>
            <div className="stance-indicator text-right">
              <span className="indicator-lbl">Required Baseline</span>
              <span className="indicator-val text-white">≥ ₹{initialThreshold}</span>
            </div>
          </div>

          <div className="slip-input-calculator-matrix">
            <div className="amount-field-wrapper">
              <label className="calc-mini-lbl">Enter Investment Amount (INR)</label>
              <div className="rupee-input-container-box">
                <span className="currency-prefix-vector">₹</span>
                <input 
                  type="number"
                  className="numerical-stake-input"
                  min={initialThreshold}
                  value={investmentAmount}
                  onChange={handleAmountChange}
                  placeholder={`Min ₹${initialThreshold}`}
                />
              </div>
            </div>
          </div>

          {inputError && (
            <div className="slip-validation-error-notice">
              ⚠️ {inputError}
            </div>
          )}

          <div className="slip-action-footers">
            <button className="slip-btn-abort" onClick={handleCancel}>Cancel</button>
            <button 
              type="button"
              className="slip-btn-execute" 
              onClick={handleConfirmOrder}
              disabled={!!inputError || investmentAmount <= 0}
            >
              Confirm & Invest ₹{investmentAmount}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}