import { useEffect, useState, useCallback } from 'react';
import {
  getFilters,
  getSummary,
  getQuarterly,
  getByHead,
  getDistribution
} from '../api/expenditureApi';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatINR } from '../utils/formatCurrency';
import StatCard from '../components/StatCard';
import QuarterlyChart from '../components/QuarterlyChart';
import HeadWiseChart from '../components/HeadWiseChart';
import DistributionChart from '../components/DistributionChart';
import ForecastSection from '../components/ForecastSection';
import { ErrorBanner } from '../components/SectionState';

const Dashboard = () => {
  const { currencyMode } = useTheme();
  const [filterOptions, setFilterOptions] = useState({ years: [], quarters: [], headCodes: [] });
  const [filters, setFilters] = useState({ year: '', quarter: '', headCode: '' });

  // Section States
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

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

    setSummaryError(null);
    setQuarterlyError(null);
    setHeadWiseError(null);
    setDistError(null);

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
        <StatCard label="Total Expenditure" value={stats.exp} sub="Actual amount passed" />
        <StatCard label="Highest Spending Head" value={stats.head} sub="Primary cost contributor" />
        <StatCard label="Avg Quarterly Spend" value={stats.avg} sub="Across active periods" />
        <StatCard label="Total Budget Heads" value={stats.count} sub="Distinct classification codes" />
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
    </div>
  );
};

export default Dashboard;
