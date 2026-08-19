import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import SummaryCard from '../components/SummaryCard';
import EmptyState from '../components/EmptyState';
import { getReport } from '../api/reports';
import { formatCurrency, formatDate } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function ReportsPage() {
  const { currency } = useSettings();
  const [period, setPeriod] = useState('monthly');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period, date],
    queryFn: () => getReport(period, date),
  });

  const bucketLabel = period === 'yearly' ? 'Month' : 'Day';
  const chartData = (data?.breakdown || []).map((b) => ({
    label: period === 'yearly' ? format(new Date(`${b.bucket}-01`), 'MMM') : formatDate(b.bucket, 'd MMM'),
    total: b.total,
  }));

  return (
    <>
      <PageHeader title="Reports & Analytics" />
      <div className="app-content">
        <ChipSelector options={PERIODS} value={period} onChange={setPeriod} />
        <input
          type="date"
          className="text-input"
          style={{ marginTop: 12, marginBottom: 20 }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {isLoading || !data ? (
          <div className="spinner" />
        ) : (
          <>
            <div className="summary-grid">
              <SummaryCard icon="💰" label="Total" value={formatCurrency(data.total, currency)} />
              <SummaryCard icon="🧾" label="Transactions" value={String(data.transactionCount)} />
              <SummaryCard
                icon="🔺"
                label={`Highest Spending ${bucketLabel}`}
                value={
                  data.highestSpendingBucket
                    ? formatCurrency(data.highestSpendingBucket.total, currency)
                    : '—'
                }
                sublabel={data.highestSpendingBucket?.bucket}
              />
              <SummaryCard
                icon="📊"
                label={`Average per ${bucketLabel}`}
                value={formatCurrency(data.averagePerBucket, currency)}
              />
            </div>

            <div className="charts-grid">
              <div>
                <p className="section-title">Category-wise Spending</p>
                {data.categoryBreakdown?.length ? (
                  <div className="card">
                    {data.categoryBreakdown.map((c) => (
                      <div key={c.category} className="detail-row">
                        <span className="detail-label">
                          {c.category} ({c.count})
                        </span>
                        <span className="detail-value">{formatCurrency(c.total, currency)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🏷️" title="No expenses in this period" />
                )}
              </div>

              <div>
                <p className="section-title">{bucketLabel}-wise Spending</p>
                {chartData.length ? (
                  <div className="chart-card">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData} margin={{ left: -20, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                        <Bar dataKey="total" fill="#2a78d6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon="📉" title="No expenses in this period" />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
