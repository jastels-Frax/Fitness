import { create } from 'zustand';

const SETS_PER_EXERCISE = 3;

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
      sets:     Object.fromEntries(exercises.map((e) => [e.id, Array(SETS_PER_EXERCISE).fill(false)])),
      weights:  Object.fromEntries(exercises.map((e) => [e.id, 0])),
      notes:    Object.fromEntries(exercises.map((e) => [e.id, ''])),
      noteOpen: Object.fromEntries(exercises.map((e) => [e.id, false])),
    }),

  toggleSet: (exId, idx) =>
    set((s) => {
      const next = s.sets[exId].map((v, i) => (i === idx ? !v : v));
      return {
        sets: { ...s.sets, [exId]: next },
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
