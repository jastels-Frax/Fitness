import EXERCISES from './data/exercises';
import TEMPLATES from './data/templates';
import historyStore from './store/historyStore';

const exMap = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
const tmMap = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

export function getExercises() {
  return Promise.resolve(
    [...EXERCISES].sort((a, b) =>
      a.muscle_group !== b.muscle_group
        ? a.muscle_group.localeCompare(b.muscle_group)
        : a.name.localeCompare(b.name)
    )
  );
}

export function getExercise(id) {
  const ex = exMap[Number(id)];
  return ex ? Promise.resolve(ex) : Promise.reject(new Error('Exercise not found'));
}

export function getTemplates() {
  return Promise.resolve(
    TEMPLATES.map((t) => {
      const exs = t.exercise_ids.map((id) => exMap[id]).filter(Boolean);
      const muscle_groups = [...new Set(exs.map((e) => e.muscle_group))];
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        muscle_groups,
        exercise_count: t.exercise_ids.length,
        estimated_minutes: t.exercise_ids.length * 10,
      };
    })
  );
}

export function getTemplate(id) {
  const t = tmMap[Number(id)];
  if (!t) return Promise.reject(new Error('Template not found'));
  const exercises = t.exercise_ids.map((eid) => exMap[eid]).filter(Boolean);
  return Promise.resolve({ ...t, exercises });
}

export function getSessions() {
  const { sessions } = historyStore.getState();
  return Promise.resolve(
    [...sessions].reverse().map(({ exercises: _ex, ...summary }) => summary)
  );
}

export function getSession(id) {
  const { sessions } = historyStore.getState();
  const session = sessions.find((s) => s.id === Number(id));
  return session ? Promise.resolve(session) : Promise.reject(new Error('Session not found'));
}

export function saveSession(data) {
  const { addSession } = historyStore.getState();
  const id = Date.now();
  const tmpl = tmMap[data.template_id];
  addSession({
    id,
    template_id:          data.template_id ?? null,
    template_name:        tmpl?.name ?? 'Custom Workout',
    date:                 new Date().toISOString().slice(0, 10),
    notes:                data.notes ?? null,
    completed_at:         new Date().toISOString(),
    started_at:           data.started_at ?? null,
    duration_seconds:     data.duration_seconds ?? null,
    total_sets:           data.total_sets ?? null,
    total_sets_completed: data.total_sets_completed ?? null,
    exercises: (data.exercises ?? []).map((ex, i) => ({
      id:            id + i + 1,
      session_id:    id,
      exercise_id:   ex.exercise_id ?? null,
      exercise_name: ex.exercise_name,
      muscle_group:  ex.muscle_group ?? null,
      weight:        ex.weight ?? 0,
      note:          ex.note || null,
      sets_data:     ex.sets ?? [],
    })),
  });
  return Promise.resolve({ id });
}

export function deleteSession(id) {
  historyStore.getState().removeSession(Number(id));
  return Promise.resolve({ ok: true });
}

export function deleteAllSessions() {
  historyStore.getState().clearAll();
  return Promise.resolve({ ok: true });
}

export function getExerciseMetrics(id) {
  const exId = Number(id);
  const exercise = exMap[exId];
  if (!exercise) return Promise.reject(new Error('Exercise not found'));

  const { sessions } = historyStore.getState();
  const history = [];
  for (const session of sessions) {
    for (const ex of session.exercises ?? []) {
      if (ex.exercise_id === exId) {
        const done = (ex.sets_data ?? []).filter(Boolean).length;
        history.push({ date: session.date, weight: ex.weight, volume: ex.weight * done, sets_done: done });
      }
    }
  }
  history.sort((a, b) => a.date.localeCompare(b.date));
  const personal_best = history.length ? Math.max(...history.map((h) => h.weight)) : 0;
  return Promise.resolve({ exercise, history, personal_best });
}

export function getOverviewMetrics() {
  const { sessions } = historyStore.getState();
  let total_volume = 0;
  const muscleTotals = {};
  const dateSet = new Set();

  for (const session of sessions) {
    if (session.date) dateSet.add(session.date);
    for (const ex of session.exercises ?? []) {
      const done = (ex.sets_data ?? []).filter(Boolean).length;
      total_volume += ex.weight * done;
      if (ex.muscle_group) muscleTotals[ex.muscle_group] = (muscleTotals[ex.muscle_group] || 0) + done;
    }
  }

  const most_trained_muscle = Object.entries(muscleTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let current_streak = 0;
  if (dateSet.size) {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    let cursor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;
    if (cursor) {
      current_streak = 1;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      while (dateSet.has(d.toISOString().slice(0, 10))) {
        current_streak++;
        d.setDate(d.getDate() - 1);
      }
    }
  }

  return Promise.resolve({
    total_sessions:      sessions.length,
    total_volume:        Math.round(total_volume),
    most_trained_muscle,
    current_streak,
  });
}
