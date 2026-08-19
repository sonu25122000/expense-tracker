import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { exportAndShare } from '../api/exportApi';

export default function ExportPage() {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [busy, setBusy] = useState(null); // 'pdf' | 'excel' | null
  const [message, setMessage] = useState(null); // { type, text }

  const buildFilters = () => ({
    startDate: customStart || undefined,
    endDate: customEnd || undefined,
  });

  const handleExport = async (type) => {
    setBusy(type);
    setMessage(null);
    try {
      await exportAndShare(type, buildFilters());
      setMessage({ type: 'success', text: `${type.toUpperCase()} export ready.` });
    } catch (err) {
      setMessage({ type: 'error', text: `Export failed: ${err.message}` });
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
        <div className="form-row">
          <input type="date" className="text-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          <input type="date" className="text-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
        </div>

        <div className="form-row" style={{ marginTop: 24 }}>
          <button className="button button-primary" onClick={() => handleExport('pdf')} disabled={busy !== null}>
            {busy === 'pdf' ? 'Exporting…' : '📄 Export PDF'}
          </button>
          <button className="button button-primary" onClick={() => handleExport('excel')} disabled={busy !== null}>
            {busy === 'excel' ? 'Exporting…' : '📊 Export Excel'}
          </button>
        </div>
        {message && (
          <div className={message.type === 'success' ? 'banner-success' : 'banner-error'} style={{ marginTop: 12 }}>
            {message.text}
          </div>
        )}
      </div>
    </>
  );
}
