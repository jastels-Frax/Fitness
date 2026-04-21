import { useState } from 'react';
import { MUSCLE_COLOR } from '../constants';

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDuration(secs) {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${secs}s`;
}

export default function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = async () => {
    if (!expanded && !detail) {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/sessions/${session.id}`);
        setDetail(await res.json());
      } finally {
        setLoadingDetail(false);
      }
    }
    setExpanded((v) => !v);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
    onDelete(session.id);
  };

  const totalSets = session.total_sets            ?? '?';
  const doneSets  = session.total_sets_completed  ?? '?';

  return (
    <div style={s.card}>
      {/* Header row — always visible, tap to expand */}
      <div style={s.header} onClick={toggle}>
        <div style={s.headerLeft}>
          <span style={s.name}>{session.template_name}</span>
          <span style={s.sub}>
            {fmtDuration(session.duration_seconds)}
            <span style={s.dot}>·</span>
            {doneSets}/{totalSets} sets
          </span>
        </div>
        <div style={s.headerRight}>
          <span style={s.date}>{fmtDate(session.completed_at)}</span>
          <span style={s.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={s.detail}>
          {loadingDetail && <p style={s.loading}>Loading…</p>}

          {detail && (
            <>
              {detail.exercises && detail.exercises.length > 0 ? (
                <div style={s.exercises}>
                  {detail.exercises.map((ex) => (
                    <ExRow key={ex.id} ex={ex} />
                  ))}
                </div>
              ) : (
                <p style={s.empty}>No exercise data recorded.</p>
              )}

              {detail.notes && (
                <div style={s.sessionNote}>
                  <span style={s.noteLabel}>Session note</span>
                  <p style={s.noteText}>{detail.notes}</p>
                </div>
              )}
            </>
          )}

          <div style={s.footer}>
            <button
              style={{ ...s.deleteBtn, ...(confirmDelete ? s.deleteBtnConfirm : {}) }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm' : 'Delete session'}
            </button>
            {confirmDelete && (
              <button style={s.cancelDelete} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExRow({ ex }) {
  const completedCount = ex.sets_data.filter(Boolean).length;
  const dotColor = MUSCLE_COLOR[ex.muscle_group] ?? '#555';

  return (
    <div style={s.exRow}>
      <div style={s.exHeader}>
        <div style={s.exLeft}>
          <span style={{ ...s.exDot, background: dotColor }} />
          <span style={s.exName}>{ex.exercise_name}</span>
        </div>
        <span style={s.exWeight}>{ex.weight > 0 ? `${ex.weight} lbs` : '—'}</span>
      </div>

      <div style={s.sets}>
        {ex.sets_data.map((done, i) => (
          <span key={i} style={{ ...s.setChip, ...(done ? s.setDone : s.setMissed) }}>
            {done ? '✓' : '✗'}
          </span>
        ))}
        <span style={s.setsCount}>{completedCount}/{ex.sets_data.length}</span>
      </div>

      {ex.note && <p style={s.exNote}>{ex.note}</p>}
    </div>
  );
}

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    cursor: 'pointer',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  sub: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    color: 'var(--border)',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  date: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  chevron: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  detail: {
    borderTop: '1px solid var(--border)',
    padding: '16px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  loading: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  exercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  empty: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  exRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingBottom: 14,
    borderBottom: '1px solid var(--border)',
  },
  exHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  exDot: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  exName: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  exWeight: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  sets: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 15,
  },
  setChip: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
  },
  setDone: {
    color: '#22c55e',
    borderColor: '#22c55e',
  },
  setMissed: {
    color: 'var(--border)',
    borderColor: 'var(--border)',
  },
  setsCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    marginLeft: 4,
  },
  exNote: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 300,
    color: 'var(--text-muted)',
    paddingLeft: 15,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  sessionNote: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'var(--bg)',
    borderRadius: 6,
    padding: '10px 12px',
  },
  noteLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  noteText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 300,
    color: 'var(--text-dim)',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  deleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--dot-core)',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '6px 14px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'border-color 0.15s',
  },
  deleteBtnConfirm: {
    borderColor: 'var(--dot-core)',
  },
  cancelDelete: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
};
