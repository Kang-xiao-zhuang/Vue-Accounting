import { create } from "zustand";
import type { LedgerRecord, Period, RecordInput } from "@/types";
import { createId } from "@/lib/id";
import { round2 } from "@/lib/money";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { fmt, parseDate, shiftDays, shiftMonth, todayString } from "@/utils/date";

interface RecordsState {
  records: LedgerRecord[];
  hydrated: boolean;
  period: Period;
  anchor: string;
  today: string;
  hydrate: () => void;
  setPeriod: (period: Period) => void;
  shift: (dir: number) => void;
  goToday: () => void;
  create: (input: RecordInput) => LedgerRecord;
  update: (id: string, patch: Partial<RecordInput>) => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (records: LedgerRecord[]) => void;
}

/** 写入立即落盘：记账是低频操作，避免延迟写期间进程被杀导致丢账。 */
const persist = (records: LedgerRecord[]): void => {
  writeJSON(STORAGE_KEYS.records, records);
};

const sortRecords = (records: LedgerRecord[]): LedgerRecord[] =>
  [...records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1));

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  hydrated: false,
  period: "day",
  anchor: todayString(),
  today: todayString(),

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readJSON<LedgerRecord[]>(STORAGE_KEYS.records, []);
    set({ records: sortRecords(stored), hydrated: true, today: todayString() });
  },

  setPeriod: (period) => set({ period }),
  shift: (dir) => {
    const { period, anchor } = get();
    if (period === "all") return;
    const next = period === "day" ? shiftDays(anchor, dir)
      : period === "week" ? shiftDays(anchor, dir * 7)
      : shiftMonth(anchor, dir);
    set({ anchor: next });
  },
  goToday: () => set({ anchor: todayString(), today: todayString() }),

  create: (input) => {
    const record: LedgerRecord = {
      ...input,
      amount: round2(input.amount),
      note: input.note ?? "",
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    const records = sortRecords([record, ...get().records]);
    persist(records);
    set({ records });
    return record;
  },

  update: (id, patch) => {
    const records = sortRecords(get().records.map((r) =>
      r.id === id ? { ...r, ...patch, amount: patch.amount === undefined ? r.amount : round2(patch.amount) } : r,
    ));
    persist(records);
    set({ records });
  },

  remove: (id) => {
    const records = get().records.filter((r) => r.id !== id);
    persist(records);
    set({ records });
  },

  clear: () => {
    persist([]);
    set({ records: [] });
  },

  replaceAll: (records) => {
    const sorted = sortRecords(records);
    persist(sorted);
    set({ records: sorted, hydrated: true });
  },
}));

/** 供测试与备份使用：不依赖 React 的静态读取。 */
export function readStoredRecords(): LedgerRecord[] {
  return readJSON<LedgerRecord[]>(STORAGE_KEYS.records, []);
}

/** 周期范围文本（供 PeriodNav 展示，保持与 v1.x 一致的格式）。 */
export function periodRangeLabel(period: Period, anchor: string): string {
  if (period === "day") return anchor;
  if (period === "month") return anchor.slice(0, 7);
  if (period === "all") return "";
  const { start, end } = (() => {
    const d = parseDate(anchor);
    const day = (d.getDay() + 6) % 7;
    const s = new Date(d);
    s.setDate(d.getDate() - day);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return { start: s, end: e };
  })();
  return `${fmt(start)} – ${fmt(end)}`;
}
