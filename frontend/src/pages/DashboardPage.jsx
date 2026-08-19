import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/SummaryCard';
import EmptyState from '../components/EmptyState';
import { getDashboardSummary } from '../api/dashboard';
import { colorForIndex } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

export default function DashboardPage() {
  const { currency } = useSettings();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary });

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="app-content">
          <div className="spinner" />
        </div>
      </>
    );
  }

  const categoryData = (data.categoryBreakdown || []).map((c) => ({ name: c.category, value: c.total }));
  const trendData = (data.dailyTrend || []).map((d) => ({ date: formatDate(d.date, 'd MMM'), total: d.total }));
  const paymentData = (data.paymentMethodBreakdown || []).map((p) => ({
    name: p.paymentMethod,
    total: p.total,
  }));

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="app-content">
        <div className="summary-grid">
          <SummaryCard label="Today" value={formatCurrency(data.totalToday, currency)} />
          <SummaryCard label="This Week" value={formatCurrency(data.totalThisWeek, currency)} />
          <SummaryCard label="This Month" value={formatCurrency(data.totalThisMonth, currency)} />
          <SummaryCard label="Transactions" value={String(data.totalTransactions)} />
          <SummaryCard
            label="Highest Expense"
            value={data.highestExpense ? formatCurrency(data.highestExpense.amount, currency) : '—'}
            sublabel={data.highestExpense?.category}
          />
          <SummaryCard label="Avg. Daily (this month)" value={formatCurrency(data.averageDailyExpense, currency)} />
        </div>

        <p className="section-title">Category-wise Spending (this month)</p>
        {categoryData.length ? (
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((entry, i) => (
                    <Cell key={entry.name} fill={colorForIndex(i)} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatCurrency(v, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="🥧" title="No spending yet this month" />
        )}

        <p className="section-title">Daily Trend (last 30 days)</p>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ left: -20, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="total" stroke="#2a78d6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="section-title">Payment Method Breakdown (this month)</p>
        {paymentData.length ? (
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} margin={{ left: -20, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                <Bar dataKey="total" fill="#2a78d6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="📊" title="No spending yet this month" />
        )}
      </div>
    </>
  );
}
