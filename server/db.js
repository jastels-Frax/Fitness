const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const db = new Database(path.join(DB_DIR, 'push.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    muscle_group    TEXT    NOT NULL,
    difficulty      TEXT    NOT NULL CHECK(difficulty IN ('beginner','intermediate','advanced')),
    form_cues       TEXT    NOT NULL,  -- JSON array
    common_mistakes TEXT    NOT NULL,  -- JSON array
    rep_ranges      TEXT    NOT NULL   -- JSON object
  );

  CREATE TABLE IF NOT EXISTS workout_templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL,
    exercise_ids TEXT   NOT NULL  -- JSON array of exercise IDs
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id          INTEGER REFERENCES workout_templates(id),
    date                 TEXT    NOT NULL DEFAULT (date('now')),
    notes                TEXT,
    completed_at         TEXT,
    started_at           TEXT,
    duration_seconds     INTEGER,
    total_sets           INTEGER,
    total_sets_completed INTEGER
  );

  CREATE TABLE IF NOT EXISTS session_exercises (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id    INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id   INTEGER REFERENCES exercises(id),
    exercise_name TEXT    NOT NULL,
    muscle_group  TEXT,
    weight        REAL    NOT NULL DEFAULT 0,
    note          TEXT,
    sets_data     TEXT    NOT NULL DEFAULT '[]'
  );
`);

// Migrate existing sessions table if columns are absent
const sessionCols = db.prepare('PRAGMA table_info(sessions)').all().map((c) => c.name);
const addCol = (col, type) => {
  if (!sessionCols.includes(col))
    db.exec(`ALTER TABLE sessions ADD COLUMN ${col} ${type}`);
};
addCol('started_at',           'TEXT');
addCol('duration_seconds',     'INTEGER');
addCol('total_sets',           'INTEGER');
addCol('total_sets_completed', 'INTEGER');

// ── Seed helpers ─────────────────────────────────────────────────────────────

const insertExercise = db.prepare(`
  INSERT OR IGNORE INTO exercises (name, muscle_group, difficulty, form_cues, common_mistakes, rep_ranges)
  VALUES (@name, @muscle_group, @difficulty, @form_cues, @common_mistakes, @rep_ranges)
`);

const insertTemplate = db.prepare(`
  INSERT OR IGNORE INTO workout_templates (name, description, exercise_ids)
  VALUES (@name, @description, @exercise_ids)
