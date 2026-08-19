import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountSetupPage() {
  const { setup } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Choose a username.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await setup(username.trim(), password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create account.');
    } finally {
      setBusy(false);
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
      <form onSubmit={handleSubmit} style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔐</div>
        <h1 style={{ fontSize: 22, margin: '16px 0 8px' }}>Create your account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Set a username and password to protect access to your expenses. You'll use this to log
          in every time you open the app.
        </p>
        <input
          className="text-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          style={{ marginBottom: 12 }}
        />
        <input
          className="text-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <input
          className="text-input"
          placeholder="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
