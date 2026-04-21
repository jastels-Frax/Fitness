import { useState } from 'react';
import useSettingsStore from '../store/settingsStore';
import { deleteAllSessions } from '../api';

export default function Settings() {
  const { unit, setUnit } = useSettingsStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setClearing(true);
    await deleteAllSessions();
    setClearing(false);
    setConfirmClear(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>SETTINGS</h1>
      </header>

      <div style={s.section}>
        <p style={s.sectionLabel}>Weight Unit</p>
        <div style={s.pills}>
          {['lbs', 'kg'].map((u) => (
            <button
              key={u}
              style={{ ...s.pill, ...(unit === u ? s.pillActive : {}) }}
              onClick={() => setUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <p style={s.sectionLabel}>Data</p>
        <button
          style={{ ...s.danger, ...(confirmClear ? s.dangerConfirm : {}) }}
          onClick={handleClear}
          disabled={clearing}
        >
          {clearing ? 'clearing…' : confirmClear ? 'tap again to confirm' : 'clear all history'}
        </button>
        {confirmClear && (
          <p style={s.hint}>This permanently deletes all saved workout sessions.</p>
        )}
        {cleared && (
          <p style={{ ...s.hint, color: 'var(--text-muted)' }}>History cleared.</p>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 80px',
    maxWidth: 480,
    margin: '0 auto',
  },
  header: { marginBottom: 48 },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    letterSpacing: '0.06em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 40,
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
  },
  pills: { display: 'flex', gap: 8 },
  pill: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    letterSpacing: '0.05em',
    padding: '10px 28px',
    borderRadius: 24,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pillActive: {
    background: 'var(--text)',
    color: 'var(--bg)',
    borderColor: 'var(--text)',
  },
  danger: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: '0.04em',
    padding: '12px 20px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, color 0.15s',
  },
  dangerConfirm: {
    borderColor: 'var(--dot-core)',
    color: 'var(--dot-core)',
  },
  hint: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--dot-core)',
    letterSpacing: '0.03em',
  },
};
