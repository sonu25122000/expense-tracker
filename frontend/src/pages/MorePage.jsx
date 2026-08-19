import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const ITEMS = [
  { to: '/categories', label: 'Categories', icon: '🏷️', desc: 'Manage default & custom categories' },
  { to: '/export', label: 'Export / Download', icon: '⬇️', desc: 'Export expenses as PDF or Excel' },
  { to: '/settings', label: 'Settings', icon: '⚙️', desc: 'Server address & currency' },
];

export default function MorePage() {
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  return (
    <>
      <PageHeader title="More" />
      <div className="app-content">
        {username && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(160deg, var(--primary), var(--primary-dark))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="expense-category" style={{ margin: 0 }}>
                {username}
              </p>
              <p className="expense-meta" style={{ margin: '2px 0 0' }}>
                Logged in
              </p>
            </div>
          </div>
        )}
        {ITEMS.map((item) => (
          <div key={item.to} className="list-row" role="button" tabIndex={0} onClick={() => navigate(item.to)}>
            <div className="expense-icon">{item.icon}</div>
            <div style={{ flex: 1 }}>
              <p className="expense-category">{item.label}</p>
              <p className="expense-meta">{item.desc}</p>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
        ))}
        <div className="list-row" role="button" tabIndex={0} onClick={logout}>
          <div className="expense-icon" style={{ background: 'var(--danger-soft)' }}>🚪</div>
          <div style={{ flex: 1 }}>
            <p className="expense-category" style={{ color: 'var(--danger)' }}>Log Out</p>
            <p className="expense-meta">Sign out of this device</p>
          </div>
        </div>
      </div>
    </>
  );
}
