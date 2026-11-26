import { create } from "zustand";
import type { Habit, HabitInput } from "@/types";
import { createId } from "@/lib/id";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

interface HabitsState {
  habits: Habit[];
  hydrated: boolean;
  hydrate: () => void;
  create: (input: HabitInput) => Habit;
  update: (id: string, patch: HabitInput) => void;
  remove: (id: string) => void;
  /** 切换某日打卡，返回切换后是否已打卡。 */
  toggle: (id: string, date: string) => boolean;
  clear: () => void;
  replaceAll: (habits: Habit[]) => void;
}

const persist = (habits: Habit[]): void => {
  writeJSON(STORAGE_KEYS.habits, habits);
};

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readJSON<Habit[]>(STORAGE_KEYS.habits, []);
    set({
      habits: stored.map((h) => ({
        ...h,
        weeklyTarget: Number(h.weeklyTarget) || 0,
        checkins: [...new Set(h.checkins ?? [])].sort(),
      })),
      hydrated: true,
    });
  },

  create: (input) => {
    const habit: Habit = {
      ...input,
      weeklyTarget: Number(input.weeklyTarget) || 0,
      id: createId(),
      checkins: [],
    };
    const habits = [...get().habits, habit];
    persist(habits);
    set({ habits });
    return habit;
  },

  update: (id, patch) => {
    const habits = get().habits.map((h) =>
      h.id === id ? { ...h, ...patch, weeklyTarget: Number(patch.weeklyTarget) || 0 } : h,
    );
    persist(habits);
    set({ habits });
  },

  remove: (id) => {
    const habits = get().habits.filter((h) => h.id !== id);
    persist(habits);
    set({ habits });
  },

  toggle: (id, date) => {
    let checked = false;
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h;
      const set2 = new Set(h.checkins);
      if (set2.has(date)) set2.delete(date);
      else { set2.add(date); checked = true; }
      return { ...h, checkins: [...set2].sort() };
    });
    persist(habits);
    set({ habits });
    return checked;
  },

  clear: () => {
    persist([]);
    set({ habits: [] });
  },

  replaceAll: (habits) => {
    const normalized = habits.map((h) => ({
      ...h,
      weeklyTarget: Number(h.weeklyTarget) || 0,
      checkins: [...new Set(h.checkins ?? [])].sort(),
    }));
    persist(normalized);
    set({ habits: normalized, hydrated: true });
  },
}));
