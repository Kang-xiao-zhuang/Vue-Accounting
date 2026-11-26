import { describe, expect, it } from "vitest";
import { currentStreak, lastNDays, longestStreak, monthGrid, weeklyDone } from "../habits";

describe("habit streaks", () => {
  it("counts a streak ending today", () => {
    expect(currentStreak(["2026-11-24", "2026-11-25", "2026-11-26"], "2026-11-26")).toBe(3);
  });

  it("allows a streak ending yesterday when today is not checked in", () => {
    expect(currentStreak(["2026-11-24", "2026-11-25"], "2026-11-26")).toBe(2);
  });

  it("returns zero when the last check-in is older than yesterday", () => {
    expect(currentStreak(["2026-11-23", "2026-11-24"], "2026-11-26")).toBe(0);
  });

  it("finds the longest run and ignores duplicates", () => {
    expect(longestStreak(["2026-11-01", "2026-11-02", "2026-11-02", "2026-11-04", "2026-11-05", "2026-11-06"])).toBe(3);
  });

  it("handles empty input", () => {
    expect(currentStreak([], "2026-11-26")).toBe(0);
    expect(longestStreak([])).toBe(0);
  });
});

describe("habit calendar helpers", () => {
  it("builds the last n days oldest first", () => {
    expect(lastNDays(3, "2026-11-26")).toEqual(["2026-11-24", "2026-11-25", "2026-11-26"]);
  });

  it("counts this week's check-ins from Monday", () => {
    // 2026-11-26 is a Thursday; week starts Monday 2026-11-23.
    expect(weeklyDone(["2026-11-22", "2026-11-23", "2026-11-26"], "2026-11-26")).toBe(2);
  });

  it("renders a Monday-first month grid padded to full weeks", () => {
    const grid = monthGrid(2026, 10); // November 2026 starts on Sunday
    expect(grid[0]).toBeNull();
    expect(grid.includes("2026-11-01")).toBe(true);
    expect(grid.filter((c) => c !== null)).toHaveLength(30);
    expect(grid.length % 7).toBe(0);
  });
});
