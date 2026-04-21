import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MUSCLE_COLOR, DIFFICULTY_COLOR } from '../constants';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/exercises/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Exercise not found');
        return r.json();
      })
      .then(setExercise)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.page}><p style={styles.state}>Loading…</p></div>;
  if (error)   return <div style={styles.page}><p style={{ ...styles.state, color: 'var(--dot-core)' }}>{error}</p></div>;

  const { name, muscle_group, difficulty, form_cues, common_mistakes, rep_ranges } = exercise;
  const dotColor   = MUSCLE_COLOR[muscle_group]       ?? '#555';
  const diffColor  = DIFFICULTY_COLOR[difficulty]     ?? '#888';
  const repEntries = Object.entries(rep_ranges);

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/library')}>← library</button>

      <header style={styles.header}>
        <div style={styles.meta}>
          <span style={styles.groupRow}>
            <span style={{ ...styles.dot, background: dotColor }} />
            <span style={styles.groupLabel}>{muscle_group}</span>
          </span>
          <span
            style={{
              ...styles.badge,
              color: diffColor,
              borderColor: diffColor,
            }}
          >
            {difficulty}
          </span>
        </div>
        <h1 style={styles.title}>{name}</h1>
      </header>

      <div style={styles.sections}>
        <Section title="Form Cues">
          <ol style={styles.ol}>
            {form_cues.map((cue, i) => (
              <li key={i} style={styles.li}>
                <span style={styles.liPrefix}>{i + 1}.</span> {cue}
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Common Mistakes">
          <ul style={styles.ul}>
            {common_mistakes.map((m, i) => (
              <li key={i} style={styles.li}>
                <span style={styles.liPrefix}>—</span> {m}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Rep Ranges">
          <div style={styles.repGrid}>
            {repEntries.map(([label, range]) => (
              <div key={label} style={styles.repCell}>
                <span style={styles.repLabel}>{label}</span>
                <span style={styles.repValue}>{range}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={sectionStyles.wrap}>
      <h2 style={sectionStyles.heading}>{title}</h2>
      {children}
    </section>
  );
}

const sectionStyles = {
  wrap: {
    borderTop: '1px solid var(--border)',
    paddingTop: 24,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    letterSpacing: '0.06em',
    color: 'var(--text-dim)',
    marginBottom: 16,
  },
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 80px',
    maxWidth: 680,
    margin: '0 auto',
  },
  back: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: 24,
    letterSpacing: '0.04em',
  },
  header: {
    marginBottom: 40,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    display: 'block',
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  groupLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 56,
    letterSpacing: '0.04em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  ol: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    counterReset: 'cues',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  li: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 300,
    color: 'var(--text-dim)',
    lineHeight: 1.6,
    display: 'flex',
    gap: 10,
  },
  liPrefix: {
    color: 'var(--text-muted)',
    flexShrink: 0,
    minWidth: 16,
  },
  repGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  },
  repCell: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  repLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
  },
  repValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  state: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};
