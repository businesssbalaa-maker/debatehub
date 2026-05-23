import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Wallet.css';

// Centralizing all backend requests cleanly inside your api.js layer
import { GetBankDetails, getUserStatementHistory } from '../api';

export default function Wallet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  
  // --- Live Balance States ---
  const [playableBalance, setPlayableBalance] = useState(0);
  const [withdrawableWinnings, setWithdrawableWinnings] = useState(0);
  const [totalCombinedBalance, setTotalCombinedBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  // --- Real-time Passbook Ledger Array States ---
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // --- 1. Strict Session Purge Mechanism ---
  const handleLogout = () => {
    Cookies.remove("2ndtredingWeb", { path: "/" });
    Cookies.remove("2ndtredingWebUser", { path: "/" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
    setPlayableBalance(0);
    setWithdrawableWinnings(0);
    setTotalCombinedBalance(0);
    setUserId(null);
    navigate("/auth");
  };

  // --- 2. Centralized Production Passbook Builder Engine ---
  const fetchRealTimeLedgerHistory = async (targetUid) => {
    setLoadingTransactions(true);
    try {
      // ✅ CALLED CLEANLY VIA YOUR API.JS METHOD NOW
      const resultData = await getUserStatementHistory(targetUid);

      if (resultData && resultData.success) {
        const payloadData = resultData.data;
        const compiledPassbookList = [];

        // Map Stream A: Inbound Recharge Cash Top-Ups
        if (payloadData.rechargeHistory) {
          payloadData.rechargeHistory.forEach((deposit) => {
            compiledPassbookList.push({
              id: deposit.utr || 'RECH-GWAY',
              type: 'Credit',
              desc: 'UPI Cash Deposit Wallet Top-Up',
              date: deposit.date ? new Date(deposit.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'Processing',
              amount: Number(deposit.amount || 0),
              status: deposit.approved || 'PENDING'
            });
          });
        }

        // Map Stream B: Outbound Bank Line Settlements 
        if (payloadData.withdrawHistory) {
          payloadData.withdrawHistory.forEach((payout) => {
            compiledPassbookList.push({
              id: payout._id ? `WTH-${payout._id.toString().substring(18).toUpperCase()}` : 'WITHDRAWAL',
              type: 'Debit',
              desc: 'Bank Account Withdrawal Settlement',
              date: payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'Processing',
              amount: Number(payout.amount || 0),
              status: payout.status || 'PENDING'
            });
          });
        }

        // Map Stream C: Trade Placements (Deducted Stakes)
        if (payloadData.purchasesWithStock) {
          payloadData.purchasesWithStock.forEach((trade) => {
            compiledPassbookList.push({
              id: trade.purchaseId || 'TRD-MARKET',
              type: 'Debit',
              desc: `Placed Bet: "${trade.stockName || 'Opinion Poll Contract'}" [Chosen Side: ${trade.chosenOption || 'YES'}]`,
              date: trade.purchaseDate ? new Date(trade.purchaseDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'Settled',
              amount: Number(trade.TotalAmount || 0),
              status: 'SUCCESS'
            });
          });
        }

        // Chronological Sequence Sort: Latest actions always paint at index 0
        compiledPassbookList.sort((x, y) => new Date(y.date) - new Date(x.date));
        setLedgerTransactions(compiledPassbookList);
      }
    } catch (error) {
      console.error("Critical Failure inside real-time history compiler loop:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // --- 3. Live Balance Metrics Fetcher ---
  const fetchLiveWalletMetrics = async (activeUid) => {
    try {
      const response = await GetBankDetails(activeUid);
      if (response && response.data) {
        const balanceVal = Number(response.data.Withdrawal || 0);
        const playVal = Number(response.data.balance || 0);

        setWithdrawableWinnings(balanceVal);
        setPlayableBalance(playVal);
        setTotalCombinedBalance(balanceVal + playVal);
      }
    } catch (err) {
      console.error("Error loading wallet finance data metrics:", err);
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsed = JSON.parse(storedUserData);
        const wVal = Number(parsed.Withdrawal || 0);
        const bVal = Number(parsed.balance || 0);
        setWithdrawableWinnings(wVal);
        setPlayableBalance(bVal);
        setTotalCombinedBalance(wVal + bVal);
      }
    }
  };

  // --- 4. Initialization Component Hook ---
  useEffect(() => {
    const localLoginFlag = localStorage.getItem('isLoggedIn');
    const savedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('auth_token') || Cookies.get('2ndtredingWeb');

    if (token && (localLoginFlag === "true" || savedUserId)) {
      setUserId(savedUserId);
      fetchLiveWalletMetrics(savedUserId);
      fetchRealTimeLedgerHistory(savedUserId);
    } else {
      handleLogout();
    }
  }, []);

  // --- Tab Filters Engine Mapping ---
  const filteredTxns = activeTab === 'All' 
    ? ledgerTransactions 
    : ledgerTransactions.filter(txn => txn.type === activeTab);

  return (
    <div className="wallet-page-container">
      
      {/* HEADER STICKY PANEL */}
      <header className="wallet-page-header">
        <div className="wallet-header-wrap">
          <div className="wallet-page-logo">
            <button className="back-navigation-btn" onClick={() => navigate("/")}>
              <span className="back-arrow-vector">←</span> Back Home
            </button>
          </div>
          
          <div className="wallet-user-stats">
            <div className="global-wallet-badge">₹{totalCombinedBalance.toFixed(2)}</div>
            <button className="wallet-logout-trigger-btn" onClick={handleLogout}>
              🚪 Log Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY WRAP */}
      <main className="wallet-page-layout">

        {/* ROW 1: BALANCE SUMMARY AND QUICK ACTIONS */}
        <section className="wallet-summary-grid">
          
          {/* Detailed Rupee Assets Balance Card */}
          <div className="balance-breakdown-card glass-panel">
            <div className="card-top-row">
              <span className="balance-headline">Total Balance Assets</span>
              <span className="verified-shield">🛡️ Secure Account</span>
            </div>
            
            <div className="primary-coin-metric">₹{totalCombinedBalance.toFixed(2)}</div>
            
            <div className="balance-sub-metrics">
              <div className="metric-box">
                <span className="metric-label">Winnings (Withdrawable)</span>
                <span className="metric-val text-emerald">₹{withdrawableWinnings.toFixed(2)}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Deposit Wallet Cash</span>
                <span className="metric-val text-purple">₹{playableBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Cash Flow Management Form */}
          <div className="wallet-quick-actions bg-brand-card">
            <h3 className="actions-header-title">Funds Management</h3>
            <p className="actions-header-subtitle">Instantly add money or settle funds to your linked bank account.</p>
            
            <div className="action-button-group">
              <button className="action-btn btn-deposit" onClick={() => navigate('/recharge')}>
                <span>➕</span> Deposit Money
              </button>
              <button className="action-btn btn-withdraw" onClick={() => navigate('/withdraw')}>
                <span>💸</span> Instant Withdrawal
              </button>
            </div>
            <p className="action-compliance-notice">⚡ Powered by instant IMPS & UPI payout architectures.</p>
          </div>

        </section>

        {/* ROW 2: TRANSACTION LEDGER TABLE */}
        <section className="wallet-ledger-section">
          <div className="ledger-header">
            <h2 className="ledger-title">Account Passbook</h2>
            
            <div className="ledger-filters">
              {['All', 'Credit', 'Debit'].map((tab) => (
                <button
                  key={tab}
                  className={`ledger-tab ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'All' ? 'All History' : `${tab}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table Viewport */}
          <div className="table-responsive-wrapper scrollbar-hide">
            {loadingTransactions ? (
              <div className="ledger-realtime-spinner-container">
                <div className="ledger-sync-dots">Synchronizing Transaction Ledger Nodes...</div>
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="ledger-empty-placeholder-card">
                <span className="empty-book-icon">📋</span>
                <p>No transactions registered on this workspace node yet.</p>
              </div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Transaction / UTR Reference</th>
                    <th>Statement Description</th>
                    <th>Execution Date</th>
                    <th>Type</th>
                    <th className="text-right">Amount (INR)</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map((txn, index) => (
                    <tr key={`${txn.id}-${index}`}>
                      <td className="txn-id">{txn.id}</td>
                      <td className="txn-desc">{txn.desc}</td>
                      <td className="txn-date">{txn.date}</td>
                      <td>
                        <span className={`txn-type-pill ${txn.type.toLowerCase()}`}>
                          {txn.type === 'Credit' ? 'Received' : 'Paid'}
                        </span>
                      </td>
                      <td className={`txn-amount text-right ${txn.type === 'Credit' ? 'amt-credit' : 'amt-debit'}`}>
                        {txn.type === 'Credit' ? '+' : '-'} ₹{txn.amount.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span className={`status-pill-badge badge-${txn.status.toLowerCase()}`}>
                          ● {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}