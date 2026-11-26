import { describe, expect, it } from "vitest";
import { advance, materializeDue, MAX_OCCURRENCES } from "../recurring";
import type { RecurringRule } from "@/types";

const rule = (patch: Partial<RecurringRule> = {}): RecurringRule => ({
  id: "r1",
  type: "expense",
  category: "housing",
  amount: 1200,
  note: "rent",
  frequency: "MONTHLY",
  nextRunDate: "2026-09-15",
  active: true,
  ...patch,
});

describe("recurring advance", () => {
  it("advances by day, week and month", () => {
    expect(advance("2026-01-31", "DAILY")).toBe("2026-02-01");
    expect(advance("2026-01-31", "WEEKLY")).toBe("2026-02-07");
    expect(advance("2026-01-31", "MONTHLY")).toBe("2026-02-28");
  });
});

describe("materializeDue", () => {
  it("generates all missed occurrences and advances the rule", () => {
    const result = materializeDue([rule()], "2026-11-15", "2026-11-26T00:00:00.000Z");
    expect(result.records).toHaveLength(3); // Sep, Oct, Nov
    expect(result.records.map((r) => r.date)).toEqual(["2026-09-15", "2026-10-15", "2026-11-15"]);
    expect(result.rules[0].nextRunDate).toBe("2026-12-15");
    expect(result.changed).toBe(true);
    expect(result.records[0]).toMatchObject({ type: "expense", category: "housing", amount: 1200, note: "rent" });
  });

  it("skips inactive rules and future dates", () => {
    expect(materializeDue([rule({ active: false })], "2026-11-15").records).toHaveLength(0);
    expect(materializeDue([rule({ nextRunDate: "2026-12-01" })], "2026-11-15").records).toHaveLength(0);
    expect(materializeDue([rule({ nextRunDate: "2026-12-01" })], "2026-11-15").changed).toBe(false);
  });

  it("caps runaway rules at MAX_OCCURRENCES", () => {
    const result = materializeDue([rule({ frequency: "DAILY", nextRunDate: "2000-01-01" })], "2026-11-15");
    expect(result.records).toHaveLength(MAX_OCCURRENCES);
  });
});
