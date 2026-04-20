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
