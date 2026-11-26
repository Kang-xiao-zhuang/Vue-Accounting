import { describe, expect, it } from "vitest";
import { buildBackup, mergeById, parseBackup, toCsv } from "@/lib/backup";
import { DEFAULT_SETTINGS, type LedgerRecord } from "@/types";

const rec = (id: string, amount: number): LedgerRecord => ({
  id, type: "expense", category: "Dining", amount, date: "2026-11-25", note: "午餐", createdAt: "2026-11-25T00:00:00.000Z",
});

describe("backup", () => {
  it("round-trips a valid payload", () => {
    const payload = buildBackup([rec("a", 12.5)], [], DEFAULT_SETTINGS);
    const parsed = parseBackup(JSON.stringify(payload));
    expect(parsed?.records[0].amount).toBe(12.5);
    expect(parsed?.settings?.currency).toBe("¥");
    expect(parsed?.habits).toEqual([]);
    expect(parsed?.todos).toEqual([]);
    expect(parsed?.rules).toEqual([]);
  });

  it("rejects wrong app, wrong version and malformed records", () => {
    const payload = buildBackup([rec("a", 1)], [], DEFAULT_SETTINGS);
    expect(parseBackup(JSON.stringify({ ...payload, app: "other" }))).toBeNull();
    expect(parseBackup(JSON.stringify({ ...payload, version: 3 }))).toBeNull();
    expect(parseBackup(JSON.stringify({ ...payload, records: [{ id: "x" }] }))).toBeNull();
    expect(parseBackup("not json")).toBeNull();
  });

  it("still imports a legacy v1 backup", () => {
    const legacy = { app: "daily-bookkeeping", version: 1, exportedAt: "", records: [rec("a", 1)], budgets: [], settings: DEFAULT_SETTINGS };
    const parsed = parseBackup(JSON.stringify(legacy));
    expect(parsed?.version).toBe(1);
    expect(parsed?.records).toHaveLength(1);
    expect(parsed?.habits).toEqual([]);
  });

  it("rejects malformed phase-two entities", () => {
    const payload = buildBackup([], [], DEFAULT_SETTINGS);
    expect(parseBackup(JSON.stringify({ ...payload, habits: [{ id: "h" }] }))).toBeNull();
    expect(parseBackup(JSON.stringify({ ...payload, todos: [{ id: "t", text: "x", date: "bad" }] }))).toBeNull();
  });

  it("merge keeps local value for duplicate ids", () => {
    const merged = mergeById([rec("a", 20)], [rec("a", 10), rec("b", 5)]);
    expect(merged.find((x) => x.id === "a")?.amount).toBe(20);
    expect(merged).toHaveLength(2);
  });

  it("csv includes BOM and escapes commas / quotes", () => {
    const csv = toCsv([{ ...rec("a", 3), note: 'a,b"c' }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\"a,b\"\"c\"");
  });
});
