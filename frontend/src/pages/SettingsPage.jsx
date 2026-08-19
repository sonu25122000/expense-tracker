import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import { useSettings } from '../context/SettingsContext';
import { apiClient } from '../api/client';

const CURRENCY_OPTIONS = ['₹', '$', '€', '£'];

export default function SettingsPage() {
  const { serverUrl, updateServerUrl, currency, updateCurrency } = useSettings();
  const [url, setUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setMessage('Enter a full address like http://192.168.1.10:5001');
      return;
    }
    setTesting(true);
    setMessage('');
    const prevBase = apiClient.defaults.baseURL;
    try {
      apiClient.defaults.baseURL = `${trimmed}/api`;
      await apiClient.get('/health', { timeout: 6000 });
      updateServerUrl(trimmed);
      setMessage('Connected and saved.');
    } catch (err) {
      apiClient.defaults.baseURL = prevBase;
      setMessage('Could not connect. Check the address and that the server is running.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" back />
      <div className="app-content">
        <span className="field-label" style={{ marginTop: 0 }}>
          Backend server address
        </span>
        <input
          className="text-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="http://192.168.1.10:5001"
        />
        <button
          className="button button-primary"
          style={{ marginTop: 12 }}
          onClick={handleSave}
          disabled={testing}
        >
          {testing ? 'Testing…' : 'Save & Test'}
        </button>
        {message && <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>{message}</p>}

        <span className="field-label">Currency symbol</span>
        <ChipSelector options={CURRENCY_OPTIONS} value={currency} onChange={updateCurrency} />
      </div>
    </>
  );
}
