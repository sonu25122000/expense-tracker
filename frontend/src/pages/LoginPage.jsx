import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.');
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
      <form onSubmit={handleSubmit} style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>💰</div>
        <h1 style={{ fontSize: 22, margin: '16px 0 24px' }}>Log in</h1>
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
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
