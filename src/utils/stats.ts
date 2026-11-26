import type { LedgerRecord, Period, RecordType } from "@/types";
import { sumAmount } from "@/lib/money";
import { fmt, monthKey, parseDate, recentMonthKeys, weekRange } from "@/utils/date";

/** 与 v1.x Pinia getter `periodRecords` 完全一致的过滤口径。 */
export function filterByPeriod(
  records: readonly LedgerRecord[],
  period: Period,
  anchor: string,
): LedgerRecord[] {
  if (period === "all") return [...records];
  if (period === "day") return records.filter((r) => r.date === anchor);
  if (period === "month") {
    const prefix = anchor.slice(0, 7);
    return records.filter((r) => r.date.slice(0, 7) === prefix);
  }
  const { start, end } = weekRange(parseDate(anchor));
  const s = fmt(start);
  const e = fmt(end);
  return records.filter((r) => r.date >= s && r.date <= e);
}

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function totals(records: readonly LedgerRecord[]): Totals {
  const income = sumAmount(records.filter((r) => r.type === "income"));
  const expense = sumAmount(records.filter((r) => r.type === "expense"));
  return { income, expense, balance: Math.round((income - expense) * 100) / 100 };
}

export interface CategorySlice {
  category: string;
  value: number;
  count: number;
}

export function categoryBreakdown(records: readonly LedgerRecord[], type: RecordType): CategorySlice[] {
  const map = new Map<string, { cents: number; count: number }>();
  for (const r of records) {
    if (r.type !== type) continue;
    const entry = map.get(r.category) ?? { cents: 0, count: 0 };
    entry.cents += Math.round(r.amount * 100);
    entry.count += 1;
    map.set(r.category, entry);
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, value: v.cents / 100, count: v.count }))
    .sort((a, b) => b.value - a.value);
}

export function monthCompare(records: readonly LedgerRecord[], today: string): {
  current: Totals;
  previous: Totals;
} {
  const d = parseDate(today);
  const cur = monthKey(today);
  const prevDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const prev = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  return {
    current: totals(records.filter((r) => monthKey(r.date) === cur)),
    previous: totals(records.filter((r) => monthKey(r.date) === prev)),
  };
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

export function sixMonthTrend(records: readonly LedgerRecord[], today: string): TrendPoint[] {
  return recentMonthKeys(6, today).map((m) => {
    const inMonth = records.filter((r) => monthKey(r.date) === m);
    const t = totals(inMonth);
    return { month: m, income: t.income, expense: t.expense };
  });
}

/** 按日期分组，新的在前，供记录列表渲染。 */
export function groupByDate(records: readonly LedgerRecord[]): { date: string; items: LedgerRecord[]; net: number }[] {
  const map = new Map<string, LedgerRecord[]>();
  for (const r of records) {
    const list = map.get(r.date) ?? [];
    list.push(r);
    map.set(r.date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, items]) => {
      const t = totals(items);
      return { date, items: items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), net: t.balance };
    });
}

/** 常用分类排序：按历史使用次数降序。 */
export function frequentCategories(records: readonly LedgerRecord[], type: RecordType, limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    if (r.type !== type) continue;
    counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name]) => name);
}

/** 备注自动补全：优先同分类历史备注。 */
export function noteSuggestions(records: readonly LedgerRecord[], category?: string): string[] {
  const sorted = [...records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const preferred: string[] = [];
  const others: string[] = [];
  const seen = new Set<string>();
  for (const r of sorted) {
    const n = r.note.trim();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    (category && r.category === category ? preferred : others).push(n);
    if (preferred.length >= 20) break;
  }
  return [...preferred, ...others].slice(0, 20);
}
