import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import SummaryCard from '../components/SummaryCard';
import { getReport } from '../api/reports';
import { formatCurrency } from '../utils/format';
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
        )}
      </div>
    </>
  );
}
