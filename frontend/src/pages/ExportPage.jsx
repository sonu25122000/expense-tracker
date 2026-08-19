import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, startOfToday, subDays } from 'date-fns';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import { listCategories } from '../api/categories';
import { exportAndShare } from '../api/exportApi';

const RANGE_PRESETS = [
  { value: 'month', label: 'This Month' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

const PAYMENT_METHODS = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

function presetToRange(preset, start, end) {
  const today = startOfToday();
  if (preset === 'month') return { startDate: format(startOfMonth(today), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
  if (preset === '7') return { startDate: format(subDays(today, 6), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
  if (preset === '30') return { startDate: format(subDays(today, 29), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
  if (preset === 'custom') return { startDate: start || undefined, endDate: end || undefined };
  return {};
}

export default function ExportPage() {
  const [rangePreset, setRangePreset] = useState('month');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [busy, setBusy] = useState(null); // 'pdf' | 'excel' | null
  const [message, setMessage] = useState('');

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const categoryOptions = ['All', ...(categoriesData?.map((c) => c.name) || [])];

  const buildFilters = () => ({
    ...presetToRange(rangePreset, customStart, customEnd),
    category: category === 'All' ? undefined : category,
    paymentMethod: paymentMethod === 'All' ? undefined : paymentMethod,
  });

  const handleExport = async (type) => {
    setBusy(type);
    setMessage('');
    try {
      await exportAndShare(type, buildFilters());
      setMessage(`${type.toUpperCase()} export ready.`);
    } catch (err) {
      setMessage(`Export failed: ${err.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title="Export / Download" />
      <div className="app-content">
        <span className="field-label" style={{ marginTop: 0 }}>
          Date Range
        </span>
        <ChipSelector options={RANGE_PRESETS} value={rangePreset} onChange={setRangePreset} />
        {rangePreset === 'custom' && (
          <div className="form-row" style={{ marginTop: 12 }}>
            <input type="date" className="text-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <input type="date" className="text-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}

        <span className="field-label">Category</span>
        <ChipSelector options={categoryOptions} value={category} onChange={setCategory} />

        <span className="field-label">Payment Method</span>
        <ChipSelector options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />

        <div className="form-row" style={{ marginTop: 24 }}>
          <button className="button button-primary" onClick={() => handleExport('pdf')} disabled={busy !== null}>
            {busy === 'pdf' ? 'Exporting…' : '📄 Export PDF'}
          </button>
          <button className="button button-primary" onClick={() => handleExport('excel')} disabled={busy !== null}>
            {busy === 'excel' ? 'Exporting…' : '📊 Export Excel'}
          </button>
        </div>
        {message && <p style={{ fontSize: 13, marginTop: 12, color: 'var(--text-secondary)' }}>{message}</p>}
      </div>
    </>
  );
}
