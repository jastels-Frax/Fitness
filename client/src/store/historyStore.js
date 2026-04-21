import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export default create(
  persist(
    (set) => ({
      sessions: [],
      addSession:    (session) => set((s) => ({ sessions: [...s.sessions, session] })),
      removeSession: (id)      => set((s) => ({ sessions: s.sessions.filter((s) => s.id !== id) })),
      clearAll:      ()        => set({ sessions: [] }),
    }),
    { name: 'push-history' }
  )
);
