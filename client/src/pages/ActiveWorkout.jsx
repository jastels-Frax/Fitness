import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkoutStore from '../store/workoutStore';
import ExerciseBlock from '../components/ExerciseBlock';
import RestTimerBanner from '../components/RestTimerBanner';
import EndWorkoutModal from '../components/EndWorkoutModal';

function fmtTime(secs) {
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
}

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { template, exercises, sets, startedAt } = useWorkoutStore();
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!template) {
    return (
      <div style={s.empty}>
        <p style={s.emptyText}>No active workout.</p>
        <button style={s.emptyLink} onClick={() => navigate('/')}>← Go home</button>
      </div>
    );
  }

  const allSets      = Object.values(sets).flat();
  const totalSets    = allSets.length;
  const doneSets     = allSets.filter(Boolean).length;
  const progress     = totalSets > 0 ? doneSets / totalSets : 0;
  const elapsed      = startedAt ? Math.floor((now - startedAt) / 1000) : 0;

  return (
    <>
      {/* Progress bar — fixed top */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${progress * 100}%` }} />
      </div>

      {/* Scrollable content */}
      <div style={s.page}>
        <header style={s.header}>
          <div>
            <button style={s.back} onClick={() => navigate('/')}>← exit</button>
            <h1 style={s.title}>{template.name}</h1>
          </div>
          <div style={s.timerWrap}>
            <span style={{ ...s.timer, ...(startedAt ? s.timerActive : {}) }}>
              {fmtTime(elapsed)}
            </span>
            <span style={s.timerLabel}>elapsed</span>
          </div>
        </header>

        <div style={s.setsBar}>
          <span style={s.setsText}>{doneSets} / {totalSets} sets</span>
        </div>

        <div style={s.exercises}>
          {exercises.map((ex) => (
            <ExerciseBlock key={ex.id} exercise={ex} />
          ))}
        </div>
      </div>

      {/* Fixed bottom: rest banner + end button */}
      <div style={s.bottom}>
        <RestTimerBanner />
        <button style={s.endBtn} onClick={() => setShowModal(true)}>
          END WORKOUT
        </button>
      </div>

      {showModal && (
        <EndWorkoutModal
          elapsed={elapsed}
          setsCompleted={doneSets}
          totalSets={totalSets}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

const s = {
  progressTrack: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 3,
    background: 'var(--border)',
    zIndex: 100,
  },
  progressFill: {
    height: '100%',
    background: '#22c55e',
    transition: 'width 0.4s ease',
  },
  page: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '3px 20px 180px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 28,
    marginBottom: 8,
  },
  back: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: 8,
    letterSpacing: '0.04em',
    display: 'block',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 48,
    letterSpacing: '0.04em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  timerWrap: {
    paddingTop: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
  },
  timer: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    lineHeight: 1,
    transition: 'color 0.3s',
  },
  timerActive: {
    color: '#22c55e',
  },
  timerLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  setsBar: {
    marginBottom: 24,
  },
  setsText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  exercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  bottom: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    background: 'var(--bg)',
    borderTop: '1px solid var(--border)',
    zIndex: 50,
  },
  endBtn: {
    display: 'block',
    width: '100%',
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    letterSpacing: '0.12em',
    background: 'none',
    border: 'none',
    color: 'var(--dot-core)',
    cursor: 'pointer',
    padding: '18px 0',
  },
  empty: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  emptyLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
};
