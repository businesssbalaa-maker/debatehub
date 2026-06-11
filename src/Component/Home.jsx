import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getLiveProductsFeed, getuserData } from "../Api";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0.00");
  const [categories, setCategories] = useState([]);
  const [trendingQuestions, setTrendingQuestions] = useState([]);

  // New States for enhanced professional features
  const [activeTab, setActiveTab] = useState("All");
  const [tickerVolume, setTickerVolume] = useState(482910);

  // Live platform statistical values
  const statsMetrics = [
    { label: "Active Traders", value: "142.8K+", color: "#10b981" },
    { label: "Total Winnings Disbursed", value: "₹4.2 Cr+", color: "#fbbf24" },
    { label: "Trades Matched (24h)", value: "894,201", color: "#915EFF" },
  ];

  const fetchLiveDatabaseMetrics = async (targetUid) => {
    if (!targetUid) return;
    try {
      const data = await getuserData(targetUid);
      if (data && data.success && data.user) {
        const freshUser = data.user;
        setUserProfile(freshUser);

        if (freshUser.balance !== undefined) {
          setWalletBalance(Number(freshUser.balance).toFixed(2));
        } else if (freshUser.Withdrawal !== undefined) {
          setWalletBalance(Number(freshUser.Withdrawal).toFixed(2));
        }

        localStorage.setItem("userData", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Failed to run profile dynamic state updates:", err);
    }
  };

  useEffect(() => {
    const localToken =
      localStorage.getItem("auth_token") || Cookies.get("proboWebUser");
    const localLoginFlag = localStorage.getItem("isLoggedIn");
    const savedUserId = localStorage.getItem("userId");

    if (localToken && (localLoginFlag === "true" || savedUserId)) {
      setIsLoggedIn(true);
      if (savedUserId) {
        setUserId(savedUserId);
        fetchLiveDatabaseMetrics(savedUserId);
      }
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setUserProfile(null);
      setWalletBalance("0.00");
    }

    const triggerGlobalSync = () => {
      if (savedUserId) fetchLiveDatabaseMetrics(savedUserId);
    };

    window.addEventListener("refreshWalletBalance", triggerGlobalSync);

    // Smooth background ticker increment to emulate global trade volume updates
    const interval = setInterval(() => {
      setTickerVolume((prev) => prev + Math.floor(Math.random() * 4) + 1);
    }, 3000);

    return () => {
      window.removeEventListener("refreshWalletBalance", triggerGlobalSync);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function fetchMarketplaceData() {
      try {
        const data = await getLiveProductsFeed();
        if (data && data.products) {
          const allProducts = data.products;
          const uniqueCategoryNames = [
            ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
          ];

          const colorAccents = [
            "#915EFF",
            "#fbbf24",
            "#ec4899",
            "#3b82f6",
            "#10b981",
            "#a855f7",
          ];
          const computedCategories = uniqueCategoryNames.map((cat, idx) => ({
            name: cat,
            accent: colorAccents[idx % colorAccents.length],
          }));

          setCategories(computedCategories);
          setTrendingQuestions(allProducts.slice(0, 6)); // Comfortably fill grid space
        }
      } catch (err) {
        console.error(
          "Failed to compile marketplace category channels via API service:",
          err,
        );
      }
    }
    fetchMarketplaceData();
  }, []);

  const handleMarketNavigation = (
    catName,
    catAccent,
    customQuestion = null,
  ) => {
    navigate("/categories", {
      state: {
        category: catName,
        accentColor: catAccent,
        forcedQuestion: customQuestion,
      },
    });
  };

  // Filter trending questions based on top horizontal secondary filters
  const filteredQuestions =
  activeTab === "All"
    ? trendingQuestions
    : trendingQuestions.filter(
        (q) => q?.category?.trim().toLowerCase() === activeTab?.trim().toLowerCase(),
      );

  return (
    <div className="app-container">
      {/* 1. Global Live Event Ticker Header Banner */}
      <div className="live-ticker-banner">
        <div className="ticker-content">
          <span className="ticker-pulse">● LIVE</span>
          <p className="ticker-text">
            Total volumes matched globally:{" "}
            <strong>{tickerVolume.toLocaleString()} trades</strong> across all
            opinion pools.
          </p>
        </div>
      </div>

      <header className="premium-navbar">
        <div className="navbar-wrapper">
          <div className="brand-logo-block">
            <span className="brand-bolt">⚡</span>
            <span className="brand-name-text">
              DEBATE<span className="text-gradient-purple">HUB</span>
            </span>
          </div>
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
                <Link to="/auth" className="luxury-auth-btn">
                  Join / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-layout">
        {/* 2. Platform Dynamic Metrics Counter Section */}
        <section className="stats-counter-shelf">
          {statsMetrics.map((stat, index) => (
            <div className="stat-pill-box" key={index}>
              <span
                className="stat-dot"
                style={{ backgroundColor: stat.color }}
              ></span>
              <div className="stat-lbl-group">
                <span className="stat-micro-label">{stat.label}</span>
                <span className="stat-numerical-headline">{stat.value}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="hero-grid">
          <div className="branding-sidebar">
            <div className="space-y-4">
              <p className="tagline">Voice Your Opinion. Win Rewards.</p>
              <h1 className="hero-title">
                Predict.
                <br />
                Debate.
                <br />
                <span className="hero-title-highlight">Earn.</span>
              </h1>
              <p className="hero-description">
                India's Fastest Opinion & Prediction Platform ⚡
              </p>
            </div>

            {/* 3. Embedded Slanted Live Event Arena Card */}
            <div className="glass-match-card preview-premium-card static-trust-widget">
              <div className="premium-time-badge platform-status-badge">
                <div className="pulse-dot radar-pulse"></div> SYSTEM ACTIVE
              </div>

              <div className="animated-radar-container">
                <div className="radar-circle circle-1"></div>
                <div className="radar-circle circle-2"></div>
                <div className="radar-circle circle-3"></div>
                <div className="radar-core">
                  <span className="radar-bolt-icon">⚡</span>
                </div>
              </div>

              <div className="premium-prompt-section clean-spacing">
                <h4 className="premium-poll-title text-center">
                  India's Leading Opinion Hub
                </h4>
                <p className="premium-poll-subtitle text-center">
                  Trade opinions on Sports, Crypto, Entertainment & News
                  instantly.
                </p>
              </div>

              <div className="static-perks-list">
                <div className="perk-item-row">
                  <div className="perk-icon-shell purple-glow">✓</div>
                  <div className="perk-text-shell">
                    <h5>Instant Payouts</h5>
                    <p>Earnings credited right after pool settlement.</p>
                  </div>
                </div>
                <div className="perk-item-row">
                  <div className="perk-icon-shell emerald-glow">🛡️</div>
                  <div className="perk-text-shell">
                    <h5>Secure Ledger</h5>
                    <p>100% transparent bidding mechanics.</p>
                  </div>
                </div>
                <div className="perk-item-row">
                  <div className="perk-icon-shell amber-glow">👥</div>
                  <div className="perk-text-shell">
                    <h5>Peer-to-Peer</h5>
                    <p>You trade directly against other users across India.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="workspace-area">
            <div className="space-y-3">
              <h3 className="section-title">Popular Categories</h3>
              <div className="categories-carousel">
                <div
                  className={`category-card ${activeTab === "All" ? "" : "category-card-inactive"}`}
                  onClick={() => setActiveTab("All")}
                  style={
                    activeTab === "All"
                      ? {
                          borderColor: "#915EFF",
                          backgroundColor: "rgba(145, 94, 255, 0.1)",
                        }
                      : {}
                  }
                >
                  <span
                    className="category-name"
                    style={{
                      color: activeTab === "All" ? "#915EFF" : "#9ca3af",
                    }}
                  >
                    🔥 All Markets
                  </span>
                </div>
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className={`category-card ${activeTab === cat.name ? "" : "category-card-inactive"}`}
                    onClick={() => {
                      setActiveTab(cat.name);
                      handleMarketNavigation(cat.name, cat.accent);
                    }}
                    style={
                      activeTab === cat.name
                        ? {
                            borderColor: cat.accent,
                            backgroundColor: `${cat.accent}22`,
                          }
                        : { borderColor: cat.accent + "33" }
                    }
                  >
                    <span
                      className="category-name"
                      style={{ color: cat.accent }}
                    >
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Filter Interactive Feed Switcher Pills */}
            <div className="space-y-3">
              <div className="feed-filter-bar">
                <h3 className="section-title">Trending Questions</h3>
                <div className="filter-chips-cluster">
                  <button className="chip-btn active-chip">Trending</button>
                  <button className="chip-btn">High Volume</button>
                  <button className="chip-btn">Closing Soon</button>
                </div>
              </div>

              {/* 🚀 RESTORED & DYNAMIC: आपका पुराना ओरिजिनल कार्ड लेआउट अब पूरी तरह API ऑप्शंस के साथ सिंक है */}
              <div className="trending-grid">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((item) => (
                    <div
                      key={item._id}
                      className="trend-card border-purple-500/20"
                      onClick={() =>
                        handleMarketNavigation(
                          item.category,
                          "#915EFF",
                          item.question,
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="trend-card-top-row">
                        <span className="live-badge">● {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}</span>
                        <span className="timestamp-badge">
                          ⏰ Ends: {item.endTime ? new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '12:33 pm'}
                        </span>
                      </div>
                      
                      <h4 className="trend-question">{item.question}</h4>

                      {/* 🚀 FIXED BIDDING ROW: बिना किसी प्राइस टैग के सीधे डेटाबेस से डायनामिक बटन्स रेंडर हो रहे हैं */}
                      <div className="trend-mini-bidding-row">
                        {item.options && item.options.length > 0 ? (
                          item.options.map((opt, idx) => (
                            <button 
                              key={opt._id || idx} 
                              className="mini-bid-btn-generic"
                              style={{
                                padding: "10px 14px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#ffffff",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              {opt.optionText}
                            </button>
                          ))
                        ) : (
                          <>
                            <button className="mini-bid-btn-yes">Yes</button>
                            <button className="mini-bid-btn-no">No</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-fallback-text">
                    No active prediction events in this segment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}