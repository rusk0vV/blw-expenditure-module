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

const HeadWiseChart = ({ data = [], loading, error }) => {
  const { currencyMode } = useTheme();
  const visible = data.slice(0, 8).map((item) => ({
    ...item,
    shortName: item.headName.length > 26 ? `${item.headName.slice(0, 25)}...` : item.headName
  }));

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h2>Head-wise Expenditure</h2>
      </div>
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && !error && !visible.length ? <EmptyState /> : null}
      {!loading && !error && visible.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={visible}
            layout="vertical"
            margin={{ top: 12, right: 18, left: 18, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatINR(value, currencyMode)}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <YAxis
              dataKey="shortName"
              type="category"
              width={150}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatINR(value, currencyMode)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.headName || ''}
            />
            <Legend verticalAlign="bottom" />
            <Bar dataKey="amount" name="Passed Amount" fill="var(--accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </section>
  );
};

export default HeadWiseChart;
