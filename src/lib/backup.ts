import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type {
  AppSettings, BackupPayload, Budget, Habit, LedgerRecord, RecurringRule, TodoItem,
} from "@/types";
import { STORAGE_KEYS, readJSON, writeJSON } from "./storage";

export function buildBackup(
  records: LedgerRecord[],
  budgets: Budget[],
  settings: AppSettings,
  habits: Habit[] = [],
  todos: TodoItem[] = [],
  rules: RecurringRule[] = [],
): BackupPayload {
  return {
    app: "daily-bookkeeping",
    version: 2,
    exportedAt: new Date().toISOString(),
    records,
    budgets,
    settings,
    habits,
    todos,
    rules,
  };
}

/** 严格校验导入内容，坏文件不允许覆盖现有数据。 */
export function parseBackup(raw: string): BackupPayload | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    if (d.app !== "daily-bookkeeping" || (d.version !== 1 && d.version !== 2)) return null;
    if (!Array.isArray(d.records) || !Array.isArray(d.budgets)) return null;
    const validRecord = (r: unknown): r is LedgerRecord => {
      if (typeof r !== "object" || r === null) return false;
      const x = r as Record<string, unknown>;
      return (
        typeof x.id === "string" &&
        (x.type === "expense" || x.type === "income") &&
        typeof x.category === "string" &&
        typeof x.amount === "number" && Number.isFinite(x.amount) &&
        typeof x.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.date)
      );
    };
    if (!d.records.every(validRecord)) return null;
    const validBudget = (b: unknown): boolean => {
      if (typeof b !== "object" || b === null) return false;
      const x = b as Record<string, unknown>;
      return typeof x.id === "string" && typeof x.category === "string" && typeof x.monthlyLimit === "number";
    };
    if (!d.budgets.every(validBudget)) return null;

    const validHabit = (h: unknown): boolean => {
      if (typeof h !== "object" || h === null) return false;
      const x = h as Record<string, unknown>;
      return (
        typeof x.id === "string" && typeof x.name === "string" &&
        Array.isArray(x.checkins) && x.checkins.every((c) => typeof c === "string" && /^\d{4}-\d{2}-\d{2}$/.test(c))
      );
    };
    const validTodo = (t: unknown): boolean => {
      if (typeof t !== "object" || t === null) return false;
      const x = t as Record<string, unknown>;
      return (
        typeof x.id === "string" && typeof x.text === "string" &&
        typeof x.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.date)
      );
    };
    const validRule = (r: unknown): boolean => {
      if (typeof r !== "object" || r === null) return false;
      const x = r as Record<string, unknown>;
      return (
        typeof x.id === "string" &&
        (x.type === "expense" || x.type === "income") &&
        typeof x.category === "string" &&
        typeof x.amount === "number" && Number.isFinite(x.amount) &&
        typeof x.nextRunDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.nextRunDate)
      );
    };
    // v2 新增字段缺省视为空；出现非法条目则整体拒绝，避免半坏数据覆盖。
    if (d.habits !== undefined && (!Array.isArray(d.habits) || !d.habits.every(validHabit))) return null;
    if (d.todos !== undefined && (!Array.isArray(d.todos) || !d.todos.every(validTodo))) return null;
    if (d.rules !== undefined && (!Array.isArray(d.rules) || !d.rules.every(validRule))) return null;

    return {
      app: "daily-bookkeeping",
      version: d.version,
      exportedAt: typeof d.exportedAt === "string" ? d.exportedAt : "",
      records: d.records as LedgerRecord[],
      budgets: d.budgets as Budget[],
      settings: (d.settings && typeof d.settings === "object" ? d.settings : undefined) as AppSettings | undefined,
      habits: (d.habits ?? []) as Habit[],
      todos: (d.todos ?? []) as TodoItem[],
      rules: (d.rules ?? []) as RecurringRule[],
    };
  } catch {
    return null;
  }
}

/** 合并模式按 id 去重，保留本地较新的数据。 */
export function mergeById<T extends { id: string }>(local: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of incoming) map.set(item.id, item);
  for (const item of local) map.set(item.id, item);
  return [...map.values()];
}

/** 覆盖恢复前留一份可回滚快照。 */
export function saveSnapshot(payload: BackupPayload): void {
  writeJSON(STORAGE_KEYS.snapshot, payload);
}

export function readSnapshot(): BackupPayload | null {
  return readJSON<BackupPayload | null>(STORAGE_KEYS.snapshot, null);
}

export function markExported(): void {
  writeJSON(STORAGE_KEYS.lastExport, new Date().toISOString());
}

export function lastExported(): string | null {
  return readJSON<string | null>(STORAGE_KEYS.lastExport, null);
}

function fileName(prefix: string, ext: string): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}-${stamp}.${ext}`;
}

/** Web 走 Blob 下载；Android 走 Filesystem + 系统分享。 */
export async function saveTextFile(text: string, prefix: string, ext: string, mime: string): Promise<void> {
  const name = fileName(prefix, ext);
  if (Capacitor.isNativePlatform()) {
    const result = await Filesystem.writeFile({
      path: name,
      data: text,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: name, url: result.uri });
    return;
  }
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** CSV 导出（BOM 保证 Excel 正确识别 UTF-8，含中文备注）。 */
export function toCsv(records: LedgerRecord[]): string {
  const esc = (v: string | number): string => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [
    ["date", "type", "category", "amount", "note"],
    ...records.map((r) => [r.date, r.type, r.category, r.amount.toFixed(2), r.note]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(esc).join(",")).join("\r\n");
}
