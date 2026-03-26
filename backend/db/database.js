const Database = require('better-sqlite3');
const path = require('path');
const { seed } = require('./seed');

const DB_PATH = path.join(__dirname, '../../push.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    form_cues TEXT NOT NULL,
    common_mistakes TEXT NOT NULL,
    rep_ranges TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_type TEXT NOT NULL,
    focus TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL,
    exercises TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    template_id INTEGER,
    template_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    total_sets INTEGER NOT NULL,
    completed_sets INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS session_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL DEFAULT 0,
    reps TEXT DEFAULT '',
    completed INTEGER DEFAULT 0
  );
`);

const count = db.prepare('SELECT COUNT(*) as count FROM exercises').get();
if (count.count === 0) {
  seed(db);
  console.log('Database seeded successfully.');
}

module.exports = db;
