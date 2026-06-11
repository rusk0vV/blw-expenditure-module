import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatINR } from '../utils/formatCurrency.js';
import { EmptyState, ErrorBanner, LoadingBlock } from './SectionState.jsx';

const COLORS = ['#C8A96E', '#2F80ED', '#27AE60', '#EB5757', '#9B51E0', '#F2994A', '#56CCF2'];

const DistributionChart = ({ data = [], loading, error }) => {
  const { currencyMode } = useTheme();
  const visible = data.slice(0, 7);

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h2>Expenditure Distribution</h2>
      </div>
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && !error && !visible.length ? <EmptyState /> : null}
      {!loading && !error && visible.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={visible}
              dataKey="amount"
              nameKey="headName"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={2}
            >
              {visible.map((entry, index) => (
                <Cell key={entry.headCode} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, payload) => [
                `${formatINR(value, currencyMode)} (${payload.payload.percentage}%)`,
                name
              ]}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : null}
    </section>
  );
};

export default DistributionChart;
