import { formatINR } from '../utils/formatCurrency.js';

const StatCard = ({ label, value, sub, icon, badge, badgeType, progress }) => {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'info': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <section className="stat-card-premium">
      <div className="stat-card-header">
        <div className={`stat-card-icon-wrapper ${badgeType || 'neutral'}`}>
          <span className="stat-card-icon">{icon || '📊'}</span>
        </div>
        {badge ? (
          <span className={`stat-card-badge ${getBadgeClass(badgeType)}`}>
            {badge}
          </span>
        ) : null}
      </div>
      
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
        
        {progress !== undefined && progress > 0 ? (
          <div className="stat-card-progress-container">
            <div className="stat-card-progress-bar">
              <div className="stat-card-progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <div className="stat-card-progress-info">
              <span>Passed Clear Rate</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
          </div>
        ) : null}
        
        {sub && (!progress || progress <= 0) ? <small className="stat-card-subtext">{sub}</small> : null}
      </div>
    </section>
  );
};

export default StatCard;
