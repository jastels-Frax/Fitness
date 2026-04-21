import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import { MUSCLE_GROUPS } from '../constants';
import { getExercises } from '../api';

export default function Library() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGroup, setActiveGroup] = useState('All');

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible =
    activeGroup === 'All'
      ? exercises
      : exercises.filter((e) => e.muscle_group === activeGroup);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/')}>← back</button>
        <h1 style={styles.title}>LIBRARY</h1>
        <p style={styles.count}>
          {loading ? '…' : `${visible.length} exercises`}
        </p>
      </header>

      <div style={styles.tabs}>
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            style={{
              ...styles.tab,
              ...(activeGroup === g ? styles.tabActive : {}),
            }}
            onClick={() => setActiveGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {error && <p style={styles.state}>{error}</p>}

      {!loading && !error && (
        <div style={styles.grid}>
          {visible.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 64px',
    maxWidth: 960,
    margin: '0 auto',
  },
  header: {
    marginBottom: 32,
  },
  back: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: 12,
    letterSpacing: '0.04em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    letterSpacing: '0.06em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  count: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 8,
    letterSpacing: '0.04em',
  },
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  tab: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--text)',
    color: 'var(--bg)',
    borderColor: 'var(--text)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  state: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};
