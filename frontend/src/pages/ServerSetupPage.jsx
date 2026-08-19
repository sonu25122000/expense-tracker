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
    const prevBase = apiClient.defaults.baseURL;
    try {
      apiClient.defaults.baseURL = `${trimmed}/api`;
      await apiClient.get('/health', { timeout: 6000 });
      updateServerUrl(trimmed);
    } catch (err) {
      apiClient.defaults.baseURL = prevBase;
      setError(
        'Could not connect. Make sure the backend server is running and this device is on the same Wi-Fi network as your PC.'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-badge">💰</div>
        <h1 className="auth-title">Connect to your backend</h1>
        <p className="auth-subtitle">
          This app talks to the Expense Tracker server running on your PC. Enter your PC's local
          network address below, e.g. <strong>http://192.168.1.10:5001</strong>. This device must
          be on the same Wi-Fi network as the PC.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <input
          className="text-input"
          placeholder="http://192.168.1.10:5001"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          keyboardType="url"
        />
        <button type="button" className="button button-primary" onClick={handleSave} disabled={testing} style={{ marginTop: 4 }}>
          {testing ? 'Connecting…' : 'Connect'}
        </button>

        <p className="auth-hint">
          Tip: On the PC, run <code>ipconfig</code> (Windows) to find its local IPv4 address, and
          make sure the backend was started with <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}
