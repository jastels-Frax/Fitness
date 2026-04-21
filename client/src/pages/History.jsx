import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCard from '../components/SessionCard';

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load history');
        return r.json();
      })
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← back</button>
        <h1 style={s.title}>HISTORY</h1>
        {!loading && (
          <p style={s.count}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
        )}
      </header>

      {loading && <p style={s.state}>Loading…</p>}
      {error   && <p style={{ ...s.state, color: 'var(--dot-core)' }}>{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p style={s.state}>No workouts saved yet.</p>
      )}

      {!loading && !error && (
        <div style={s.list}>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 64px',
    maxWidth: 720,
    margin: '0 auto',
  },
  header: {
    marginBottom: 40,
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
    display: 'block',
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  state: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};
