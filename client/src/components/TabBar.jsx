import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { label: 'Home',     path: '/',         Icon: HomeIcon },
  { label: 'Library',  path: '/library',  Icon: LibraryIcon },
  { label: 'History',  path: '/history',  Icon: HistoryIcon },
  { label: 'Metrics',  path: '/metrics',  Icon: MetricsIcon },
  { label: 'Settings', path: '/settings', Icon: SettingsIcon },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/workout/active') return null;

  return (
    <nav style={s.bar}>
      {TABS.map(({ label, path, Icon }) => {
        const active = location.pathname === path ||
          (path !== '/' && location.pathname.startsWith(path));
        return (
          <button key={path} style={s.tab} onClick={() => navigate(path)}>
            <Icon color={active ? 'var(--text)' : 'var(--text-muted)'} />
            <span style={{ ...s.label, color: active ? 'var(--text)' : 'var(--text-muted)' }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function LibraryIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HistoryIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function MetricsIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M7 20V14M12 20V8M17 20V4" />
    </svg>
  );
}

function SettingsIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

const s = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
};
