const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PUSH', timestamp: new Date().toISOString() });
});

app.get('/api/exercises', (req, res) => {
  const exercises = db
    .prepare('SELECT * FROM exercises ORDER BY muscle_group, name')
    .all()
    .map((e) => ({
      ...e,
      form_cues:       JSON.parse(e.form_cues),
      common_mistakes: JSON.parse(e.common_mistakes),
      rep_ranges:      JSON.parse(e.rep_ranges),
    }));
  res.json(exercises);
});

app.get('/api/exercises/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...row,
    form_cues:       JSON.parse(row.form_cues),
    common_mistakes: JSON.parse(row.common_mistakes),
    rep_ranges:      JSON.parse(row.rep_ranges),
  });
});

app.get('/api/templates/:id', (req, res) => {
  const tmpl = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Not found' });

  const exerciseIds = JSON.parse(tmpl.exercise_ids);
  const placeholders = exerciseIds.map(() => '?').join(',');
  const exerciseMap = {};
  db.prepare(`SELECT * FROM exercises WHERE id IN (${placeholders})`)
    .all(...exerciseIds)
    .forEach((e) => {
      exerciseMap[e.id] = {
        ...e,
        form_cues:       JSON.parse(e.form_cues),
        common_mistakes: JSON.parse(e.common_mistakes),
        rep_ranges:      JSON.parse(e.rep_ranges),
      };
    });

  res.json({ ...tmpl, exercises: exerciseIds.map((id) => exerciseMap[id]).filter(Boolean) });
});

app.get('/api/sessions', (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.date, s.notes, s.completed_at, s.started_at,
           s.duration_seconds, s.total_sets, s.total_sets_completed,
           COALESCE(wt.name, 'Custom Workout') AS template_name
    FROM sessions s
    LEFT JOIN workout_templates wt ON s.template_id = wt.id
    ORDER BY s.id DESC
  `).all();
  res.json(rows);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = db.prepare(`
    SELECT s.*, COALESCE(wt.name, 'Custom Workout') AS template_name
    FROM sessions s
    LEFT JOIN workout_templates wt ON s.template_id = wt.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });

  const exercises = db
    .prepare('SELECT * FROM session_exercises WHERE session_id = ? ORDER BY id')
    .all(req.params.id)
    .map((e) => ({ ...e, sets_data: JSON.parse(e.sets_data) }));

  res.json({ ...session, exercises });
});

app.post('/api/sessions', (req, res) => {
  const {
    template_id, notes, started_at, duration_seconds,
    total_sets, total_sets_completed, exercises = [],
  } = req.body;

  const save = db.transaction(() => {
    const { lastInsertRowid: sessionId } = db.prepare(`
      INSERT INTO sessions
        (template_id, notes, completed_at, started_at, duration_seconds, total_sets, total_sets_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      template_id ?? null, notes ?? null, new Date().toISOString(),
      started_at ?? null, duration_seconds ?? null,
      total_sets ?? null, total_sets_completed ?? null,
    );

    const insertEx = db.prepare(`
      INSERT INTO session_exercises (session_id, exercise_id, exercise_name, muscle_group, weight, note, sets_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ex of exercises) {
      insertEx.run(
        sessionId, ex.exercise_id ?? null, ex.exercise_name,
        ex.muscle_group ?? null, ex.weight ?? 0,
        ex.note || null, JSON.stringify(ex.sets ?? []),
      );
    }
    return sessionId;
  });

  res.json({ id: save() });
});

app.delete('/api/sessions/all', (req, res) => {
  db.prepare('DELETE FROM sessions').run();
  res.json({ ok: true });
});

app.delete('/api/sessions/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  if (changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.get('/api/metrics/exercise/:id', (req, res) => {
  const exercise = db
    .prepare('SELECT id, name, muscle_group FROM exercises WHERE id = ?')
    .get(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Not found' });

  const rows = db.prepare(`
    SELECT s.date, s.completed_at, se.weight, se.sets_data
    FROM session_exercises se
    JOIN sessions s ON se.session_id = s.id
    WHERE se.exercise_id = ?
    ORDER BY s.completed_at ASC, s.id ASC
  `).all(req.params.id);

  const history = rows.map((row) => {
    const sets = JSON.parse(row.sets_data || '[]');
    const done = sets.filter(Boolean).length;
    return { date: row.date, weight: row.weight, volume: row.weight * done, sets_done: done };
  });

  const personal_best = history.length ? Math.max(...history.map((h) => h.weight)) : 0;
  res.json({ exercise, history, personal_best });
});

app.get('/api/metrics/overview', (req, res) => {
  const total_sessions = db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n;

  const allSets = db.prepare('SELECT weight, sets_data, muscle_group FROM session_exercises').all();
  let total_volume = 0;
  const muscleTotals = {};
  for (const row of allSets) {
    const done = JSON.parse(row.sets_data || '[]').filter(Boolean).length;
    total_volume += row.weight * done;
    if (row.muscle_group) muscleTotals[row.muscle_group] = (muscleTotals[row.muscle_group] || 0) + done;
  }

  const most_trained_muscle =
    Object.entries(muscleTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const dates = db
    .prepare("SELECT DISTINCT date FROM sessions WHERE date IS NOT NULL ORDER BY date DESC")
    .all()
    .map((r) => r.date);

  let current_streak = 0;
  if (dates.length) {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const dateSet   = new Set(dates);
    let cursor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;
    if (cursor) {
      current_streak = 1;
      let d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      while (dateSet.has(d.toISOString().slice(0, 10))) {
        current_streak++;
        d.setDate(d.getDate() - 1);
      }
    }
  }

  res.json({
    total_sessions,
    total_volume: Math.round(total_volume),
    most_trained_muscle,
    current_streak,
  });
});

app.get('/api/templates', (req, res) => {
  const templates = db.prepare('SELECT * FROM workout_templates ORDER BY id').all();

  const result = templates.map((t) => {
    const exerciseIds = JSON.parse(t.exercise_ids);
    const placeholders = exerciseIds.map(() => '?').join(',');
    const muscleGroups = db
      .prepare(`SELECT DISTINCT muscle_group FROM exercises WHERE id IN (${placeholders})`)
      .all(...exerciseIds)
      .map((r) => r.muscle_group);

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      muscle_groups: muscleGroups,
      exercise_count: exerciseIds.length,
      estimated_minutes: exerciseIds.length * 10,
    };
  });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`PUSH server running on http://localhost:${PORT}`);
});
