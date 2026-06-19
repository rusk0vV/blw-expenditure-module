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
  const totalPassedAmount = visible.reduce((sum, item) => sum + item.amount, 0);
  const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#9B51E0', '#56CCF2'];

  return (
    <section className="panel chart-panel-donut">
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
                <Cell key={entry.headCode} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <text
              x="50%"
              y="44%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                fill: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Claims Base
            </text>
            <text
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                fill: 'var(--text-primary)'
              }}
            >
              {formatINR(totalPassedAmount, currencyMode)}
            </text>
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
