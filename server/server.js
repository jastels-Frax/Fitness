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
