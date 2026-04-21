import { useNavigate } from 'react-router-dom';
import { MUSCLE_COLOR, DIFFICULTY_COLOR } from '../constants';

export default function ExerciseCard({ exercise }) {
  const navigate = useNavigate();
  const { id, name, muscle_group, difficulty } = exercise;

  return (
    <article style={styles.card} onClick={() => navigate(`/library/${id}`)}>
      <div style={styles.top}>
        <span
          style={{
            ...styles.badge,
            color: DIFFICULTY_COLOR[difficulty] ?? '#888',
            borderColor: DIFFICULTY_COLOR[difficulty] ?? '#888',
          }}
        >
          {difficulty}
        </span>
      </div>

      <h3 style={styles.name}>{name}</h3>

      <div style={styles.group}>
        <span style={{ ...styles.dot, background: MUSCLE_COLOR[muscle_group] ?? '#555' }} />
        <span style={styles.groupLabel}>{muscle_group}</span>
      </div>
    </article>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '20px 20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-end',
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
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.03em',
    lineHeight: 1.1,
    color: 'var(--text)',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  dot: {
    display: 'block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  groupLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};
