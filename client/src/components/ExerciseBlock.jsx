import { useState } from 'react';
import useWorkoutStore from '../store/workoutStore';
import useSettingsStore from '../store/settingsStore';

const REST_OPTIONS = [
  { label: '30s',  seconds: 30 },
  { label: '1m',   seconds: 60 },
  { label: '1.5m', seconds: 90 },
  { label: '2m',   seconds: 120 },
  { label: '3m',   seconds: 180 },
];

function toLbs(val, unit) {
  return unit === 'kg' ? val * 2.205 : val;
}

function toDisplay(lbs, unit) {
  if (unit === 'kg') return parseFloat((lbs / 2.205).toFixed(1));
  return lbs;
}

export default function ExerciseBlock({ exercise }) {
  const { id, name, rep_ranges, form_cues } = exercise;
  const { sets, weights, notes, noteOpen, toggleSet, setWeight, toggleNote, setNote, startRestTimer } =
    useWorkoutStore();
  const { unit } = useSettingsStore();

  const exSets    = sets[id]     ?? [];
  const weight    = weights[id]  ?? 0;
  const note      = notes[id]    ?? '';
  const isOpen    = noteOpen[id] ?? false;
  const repTarget = rep_ranges?.hypertrophy ?? '8–12';

  const [tipsOpen, setTipsOpen] = useState(false);
  const cues = Array.isArray(form_cues) ? form_cues : [];

  const displayWeight = toDisplay(weight, unit);
  const step = unit === 'kg' ? 1.25 : 2.5;

  return (
    <div style={s.block}>
      <div style={s.header}>
        <h3 style={s.name}>{name}</h3>
        <span style={s.target}>{repTarget} reps</span>
      </div>

      {/* Weight stepper */}
      <div style={s.weightRow}>
        <button style={s.stepper} onClick={() => setWeight(id, Math.max(0, weight - toLbs(step, unit)))}>−</button>
        <div style={s.weightCenter}>
          <input
            type="number"
            style={s.weightInput}
            value={displayWeight || ''}
            placeholder="0"
            onChange={(e) => {
              const v = parseFloat(e.target.value) || 0;
              setWeight(id, toLbs(v, unit));
            }}
          />
          <span style={s.unit}>{unit}</span>
        </div>
        <button style={s.stepper} onClick={() => setWeight(id, weight + toLbs(step, unit))}>+</button>
      </div>

      {/* Set circles */}
      <div style={s.setsRow}>
        {exSets.map((done, i) => (
          <button
            key={i}
            style={{ ...s.circle, ...(done ? s.circleDone : {}) }}
            onClick={() => toggleSet(id, i)}
          >
            {done ? '✓' : i + 1}
          </button>
        ))}
      </div>

      {/* Rest timer triggers */}
      <div style={s.restRow}>
        {REST_OPTIONS.map(({ label, seconds }) => (
          <button key={label} style={s.restBtn} onClick={() => startRestTimer(seconds, label)}>
            {label}
          </button>
        ))}
      </div>

      {/* Note toggle */}
      <button style={s.toggleBtn} onClick={() => toggleNote(id)}>
        {isOpen ? '▲ hide note' : '+ add note'}
      </button>
      <div style={{ ...s.slideWrap, gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
        <div style={s.slideInner}>
          <textarea
            style={s.noteArea}
            value={note}
            rows={2}
            placeholder="form notes, weight feels, etc."
            onChange={(e) => setNote(id, e.target.value)}
          />
        </div>
      </div>

      {/* Form tips toggle */}
      {cues.length > 0 && (
        <>
          <button style={s.toggleBtn} onClick={() => setTipsOpen((o) => !o)}>
            {tipsOpen ? '▲ hide tips' : '▸ form tips'}
          </button>
          <div style={{ ...s.slideWrap, gridTemplateRows: tipsOpen ? '1fr' : '0fr' }}>
            <div style={s.slideInner}>
              <ul style={s.cueList}>
                {cues.map((cue, i) => (
                  <li key={i} style={s.cueItem}>{cue}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  block: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  target: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  weightRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
  },
  weightCenter: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  weightInput: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    width: 90,
    textAlign: 'center',
    outline: 'none',
    MozAppearance: 'textfield',
    appearance: 'textfield',
  },
  unit: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  setsRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  },
  circleDone: {
    background: '#ffffff',
    borderColor: '#ffffff',
    color: '#0a0a0a',
    fontWeight: 700,
  },
  restRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  restBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.05em',
    padding: '5px 12px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  toggleBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    letterSpacing: '0.04em',
  },
  slideWrap: {
    display: 'grid',
    overflow: 'hidden',
    transition: 'grid-template-rows 0.22s ease',
  },
  slideInner: {
    minHeight: 0,
  },
  noteArea: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 300,
    padding: '10px 12px',
    resize: 'vertical',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  cueList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingBottom: 4,
  },
  cueItem: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-dim)',
    paddingLeft: 12,
    borderLeft: '2px solid var(--border-hover)',
    lineHeight: 1.5,
  },
};
