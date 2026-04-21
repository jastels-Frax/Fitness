import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const TABS = ['Exercise', 'Overview'];

const tickStyle  = { fill: '#555', fontSize: 11, fontFamily: 'DM Mono, monospace' };
const dotWhite   = { fill: '#fff',    r: 3, strokeWidth: 0 };
const dotTeal    = { fill: '#22d3ee', r: 3, strokeWidth: 0 };
const tipStyle   = {
  background: '#111', border: '1px solid #1e1e1e',
  borderRadius: 6, fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#fff',
};

function fmtDate(str) {
  if (!str) return '';
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtVolume(v) {
  if (!v) return '0';
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

export default function Metrics() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('Exercise');
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [exData, setExData]     = useState(null);
  const [loadingEx, setLoadingEx] = useState(false);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => {
        setExercises(data);
        if (data.length) setSelectedId(String(data[0].id));
      });
  }, []);

  useEffect(() => {
    if (!selectedId || tab !== 'Exercise') return;
    setLoadingEx(true);
    setExData(null);
    fetch(`/api/metrics/exercise/${selectedId}`)
      .then((r) => r.json())
      .then(setExData)
      .finally(() => setLoadingEx(false));
  }, [selectedId, tab]);

  useEffect(() => {
    if (tab !== 'Overview' || overview) return;
    fetch('/api/metrics/overview').then((r) => r.json()).then(setOverview);
  }, [tab, overview]);

  const chartData = (exData?.history ?? []).map((h) => ({
    date:   fmtDate(h.date),
    weight: h.weight,
    volume: h.volume,
  }));

  const pb = exData?.personal_best ?? 0;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← back</button>
        <h1 style={s.title}>METRICS</h1>
      </header>

      <div style={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Exercise tab ───────────────────────────────────────────── */}
      {tab === 'Exercise' && (
        <div style={s.section}>
          <select
            style={s.selector}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {loadingEx && <p style={s.dim}>Loading…</p>}

          {!loadingEx && exData && chartData.length === 0 && (
            <p style={s.dim}>No sessions logged for this exercise yet.</p>
          )}

          {!loadingEx && exData && chartData.length > 0 && (
            <>
              {pb > 0 && (
                <div style={s.pb}>
                  <span style={s.pbLabel}>Personal best</span>
                  <span style={s.pbValue}>{pb} lbs</span>
                </div>
              )}

              <ChartCard title="Weight over time" unit="lbs">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e1e1e" />
                    <XAxis dataKey="date" tick={tickStyle} />
                    <YAxis tick={tickStyle} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={tipStyle} itemStyle={{ color: '#fff' }} />
                    <Line
                      type="monotone" dataKey="weight" name="weight (lbs)"
                      stroke="#fff" strokeWidth={2} dot={dotWhite} activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Volume per session" unit="lbs total">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e1e1e" />
                    <XAxis dataKey="date" tick={tickStyle} />
                    <YAxis tick={tickStyle} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={tipStyle} itemStyle={{ color: '#22d3ee' }} />
                    <Line
                      type="monotone" dataKey="volume" name="volume (lbs)"
                      stroke="#22d3ee" strokeWidth={2} dot={dotTeal} activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}
        </div>
      )}

      {/* ── Overview tab ───────────────────────────────────────────── */}
      {tab === 'Overview' && (
        <div style={s.section}>
          {!overview
            ? <p style={s.dim}>Loading…</p>
            : (
              <div style={s.grid}>
                <StatCard value={overview.total_sessions} label="sessions" />
                <StatCard value={`${fmtVolume(overview.total_volume)} lbs`} label="total volume" />
                <StatCard value={overview.most_trained_muscle ?? '—'} label="top muscle" />
                <StatCard
                  value={overview.current_streak}
                  label={`day${overview.current_streak !== 1 ? 's' : ''} streak`}
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, unit, children }) {
  return (
    <div style={cc.wrap}>
      <div style={cc.head}>
        <span style={cc.title}>{title}</span>
        <span style={cc.unit}>{unit}</span>
      </div>
      {children}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div style={sc.card}>
      <span style={sc.value}>{value}</span>
      <span style={sc.label}>{label}</span>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 64px',
    maxWidth: 720,
    margin: '0 auto',
  },
  header: { marginBottom: 32 },
  back: {
    fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)',
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, marginBottom: 12, letterSpacing: '0.04em', display: 'block',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 72,
    letterSpacing: '0.06em', lineHeight: 1, color: 'var(--text)',
  },
  tabs: { display: 'flex', gap: 8, marginBottom: 32 },
  tab: {
    fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.08em', padding: '6px 16px', borderRadius: 20,
    border: '1px solid var(--border)', background: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  tabActive: { background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' },
  section: { display: 'flex', flexDirection: 'column', gap: 20 },
  selector: {
    appearance: 'none', WebkitAppearance: 'none',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-mono)',
    fontSize: 13, padding: '11px 16px', cursor: 'pointer', width: '100%', outline: 'none',
  },
  pb: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--surface)', border: '1px solid var(--border-hover)',
    borderRadius: 10, padding: '16px 20px',
  },
  pbLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  pbValue: {
    fontFamily: 'var(--font-display)', fontSize: 36,
    letterSpacing: '0.04em', color: 'var(--text)',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  dim: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' },
};

const cc = {
  wrap: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '18px 16px 12px',
  },
  head: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 16,
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 18,
    letterSpacing: '0.04em', color: 'var(--text)',
  },
  unit: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
  },
};

const sc = {
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '20px 18px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  value: {
    fontFamily: 'var(--font-display)', fontSize: 40,
    letterSpacing: '0.03em', color: 'var(--text)', lineHeight: 1,
  },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
  },
};
