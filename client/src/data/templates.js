const TEMPLATES = [
  // ── Push Day ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Push Day — Strength',
    group: 'Push Day',
    description: 'Heavy compound pressing. Low volume, max intensity.',
    exercises: [
      { exercise_id: 1,  num_sets: 5, reps_target: '3–5' },
      { exercise_id: 9,  num_sets: 4, reps_target: '3–5' },
      { exercise_id: 2,  num_sets: 3, reps_target: '5–8' },
      { exercise_id: 18, num_sets: 3, reps_target: '5–8' },
      { exercise_id: 3,  num_sets: 2, reps_target: '10–15' },
    ],
  },
  {
    id: 2,
    name: 'Push Day — Hypertrophy',
    group: 'Push Day',
    description: 'Volume-focused pushing. More exercises, moderate weight.',
    exercises: [
      { exercise_id: 1,  num_sets: 4, reps_target: '8–12' },
      { exercise_id: 2,  num_sets: 4, reps_target: '10–15' },
      { exercise_id: 9,  num_sets: 3, reps_target: '8–12' },
      { exercise_id: 4,  num_sets: 4, reps_target: '12–20' },
      { exercise_id: 10, num_sets: 4, reps_target: '15–20' },
      { exercise_id: 18, num_sets: 3, reps_target: '10–15' },
    ],
  },
  // ── Pull Day ──────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'Pull Day — Strength',
    group: 'Pull Day',
    description: 'Heavy pulling. Pull-up and barbell row dominant.',
    exercises: [
      { exercise_id: 5,  num_sets: 5, reps_target: '3–5' },
      { exercise_id: 6,  num_sets: 4, reps_target: '3–6' },
      { exercise_id: 8,  num_sets: 3, reps_target: '5–8' },
      { exercise_id: 11, num_sets: 3, reps_target: '10–12' },
      { exercise_id: 17, num_sets: 3, reps_target: '4–6' },
    ],
  },
  {
    id: 4,
    name: 'Pull Day — Hypertrophy',
    group: 'Pull Day',
    description: 'High-volume back and biceps. Cable and row emphasis.',
    exercises: [
      { exercise_id: 5,  num_sets: 4, reps_target: '6–12' },
      { exercise_id: 6,  num_sets: 3, reps_target: '8–12' },
      { exercise_id: 7,  num_sets: 4, reps_target: '10–15' },
      { exercise_id: 8,  num_sets: 4, reps_target: '10–15' },
      { exercise_id: 11, num_sets: 4, reps_target: '15–20' },
      { exercise_id: 17, num_sets: 4, reps_target: '8–12' },
      { exercise_id: 19, num_sets: 3, reps_target: '10–15' },
    ],
  },
  // ── Leg Day ───────────────────────────────────────────────────────────────
  {
    id: 5,
    name: 'Leg Day — Squat Focus',
    group: 'Leg Day',
    description: 'Squat-dominant. Quad strength and hypertrophy.',
    exercises: [
      { exercise_id: 12, num_sets: 5, reps_target: '5–8' },
      { exercise_id: 15, num_sets: 3, reps_target: '8–12' },
      { exercise_id: 14, num_sets: 4, reps_target: '10–15' },
      { exercise_id: 16, num_sets: 3, reps_target: '10–15' },
    ],
  },
  {
    id: 6,
    name: 'Leg Day — Hinge Focus',
    group: 'Leg Day',
    description: 'Hip-hinge dominant. Hamstring and glute emphasis.',
    exercises: [
      { exercise_id: 13, num_sets: 4, reps_target: '6–10' },
      { exercise_id: 16, num_sets: 4, reps_target: '10–15' },
      { exercise_id: 15, num_sets: 3, reps_target: '10–12' },
      { exercise_id: 12, num_sets: 3, reps_target: '6–10' },
      { exercise_id: 14, num_sets: 3, reps_target: '15–20' },
    ],
  },
  // ── Lower + Push ──────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Lower + Push — Balanced',
    group: 'Lower + Push',
    description: 'Equal split of legs and pressing. Efficient and complete.',
    exercises: [
      { exercise_id: 12, num_sets: 4, reps_target: '6–10' },
      { exercise_id: 1,  num_sets: 4, reps_target: '6–10' },
      { exercise_id: 13, num_sets: 3, reps_target: '8–12' },
      { exercise_id: 2,  num_sets: 3, reps_target: '10–15' },
      { exercise_id: 10, num_sets: 3, reps_target: '15–20' },
    ],
  },
  {
    id: 8,
    name: 'Lower + Push — Leg Heavy',
    group: 'Lower + Push',
    description: 'Legs first, press as finisher. Quad and hamstring focus.',
    exercises: [
      { exercise_id: 12, num_sets: 5, reps_target: '3–5' },
      { exercise_id: 13, num_sets: 4, reps_target: '6–10' },
      { exercise_id: 15, num_sets: 4, reps_target: '8–12' },
      { exercise_id: 14, num_sets: 4, reps_target: '12–15' },
      { exercise_id: 2,  num_sets: 2, reps_target: '10–12' },
    ],
  },
  // ── Push + Legs ───────────────────────────────────────────────────────────
  {
    id: 9,
    name: 'Push + Legs — Push Heavy',
    group: 'Push + Legs',
    description: 'Press-dominant session with legs as secondary work.',
    exercises: [
      { exercise_id: 1,  num_sets: 5, reps_target: '3–5' },
      { exercise_id: 9,  num_sets: 4, reps_target: '5–8' },
      { exercise_id: 2,  num_sets: 4, reps_target: '8–12' },
      { exercise_id: 12, num_sets: 3, reps_target: '6–10' },
      { exercise_id: 16, num_sets: 3, reps_target: '10–15' },
    ],
  },
  {
    id: 10,
    name: 'Push + Legs — Balanced',
    group: 'Push + Legs',
    description: 'Chest, shoulders, and legs in equal measure.',
    exercises: [
      { exercise_id: 1,  num_sets: 4, reps_target: '6–10' },
      { exercise_id: 9,  num_sets: 3, reps_target: '8–12' },
      { exercise_id: 12, num_sets: 4, reps_target: '6–10' },
      { exercise_id: 13, num_sets: 3, reps_target: '8–12' },
      { exercise_id: 10, num_sets: 3, reps_target: '15–20' },
      { exercise_id: 14, num_sets: 3, reps_target: '12–15' },
    ],
  },
  // ── Full Body ─────────────────────────────────────────────────────────────
  {
    id: 11,
    name: 'Full Body — Strength',
    group: 'Full Body',
    description: 'One heavy compound per pattern. Maximum strength carryover.',
    exercises: [
      { exercise_id: 12, num_sets: 5, reps_target: '3–5' },
      { exercise_id: 1,  num_sets: 4, reps_target: '3–5' },
      { exercise_id: 6,  num_sets: 4, reps_target: '3–6' },
      { exercise_id: 9,  num_sets: 3, reps_target: '5–8' },
      { exercise_id: 13, num_sets: 3, reps_target: '5–8' },
    ],
  },
  {
    id: 12,
    name: 'Full Body — Volume',
    group: 'Full Body',
    description: 'Higher reps, more variety. Good for general fitness days.',
    exercises: [
      { exercise_id: 12, num_sets: 4, reps_target: '8–12' },
      { exercise_id: 1,  num_sets: 4, reps_target: '8–12' },
      { exercise_id: 6,  num_sets: 4, reps_target: '8–12' },
      { exercise_id: 9,  num_sets: 3, reps_target: '10–15' },
      { exercise_id: 13, num_sets: 3, reps_target: '10–12' },
      { exercise_id: 5,  num_sets: 3, reps_target: '8–12' },
      { exercise_id: 10, num_sets: 3, reps_target: '15–20' },
      { exercise_id: 20, num_sets: 3, reps_target: '45–60s' },
    ],
  },
  // ── Ab Circuit ────────────────────────────────────────────────────────────
  {
    id: 13,
    name: 'Ab Circuit — Weighted',
    group: 'Ab Circuit',
    description: 'Core work with added resistance. Hanging raises and loaded holds.',
    exercises: [
      { exercise_id: 21, num_sets: 4, reps_target: '10–15' },
      { exercise_id: 20, num_sets: 5, reps_target: '45–60s' },
    ],
  },
  {
    id: 14,
    name: 'Ab Circuit — Bodyweight',
    group: 'Ab Circuit',
    description: 'High-rep bodyweight core circuit. No equipment needed.',
    exercises: [
      { exercise_id: 21, num_sets: 4, reps_target: '15–20' },
      { exercise_id: 3,  num_sets: 4, reps_target: '20–30' },
      { exercise_id: 20, num_sets: 4, reps_target: '60–120s' },
    ],
  },
];

export default TEMPLATES;
