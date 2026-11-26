/** 全部使用本地时区的 YYYY-MM-DD 字符串，避免 UTC 偏移导致跨日错账。 */
export function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayString(): string {
  return fmt(new Date());
}

export function parseDate(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

/** 周一为一周起点。 */
export function weekRange(d: Date): { start: Date; end: Date } {
  const day = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** 相对月份偏移，返回 YYYY-MM-DD（日期钳制到目标月最后一天）。 */
export function shiftMonth(date: string, delta: number): string {
  const d = parseDate(date);
  const target = new Date(d.getFullYear(), d.getMonth() + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return fmt(target);
}

export function shiftDays(date: string, delta: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + delta);
  return fmt(d);
}

/** 近 n 个月的 YYYY-MM 键，含当前月，按时间正序。 */
export function recentMonthKeys(n: number, from: string = todayString()): string[] {
  const d = parseDate(from);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}
