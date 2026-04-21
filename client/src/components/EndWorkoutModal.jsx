import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkoutStore from '../store/workoutStore';

function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function EndWorkoutModal({ elapsed, setsCompleted, totalSets, onClose }) {
  const navigate = useNavigate();
  const { template, clearSession } = useWorkoutStore();
  const [sessionNote, setSessionNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template.id, notes: sessionNote }),
      });
    } catch {}
    clearSession();
    navigate('/');
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <h2 style={s.title}>Save workout?</h2>

        <div style={s.stats}>
          <Stat value={template.name} label="template" />
          <Stat value={fmtDuration(elapsed)} label="duration" />
          <Stat value={`${setsCompleted}/${totalSets}`} label="sets done" />
        </div>

        <textarea
          style={s.noteArea}
          value={sessionNote}
          onChange={(e) => setSessionNote(e.target.value)}
          placeholder="Session notes…"
          rows={3}
        />

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '…' : 'SAVE & EXIT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={s.stat}>
      <span style={s.statVal}>{value}</span>
      <span style={s.statLbl}>{label}</span>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 24,
  },
  modal: {
    background: '#111',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  stat: {
    background: 'var(--bg)',
    borderRadius: 8,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  statVal: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  statLbl: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
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
    resize: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    padding: '13px 0',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.08em',
    padding: '13px 0',
    background: '#ffffff',
    border: 'none',
    borderRadius: 8,
    color: '#0a0a0a',
    cursor: 'pointer',
  },
};
