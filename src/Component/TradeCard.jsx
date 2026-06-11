import { useState } from "react";
import "./TradeCard.css";

export default function TradeCard({ product, onPlaceTrade }) {
  // HOOKS DECLARED FIRST (Enforces strict React hook lifecycle call execution frames order)
  const [selectedOption, setSelectedOption] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(
    product?.initialThreshold || 0,
  );
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
    rewardPercentage = 0,
    endTime,
  } = product;

  const investment = Number(investmentAmount) || 0;
  const rewardPct = Number(rewardPercentage) || 0;

  let multiplier;

  if (rewardPct <= 100) {
    // Tier 1: Standard linear scale for 0% to 100% (Handles 10%->1.1x, 50%->1.5x, 100%->2x)
    multiplier = 1 + rewardPct / 100;
  } else {
    // Tier 2: Accelerated scale for over 100% (Smoothly scales from 2x up to exactly 4x at 200%)
    multiplier = 2 + (rewardPct - 100) * 0.02;
  }

  const calculativePayout = investment * multiplier;

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
      setInputError(
        `Minimum required pool allocation stake is ₹${initialThreshold}`,
      );
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
      setInputError(
        `You must invest at least ₹${initialThreshold} to place an execution order.`,
      );
      return;
    }

    const parsedProductId = _id?.$oid || _id;
    const parsedOptionId =
      selectedOption._id?.$oid || selectedOption._id || selectedOption.id;

    if (!parsedOptionId || !parsedProductId) {
      setInputError(
        "System parsing failure tracking choice data parameters. Please try again.",
      );
      return;
    }

    if (onPlaceTrade) {
      onPlaceTrade({
        questionId: String(parsedProductId),
        question: question,
        chosenOptionId: String(parsedOptionId),
        option: selectedOption.optionText,
        investmentAmount: Number(investmentAmount),
        estimatedPayout: calculativePayout, // Passing the calculation down cleanly
      });
    }

    setShowOrderSlip(false);
    setSelectedOption(null);
  };

  const formatRemaining = (dateString) => {
    if (!dateString) return "soon";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return "soon";
    const diffMs = dateObj.getTime() - Date.now();
    if (diffMs <= 0) return "ended";

    let remaining = diffMs;
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    remaining -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    remaining -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(remaining / (60 * 1000));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (parts.length === 0) return "less than a minute";
    return parts.join(" ");
  };

  return (
    <div className="probo-trade-card">
      {/* HEADER MARKET CLASSIFICATION BADGES */}
      <div className="card-top-meta">
        <div className="meta-badge-tag">
          <span className="badge-text">
            {category} • {subCategory}
          </span>
        </div>
        <div className="meta-timer-tag">
          ⏰ Ends in {formatRemaining(endTime)}
        </div>
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
        <span>
          📋 Required Min Entry: ₹{initialThreshold} • Reward Percentage:{" "}
          {rewardPercentage}%
        </span>
      </div>

      {/* OVERLAY ACTION CHECKOUT ORDER SLIP MODAL */}
      {showOrderSlip && (
        <div className="inline-order-slip-overlay">
          <div className="slip-header-row">
            <h4 className="slip-title">Set Pool Stake Allocation</h4>
            <button className="slip-dismiss-x" onClick={handleCancel}>
              ×
            </button>
          </div>

          <div className="slip-stance-badge-row">
            <div className="stance-indicator">
              <span className="indicator-lbl">Selected Target</span>
              <span className="indicator-val text-purple">
                {selectedOption?.optionText}
              </span>
            </div>
            <div className="stance-indicator text-right">
              <span className="indicator-lbl">Required Baseline</span>
              <span className="indicator-val text-white">
                ≥ ₹{initialThreshold}
              </span>
            </div>
          </div>

          <div className="slip-input-calculator-matrix">
            <div className="amount-field-wrapper">
              <label className="calc-mini-lbl">
                Enter Investment Amount (INR)
              </label>
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

          {/* 🚀 NEW LIVE ESTIMATED PAYOUT SUB-MATRIX PANEL DISPLAY */}
          <div className="slip-payout-estimation-block">
            <div className="estimation-row">
              <span className="estimation-lbl">Contract Reward Rate:</span>
              <span className="estimation-val text-cyan">
                {rewardPercentage}%
              </span>
            </div>
            <div className="estimation-row structural-divider">
              <span className="estimation-lbl highlight-payout-lbl">
                Potential Return Payout:
              </span>
              <span className="estimation-val highlight-payout-val">
                ₹
                {isNaN(calculativePayout)
                  ? "0.00"
                  : calculativePayout.toFixed(2)}
              </span>
            </div>
          </div>

          {inputError && (
            <div className="slip-validation-error-notice">⚠️ {inputError}</div>
          )}

          <div className="slip-action-footers">
            <button className="slip-btn-abort" onClick={handleCancel}>
              Cancel
            </button>
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
