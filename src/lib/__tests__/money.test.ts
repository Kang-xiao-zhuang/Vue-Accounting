import { describe, expect, it } from "vitest";
import { formatMoney, round2, sumAmount, toCents } from "@/lib/money";
import type { LedgerRecord } from "@/types";

const record = (amount: number): LedgerRecord => ({
  id: String(amount),
  type: "expense",
  category: "Dining",
  amount,
  date: "2026-11-25",
  note: "",
  createdAt: "2026-11-25T00:00:00.000Z",
});

describe("money", () => {
  it("sums in integer cents without float drift", () => {
    expect(sumAmount([record(0.1), record(0.2)])).toBe(0.3);
    expect(sumAmount([record(1.005), record(2.015)])).toBe(3.02);
  });

  it("rounds to 2 decimals safely", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(-3.456)).toBe(-3.46);
    expect(toCents(120.5)).toBe(12050);
  });

  it("formats with grouping and fixed decimals", () => {
    expect(formatMoney(1234.5)).toBe("1,234.50");
    expect(formatMoney(0)).toBe("0.00");
  });
});
