import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import useWorkoutStore from '../store/workoutStore';

export default function Home() {
  const navigate = useNavigate();
  const startSession = useWorkoutStore((s) => s.startSession);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load templates');
        return r.json();
      })
      .then(setTemplates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (templateId) => {
    setStarting(templateId);
    try {
      const res = await fetch(`/api/templates/${templateId}`);
      const data = await res.json();
      startSession(data, data.exercises);
      navigate('/workout/active');
    } catch {
      setStarting(null);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerRow}>
          <h1 style={styles.wordmark}>PUSH</h1>
          <button style={styles.libraryLink} onClick={() => navigate('/library')}>
            Library →
          </button>
        </div>
        <p style={styles.subtitle}>Choose your session</p>
      </header>

      {loading && <p style={styles.state}>Loading…</p>}
      {error   && <p style={{ ...styles.state, color: 'var(--dot-core)' }}>{error}</p>}

      {!loading && !error && (
        <div style={styles.grid}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{ opacity: starting && starting !== t.id ? 0.4 : 1, transition: 'opacity 0.2s' }}
            >
              <TemplateCard
                template={t}
                onClick={() => handleSelect(t.id)}
              />
            </div>
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
  header: { marginBottom: 48 },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  libraryLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    letterSpacing: '0.04em',
    marginBottom: 4,
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    letterSpacing: '0.06em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 300,
    color: 'var(--text-muted)',
    marginTop: 8,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  state: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};
