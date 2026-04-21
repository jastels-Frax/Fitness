import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useWorkoutStore from '../store/workoutStore';
import useCustomTemplatesStore from '../store/customTemplatesStore';
import ExercisePicker from '../components/ExercisePicker';
import { MUSCLE_COLOR } from '../constants';

function makeKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toBuilderExercise(ex, num_sets, reps_target) {
  return {
    ...ex,
    _key:        makeKey(),
    num_sets:    num_sets    ?? ex.num_sets    ?? 3,
    reps_target: reps_target ?? ex.reps_target ?? ex.rep_ranges?.hypertrophy ?? '8–12',
  };
}

export default function WorkoutBuilder() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const startSession = useWorkoutStore((s) => s.startSession);
  const saveCustom   = useCustomTemplatesStore((s) => s.save);

  const incoming    = location.state?.template ?? null;
  const customId    = location.state?.customId   ?? null;
  const createdAt   = location.state?.createdAt  ?? null;

  const [sessionName, setSessionName] = useState(incoming?.name ?? 'New Workout');
  const [exercises, setExercises]     = useState(() =>
    (incoming?.exercises ?? []).map((ex) => toBuilderExercise(ex, ex.num_sets, ex.reps_target))
  );
  const [showPicker, setShowPicker]   = useState(false);
  const [dragIndex, setDragIndex]     = useState(null);
  const dragOverIndex                 = useRef(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const addExercise = (ex) => {
    setExercises((prev) => [...prev, toBuilderExercise(ex)]);
    setShowPicker(false);
  };

  const removeExercise = (key) =>
    setExercises((prev) => prev.filter((e) => e._key !== key));

  const updateExercise = (key, field, value) =>
    setExercises((prev) =>
      prev.map((e) => (e._key === key ? { ...e, [field]: value } : e))
    );

  const moveUp = (idx) => {
    if (idx === 0) return;
    setExercises((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx) => {
    setExercises((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  const handleDragStart = (idx) => setDragIndex(idx);

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    dragOverIndex.current = idx;
  };

  const handleDrop = () => {
    const from = dragIndex;
    const to   = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    setExercises((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragIndex(null);
    dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    dragOverIndex.current = null;
  };

  // ── Start / Save ──────────────────────────────────────────────────────────

  const doStart = () => {
    const template = { id: incoming?.id ?? null, name: sessionName };
    startSession(template, exercises);
    navigate('/workout/active');
  };

  const doSaveAndStart = () => {
    const now = new Date().toISOString();
    const template = {
      id:         customId ?? Date.now(),
      name:       sessionName,
      created_at: createdAt ?? now,
      exercises:  exercises.map((ex) => ({
        exercise_id:   ex.id,
        exercise_name: ex.name,
        muscle_group:  ex.muscle_group,
        num_sets:      ex.num_sets,
        reps_target:   ex.reps_target,
      })),
    };
    saveCustom(template);
    doStart();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>← back</button>
        <input
          style={s.nameInput}
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Session name"
          maxLength={60}
        />
      </header>

      {exercises.length === 0 && (
        <p style={s.empty}>No exercises yet. Tap ADD EXERCISE to get started.</p>
      )}

      <div style={s.list}>
        {exercises.map((ex, idx) => (
          <div
            key={ex._key}
            style={{
              ...s.row,
              opacity: dragIndex !== null && dragIndex !== idx ? 0.5 : 1,
            }}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle + order buttons */}
            <div style={s.handle}>
              <span style={s.handleIcon}>⠿</span>
              <div style={s.arrows}>
                <button style={s.arrowBtn} onClick={() => moveUp(idx)} disabled={idx === 0}>▲</button>
                <button style={s.arrowBtn} onClick={() => moveDown(idx)} disabled={idx === exercises.length - 1}>▼</button>
              </div>
            </div>

            {/* Exercise info */}
            <div style={s.exInfo}>
              <div style={s.exHeader}>
                <span style={{ ...s.dot, background: MUSCLE_COLOR[ex.muscle_group] ?? '#555' }} />
                <span style={s.exName}>{ex.name}</span>
              </div>

              <div style={s.controls}>
                <label style={s.controlLabel}>
                  <span style={s.controlTag}>sets</span>
                  <input
                    type="number"
                    style={s.numInput}
                    value={ex.num_sets}
                    min={1}
                    max={20}
                    onChange={(e) => updateExercise(ex._key, 'num_sets', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </label>
                <label style={s.controlLabel}>
                  <span style={s.controlTag}>reps</span>
                  <input
                    type="text"
                    style={{ ...s.numInput, width: 72 }}
                    value={ex.reps_target}
                    placeholder="8–12"
                    onChange={(e) => updateExercise(ex._key, 'reps_target', e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Remove button */}
            <button style={s.removeBtn} onClick={() => removeExercise(ex._key)}>✕</button>
          </div>
        ))}
      </div>

      <button style={s.addBtn} onClick={() => setShowPicker(true)}>
        + ADD EXERCISE
      </button>

      <div style={s.footer}>
        <button style={s.startBtn} onClick={doStart} disabled={exercises.length === 0}>
          START SESSION
        </button>
        <button style={s.saveBtn} onClick={doSaveAndStart} disabled={exercises.length === 0}>
          SAVE AS CUSTOM + START
        </button>
      </div>

      {showPicker && (
        <ExercisePicker
          title="Add Exercise"
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 20px 160px',
    maxWidth: 680,
    margin: '0 auto',
  },
  header: {
    marginBottom: 32,
  },
  back: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: 16,
    letterSpacing: '0.04em',
    display: 'block',
  },
  nameInput: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'var(--font-display)',
    fontSize: 48,
    letterSpacing: '0.04em',
    lineHeight: 1,
    width: '100%',
    outline: 'none',
    padding: '0 0 8px',
  },
  empty: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 24,
    letterSpacing: '0.04em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '14px 16px',
    transition: 'opacity 0.15s',
    cursor: 'grab',
  },
  handle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  handleIcon: {
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    color: 'var(--border-hover)',
    cursor: 'grab',
    lineHeight: 1,
  },
  arrows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  arrowBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 8,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '1px 3px',
    lineHeight: 1,
    opacity: 0.6,
  },
  exInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
  },
  exHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  exName: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  controls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  controlLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  controlTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  numInput: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    padding: '4px 8px',
    width: 52,
    outline: 'none',
    textAlign: 'center',
    MozAppearance: 'textfield',
    appearance: 'textfield',
  },
  removeBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    flexShrink: 0,
  },
  addBtn: {
    display: 'block',
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    background: 'none',
    border: '1px dashed var(--border)',
    borderRadius: 10,
    padding: '14px 0',
    cursor: 'pointer',
    marginBottom: 32,
  },
  footer: {
    position: 'fixed',
    bottom: 64,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 20px',
    background: 'var(--bg)',
    borderTop: '1px solid var(--border)',
  },
  startBtn: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.1em',
    padding: '14px 0',
    background: '#ffffff',
    border: 'none',
    borderRadius: 10,
    color: '#0a0a0a',
    cursor: 'pointer',
    width: '100%',
    ':disabled': { opacity: 0.4 },
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    padding: '12px 0',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    width: '100%',
  },
};
