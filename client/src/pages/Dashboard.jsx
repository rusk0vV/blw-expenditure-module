import { useEffect, useState, useCallback } from 'react';
import {
  getFilters,
  getSummary,
  getQuarterly,
  getByHead,
  getDistribution,
  getTopItems
} from '../api/expenditureApi';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatINR } from '../utils/formatCurrency';
import StatCard from '../components/StatCard';
import QuarterlyChart from '../components/QuarterlyChart';
import HeadWiseChart from '../components/HeadWiseChart';
import DistributionChart from '../components/DistributionChart';
import ForecastSection from '../components/ForecastSection';
import { ErrorBanner, LoadingBlock, EmptyState } from '../components/SectionState';

const Dashboard = () => {
  const { currencyMode } = useTheme();
  const [filterOptions, setFilterOptions] = useState({ years: [], quarters: [], headCodes: [] });
  const [filters, setFilters] = useState({ year: '', quarter: '', headCode: '' });

  // Section States
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [topItems, setTopItems] = useState({ pos: [], bills: [] });
  const [topItemsLoading, setTopItemsLoading] = useState(true);
  const [topItemsError, setTopItemsError] = useState(null);

  const [quarterlyData, setQuarterlyData] = useState([]);
  const [quarterlyLoading, setQuarterlyLoading] = useState(true);
  const [quarterlyError, setQuarterlyError] = useState(null);

  const [headWiseData, setHeadWiseData] = useState([]);
  const [headWiseLoading, setHeadWiseLoading] = useState(true);
  const [headWiseError, setHeadWiseError] = useState(null);

  const [distData, setDistData] = useState([]);
  const [distLoading, setDistLoading] = useState(true);
  const [distError, setDistError] = useState(null);

  // Initialize filter options
  useEffect(() => {
    getFilters()
      .then((res) => {
        setFilterOptions({
          years: res.years || [],
          quarters: res.quarters || [],
          headCodes: res.headCodes || []
        });
      })
      .catch(() => {});
  }, []);

  const fetchDashboardData = useCallback((currentFilters) => {
    setSummaryLoading(true);
    setQuarterlyLoading(true);
    setHeadWiseLoading(true);
    setDistLoading(true);
    setTopItemsLoading(true);

    setSummaryError(null);
    setQuarterlyError(null);
    setHeadWiseError(null);
    setDistError(null);
    setTopItemsError(null);

    getTopItems(currentFilters)
      .then((res) => {
        setTopItems(res || { pos: [], bills: [] });
        setTopItemsLoading(false);
      })
      .catch((err) => {
        setTopItemsError(err.message || 'Failed to fetch top items.');
        setTopItemsLoading(false);
      });

    getSummary(currentFilters)
      .then((res) => {
        setSummaryData(res);
        setSummaryLoading(false);
      })
      .catch((err) => {
        setSummaryError(err.message || 'Failed to fetch summary card metrics.');
        setSummaryLoading(false);
      });

    getQuarterly(currentFilters)
      .then((res) => {
        setQuarterlyData(res.data || []);
        setQuarterlyLoading(false);
      })
      .catch((err) => {
        setQuarterlyError(err.message || 'Failed to fetch quarterly trends.');
        setQuarterlyLoading(false);
      });

    getByHead(currentFilters)
      .then((res) => {
        setHeadWiseData(res.data || []);
        setHeadWiseLoading(false);
      })
      .catch((err) => {
        setHeadWiseError(err.message || 'Failed to fetch head-wise distribution.');
        setHeadWiseLoading(false);
      });

    getDistribution(currentFilters)
      .then((res) => {
        setDistData(res.data || []);
        setDistLoading(false);
      })
      .catch((err) => {
        setDistError(err.message || 'Failed to fetch share percentages.');
        setDistLoading(false);
      });
  }, []);

  // Refetch when filters mutate
  useEffect(() => {
    fetchDashboardData(filters);
  }, [filters, fetchDashboardData]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleClearFilters = () => {
    setFilters({ year: '', quarter: '', headCode: '' });
  };

  // Compute stat card values
  const getStatValues = () => {
    if (summaryLoading) return { exp: 'Loading...', head: 'Loading...', avg: 'Loading...', count: 'Loading...' };
    if (summaryError || !summaryData) return { exp: 'Error', head: 'Error', avg: 'Error', count: 'Error' };

    const topHead = summaryData.highestHead
      ? `${summaryData.highestHead.headName} (${formatINR(summaryData.highestHead.amount, currencyMode)})`
      : 'None';

    return {
      exp: formatINR(summaryData.totalExpenditure, currencyMode),
      head: topHead,
      avg: formatINR(summaryData.averageQuarterly, currencyMode),
      count: String(summaryData.totalBudgetHeads)
    };
  };

  const stats = getStatValues();

  return (
    <div className="dashboard-grid" aria-label="Dashboard Grid">
      {/* Filters Control Bar */}
      <nav className="filters-bar" aria-label="Dashboard Filters">
        <div className="filter-group">
          <label htmlFor="year-filter">Financial Year</label>
          <select
            id="year-filter"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="filter-select"
          >
            <option value="">All Years</option>
            {filterOptions.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="quarter-filter">Quarter</label>
          <select
            id="quarter-filter"
            value={filters.quarter}
            onChange={(e) => handleFilterChange('quarter', e.target.value)}
            className="filter-select"
          >
            <option value="">All Quarters</option>
            {filterOptions.quarters.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="head-filter">Budget Head Code</label>
          <select
            id="head-filter"
            value={filters.headCode}
            onChange={(e) => handleFilterChange('headCode', e.target.value)}
            className="filter-select"
          >
            <option value="">All Budget Heads</option>
            {filterOptions.headCodes.map((h) => (
              <option key={h.headCode} value={h.headCode}>
                {h.headCode} - {h.headName}
              </option>
            ))}
          </select>
        </div>

        {(filters.year || filters.quarter || filters.headCode) && (
          <button type="button" onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </nav>

      {/* Headline Metric Stat Cards */}
      <header className="stat-cards-container" aria-label="Headline Metrics">
        <StatCard
          label="Total Expenditure"
          value={stats.exp}
          sub="Actual amount passed"
          icon="💼"
          badge="Passed"
          badgeType="success"
          progress={summaryData && summaryData.totalBilled > 0 ? (summaryData.totalExpenditure / summaryData.totalBilled) * 100 : 0}
        />
        <StatCard
          label="Highest Spending Head"
          value={stats.head}
          sub="Primary cost contributor"
          icon="🏢"
          badge="Top Head"
          badgeType="warning"
        />
        <StatCard
          label="Avg Quarterly Spend"
          value={stats.avg}
          sub="Across active periods"
          icon="📊"
          badge="Quarterly Avg"
          badgeType="info"
        />
        <StatCard
          label="Total Budget Heads"
          value={stats.count}
          sub="Distinct classification codes"
          icon="🗂️"
          badge="Active"
          badgeType="neutral"
        />
      </header>

      {summaryError && (
        <div style={{ gridColumn: 'span 4' }}>
          <ErrorBanner message={summaryError} />
        </div>
      )}

      {/* Chart Visualization Row */}
      <QuarterlyChart data={quarterlyData} loading={quarterlyLoading} error={quarterlyError} />
      <HeadWiseChart data={headWiseData} loading={headWiseLoading} error={headWiseError} />
      <DistributionChart data={distData} loading={distLoading} error={distError} />

      {/* Forecast Projections Row */}
      <ForecastSection />

      {/* Top Allocations Tables */}
      <div className="top-allocations-row" style={{ gridColumn: 'span 4', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <section className="panel">
          <div className="panel-heading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
            <h2 style={{ margin: 0 }}>Major PO Allocations</h2>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Highest volume sanctioned purchase orders</small>
          </div>
          {topItemsError ? <ErrorBanner message={topItemsError} /> : null}
          {topItemsLoading ? <LoadingBlock /> : null}
          {!topItemsLoading && !topItemsError && !topItems.pos.length ? <EmptyState /> : null}
          {!topItemsLoading && !topItemsError && topItems.pos.length ? (
            <div className="top-items-list" style={{ marginTop: '0.5rem' }}>
              {topItems.pos.map((po, idx) => (
                <div key={po.poNo || idx} className="top-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div className="item-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#5A52E5', fontSize: '0.95rem' }}>
                      📋
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', fontWeight: 600 }}>{po.vendor || 'Unknown Vendor'}</strong>
                      <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{po.poNo} • {po.department}</small>
                    </div>
                  </div>
                  <strong style={{ color: '#5A52E5', fontSize: '0.95rem', fontWeight: 700 }}>+{formatINR(po.value, currencyMode)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-heading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
            <h2 style={{ margin: 0 }}>High-Value CO6 Claims</h2>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Contractor bills registered with highest weight</small>
          </div>
          {topItemsError ? <ErrorBanner message={topItemsError} /> : null}
          {topItemsLoading ? <LoadingBlock /> : null}
          {!topItemsLoading && !topItemsError && !topItems.bills.length ? <EmptyState /> : null}
          {!topItemsLoading && !topItemsError && topItems.bills.length ? (
            <div className="top-items-list" style={{ marginTop: '0.5rem' }}>
              {topItems.bills.map((bill, idx) => {
                const isPassed = String(bill.status).toLowerCase() === 'passed';
                const statusColor = isPassed ? 'var(--success)' : bill.status?.toLowerCase() === 'returned' ? 'var(--danger)' : 'var(--warning)';
                const statusBg = isPassed ? 'rgba(16, 185, 129, 0.1)' : bill.status?.toLowerCase() === 'returned' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                return (
                  <div key={bill.coNumber || idx} className="top-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <div className="item-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(var(--accent-rgb), 0.1)', color: isPassed ? 'var(--success)' : 'var(--accent)', fontSize: '0.95rem' }}>
                        {isPassed ? '✓' : '📄'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', fontWeight: 600 }}>{bill.party || 'Unknown Contractor'}</strong>
                        <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{bill.coNumber} • {bill.department}</small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>{formatINR(bill.value, currencyMode)}</strong>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase', color: statusColor, backgroundColor: statusBg }}>{bill.status || 'Pending'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
