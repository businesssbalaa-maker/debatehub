import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Wallet.css';
import { getuserData, getUserStatementHistory } from '../Api';

export default function Wallet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  
  // Live Balance States
  const [playableBalance, setPlayableBalance] = useState(0);
  const [withdrawableWinnings, setWithdrawableWinnings] = useState(0);
  const [totalCombinedBalance, setTotalCombinedBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleLogout = () => {
    Cookies.remove("2ndtredingWeb", { path: "/" });
    Cookies.remove("2ndtredingWebUser", { path: "/" });
    localStorage.clear();
    navigate("/auth");
  };

  const fetchRealTimeLedgerHistory = async (targetUid) => {
    setLoadingTransactions(true);
    try {
      const resultData = await getUserStatementHistory(targetUid);

      if (resultData && resultData.success) {
        const payloadData = resultData.data;
        const compiledPassbookList = [];

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

        if (payloadData.purchasesWithStock) {
          payloadData.purchasesWithStock.forEach((trade) => {
            compiledPassbookList.push({
              id: trade.purchaseId || 'TRD-MARKET',
              type: 'Debit',
              desc: `Placed Bet: "${trade.stockName || 'Opinion Poll Contract'}"`,
              date: trade.purchaseDate ? new Date(trade.purchaseDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'Settled',
              amount: Number(trade.TotalAmount || 0),
              status: 'SUCCESS'
            });
          });
        }

        compiledPassbookList.sort((x, y) => new Date(y.date) - new Date(x.date));
        setLedgerTransactions(compiledPassbookList);
      }
    } catch (error) {
      console.error("Failure inside history compiler loop:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ✅ FIXED: Calls getuserData dynamically to read and split balances live from DB
  const fetchLiveWalletMetrics = async (activeUid) => {
    try {
      const response = await getuserData(activeUid);
      if (response && response.success && response.user) {
        const wVal = Number(response.user.Withdrawal || 0);
        const bVal = Number(response.user.balance || 0);

        setWithdrawableWinnings(wVal);
        setPlayableBalance(bVal);
        setTotalCombinedBalance(wVal + bVal);
      }
    } catch (err) {
      console.error("Error loading wallet finance metrics:", err);
    }
  };

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

  const filteredTxns = activeTab === 'All' 
    ? ledgerTransactions 
    : ledgerTransactions.filter(txn => txn.type === activeTab);

  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / itemsPerPage));
  const pagedTxns = filteredTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, ledgerTransactions]);

  const handleWalletPageChange = (direction) => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + direction;
      return Math.min(Math.max(nextPage, 1), totalPages);
    });
  };

  return (
    <div className="wallet-page-container">
      <header className="wallet-page-header">
        <div className="wallet-header-wrap">
          <div className="wallet-page-logo">
            <button className="back-navigation-btn" onClick={() => navigate("/")}>
              <span className="back-arrow-vector">←</span> Back
            </button>
          </div>
          <div className="wallet-user-stats">
            <div className="global-wallet-badge">₹{totalCombinedBalance.toFixed(2)}</div>
            <button className="wallet-logout-trigger-btn" onClick={handleLogout}>🚪 Log Out</button>
          </div>
        </div>
      </header>

      <main className="wallet-page-layout">
        <section className="wallet-summary-grid">
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

          <div className="wallet-quick-actions">
            <h3 className="actions-header-title">Funds Management</h3>
            <p className="actions-header-subtitle">Instantly add money or settle funds to your linked bank account.</p>
            <div className="action-button-group">
              <button className="action-btn btn-deposit" onClick={() => navigate('/recharge')}>➕ Deposit Money</button>
              <button className="action-btn btn-withdraw" onClick={() => navigate('/withdraw')}>💸 Withdrawal</button>
            </div>
            <p className="action-compliance-notice">⚡ Powered by instant IMPS & UPI payouts.</p>
          </div>
        </section>

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

          <div className="table-responsive-wrapper">
            {loadingTransactions ? (
              <div className="ledger-realtime-spinner-container">
                <div className="ledger-sync-dots">Synchronizing Transaction Ledger Nodes...</div>
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="ledger-empty-placeholder-card">
                <span className="empty-book-icon">📋No transactions registered on this workspace node yet.</span>
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
                  {pagedTxns.map((txn, index) => (
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
                        <span className={`status-pill-badge badge-${txn.status.toLowerCase()}`}>● {txn.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredTxns.length > itemsPerPage && (
              <div className="pagination-controls wallet-pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleWalletPageChange(-1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleWalletPageChange(1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}