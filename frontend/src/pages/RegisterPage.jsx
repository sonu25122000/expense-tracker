import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
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
      await register(username.trim(), password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-badge">💰</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Sign up to start tracking your expenses. Your data is private to your account.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <input
          className="text-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <input
          className="text-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="text-input"
          placeholder="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button type="submit" className="button button-primary" disabled={busy} style={{ marginTop: 4 }}>
          {busy ? 'Creating…' : 'Create Account'}
        </button>

        <p className="auth-hint">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
