import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getUserPurchaseHistory, getuserData } from '../api'; // Central API module imports
import './Rewards.css';

export default function Rewards() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Real-time Database States
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawableBalance, setWithdrawableBalance] = useState("0.00");
  const [liveInPlayBalance, setLiveInPlayBalance] = useState(0);
  const [totalWonCash, setTotalWonCash] = useState(0);

  // Filters setup to map against database string configurations
  const filters = ['All', 'pending', 'win', 'loss'];

  // 1. Fetch live metrics and balance allocations directly from DB
  const loadDynamicPortfolioData = async () => {
    const savedUserId = localStorage.getItem('userId');
    const localToken = localStorage.getItem('auth_token') || Cookies.get('2ndtredingWeb');

    if (!localToken || !savedUserId) {
      localStorage.clear();
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const userRes = await getuserData(savedUserId);
      if (userRes && userRes.success && userRes.user) {
        const freshUser = userRes.user;
        if (freshUser.Withdrawal !== undefined) {
          setWithdrawableBalance(Number(freshUser.Withdrawal).toFixed(2));
        } else if (freshUser.balance !== undefined) {
          setWithdrawableBalance(Number(freshUser.balance).toFixed(2));
        }
      }

      // Fetch absolute user standalone transaction purchases feed
      const purchaseRes = await getUserPurchaseHistory(savedUserId);
      if (purchaseRes && purchaseRes.success) {
        const rawPurchasesList = purchaseRes.purchases || [];
        setTrades(rawPurchasesList);

        // Dynamically compute runtime summary panels stats indicators straight from database
        let inPlayAccumulator = 0;
        let wonAccumulator = 0;

        rawPurchasesList.forEach((trade) => {
          if (trade.winningStatus === 'pending') {
            inPlayAccumulator += Number(trade.investmentAmount || 0);
          } else if (trade.winningStatus === 'win') {
            wonAccumulator += Number(trade.payoutAmount || 0);
          }
        });

        setLiveInPlayBalance(inPlayAccumulator);
        setTotalWonCash(wonAccumulator);
      }
    } catch (err) {
      console.error("Failed to compile target live transaction portfolios matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDynamicPortfolioData();
  }, []);

  // Filter application calculation logic mapping raw strings
  const filteredTrades = activeFilter === 'All'
    ? trades
    : trades.filter(item => item.winningStatus === activeFilter);

  // Status mapping display parser configuration text helpers
  const getDisplayStatusLabel = (status) => {
    if (status === 'pending') return 'Live';
    if (status === 'win') return 'Won';
    if (status === 'loss') return 'Lost';
    return status;
  };

  return (
    <div className="rewards-container">
      
      {/* HEADER SECTION */}
      <header className="rewards-header">
        <div className="rewards-header-wrap">
          <div className="rewards-logo">
            <button className="back-navigation-btn" onClick={() => navigate("/")}>
              <span className="back-arrow-vector">←</span> Back
            </button>
          </div>
          <div className="rewards-user-wallet">
            <div className="rewards-wallet-badge">₹{withdrawableBalance}</div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="rewards-layout">
        
        {/* ROW 1: BALANCE OVERVIEW & HEADER */}
        <section className="rewards-hero-section">
          <div className="rewards-headline-block">
            <h1 className="rewards-title">Track Your Trades & <span className="rewards-title-highlight">Earnings</span></h1>
            <p className="rewards-description">Monitor your active investments on live matches or review your historical won and lost predictions.</p>
          </div>

          {/* Dynamic Wallet Balance Card */}
          <div className="rewards-balance-panel glass-panel">
            <p className="balance-label">Withdrawable Funds Balance</p>
            <div className="balance-value">₹{withdrawableBalance}</div>
            <div className="balance-investment-row">
              <div>
                <span className="invest-sublabel">In Play (Live Stakes)</span>
                <span className="invest-subvalue text-amber">₹{liveInPlayBalance.toFixed(2)}</span>
              </div>
              <div className="invest-divider-line"></div>
              <div>
                <span className="invest-sublabel">Total Won Cash Return</span>
                <span className="invest-subvalue text-emerald">₹{totalWonCash.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ROW 2: FILTERS & CARD GRID ARRAYS */}
        <section className="rewards-catalog-section">
          <div className="catalog-header">
            <h2 className="catalog-section-title">Prediction Marketplace History</h2>
            
            <div className="catalog-filters scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? 'filter-tab-active' : 'filter-tab-inactive'}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'All' ? 'All Bets' : `${getDisplayStatusLabel(filter)} Options`}
                </button>
              ))}
            </div>
          </div>

          {/* Core Status Block Switch Views */}
          {loading ? (
            <div className="rewards-loader-container-box">
              <div className="spinning-sync-vector"></div>
              <p>Compiling live database prediction history entries logs...</p>
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="rewards-empty-state-card">
              <span className="empty-state-icon-lbl">📋 No trade positions matching "{getDisplayStatusLabel(activeFilter)}" registered inside this node profile matrix.</span>
            </div>
          ) : (
            <div className="rewards-grid">
              {filteredTrades.map((trade) => (
                <div key={trade._id} className="reward-card bg-brand-card">
                  
                  <div className="reward-card-top">
                    <div className="reward-brand-identity">
                      <span className="brand-avatar">📊</span>
                      
                      <div className="brand-title-meta">
                        {/* Maps dynamic question string text natively from your document log layout keys */}
                        <h3 className="brand-name">{trade.question}</h3>
                        <span className="brand-type-badge">
                          Invested On: {new Date(trade.investedAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`status-pill pill-${getDisplayStatusLabel(trade.winningStatus).toLowerCase()}`}>
                      {getDisplayStatusLabel(trade.winningStatus)}
                    </span>
                  </div>

                  <div className="reward-card-divider"></div>

                  <div className="reward-card-bottom">
                    <div className="trade-position-details">
                      <span className="position-label">Your Backed Option Stance:</span>
                      {/* Maps literal selected option string text parameters fields natively */}
                      <span className="position-value text-purple">{trade.option}</span>
                    </div>

                    <div className="reward-cost-metrics">
                      <div className="metric-column">
                        <span className="cost-label">Allocated Capital Put In</span>
                        <span className="cost-rupees">₹{Number(trade.investmentAmount || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="metric-column text-right">
                        <span className="cost-label">
                          {trade.winningStatus === 'pending' ? 'Estimated Return' : 'Settled Balance Yield'}
                        </span>
                        <span className={`cost-rupees ${
                          trade.winningStatus === 'win' ? 'text-emerald' : 
                          trade.winningStatus === 'loss' ? 'text-gray' : 'text-amber'
                        }`}>
                          {trade.winningStatus === 'loss' ? '₹0.00' : 
                           `₹${trade.winningStatus === 'pending' 
                              ? (trade.investmentAmount * 1.8).toFixed(2) 
                              : Number(trade.payoutAmount || 0).toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}