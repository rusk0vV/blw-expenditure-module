import { useEffect, useState } from 'react';
import { getForecast } from '../api/expenditureApi';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatINR } from '../utils/formatCurrency';
import { ErrorBanner, LoadingBlock } from './SectionState';

const ForecastSection = () => {
  const { currencyMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getForecast()
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || err.message || 'Failed to generate forecast.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="panel chart-panel-large" aria-label="Forecast Loading">
        <div className="panel-heading">
          <h2>Expenditure Forecast Projections</h2>
        </div>
        <LoadingBlock />
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel chart-panel-large" aria-label="Forecast Error">
        <div className="panel-heading">
          <h2>Expenditure Forecast Projections</h2>
        </div>
        <ErrorBanner message={error} />
      </section>
    );
  }

  const {
    predicted_amount = 0,
    growth_rate = 0,
    model_used = 'N/A',
    projection_label = 'N/A',
    confidence = 'low',
    feature_importance
  } = data || {};

  const isPositiveGrowth = growth_rate >= 0;
  const growthClass = isPositiveGrowth ? 'growth-positive' : 'growth-negative';
  const growthSign = isPositiveGrowth ? '+' : '';

  const getConfidenceClass = (conf) => {
    switch (String(conf).toLowerCase()) {
      case 'high':
        return 'confidence-high';
      case 'medium':
        return 'confidence-medium';
      default:
        return 'confidence-low';
    }
  };

  const featureLabels = {
    time_index: 'Time Trend (Sequential sequence of quarters)',
    quarter_number: 'Seasonality (Target Quarter 1 to 4)',
    lag_1: 'Previous Quarter Spend (Lag 1)',
    lag_2: 'Two Quarters Back Spend (Lag 2)'
  };

  return (
    <section className="panel chart-panel-large" aria-label="Forecast Projections">
      <div className="panel-heading">
        <h2>Expenditure Forecast Projections</h2>
        <span className={`confidence-badge ${getConfidenceClass(confidence)}`}>
          {confidence} Confidence
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
        <div className="stat-card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
          <span>Next Quarter Projection</span>
          <strong>{formatINR(predicted_amount, currencyMode)}</strong>
          <small>Projected for {projection_label}</small>
        </div>

        <div className="stat-card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
          <span>Expected Growth Rate</span>
          <strong className={growthClass}>
            {growthSign}{growth_rate}%
          </strong>
          <small>Quarter-over-Quarter comparison</small>
        </div>
      </div>

      <div className="forecast-accordion">
        <button
          type="button"
          className="accordion-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span>Model Analytics & Details ({model_used})</span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="accordion-content">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Projections are computed using a {model_used} model trained dynamically on available historical aggregates.
            </p>

            {feature_importance ? (
              <div className="feature-importance-list">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Model Feature Importances
                </h4>
                {Object.entries(feature_importance).map(([key, val]) => {
                  const percent = Math.round(val * 100);
                  return (
                    <div key={key} className="feature-item">
                      <div className="feature-label">
                        <span>{featureLabels[key] || key}</span>
                        <strong>{percent}%</strong>
                      </div>
                      <div className="feature-bar-container">
                        <div className="feature-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Feature importances are only available when using the Random Forest Regressor (requires at least 4 historical quarters).
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ForecastSection;
