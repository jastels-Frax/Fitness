import { useEffect, useState } from 'react';
import TemplateCard from '../components/TemplateCard';

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.wordmark}>PUSH</h1>
        <p style={styles.subtitle}>Choose your session</p>
      </header>

      {loading && (
        <p style={styles.state}>Loading…</p>
      )}

      {error && (
        <p style={{ ...styles.state, color: 'var(--dot-core)' }}>{error}</p>
      )}

      {!loading && !error && (
        <div style={styles.grid}>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
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
    marginBottom: 48,
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
