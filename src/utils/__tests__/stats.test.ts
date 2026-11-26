import { describe, expect, it } from "vitest";
import { categoryBreakdown, filterByPeriod, sixMonthTrend, totals } from "@/utils/stats";
import type { LedgerRecord } from "@/types";

const r = (id: string, type: "income" | "expense", category: string, amount: number, date: string): LedgerRecord => ({
  id, type, category, amount, date, note: "", createdAt: `${date}T00:00:00.000Z`,
});

const DATA = [
  r("1", "expense", "Dining", 30, "2026-11-25"),
  r("2", "expense", "Dining", 20, "2026-11-25"),
  r("3", "expense", "Transport", 10, "2026-11-24"),
  r("4", "income", "Salary", 1000, "2026-11-01"),
  r("5", "expense", "Dining", 5, "2026-10-03"),
];

describe("stats", () => {
  it("filters day / month / all consistently", () => {
    expect(filterByPeriod(DATA, "day", "2026-11-25")).toHaveLength(2);
    expect(filterByPeriod(DATA, "month", "2026-11-25")).toHaveLength(4);
    expect(filterByPeriod(DATA, "all", "2026-11-25")).toHaveLength(5);
  });

  it("computes totals in integer cents", () => {
    expect(totals(DATA)).toEqual({ income: 1000, expense: 65, balance: 935 });
  });

  it("groups category breakdown with counts", () => {
    const slices = categoryBreakdown(DATA, "expense");
    expect(slices[0]).toEqual({ category: "Dining", value: 55, count: 3 });
    expect(slices[1]).toEqual({ category: "Transport", value: 10, count: 1 });
  });

  it("produces 6 ordered month buckets", () => {
    const trend = sixMonthTrend(DATA, "2026-11-25");
    expect(trend).toHaveLength(6);
    expect(trend[5].month).toBe("2026-11");
    expect(trend[5].expense).toBe(60);
    expect(trend[4].expense).toBe(5);
  });
});
