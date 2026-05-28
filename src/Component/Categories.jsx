import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TradeCard from './TradeCard';
import { getLiveProductsFeed, placeMarketPrediction } from '../Api';
import './Categories.css'; 

export default function Categories() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1️⃣ Extract chosen category and styling context passed from Home screen
  const { category, accentColor = "#915EFF" } = location.state || {};

  // State Management matrices
  const [allCategoryProducts, setAllCategoryProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Global language toggle state matrix ('EN' | 'HI')
  const [currentLang, setCurrentLang] = useState('EN');

  // 2️⃣ Protection Shield: Direct access guard & Fetch Data
  const loadCategoryData = async () => {
    if (!category) {
      setErrorMessage("No active marketplace category context selected. Please return home.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getLiveProductsFeed();
      
      if (response.success && response.products) {
        const filtered = response.products.filter(
          p => String(p.category).toLowerCase() === String(category).toLowerCase()
        );
        setAllCategoryProducts(filtered);
      } else {
        setErrorMessage("Failed to populate matching market events.");
      }
    } catch (err) {
      console.error("Failed to compile category matrix mapping paths:", err);
      setErrorMessage("Network timeout error loading target predictive contracts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [category]);

  // Dynamically synchronize navigation subtabs based on selected language
  useEffect(() => {
    const langFilteredProducts = allCategoryProducts.filter(p => {
      const normalizedLang = String(p.language || 'English').toLowerCase();
      return (
        normalizedLang === 'bilingual' || 
        (currentLang === 'EN' && normalizedLang === 'english') || 
        (currentLang === 'HI' && normalizedLang === 'hindi')
      );
    });

    const uniqueSubCats = [
      ...new Set(langFilteredProducts.map(p => p.subCategory).filter(Boolean))
    ];
    
    setSubCategories(uniqueSubCats);

    if (activeSubCat !== 'All' && !uniqueSubCats.includes(activeSubCat)) {
      setActiveSubCat('All');
    }
  }, [currentLang, allCategoryProducts]);

  // Filter cards matrix feed rendered in the main display port
  const displayedQuestions = allCategoryProducts.filter(p => {
    const matchesSubCat = activeSubCat === 'All' || p.subCategory === activeSubCat;
    
    const normalizedLang = String(p.language || 'English').toLowerCase();
    const matchesLang = 
      normalizedLang === 'bilingual' || 
      (currentLang === 'EN' && normalizedLang === 'english') || 
      (currentLang === 'HI' && normalizedLang === 'hindi');

    return matchesSubCat && matchesLang;
  });

  // 4️⃣ Centralized Inline Staking Trade Placement Pipeline Handlers
  const handleTradeExecution = async (tradePayload) => {
    try {
      const sessionUserId = localStorage.getItem("userId");
      if (!sessionUserId) {
        alert("Session expired. Please log back in to place predictions.");
        navigate('/auth');
        return;
      }

      // 🚀 TARGET MATCH PAYLOAD: Clean mapping matching your specific updated backend keys definitions
      const targetPayload = {
        userId: sessionUserId,
        questionId: tradePayload.questionId,
        chosenOptionId: tradePayload.chosenOptionId, // 🚀 Now passed safely with guaranteed string attributes!
        option: tradePayload.option,
        investmentAmount: Number(tradePayload.investmentAmount)
      };

      const result = await placeMarketPrediction(targetPayload);
      
      if (result.success) {
        alert(`Prediction Placed successfully!\nMarket: ${tradePayload.question}\nPosition: ${tradePayload.option}\nStaked Amount: ₹${tradePayload.investmentAmount}`);
        
        window.dispatchEvent(new Event("refreshWalletBalance"));
        
        const response = await getLiveProductsFeed();
        if (response.success && response.products) {
          const filtered = response.products.filter(
            p => String(p.category).toLowerCase() === String(category).toLowerCase()
          );
          setAllCategoryProducts(filtered);
        }
      }
    } catch (err) {
      console.error("Order desk booking fault rejection:", err);
      alert(err.response?.data?.message || err.message || "Investment failed. Please verify wallet balance.");
    }
  };

  return (
    <div className="subcat-page-container">
      <header className="subcat-dynamic-header" style={{ '--subcat-accent': accentColor }}>
        <div className="subcat-header-wrap">
          <button className="subcat-back-btn" onClick={() => navigate('/')}>
            ← <span className="back-btn-text">Back</span>
          </button>
          
          <div className="subcat-title-block">
            <h2>{category} Hub</h2>
          </div>

          <div className="subcat-lang-switch-box">
            <button 
              type="button" 
              className={`lang-toggle-pill-btn ${currentLang === 'EN' ? 'lang-active' : ''}`}
              onClick={() => setCurrentLang('EN')}
            >
              English
            </button>
            <button 
              type="button" 
              className={`lang-toggle-pill-btn ${currentLang === 'HI' ? 'lang-active' : ''}`}
              onClick={() => setCurrentLang('HI')}
            >
              हिंदी
            </button>
          </div>
        </div>
      </header>

      <main className="subcat-page-layout">
        <section className="subcat-navigation-tabs-bar scrollbar-hide">
          <button 
            className={`subcat-tab-btn ${activeSubCat === 'All' ? 'active-tab' : ''}`}
            onClick={() => setActiveSubCat('All')}
            style={{ '--tab-accent': accentColor }}
          >
            All Markets
          </button>
          
          {subCategories.map((sub, idx) => (
            <button
              key={idx}
              className={`subcat-tab-btn ${activeSubCat === sub ? 'active-tab' : ''}`}
              onClick={() => setActiveSubCat(sub)}
              style={{ '--tab-accent': accentColor }}
            >
              {sub}
            </button>
          ))}
        </section>

        <section className="subcat-feed-cards-section">
          {loading ? (
            <div className="subcat-loader-box">
              <div className="spinning-orbit-vector"></div>
              <p>Gathering specialized market contracts channels...</p>
            </div>
          ) : errorMessage ? (
            <div className="subcat-error-box">
              <p>⚠️ {errorMessage}</p>
            </div>
          ) : displayedQuestions.length === 0 ? (
            <div className="subcat-empty-box">
              <p>No active pools open in {currentLang === 'EN' ? 'English' : 'हिंदी'} under "{activeSubCat}" right now.</p>
            </div>
          ) : (
            <div className="subcat-vertical-cards-list">
              {displayedQuestions.map((item) => (
                <div key={item._id?.$oid || item._id} className="list-item-card-wrapper">
                  <TradeCard 
                    product={item}
                    onPlaceTrade={handleTradeExecution}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}