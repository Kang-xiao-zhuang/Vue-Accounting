import { create } from "zustand";
import type { RecurringInput, RecurringRule } from "@/types";
import { createId } from "@/lib/id";
import { materializeDue } from "@/lib/recurring";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { todayString } from "@/utils/date";
import { useRecordsStore } from "./records.store";

interface RulesState {
  rules: RecurringRule[];
  hydrated: boolean;
  hydrate: () => void;
  create: (input: RecurringInput) => RecurringRule;
  update: (id: string, patch: RecurringInput) => void;
  remove: (id: string) => void;
  /** 补齐到期记录（替代旧后端的定时任务），返回新增条数。 */
  runDue: (today?: string) => number;
  clear: () => void;
  replaceAll: (rules: RecurringRule[]) => void;
}

const persist = (rules: RecurringRule[]): void => {
  writeJSON(STORAGE_KEYS.rules, rules);
};

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readJSON<RecurringRule[]>(STORAGE_KEYS.rules, []);
    set({
      rules: stored.map((r) => ({ ...r, amount: Number(r.amount) || 0 })),
      hydrated: true,
    });
  },

  create: (input) => {
    const rule: RecurringRule = {
      ...input,
      id: createId(),
      amount: Math.round(Number(input.amount) * 100) / 100,
      category: input.category.trim(),
      note: input.note?.trim() ?? "",
      frequency: input.frequency,
    };
    const rules = [...get().rules, rule];
    persist(rules);
    set({ rules });
    return rule;
  },

  update: (id, patch) => {
    const rules = get().rules.map((r) =>
      r.id === id
        ? {
            ...r,
            ...patch,
            amount: Math.round(Number(patch.amount) * 100) / 100,
            category: patch.category.trim(),
            note: patch.note?.trim() ?? "",
          }
        : r,
    );
    persist(rules);
    set({ rules });
  },

  remove: (id) => {
    const rules = get().rules.filter((r) => r.id !== id);
    persist(rules);
    set({ rules });
  },

  runDue: (today = todayString()) => {
    const { rules, records } = materializeDue(get().rules, today);
    if (!records.length) return 0;
    // 先写规则再写记录；若写入失败会有全局告警，恢复后再次执行即可幂等。
    persist(rules);
    const recordStore = useRecordsStore.getState();
    recordStore.replaceAll([...records, ...recordStore.records]);
    set({ rules });
    return records.length;
  },

  clear: () => {
    persist([]);
    set({ rules: [] });
  },

  replaceAll: (rules) => {
    const normalized = rules.map((r) => ({ ...r, amount: Number(r.amount) || 0 }));
    persist(normalized);
    set({ rules: normalized, hydrated: true });
  },
}));
