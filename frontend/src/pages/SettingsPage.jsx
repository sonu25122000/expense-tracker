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
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const handleSave = async () => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
      setMessage({ type: 'error', text: 'Enter a full address like http://192.168.1.10:5001, or leave blank.' });
      return;
    }
    setTesting(true);
    setMessage(null);
    const prevBase = apiClient.defaults.baseURL;
    try {
      apiClient.defaults.baseURL = trimmed ? `${trimmed}/api` : '/api';
      await apiClient.get('/health', { timeout: 6000 });
      updateServerUrl(trimmed);
      setMessage({ type: 'success', text: 'Connected and saved.' });
    } catch (err) {
      apiClient.defaults.baseURL = prevBase;
      setMessage({ type: 'error', text: 'Could not connect. Check the address and that the server is running.' });
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
        <p className="muted-note" style={{ margin: '0 0 10px' }}>
          Leave blank if you're using this app in a browser on the same device as the backend.
          Only the installed Android app needs an explicit address.
        </p>
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
        {message && (
          <div className={message.type === 'success' ? 'banner-success' : 'banner-error'} style={{ marginTop: 12 }}>
            {message.text}
          </div>
        )}

        <span className="field-label">Currency symbol</span>
        <ChipSelector options={CURRENCY_OPTIONS} value={currency} onChange={updateCurrency} />
      </div>
    </>
  );
}
