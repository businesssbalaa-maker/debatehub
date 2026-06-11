import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getUserPurchaseHistory, getuserData } from '../Api'; // Central API module imports
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters setup to map against database string configurations
  const filters = ['All', 'pending', 'win', 'loss'];

  // 1. Fetch live metrics and balance allocations directly from DB
  const loadDynamicPortfolioData = async () => {
    const savedUserId = localStorage.getItem('userId');
    const localToken = localStorage.getItem('auth_token') || Cookies.get('proboWebUser');

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

        let inPlayAccumulator = 0;
        let wonAccumulator = 0;

        // Map to a clean secondary array container to force React rendering cycles to pick up changes
        const processedTradesList = rawPurchasesList.map((trade) => {
          const updatedTrade = { ...trade };

          if (updatedTrade.winningStatus === 'pending') {
            const investment = Number(updatedTrade.investmentAmount || 0);
            // 🚀 FIXED KEY MATCHING: Direct pairing with your exact schema property definition
            const rewardPercentageField = Number(updatedTrade.rewardPercentage || 0);
            
            // Progressive Bracket Scaling Logic Matrix Engine
            let multiplier;
            if (rewardPercentageField <= 100) {
              multiplier = 1 + (rewardPercentageField / 100);
            } else {
              multiplier = 2 + ((rewardPercentageField - 100) * 0.02);
            }

            inPlayAccumulator += investment;
            // Inject calculated field onto the localized object mapping instance
            updatedTrade.calculatedEstimatedPayout = investment * multiplier;

          } else if (updatedTrade.winningStatus === 'win') {
            wonAccumulator += Number(updatedTrade.payoutAmount || 0);
          }

          return updatedTrade;
        });

        setTrades(processedTradesList);
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

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / itemsPerPage));
  const pagedTrades = filteredTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, trades]);

  const handleRewardsPageChange = (direction) => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + direction;
      return Math.min(Math.max(nextPage, 1), totalPages);
    });
  };

  // Status mapping display parser configuration text helpers
  const getDisplayStatusLabel = (status) => {
    if (status === 'pending') return 'Live';
    if (status === 'win') return 'Won';
    if (status === 'loss') return 'Lost';
    return status;
  };

  const getPayoutLabel = (status) => {
    return status === 'pending' ? 'Estimated Return' : 'Settled Balance Yield';
  };

  const getPayoutValue = (trade) => {
    const investment = Number(trade.investmentAmount || 0);
    const rewardPercentage = Number(trade.rewardPercentage);

    if (trade.winningStatus === 'pending') {
      const multiplier = rewardPercentage <= 100
        ? 1 + rewardPercentage / 100
        : 2 + (rewardPercentage - 100) * 0.02;
      const estimatedReturn = investment * multiplier;
      return `₹${estimatedReturn.toFixed(2)}`;
    }

    const backendPayout = Number(trade.payoutAmount ?? trade.calculatedEstimatedPayout ?? trade.estimatedPayout ?? 0);

    if (trade.winningStatus === 'loss') {
      const lossAmount = backendPayout !== 0 ? backendPayout : investment;
      return `-₹${Math.abs(lossAmount).toFixed(2)}`;
    }

    return `₹${backendPayout.toFixed(2)}`;
  };

  const getPayoutClass = (status) => {
    if (status === 'win') return 'text-emerald';
    if (status === 'loss') return 'text-gray';
    return 'text-amber';
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
            <>
              <div className="rewards-grid">
                {pagedTrades.map((trade) => (
                  <div key={trade._id} className="reward-card bg-brand-card">
                  
                  <div className="reward-card-top">
                    <div className="reward-brand-identity">
                      <span className="brand-avatar">📊</span>
                      
                      <div className="brand-title-meta">
                        <h3 className="brand-name">{trade.question}</h3>
                        <span className="brand-type-badge">
                          Invested On: {trade.investedAt ? new Date(trade.investedAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          }) : 'Recent'}
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
                      <span className="position-value text-purple">{trade.option}</span>
                    </div>

                    <div className="reward-cost-metrics">
                      <div className="metric-column">
                        <span className="cost-label">Allocated Capital Put In</span>
                        <span className="cost-rupees">₹{Number(trade.investmentAmount || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="metric-column text-right">
                        <span className="cost-label">
                          {getPayoutLabel(trade.winningStatus)}
                        </span>
                        <span className={`cost-rupees ${getPayoutClass(trade.winningStatus)}`}>
                          {getPayoutValue(trade)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
                ))}
              </div>

              {filteredTrades.length > itemsPerPage && (
                <div className="pagination-controls rewards-pagination-controls">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => handleRewardsPageChange(-1)}
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
                    onClick={() => handleRewardsPageChange(1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          </section>
      </main>
    </div>
  );
}