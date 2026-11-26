/**
 * localStorage 的唯一入口 —— 组件与 store 都不直接触碰 localStorage。
 * 移植自 Track100 lib/storage.ts：延迟合并写 + 写入失败可观测 + 配额统计。
 */

export const STORAGE_KEYS = {
  records: "bk-records",
  budgets: "bk-budgets",
  settings: "bk-settings",
  snapshot: "bk-snapshot",
  lastExport: "bk-last-export",
  // 阶段二
  habits: "bk-habits",
  todos: "bk-todos",
  rules: "bk-rules",
  prefs: "bk-prefs",
} as const;

const WRITE_DELAY = 300;
const pending = new Map<string, unknown>();
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

let writeFailed = false;
const errorListeners = new Set<() => void>();

export function hasWriteError(): boolean {
  return writeFailed;
}

export function subscribeWriteError(cb: () => void): () => void {
  errorListeners.add(cb);
  return () => { errorListeners.delete(cb); };
}

export function clearWriteError(): void {
  if (!writeFailed) return;
  writeFailed = false;
  errorListeners.forEach((l) => l());
}

function markWriteError(): void {
  if (writeFailed) return;
  writeFailed = true;
  errorListeners.forEach((l) => l());
}

/** 主流浏览器配额约 5MB（Chromium 按 UTF-16 计 2 字节/字符）。 */
export const STORAGE_QUOTA = 5 * 1024 * 1024;

export function storageUsage(): number {
  if (typeof window === "undefined") return 0;
  let bytes = 0;
  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      const raw = window.localStorage.getItem(key);
      if (raw) bytes += (key.length + raw.length) * 2;
    }
  } catch {
    // 读不到就返回已累计的值
  }
  return bytes;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function flushWrites(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  const entries = [...pending];
  pending.clear();
  for (const [key, value] of entries) writeJSON(key, value);
}

export function writeJSONDeferred<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  if (!listening) {
    listening = true;
    window.addEventListener("pagehide", flushWrites);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushWrites();
    });
  }
  pending.set(key, value);
  timer ??= setTimeout(flushWrites, WRITE_DELAY);
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (pending.has(key)) return pending.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 立即写盘。返回是否成功；失败会触发全局告警。 */
export function writeJSON<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return true;
  pending.delete(key);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    markWriteError();
    return false;
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  pending.delete(key);
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}