`);

const j = (v) => JSON.stringify(v);

const EXERCISES = [
  // ── Chest ────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Bench Press',
    muscle_group: 'Chest',
    difficulty: 'intermediate',
    form_cues: j(['Retract and depress scapulae', 'Feet flat on floor', 'Bar path to lower chest', 'Wrists stacked over elbows']),
    common_mistakes: j(['Flaring elbows 90°', 'Bouncing bar off chest', 'Losing arch under heavy load']),
    rep_ranges: j({ strength: '3–5', hypertrophy: '6–12', endurance: '15–20' }),
  },
  {
    name: 'Dumbbell Incline Press',
    muscle_group: 'Chest',
    difficulty: 'intermediate',
    form_cues: j(['Set bench to 30–45°', 'Press in slight arc toward midline', 'Full stretch at bottom']),
    common_mistakes: j(['Bench angle too steep (becomes shoulder press)', 'Dumbbells drifting too wide']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '8–15', endurance: '15–20' }),
  },
  {
    name: 'Push-Up',
    muscle_group: 'Chest',
    difficulty: 'beginner',
    form_cues: j(['Hands just outside shoulder width', 'Rigid plank throughout', 'Chest touches floor']),
    common_mistakes: j(['Sagging hips', 'Partial range of motion', 'Flaring elbows excessively']),
    rep_ranges: j({ strength: '5–10', hypertrophy: '15–30', endurance: '30+' }),
  },
  {
    name: 'Cable Fly',
    muscle_group: 'Chest',
    difficulty: 'beginner',
    form_cues: j(['Slight elbow bend maintained throughout', 'Hinge at shoulder not elbow', 'Squeeze at full contraction']),
    common_mistakes: j(['Bending elbows and turning it into a press', 'Using momentum to swing weight']),
    rep_ranges: j({ strength: '8–10', hypertrophy: '12–20', endurance: '20–25' }),
  },
  // ── Back ─────────────────────────────────────────────────────────────────
  {
    name: 'Pull-Up',
    muscle_group: 'Back',
    difficulty: 'intermediate',
    form_cues: j(['Dead hang start', 'Pull elbows to hips', 'Chin clears bar', 'Control the descent']),
    common_mistakes: j(['Kipping without intent', 'Shrugging shoulders at top', 'Not achieving full hang']),
    rep_ranges: j({ strength: '3–5', hypertrophy: '6–12', endurance: '12–20' }),
  },
  {
    name: 'Barbell Bent-Over Row',
    muscle_group: 'Back',
    difficulty: 'intermediate',
    form_cues: j(['Hinge to ~45° torso angle', 'Pull bar to lower sternum', 'Squeeze shoulder blades at top']),
    common_mistakes: j(['Jerking with lower back', 'Too upright — becomes a shrug', 'Bar drifting away from body']),
    rep_ranges: j({ strength: '3–6', hypertrophy: '6–12', endurance: '12–15' }),
  },
  {
    name: 'Seated Cable Row',
    muscle_group: 'Back',
    difficulty: 'beginner',
    form_cues: j(['Neutral spine throughout', 'Pull to navel, elbows close', 'Pause and squeeze at peak contraction']),
    common_mistakes: j(['Rounding forward on the stretch', 'Using body momentum to row']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '10–15', endurance: '15–20' }),
  },
  {
    name: 'Lat Pulldown',
    muscle_group: 'Back',
    difficulty: 'beginner',
    form_cues: j(['Slight torso lean back', 'Pull bar to upper chest', 'Keep chest up throughout']),
    common_mistakes: j(['Pulling behind the neck', 'Leaning too far back (becomes a row)']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '10–15', endurance: '15–20' }),
  },
  // ── Shoulders ────────────────────────────────────────────────────────────
  {
    name: 'Barbell Overhead Press',
    muscle_group: 'Shoulders',
    difficulty: 'intermediate',
    form_cues: j(['Bar rests on front delts at start', 'Press in straight line over head', 'Move head back to allow bar path', 'Lock out at top']),
    common_mistakes: j(['Excessive lumbar extension', 'Bar drifting forward', 'Pressing in front of body']),
    rep_ranges: j({ strength: '3–5', hypertrophy: '6–10', endurance: '12–15' }),
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscle_group: 'Shoulders',
    difficulty: 'beginner',
    form_cues: j(['Slight forward lean', 'Pinkies slightly higher than thumbs', 'Stop at shoulder height']),
    common_mistakes: j(['Swinging weight with momentum', 'Shrugging traps at top', 'Going above shoulder height']),
    rep_ranges: j({ strength: '8–10', hypertrophy: '12–20', endurance: '20–30' }),
  },
  {
    name: 'Face Pull',
    muscle_group: 'Shoulders',
    difficulty: 'beginner',
    form_cues: j(['Rope at face height', 'Pull to forehead, elbows flared', 'Externally rotate at peak']),
    common_mistakes: j(['Pulling to chest instead of face', 'Not achieving external rotation']),
    rep_ranges: j({ strength: '10–12', hypertrophy: '15–20', endurance: '20–25' }),
  },
  // ── Legs ─────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Back Squat',
    muscle_group: 'Legs',
    difficulty: 'advanced',
    form_cues: j(['Bar on traps, chest up', 'Brace core before descent', 'Knees track over toes', 'Hip crease below parallel']),
    common_mistakes: j(['Knee cave under load', 'Butt wink at depth', 'Forward torso lean', 'Rising on toes']),
    rep_ranges: j({ strength: '1–5', hypertrophy: '6–12', endurance: '15–20' }),
  },
  {
    name: 'Romanian Deadlift',
    muscle_group: 'Legs',
    difficulty: 'intermediate',
    form_cues: j(['Micro-bend in knees', 'Push hips back, not down', 'Bar stays close to legs', 'Feel hamstring stretch']),
    common_mistakes: j(['Squatting the weight down', 'Rounding lower back', 'Bar drifting forward']),
    rep_ranges: j({ strength: '4–6', hypertrophy: '8–12', endurance: '12–15' }),
  },
  {
    name: 'Leg Press',
    muscle_group: 'Legs',
    difficulty: 'beginner',
    form_cues: j(['Feet shoulder-width, mid-plate', 'Lower until 90° knee angle', 'Do not lock knees at top']),
    common_mistakes: j(['Lifting hips off seat', 'Knees caving inward', 'Locking out and resting at top']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '10–15', endurance: '15–25' }),
  },
  {
    name: 'Bulgarian Split Squat',
    muscle_group: 'Legs',
    difficulty: 'intermediate',
    form_cues: j(['Rear foot elevated on bench', 'Front shin vertical', 'Descend straight down', 'Drive through front heel']),
    common_mistakes: j(['Front foot too close (shin tips forward)', 'Leaning excessively forward']),
    rep_ranges: j({ strength: '4–6', hypertrophy: '8–12', endurance: '12–20' }),
  },
  {
    name: 'Lying Leg Curl',
    muscle_group: 'Legs',
    difficulty: 'beginner',
    form_cues: j(['Hips pressed into pad', 'Full extension at start', 'Curl until fully contracted']),
    common_mistakes: j(['Hips lifting off pad', 'Using momentum to swing weight']),
    rep_ranges: j({ strength: '6–8', hypertrophy: '10–15', endurance: '15–20' }),
  },
  // ── Arms ─────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Curl',
    muscle_group: 'Arms',
    difficulty: 'beginner',
    form_cues: j(['Elbows pinned to sides', 'Full extension at bottom', 'Squeeze at top']),
    common_mistakes: j(['Swinging torso', 'Elbows drifting forward', 'Incomplete range of motion']),
    rep_ranges: j({ strength: '4–6', hypertrophy: '8–12', endurance: '15–20' }),
  },
  {
    name: 'Tricep Dip',
    muscle_group: 'Arms',
    difficulty: 'intermediate',
    form_cues: j(['Upright torso for tricep focus', 'Elbows track straight back', 'Lower until upper arms parallel']),
    common_mistakes: j(['Leaning too far forward (shifts load to chest)', 'Not reaching full depth']),
    rep_ranges: j({ strength: '4–6', hypertrophy: '8–15', endurance: '15–20' }),
  },
  {
    name: 'Hammer Curl',
    muscle_group: 'Arms',
    difficulty: 'beginner',
    form_cues: j(['Neutral grip (thumbs up)', 'Elbows fixed at sides', 'Controlled descent']),
    common_mistakes: j(['Swinging elbows forward', 'Rushing the eccentric']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '10–15', endurance: '15–20' }),
  },
  // ── Core ─────────────────────────────────────────────────────────────────
  {
    name: 'Plank',
    muscle_group: 'Core',
    difficulty: 'beginner',
    form_cues: j(['Forearms on floor, elbows under shoulders', 'Neutral spine', 'Squeeze glutes and abs']),
    common_mistakes: j(['Hips too high or sagging', 'Holding breath']),
    rep_ranges: j({ strength: '20–30s', hypertrophy: '45–60s', endurance: '60–120s' }),
  },
  {
    name: 'Hanging Leg Raise',
    muscle_group: 'Core',
    difficulty: 'intermediate',
    form_cues: j(['Dead hang start', 'Posterior pelvic tilt before raising', 'Control the descent']),
    common_mistakes: j(['Swinging with momentum', 'Only raising to 90° without pelvic tilt']),
    rep_ranges: j({ strength: '5–8', hypertrophy: '10–15', endurance: '15–20' }),
  },
];

// ── Run seed inside a transaction ────────────────────────────────────────────

const seedAll = db.transaction(() => {
  for (const ex of EXERCISES) insertExercise.run(ex);

  // Fetch IDs by name for template wiring
  const id = (name) => db.prepare('SELECT id FROM exercises WHERE name = ?').get(name).id;

  const TEMPLATES = [
    {
      name: 'Push Day',
      description: 'Chest, shoulders, and triceps. Volume-focused.',
      exercise_ids: j([
        id('Barbell Bench Press'),
        id('Dumbbell Incline Press'),
        id('Barbell Overhead Press'),
        id('Dumbbell Lateral Raise'),
        id('Cable Fly'),
        id('Tricep Dip'),
      ]),
    },
    {
      name: 'Pull Day',
      description: 'Back and biceps. Full range pulling patterns.',
      exercise_ids: j([
        id('Pull-Up'),
        id('Barbell Bent-Over Row'),
        id('Seated Cable Row'),
        id('Lat Pulldown'),
        id('Face Pull'),
        id('Barbell Curl'),
        id('Hammer Curl'),
      ]),
    },
    {
      name: 'Leg Day',
      description: 'Quad, hamstring, and glute compound work.',
      exercise_ids: j([
        id('Barbell Back Squat'),
        id('Romanian Deadlift'),
        id('Bulgarian Split Squat'),
        id('Leg Press'),
        id('Lying Leg Curl'),
      ]),
    },
    {
      name: 'Upper Body',
      description: 'Balanced push and pull for upper body days.',
      exercise_ids: j([
        id('Barbell Bench Press'),
        id('Barbell Bent-Over Row'),
        id('Barbell Overhead Press'),
        id('Pull-Up'),
        id('Dumbbell Lateral Raise'),
        id('Barbell Curl'),
        id('Tricep Dip'),
      ]),
    },
    {
      name: 'Full Body',
      description: 'One compound per pattern. Efficient total-body session.',
      exercise_ids: j([
        id('Barbell Back Squat'),
        id('Barbell Bench Press'),
        id('Barbell Bent-Over Row'),
        id('Barbell Overhead Press'),
        id('Romanian Deadlift'),
        id('Plank'),
      ]),
    },
  ];

  for (const t of TEMPLATES) insertTemplate.run(t);
});

seedAll();

// ── Console preview on startup ───────────────────────────────────────────────

function printSeedSummary() {
  const exercises = db.prepare('SELECT id, name, muscle_group, difficulty FROM exercises ORDER BY id').all();
  const templates = db.prepare('SELECT id, name, exercise_ids FROM workout_templates ORDER BY id').all();

  console.log('\n━━━  PUSH DATABASE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n  EXERCISES (${exercises.length})\n`);

  const groups = {};
  for (const ex of exercises) {
    if (!groups[ex.muscle_group]) groups[ex.muscle_group] = [];
    groups[ex.muscle_group].push(ex);
  }
  for (const [group, list] of Object.entries(groups)) {
    console.log(`  ${group}`);
    for (const ex of list) {
      const diff = ex.difficulty.padEnd(12);
      console.log(`    [${String(ex.id).padStart(2)}]  ${diff}  ${ex.name}`);
    }
  }

  console.log(`\n  WORKOUT TEMPLATES (${templates.length})\n`);
  for (const t of templates) {
    const ids = JSON.parse(t.exercise_ids);
    console.log(`  [${t.id}]  ${t.name}  →  exercises [${ids.join(', ')}]`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

printSeedSummary();

module.exports = db;
