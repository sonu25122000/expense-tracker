import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/history', label: 'History', icon: '🕒' },
  { to: '/add', label: 'Add', icon: '➕' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/more', label: 'More', icon: '☰' },
];

function NavLinks() {
  return NAV_ITEMS.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  ));
}

export default function AppShell() {
  return (
    <div className="app-shell">
      <nav className="sidebar-nav">
        <div className="sidebar-brand">💰 Expense Tracker</div>
        <NavLinks />
      </nav>
      <div className="app-main">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLinks />
      </nav>
    </div>
  );
}
