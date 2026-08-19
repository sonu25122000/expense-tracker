import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const ITEMS = [
  { to: '/categories', label: 'Categories', icon: '🏷️', desc: 'Manage default & custom categories' },
  { to: '/export', label: 'Export / Download', icon: '⬇️', desc: 'Export expenses as PDF or Excel' },
  { to: '/settings', label: 'Settings', icon: '⚙️', desc: 'Server address & currency' },
];

export default function MorePage() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="More" />
      <div className="app-content">
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
      </div>
    </>
  );
}
