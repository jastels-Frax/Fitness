import { create } from 'zustand';

export default create((set) => ({
  template:  null,
  exercises: [],
  startedAt: null,
  sets:      {},     // { [exId]: boolean[] }
  weights:   {},     // { [exId]: number }
  notes:     {},     // { [exId]: string }
  noteOpen:  {},     // { [exId]: boolean }
  restTimer: null,   // { endsAt, durationMs, label }

  startSession: (template, exercises) =>
    set({
      template,
      exercises,
      startedAt: null,
      restTimer: null,
      sets:     Object.fromEntries(exercises.map((e) => [e.id, Array(e.num_sets ?? 3).fill(false)])),
      weights:  Object.fromEntries(exercises.map((e) => [e.id, 0])),
      notes:    Object.fromEntries(exercises.map((e) => [e.id, ''])),
      noteOpen: Object.fromEntries(exercises.map((e) => [e.id, false])),
    }),

  addExercise: (exercise) =>
    set((s) => ({
      exercises: [...s.exercises, exercise],
      sets:      { ...s.sets,     [exercise.id]: Array(exercise.num_sets ?? 3).fill(false) },
      weights:   { ...s.weights,  [exercise.id]: 0 },
      notes:     { ...s.notes,    [exercise.id]: '' },
      noteOpen:  { ...s.noteOpen, [exercise.id]: false },
    })),

  swapExercise: (oldId, newExercise) =>
    set((s) => {
      const oldSets     = s.sets[oldId]     ?? [];
      const oldWeight   = s.weights[oldId]  ?? 0;
      const oldNote     = s.notes[oldId]    ?? '';
      const oldNoteOpen = s.noteOpen[oldId] ?? false;

      const newSetsMap     = { ...s.sets };
      const newWeightsMap  = { ...s.weights };
      const newNotesMap    = { ...s.notes };
      const newNoteOpenMap = { ...s.noteOpen };
      delete newSetsMap[oldId];
      delete newWeightsMap[oldId];
      delete newNotesMap[oldId];
      delete newNoteOpenMap[oldId];

      // Carry over old tracking data, pad/trim sets to new exercise's count
      const targetSets = newExercise.num_sets ?? 3;
      const carriedSets = oldSets.length
        ? [...oldSets.slice(0, targetSets), ...Array(Math.max(0, targetSets - oldSets.length)).fill(false)]
        : Array(targetSets).fill(false);

      return {
        exercises:  s.exercises.map((ex) => (ex.id === oldId ? newExercise : ex)),
        sets:       { ...newSetsMap,     [newExercise.id]: carriedSets },
        weights:    { ...newWeightsMap,  [newExercise.id]: oldWeight },
        notes:      { ...newNotesMap,    [newExercise.id]: oldNote },
        noteOpen:   { ...newNoteOpenMap, [newExercise.id]: oldNoteOpen },
      };
    }),

  toggleSet: (exId, idx) =>
    set((s) => {
      const next = s.sets[exId].map((v, i) => (i === idx ? !v : v));
      return {
        sets:      { ...s.sets, [exId]: next },
        startedAt: s.startedAt ?? (next[idx] ? Date.now() : null),
      };
    }),

  setWeight: (exId, w) =>
    set((s) => ({ weights: { ...s.weights, [exId]: Math.max(0, w) } })),

  toggleNote: (exId) =>
    set((s) => ({ noteOpen: { ...s.noteOpen, [exId]: !s.noteOpen[exId] } })),

  setNote: (exId, text) =>
    set((s) => ({ notes: { ...s.notes, [exId]: text } })),

  startRestTimer: (seconds, label) =>
    set({ restTimer: { endsAt: Date.now() + seconds * 1000, durationMs: seconds * 1000, label } }),

  cancelRestTimer: () => set({ restTimer: null }),

  clearSession: () =>
    set({
      template: null, exercises: [], startedAt: null, restTimer: null,
      sets: {}, weights: {}, notes: {}, noteOpen: {},
    }),
}));
