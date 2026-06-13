

const ComingSoonCard = ({ item }) => {
  // Timer calculation
  const calculateTimeLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return "Starting Now";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / 1000 / 60) % 60);
    return `${h}h ${m}m remaining`;
  };

  return (
    <div className="trend-card border-purple-500/20">
      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} />
      <div className="trend-card-top-row">
        <span className="live-badge">● Upcoming</span>
        <span className="timestamp-badge" style={{ color: '#fbbf24' }}>
          Time: {calculateTimeLeft(item.comingDateTime)}
        </span>
      </div>
      <h4 className="trend-question">{item.title}</h4>
      <p style={{ fontSize: '14px', color: '#9ca3af' }}>{item.description}</p>
      
    </div>
  );
};

export default ComingSoonCard;