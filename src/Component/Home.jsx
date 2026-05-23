import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0.00");

  // --- Initialize Session States and Account Metrics ---
  useEffect(() => {
    // 1. Check local synchronization metrics across both authorization formats
    const localToken = localStorage.getItem('auth_token') || Cookies.get('2ndtredingWeb');
    const localLoginFlag = localStorage.getItem('isLoggedIn');
    const savedUserId = localStorage.getItem('userId');
    const storedUserData = localStorage.getItem('userData');

    if (localToken && (localLoginFlag === "true" || storedUserData)) {
      setIsLoggedIn(true);
      if (savedUserId) setUserId(savedUserId);

      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          setUserProfile(parsedUser);

          // 2. Map variable numbers to the wallet card seamlessly based on active ledger variables
          if (parsedUser.balance !== undefined) {
            setWalletBalance(Number(parsedUser.balance).toFixed(2));
          } else if (parsedUser.Withdrawal !== undefined) {
            setWalletBalance(Number(parsedUser.Withdrawal).toFixed(2));
          }
        } catch (err) {
          console.error("Failed to parse user tracking vectors locally:", err);
        }
      }
    } else {
      // Safe fallback state clean-gate
      setIsLoggedIn(false);
      setUserId(null);
      setUserProfile(null);
      setWalletBalance("0.00");
    }
  }, []);

  // Configured market categories mapping profile attributes
  const categories = [
    { icon: "⚽", name: "Sports", active: false, accent: "#fbbf24" },
    { icon: "🏛️", name: "Politics", active: true, accent: "#3b82f6" },
    { icon: "🎬", name: "Movies", active: false, accent: "#ec4899" },
    { icon: "🎮", name: "Gaming", active: false, accent: "#10b981" },
    { icon: "💻", name: "Tech", active: false, accent: "#a855f7" },
    { icon: "⚔️", name: "Fun Battles", active: false, accent: "#f43f5e" },
  ];

  // Global Trending feed list view database records
  const trendingQuestions = [
    { 
      id: 1, 
      time: "00:10", 
      live: true, 
      question: "Next Over Me Wicket Aayega?", 
      color: "border-red-500",
      category: "Sports",
      icon: "⚽",
      accent: "#fbbf24"
    },
    { 
      id: 2, 
      time: "01:30", 
      live: false, 
      question: "Kya RCB is baar IPL jeetegi?", 
      color: "border-purple-500/20",
      category: "Sports",
      icon: "⚽",
      accent: "#fbbf24"
    },
    { 
      id: 3, 
      time: "02:15", 
      live: false, 
      question: "Pushpa 2 1000 Cr Club me jayegi?", 
      color: "border-purple-500/20",
      category: "Movies",
      icon: "🎬",
      accent: "#ec4899"
    },
    { 
      id: 4, 
      time: "00:45", 
      live: false, 
      question: "AI Future me Jobs Khatam kar dega?", 
      color: "border-purple-500/20",
      category: "Tech",
      icon: "💻",
      accent: "#a855f7"
    },
  ];

  // Transition controller feeding variables safely to MarketDetail lists
  const handleMarketNavigation = (catName, catIcon, catAccent, customQuestion = null) => {
    navigate('/market-detail', {
      state: {
        category: catName,
        icon: catIcon,
        accentColor: catAccent,
        forcedQuestion: customQuestion
      }
    });
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      console.log(`Opening menu configuration parameters for active user sequence ID: ${userId}`);
    }
  };

  return (
    <div className="app-container">
      
      {/* OVERHAULED HEADLESS NAVBAR */}
      <header className="premium-navbar">
        <div className="navbar-wrapper">
          
          {/* Logo Element */}
          <div className="brand-logo-block">
            <span className="brand-bolt">⚡</span>
            <span className="brand-name-text">DEBATE<span className="text-gradient-purple">HUB</span></span>
          </div>
          
          {/* Futuristic Nav Matrix links */}
          <nav className="central-nav-links">
            <Link to="/" className="luxury-nav-item active-tab">
              <span>Home</span>
              <span className="active-indicator-bar"></span>
            </Link>
            <Link to="/rewards" className="luxury-nav-item">
              <span>Trades</span>
            </Link>
            <Link to="/wallet" className="luxury-nav-item">
              <span>Wallet</span>
            </Link>
          </nav>

          {/* Action pills block container group */}
          <div className="navbar-actions-panel">
            <div className="rupee-balance-pill">
              <span className="balance-currency-symbol">₹</span>
              <span className="balance-numerical-value">{walletBalance}</span>
            </div>
            
            <div className="profile-auth-trigger-box">
              {/* Dynamic UI Swap based on authentication state */}
              {isLoggedIn ? (
                <Link to="/wallet" className="luxury-avatar-badge" onClick={handleAuthAction}>
                  <span className="avatar-core-initial">
                    {userProfile?.phone ? userProfile.phone.slice(-2) : "DH"}
                  </span>
                  <div className="avatar-ping-indicator"></div>
                </Link>
              ) : (
                <Link to="/auth" className="luxury-auth-btn" onClick={handleAuthAction}>
                  Join / Sign Up
                </Link>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="main-layout">
        
        {/* HERO ARRAYS GRID */}
        <section className="hero-grid">
          
          {/* Left Presentation Panel */}
          <div className="branding-sidebar">
            <div className="space-y-4">
              <p className="tagline">Voice Your Opinion. Win Rewards.</p>
              <h1 className="hero-title">
                Predict.<br />Debate.<br /><span className="hero-title-highlight">Earn.</span>
              </h1>
              <p className="hero-description">
                India's Fastest Opinion & Prediction Platform ⚡
              </p>
            </div>
            <div className="micro-features">
              <div>
                <span className="micro-item-icon">⚡</span>
                <span className="micro-item-text">LIVE POLLS</span>
              </div>
              <div>
                <span className="micro-item-icon">💬</span>
                <span className="micro-item-text">DEBATES</span>
              </div>
              <div>
                <span className="micro-item-icon">🏆</span>
                <span className="micro-item-text">EARN CASH</span>
              </div>
            </div>
          </div>

          {/* Right Interface Panel */}
          <div className="workspace-area">
            
            {/* Live Arena Showcase - Premium Slim Variant */}
            <div 
              className="glass-match-card preview-premium-card" 
              onClick={() => handleMarketNavigation("Sports", "⚽", "#fbbf24", "India vs Pakistan Live Match Arena")}
              style={{ cursor: 'pointer' }}
            >
              {/* Absolute Floating Timer Stamp */}
              <div className="premium-time-badge">
                <span>⏰</span> 00:10
              </div>

              {/* Overlapping VS Arena Matrix Graphics */}
              <div className="premium-vs-arena">
                {/* Team India Slanted Block */}
                <div className="team-slope-block team-india-slanted">
                  <div className="team-meta-content">
                    <span className="team-flag-emoji">🇮🇳</span>
                    <div className="team-display-name">India</div>
                    <div className="team-display-percentage">52%</div>
                    <div className="team-display-sub">Votes</div>
                  </div>
                </div>
                
                {/* Central Overlay VS Typography */}
                <div className="premium-vs-badge">
                  <span className="vs-accent-text">Vs</span>
                </div>
                
                {/* Team Pakistan Slanted Block */}
                <div className="team-slope-block team-pakistan-slanted">
                  <div className="team-meta-content">
                    <span className="team-flag-emoji">🇵🇰</span>
                    <div className="team-display-name">Pakistan</div>
                    <div className="team-display-percentage">48%</div>
                    <div className="team-display-sub">Votes</div>
                  </div>
                </div>
              </div>

              {/* Poll Prompts Section */}
              <div className="premium-prompt-section">
                <h3 className="premium-poll-title">Who is Stronger?</h3>
                <p className="premium-poll-subtitle">Vote now and win points!</p>
              </div>

              {/* Twin Split Selection Buttons Layout */}
              <div className="premium-buttons-grid">
                <button 
                  className="vote-btn-pill btn-india" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    console.log('Voted India'); 
                  }}
                >
                  India
                </button>
                <button 
                  className="vote-btn-pill btn-pakistan" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    console.log('Voted Pakistan'); 
                  }}
                >
                  Pakistan
                </button>
              </div>

              {/* Metric Statistics Ledger Footer */}
              <div className="premium-ledger-footer">
                <div className="ledger-row">
                  <span className="ledger-label">My Prediction</span>
                  <span className="ledger-value-accent">+20 Points</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-label">Total Votes</span>
                  <span className="ledger-value-bold">15,432</span>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="space-y-3">
              <h3 className="section-title">Popular Categories</h3>
              <div className="categories-carousel">
                {categories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="category-card category-card-inactive"
                    onClick={() => handleMarketNavigation(cat.name, cat.icon, cat.accent)}
                  >
                    <div className="category-icon">{cat.icon}</div>
                    <span className="category-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Items Grid Layer */}
            <div className="space-y-3">
              <div className="trending-header">
                <h3 className="section-title">Trending Questions</h3>
              </div>
              
              <div className="trending-grid">
                {trendingQuestions.map((item) => (
                  <div 
                    key={item.id} 
                    className={`trend-card ${item.color}`}
                    onClick={() => handleMarketNavigation(item.category, item.icon, item.accent, item.question)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      {item.live ? (
                        <span className="live-badge">● Live</span>
                      ) : (
                        <span className="timestamp-badge">⏰ {item.time}</span>
                      )}
                    </div>
                    <h4 className="trend-question">{item.question}</h4>
                    <button className="trend-card-btn">Vote Now</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ECOSYSTEM MARKETING HIGHLIGHTS */}
        <section className="marketing-row">
          <div className="info-panel">
            <h3 className="info-panel-title">Why DebateHub?</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon-wrapper-purple">⚡</span>
                <div>
                  <h4 className="info-heading">Instant 10 Sec Polls</h4>
                  <p className="info-desc">Fastest actionable methodology to vote & project trends.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="center-showcase-card">
            <div className="center-showcase-icon">📱</div>
            <h3 className="center-showcase-title">Responsive Application Matrix</h3>
            <p className="center-showcase-desc">Cross-platform fluid viewports optimized for zero-latency renders.</p>
          </div>

          <div className="info-panel">
            <h3 className="info-panel-title">Amazing Features</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon-wrapper-amber">🏆</span>
                <div>
                  <h4 className="info-heading">Real Payouts</h4>
                  <p className="info-desc">Trade seamlessly with direct cash returns sent to your passbook.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}