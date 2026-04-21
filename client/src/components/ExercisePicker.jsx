import { useState } from 'react';
import EXERCISES from '../data/exercises';
import { MUSCLE_COLOR, DIFFICULTY_COLOR, MUSCLE_GROUPS } from '../constants';

const SORTED = [...EXERCISES].sort((a, b) =>
  a.muscle_group !== b.muscle_group
    ? a.muscle_group.localeCompare(b.muscle_group)
    : a.name.localeCompare(b.name)
);

export default function ExercisePicker({ onSelect, onClose, title = 'Add Exercise', initialGroup = 'All' }) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState(initialGroup);

  const visible = SORTED.filter((ex) => {
    const matchGroup = activeGroup === 'All' || ex.muscle_group === activeGroup;
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.sheet}>
        <div style={s.header}>
          <h2 style={s.title}>{title}</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <input
          style={s.search}
          type="text"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div style={s.tabs}>
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              style={{ ...s.tab, ...(activeGroup === g ? s.tabActive : {}) }}
              onClick={() => setActiveGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div style={s.list}>
          {visible.length === 0 && (
            <p style={s.empty}>No exercises match.</p>
          )}
          {visible.map((ex) => (
            <button key={ex.id} style={s.item} onClick={() => onSelect(ex)}>
              <div style={s.itemLeft}>
                <span style={{ ...s.dot, background: MUSCLE_COLOR[ex.muscle_group] ?? '#555' }} />
                <div style={s.itemText}>
                  <span style={s.itemName}>{ex.name}</span>
                  <span style={s.itemGroup}>{ex.muscle_group}</span>
                </div>
              </div>
              <span style={{
                ...s.badge,
                color:       DIFFICULTY_COLOR[ex.difficulty] ?? '#888',
                borderColor: DIFFICULTY_COLOR[ex.difficulty] ?? '#888',
              }}>
                {ex.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '85vh',
    background: 'var(--surface)',
    borderRadius: '14px 14px 0 0',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 0',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  closeBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  search: {
    margin: '16px 20px 0',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    padding: '10px 14px',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    gap: 6,
    padding: '12px 20px',
    overflowX: 'auto',
    flexShrink: 0,
  },
  tab: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '5px 12px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabActive: {
    background: 'var(--text)',
    color: 'var(--bg)',
    borderColor: 'var(--text)',
  },
  list: {
    overflowY: 'auto',
    flex: 1,
    padding: '0 20px 24px',
  },
  empty: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
    padding: '24px 0',
    textAlign: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '13px 0',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  itemName: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  itemGroup: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid',
    flexShrink: 0,
  },
};
