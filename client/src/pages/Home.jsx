import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, getTemplate } from '../api';
import useCustomTemplatesStore from '../store/customTemplatesStore';
import EXERCISES from '../data/exercises';
import { MUSCLE_COLOR } from '../constants';

const exMap = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

const DOT_COLOR = MUSCLE_COLOR;

function groupTemplates(templates) {
  const map = {};
  for (const t of templates) {
    if (!map[t.group]) map[t.group] = [];
    map[t.group].push(t);
  }
  return Object.entries(map).map(([group, variants]) => {
    const allMuscles = [...new Set(variants.flatMap((v) => v.muscle_groups))];
    return { group, variants, muscle_groups: allMuscles };
  });
}

// ── Preset group card (collapsed/expanded) ───────────────────────────────────

function GroupCard({ group, variants, muscle_groups, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={gc.wrap}>
      <div style={gc.header} onClick={() => setOpen((v) => !v)}>
        <div style={gc.headerLeft}>
          <h2 style={gc.name}>{group}</h2>
          <div style={gc.dots}>
            {muscle_groups.map((mg) => (
              <span key={mg} style={gc.dotGroup}>
                <span style={{ ...gc.dot, background: DOT_COLOR[mg] ?? '#555' }} />
                <span style={gc.dotLabel}>{mg}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={gc.headerRight}>
          <span style={gc.variantCount}>{variants.length} variants</span>
          <span style={gc.chevron}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      <div style={{ ...gc.variants, gridTemplateRows: open ? '1fr' : '0fr', overflow: 'hidden', display: 'grid', transition: 'grid-template-rows 0.22s ease' }}>
        <div style={{ minHeight: 0 }}>
          <div style={gc.variantList}>
            {variants.map((v) => (
              <button key={v.id} style={gc.variantBtn} onClick={() => onSelect(v.id)}>
                <div style={gc.vLeft}>
                  <span style={gc.vName}>{v.name.split('—')[1]?.trim() ?? v.name}</span>
                  <span style={gc.vDesc}>{v.description}</span>
                </div>
                <div style={gc.vRight}>
                  <span style={gc.vMeta}>{v.exercise_count} exercises</span>
                  <span style={gc.vArrow}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Custom template card ─────────────────────────────────────────────────────

function CustomCard({ template, onSelect, onEdit, onDuplicate, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const exCount = template.exercises?.length ?? 0;
  const dateStr = template.created_at
    ? new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const muscles = [...new Set(
    (template.exercises ?? []).map((e) => exMap[e.exercise_id]?.muscle_group).filter(Boolean)
  )];

  return (
    <div style={cc.card}>
      <div style={cc.main} onClick={() => onSelect(template)}>
        <h3 style={cc.name}>{template.name}</h3>
        <div style={cc.dots}>
          {muscles.map((mg) => (
            <span key={mg} style={cc.dotGroup}>
              <span style={{ ...cc.dot, background: DOT_COLOR[mg] ?? '#555' }} />
              <span style={cc.dotLabel}>{mg}</span>
            </span>
          ))}
        </div>
        <p style={cc.meta}>{exCount} exercises · {dateStr}</p>
      </div>
      <div style={cc.actions}>
        <button style={cc.actionBtn} onClick={() => onEdit(template)}>edit</button>
        <button style={cc.actionBtn} onClick={() => onDuplicate(template.id)}>copy</button>
        <button
          style={{ ...cc.actionBtn, ...(confirmDel ? cc.delConfirm : cc.del) }}
          onClick={() => {
            if (!confirmDel) { setConfirmDel(true); return; }
            onDelete(template.id);
          }}
        >
          {confirmDel ? 'confirm' : 'delete'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('PRESETS');
  const { templates: customList, remove, duplicate } = useCustomTemplatesStore();

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const groups = groupTemplates(templates);

  const handlePresetSelect = async (templateId) => {
    const data = await getTemplate(templateId);
    navigate('/workout/builder', { state: { template: data } });
  };

  const handleCustomSelect = (customTemplate) => {
    const exercises = (customTemplate.exercises ?? []).map((ce) => {
      const ex = exMap[ce.exercise_id] ?? { id: ce.exercise_id, name: ce.exercise_name, muscle_group: ce.muscle_group };
      return { ...ex, num_sets: ce.num_sets, reps_target: ce.reps_target };
    });
    navigate('/workout/builder', {
      state: {
        template:  { id: null, name: customTemplate.name, exercises },
        customId:  customTemplate.id,
        createdAt: customTemplate.created_at,
      },
    });
  };

  const handleNewWorkout = () => {
    navigate('/workout/builder', { state: { template: null } });
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.wordmark}>PUSH</h1>
        <p style={s.subtitle}>Choose your session</p>
      </header>

      {/* Tab bar */}
      <div style={s.tabs}>
        {['PRESETS', 'CUSTOM'].map((t) => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── PRESETS tab ─────────────────────────────────────────────────── */}
      {tab === 'PRESETS' && (
        <div style={s.list}>
          {loading && <p style={s.state}>Loading…</p>}
          {!loading && groups.map(({ group, variants, muscle_groups }) => (
            <GroupCard
              key={group}
              group={group}
              variants={variants}
              muscle_groups={muscle_groups}
              onSelect={handlePresetSelect}
            />
          ))}
        </div>
      )}

      {/* ── CUSTOM tab ──────────────────────────────────────────────────── */}
      {tab === 'CUSTOM' && (
        <div style={s.list}>
          <button style={s.newBtn} onClick={handleNewWorkout}>
            + NEW WORKOUT
          </button>
          {customList.length === 0 && (
            <p style={s.state}>No custom workouts yet. Build one above or save a preset.</p>
          )}
          {[...customList].reverse().map((t) => (
            <CustomCard
              key={t.id}
              template={t}
              onSelect={handleCustomSelect}
              onEdit={handleCustomSelect}
              onDuplicate={duplicate}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Group card styles ────────────────────────────────────────────────────────

const gc = {
  wrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 16px',
    cursor: 'pointer',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  dots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 14px',
  },
  dotGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    display: 'block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
    paddingTop: 2,
  },
  variantCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  chevron: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  variants: {},
  variantList: {
    borderTop: '1px solid var(--border)',
  },
  variantBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '14px 20px',
    background: 'var(--surface-hover)',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
    gap: 12,
  },
  vLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  vName: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    letterSpacing: '0.03em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  vDesc: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 300,
    color: 'var(--text-muted)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  vRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  vMeta: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  vArrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
  },
};

// ── Custom card styles ───────────────────────────────────────────────────────

const cc = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  main: {
    padding: '20px 20px 16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    letterSpacing: '0.04em',
    color: 'var(--text)',
    lineHeight: 1,
  },
  dots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 14px',
  },
  dotGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    display: 'block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  meta: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
  },
  actions: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
  },
  actionBtn: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.06em',
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderRight: '1px solid var(--border)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  del: { color: 'var(--text-muted)' },
  delConfirm: { color: 'var(--dot-core)' },
};

// ── Page styles ──────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 20px 80px',
    maxWidth: 720,
    margin: '0 auto',
  },
  header: { marginBottom: 32 },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    letterSpacing: '0.06em',
    lineHeight: 1,
    color: 'var(--text)',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 300,
    color: 'var(--text-muted)',
    marginTop: 8,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '6px 16px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--text)',
    color: 'var(--bg)',
    borderColor: 'var(--text)',
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
  newBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    background: 'none',
    border: '1px dashed var(--border)',
    borderRadius: 10,
    padding: '16px 0',
    cursor: 'pointer',
    width: '100%',
  },
};
