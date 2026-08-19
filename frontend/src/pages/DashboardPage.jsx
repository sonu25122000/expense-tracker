import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/SummaryCard';
import { getDashboardSummary } from '../api/dashboard';
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

  const trendData = (data.dailyTrend || []).map((d) => ({ date: formatDate(d.date, 'd MMM'), total: d.total }));

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="app-content">
        <div className="summary-grid">
          <SummaryCard icon="📅" label="Today" value={formatCurrency(data.totalToday, currency)} />
          <SummaryCard icon="🗓️" label="This Week" value={formatCurrency(data.totalThisWeek, currency)} />
          <SummaryCard icon="📆" label="This Month" value={formatCurrency(data.totalThisMonth, currency)} />
          <SummaryCard icon="🧾" label="Transactions" value={String(data.totalTransactions)} />
          <SummaryCard
            icon="🔺"
            label="Highest Expense"
            value={data.highestExpense ? formatCurrency(data.highestExpense.amount, currency) : '—'}
            sublabel={data.highestExpense?.category}
          />
          <SummaryCard icon="📊" label="Avg. Daily (this month)" value={formatCurrency(data.averageDailyExpense, currency)} />
        </div>

        <div className="chart-card" style={{ marginTop: 'var(--space-lg)' }}>
          <p className="chart-card-title">Daily Trend (last 30 days)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ left: -20, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" interval={4} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="total" stroke="#2a78d6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
