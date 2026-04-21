const TEMPLATES = [
  {
    id: 1,
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps. Volume-focused.',
    exercise_ids: [1, 2, 9, 10, 4, 18],
  },
  {
    id: 2,
    name: 'Pull Day',
    description: 'Back and biceps. Full range pulling patterns.',
    exercise_ids: [5, 6, 7, 8, 11, 17, 19],
  },
  {
    id: 3,
    name: 'Leg Day',
    description: 'Quad, hamstring, and glute compound work.',
    exercise_ids: [12, 13, 15, 14, 16],
  },
  {
    id: 4,
    name: 'Upper Body',
    description: 'Balanced push and pull for upper body days.',
    exercise_ids: [1, 6, 9, 5, 10, 17, 18],
  },
  {
    id: 5,
    name: 'Full Body',
    description: 'One compound per pattern. Efficient total-body session.',
    exercise_ids: [12, 1, 6, 9, 13, 20],
  },
];

export default TEMPLATES;
