import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatINR } from '../utils/formatCurrency.js';
import { EmptyState, ErrorBanner, LoadingBlock } from './SectionState.jsx';

const QuarterlyChart = ({ data = [], loading, error }) => {
  const { currencyMode } = useTheme();
  const accent = 'var(--accent)';

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h2>Quarterly Expenditure</h2>
      </div>
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && !error && !data.length ? <EmptyState /> : null}
      {!loading && !error && data.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 12, right: 18, left: 12, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              angle={data.length > 6 ? -30 : 0}
              textAnchor={data.length > 6 ? 'end' : 'middle'}
              height={data.length > 6 ? 62 : 40}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatINR(value, currencyMode)}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              width={86}
            />
            <Tooltip formatter={(value) => formatINR(value, currencyMode)} />
            <Legend verticalAlign="bottom" />
            <Bar dataKey="amount" name="Passed Amount" fill={accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </section>
  );
};

export default QuarterlyChart;
