import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export default create(
  persist(
    (set, get) => ({
      templates: [],

      save: (template) =>
        set((s) => ({
          templates: s.templates.some((t) => t.id === template.id)
            ? s.templates.map((t) => (t.id === template.id ? template : t))
            : [...s.templates, template],
        })),

      remove: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      duplicate: (id) => {
        const t = get().templates.find((t) => t.id === id);
        if (!t) return;
        set((s) => ({
          templates: [
            ...s.templates,
            { ...t, id: Date.now(), name: `${t.name} (copy)`, created_at: new Date().toISOString() },
          ],
        }));
      },
    }),
    { name: 'push-custom-templates' }
  )
);
