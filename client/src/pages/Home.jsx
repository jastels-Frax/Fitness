import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import useWorkoutStore from '../store/workoutStore';
import { getTemplates, getTemplate } from '../api';


export default function Home() {
  const navigate = useNavigate();
  const startSession = useWorkoutStore((s) => s.startSession);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (templateId) => {
    setStarting(templateId);
    try {
      const data = await getTemplate(templateId);
      startSession(data, data.exercises);
      navigate('/workout/active');
    } catch {
      setStarting(null);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.wordmark}>PUSH</h1>
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
