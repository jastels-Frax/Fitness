const DOT_COLOR = {
  Chest:     'var(--dot-chest)',
  Back:      'var(--dot-back)',
  Shoulders: 'var(--dot-shoulders)',
  Legs:      'var(--dot-legs)',
  Arms:      'var(--dot-arms)',
  Core:      'var(--dot-core)',
};

export default function TemplateCard({ template }) {
  const { name, description, muscle_groups, exercise_count, estimated_minutes } = template;

  return (
    <article style={styles.card}>
      <h2 style={styles.name}>{name}</h2>
      <p style={styles.description}>{description}</p>

      <div style={styles.dots}>
        {muscle_groups.map((group) => (
          <span key={group} style={styles.dotGroup}>
            <span style={{ ...styles.dot, background: DOT_COLOR[group] ?? '#555' }} />
            <span style={styles.dotLabel}>{group}</span>
          </span>
        ))}
      </div>

      <div style={styles.footer}>
        <span style={styles.meta}>{exercise_count} exercises</span>
        <span style={styles.time}>~{estimated_minutes} min</span>
      </div>
    </article>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '28px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    letterSpacing: '0.04em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  description: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 300,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  dots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    marginTop: 4,
  },
  dotGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    display: 'block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 400,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: '1px solid var(--border)',
  },
  meta: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  time: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-dim)',
  },
};
