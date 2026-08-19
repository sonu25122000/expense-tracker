import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { apiClient } from '../api/client';

export default function ServerSetupPage() {
  const { updateServerUrl } = useSettings();
  const [url, setUrl] = useState('http://');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setError('Enter a full address like http://192.168.1.10:5001');
      return;
    }
    setTesting(true);
    setError('');
    try {
      const prevBase = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = `${trimmed}/api`;
      await apiClient.get('/health', { timeout: 6000 });
      apiClient.defaults.baseURL = prevBase;
      updateServerUrl(trimmed);
    } catch (err) {
      setError(
        'Could not connect. Make sure the backend server is running and this device is on the same Wi-Fi network as your PC.'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>💰</div>
        <h1 style={{ fontSize: 22, margin: '16px 0 8px' }}>Connect to your backend</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          This app talks to the Expense Tracker server running on your PC. Enter your PC's local
          network address below, e.g. <strong>http://192.168.1.10:5001</strong>. This device must
          be on the same Wi-Fi network as the PC.
        </p>
        <input
          className="text-input"
          placeholder="http://192.168.1.10:5001"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          style={{ marginBottom: 12 }}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="button button-primary" onClick={handleSave} disabled={testing}>
          {testing ? 'Connecting…' : 'Connect'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Tip: On the PC, run <code>ipconfig</code> (Windows) to find its local IPv4 address, and
          make sure the backend was started with <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}
