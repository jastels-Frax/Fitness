import { useEffect, useState } from 'react';
import useWorkoutStore from '../store/workoutStore';

export default function RestTimerBanner() {
  const { restTimer, cancelRestTimer } = useWorkoutStore();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!restTimer) return;
    const tick = () => {
      const rem = Math.max(0, Math.ceil((restTimer.endsAt - Date.now()) / 1000));
      setRemaining(rem);
      if (rem === 0) cancelRestTimer();
    };
    tick();
    const id = setInterval(tick, 400);
    return () => clearInterval(id);
  }, [restTimer, cancelRestTimer]);

  if (!restTimer) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${remaining}s`;
  const pct = (remaining / (restTimer.durationMs / 1000)) * 100;

  return (
    <div style={s.wrap}>
      <div style={s.track}>
        <div style={{ ...s.fill, width: `${pct}%` }} />
      </div>
      <div style={s.row}>
        <span style={s.label}>REST</span>
        <span style={s.countdown}>{display}</span>
        <button style={s.skip} onClick={cancelRestTimer}>skip</button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    borderBottom: '1px solid var(--border)',
  },
  track: {
    height: 2,
    background: 'var(--border)',
  },
  fill: {
    height: '100%',
    background: 'var(--dot-back)',
    transition: 'width 0.4s linear',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    gap: 16,
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    flexGrow: 1,
  },
  countdown: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    letterSpacing: '0.04em',
    color: 'var(--dot-back)',
    lineHeight: 1,
  },
  skip: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    letterSpacing: '0.04em',
  },
};
