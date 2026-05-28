import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getLiveProductsFeed, getuserData } from '../Api'; // ✅ CONNECTED TO YOUR NEW API METHOD
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0.00");
  const [categories, setCategories] = useState([]);
  const [trendingQuestions, setTrendingQuestions] = useState([]);

  // ✅ NEW CORE METHOD: Queries live user metrics straight from your MongoDB cluster
  const fetchLiveDatabaseMetrics = async (targetUid) => {
    if (!targetUid) return;
    try {
      const data = await getuserData(targetUid);
      if (data && data.success && data.user) {
        const freshUser = data.user;
        setUserProfile(freshUser);

        // Map live database numbers directly to the UI layout states
        if (freshUser.balance !== undefined) {
          setWalletBalance(Number(freshUser.balance).toFixed(2));
        } else if (freshUser.Withdrawal !== undefined) {
          setWalletBalance(Number(freshUser.Withdrawal).toFixed(2));
        }
        
        // Keeps local memory in sync safely
        localStorage.setItem('userData', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Failed to run profile dynamic state updates:", err);
    }
  };

  useEffect(() => {
    const localToken = localStorage.getItem('auth_token') || Cookies.get('proboWebUser');
    const localLoginFlag = localStorage.getItem('isLoggedIn');
    const savedUserId = localStorage.getItem('userId');

    if (localToken && (localLoginFlag === "true" || savedUserId)) {
      setIsLoggedIn(true);
      if (savedUserId) {
        setUserId(savedUserId);
        // ✅ CRITICAL REPAIR: Hits dynamic database api on load instead of stale text copies
        fetchLiveDatabaseMetrics(savedUserId);
      }
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setUserProfile(null);
      setWalletBalance("0.00");
    }

    // Dynamic global listener to auto-refresh whenever transactions run elsewhere
    const triggerGlobalSync = () => {
      if (savedUserId) fetchLiveDatabaseMetrics(savedUserId);
    };

    window.addEventListener("refreshWalletBalance", triggerGlobalSync);
    return () => {
      window.removeEventListener("refreshWalletBalance", triggerGlobalSync);
    };
  }, []);

  useEffect(() => {
    async function fetchMarketplaceData() {
      try {
        const data = await getLiveProductsFeed();
        if (data && data.products) {
          const allProducts = data.products;

          const uniqueCategoryNames = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
          
          const colorAccents = ["#915EFF", "#fbbf24", "#ec4899", "#3b82f6", "#10b981", "#a855f7"];
          const computedCategories = uniqueCategoryNames.map((cat, idx) => ({
            name: cat,
            accent: colorAccents[idx % colorAccents.length]
          }));

          setCategories(computedCategories);
          setTrendingQuestions(allProducts.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to compile marketplace category channels via API service:", err);
      }
    }
    fetchMarketplaceData();
  }, []);

  const handleMarketNavigation = (catName, catAccent, customQuestion = null) => {
    navigate('/categories', {
      state: {
        category: catName,
        accentColor: catAccent,
        forcedQuestion: customQuestion
      }
    });
  };

  return (
    <div className="app-container">
      <header className="premium-navbar">
        <div className="navbar-wrapper">
          <div className="brand-logo-block">
            <span className="brand-bolt">⚡</span>
            <span className="brand-name-text">DEBATE<span className="text-gradient-purple">HUB</span></span>
          </div>
          <nav className="central-nav-links">
            <Link to="/" className="luxury-nav-item active-tab">
              <span>Home</span>
              <span className="active-indicator-bar"></span>
            </Link>
            <Link to="/rewards" className="luxury-nav-item"><span>Trades</span></Link>
            <Link to="/wallet" className="luxury-nav-item"><span>Wallet</span></Link>
          </nav>
          <div className="navbar-actions-panel">
            <div className="rupee-balance-pill">
              <span className="balance-currency-symbol">₹</span>
              <span className="balance-numerical-value">{walletBalance}</span>
            </div>
            <div className="profile-auth-trigger-box">
              {isLoggedIn ? (
                <Link to="/wallet" className="luxury-avatar-badge">
                  <span className="avatar-core-initial">
                    {userProfile?.phone ? userProfile.phone.slice(-2) : "DH"}
                  </span>
                  <div className="avatar-ping-indicator"></div>
                </Link>
              ) : (
                <Link to="/auth" className="luxury-auth-btn">Join / Sign Up</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <section className="hero-grid">
          <div className="branding-sidebar">
            <div className="space-y-4">
              <p className="tagline">Voice Your Opinion. Win Rewards.</p>
              <h1 className="hero-title">Predict.<br />Debate.<br /><span className="hero-title-highlight">Earn.</span></h1>
              <p className="hero-description">India's Fastest Opinion & Prediction Platform ⚡</p>
            </div>
          </div>

          <div className="workspace-area">
            <div className="space-y-3">
              <h3 className="section-title">Popular Categories</h3>
              <div className="categories-carousel">
                {categories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="category-card category-card-inactive"
                    onClick={() => handleMarketNavigation(cat.name, cat.accent)}
                    style={{ borderColor: cat.accent + "33" }}
                  >
                    <span className="category-name" style={{ color: cat.accent }}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="section-title">Trending Questions</h3>
              <div className="trending-grid">
                {trendingQuestions.map((item) => (
                  <div 
                    key={item._id} 
                    className="trend-card border-purple-500/20"
                    onClick={() => handleMarketNavigation(item.category, "#915EFF", item.question)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div><span className="live-badge">● {item.category}</span></div>
                    <h4 className="trend-question">{item.question}</h4>
                    <button className="trend-card-btn">Predict Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}