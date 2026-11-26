/** 习惯打卡的日期计算，移植自旧版 utils.js 的 streak 算法。 */
import { fmt, parseDate, shiftDays } from "./date";

/**
 * 连续打卡天数，截止今天；若今天未打卡则从昨天起算，
 * 避免「今天还没打卡」把昨天的连续记录误判为中断。
 */
export function currentStreak(checkins: readonly string[], today: string): number {
  const set = new Set(checkins);
  let cursor = today;
  if (!set.has(cursor)) cursor = shiftDays(cursor, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

/** 全历史最长连续天数；相邻日期按自然日 +1 判定，跳过重复日期。 */
export function longestStreak(checkins: readonly string[]): number {
  const dates = [...new Set(checkins)].sort();
  if (dates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((parseDate(dates[i]).getTime() - parseDate(dates[i - 1]).getTime()) / 86400000);
    if (diff === 0) continue;
    run = diff === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** 最近 n 天的日期数组（含今天）， oldest → newest。 */
export function lastNDays(n: number, today: string): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(shiftDays(today, -i));
  return out;
}

/** 指定偏移周的周一日期。 */
export function weekAnchor(today: string, offset: number): Date {
  const d = parseDate(today);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + offset * 7);
  return d;
}

/** 指定偏移月的 YYYY-MM。 */
export function monthAnchor(today: string, offset: number): string {
  const d = parseDate(today);
  const m = new Date(d.getFullYear(), d.getMonth() + offset, 1);
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
}

/** 月历：周一起始的 6×7 网格，空位用 null 表示。 */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** 本周内已打卡次数（用于周目标）。 */
export function weeklyDone(checkins: readonly string[], today: string): number {
  const d = weekAnchor(today, 0);
  const end = fmt(d);
  d.setDate(d.getDate() + 6);
  const last = fmt(d);
  return checkins.filter((c) => c >= end && c <= last).length;
}
