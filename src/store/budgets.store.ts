import { create } from "zustand";
import type { Budget } from "@/types";
import { createId } from "@/lib/id";
import { round2 } from "@/lib/money";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

interface BudgetsState {
  budgets: Budget[];
  hydrated: boolean;
  hydrate: () => void;
  /** category 为 "" 表示整体预算；同分类重复设置时覆盖。 */
  upsert: (category: string, monthlyLimit: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (budgets: Budget[]) => void;
}

const persist = (budgets: Budget[]): void => {
  writeJSON(STORAGE_KEYS.budgets, budgets);
};

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ budgets: readJSON<Budget[]>(STORAGE_KEYS.budgets, []), hydrated: true });
  },

  upsert: (category, monthlyLimit) => {
    const key = category || "";
    const existing = get().budgets.find((b) => b.category === key);
    const budgets = existing
      ? get().budgets.map((b) => (b.id === existing.id ? { ...b, monthlyLimit: round2(monthlyLimit) } : b))
      : [...get().budgets, { id: createId(), category: key, monthlyLimit: round2(monthlyLimit) }];
    persist(budgets);
    set({ budgets });
  },

  remove: (id) => {
    const budgets = get().budgets.filter((b) => b.id !== id);
    persist(budgets);
    set({ budgets });
  },

  clear: () => {
    persist([]);
    set({ budgets: [] });
  },

  replaceAll: (budgets) => {
    persist(budgets);
    set({ budgets, hydrated: true });
  },
}));
