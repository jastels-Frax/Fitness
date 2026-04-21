import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export default create(
  persist(
    (set) => ({
      unit: 'lbs',
      setUnit: (unit) => set({ unit }),
    }),
    { name: 'push-settings' }
  )
);
