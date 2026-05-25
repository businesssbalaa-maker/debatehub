import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TradeCard from './TradeCard'; 
import { getLiveProductsFeed, placeMarketPrediction } from '../api'; // ✅ CONNECTED TO YOUR NEW API HELPER
import './MarketDetail.css';

export default function MarketDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract variables natively from navigation routes state
  const { category, accentColor = "#915EFF" } = location.state || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Lifecycle Engine: Fetch real-time products under the dynamically selected category string
  useEffect(() => {
    if (!category) {
      setErrorMessage("No active marketplace category context selected. Please return home.");
      setLoading(false);
      return;
    }

    async function loadCategorizedMarkets() {
      try {
        setLoading(true);
        const response = await getLiveProductsFeed(category);
        
        if (response.success) {
          setProducts(response.products || []);
        } else {
          setErrorMessage("Failed to populate matching market events.");
        }
      } catch (err) {
        console.error("Failed to compile active opinion paths:", err);
        setErrorMessage("Network timeout error loading target predictive contracts feed.");
      } finally {
        setLoading(false);
      }
    }

    loadCategorizedMarkets();
  }, [category]);

  // ✅ UPDATED PIPELINE: Fires your exact schema request payload format parameters
  const handleTradeExecution = async (tradePayload) => {
  try {
    console.log("Processing trade checkouts payload matrix:", tradePayload);
    
    const sessionUserId = localStorage.getItem("userId");
    if (!sessionUserId) {
      alert("Session expired. Please log back in to place predictions.");
      navigate('/auth');
      return;
    }

    // ✅ FIXED: Variable names match your backend destructuring pattern perfectly
    const targetPayload = {
      userId: sessionUserId,
      questionId: tradePayload.questionId,
      chosenOptionId: tradePayload.chosenOptionId,
      option: tradePayload.option,               // Changed from optionText to option
      investmentAmount: tradePayload.investmentAmount // Changed from amount to investmentAmount
    };

    const result = await placeMarketPrediction(targetPayload);
    
    if (result.success) {
      alert(`Prediction Placed successfully!\nMarket: ${tradePayload.question}\nPosition: ${tradePayload.option}\nStaked Amount: ₹${tradePayload.investmentAmount}`);
      
      // Re-trigger live database sync to update total pooled counters instantly on screen
      const activeFeedUpdate = await getLiveProductsFeed(category);
      if (activeFeedUpdate.success) setProducts(activeFeedUpdate.products || []);
    }
  } catch (err) {
    console.error("Order desk booking fault rejection error:", err);
    alert(err.message || "Investment failed. Please verify wallet balance.");
  }
};

  return (
    <div className="detail-page-container">
      
      {/* FIXED CONTEXT CATEGORY HEADER BAR */}
      <header className="dynamic-category-header" style={{ '--category-accent': accentColor }}>
        <div className="category-header-wrap">
          <button className="category-back-btn" onClick={() => navigate(-1)}>
            ← <span className="back-btn-text">Back</span>
          </button>
          
          <div className="current-category-title">
            <h2>{category || "Loading"} Marketplace</h2>
          </div>
        </div>
      </header>

      <main className="market-detail-layout">

        <section className="market-cards-list-section">
          <h3 className="list-section-heading">Select a live opinion pool stance option to stake trade</h3>
          
          {loading ? (
            <div className="market-feed-loader-box">
              <div className="spinning-orbit-vector"></div>
              <p>Fetching active multi-option MCQ events lists from cluster servers...</p>
            </div>
          ) : errorMessage ? (
            <div className="market-feed-error-box">
              <p>⚠️ {errorMessage}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="market-feed-empty-box">
              <p>No active opinion questions found under the "{category}" category at this moment.</p>
            </div>
          ) : (
            <div className="vertical-cards-list">
              {products.map((item) => (
                <div key={item._id} className="list-item-card-wrapper">
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