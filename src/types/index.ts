/** 领域模型：替代原 MySQL 的 8 张表 + REST DTO。 */

export type RecordType = "expense" | "income";
export type Period = "day" | "week" | "month" | "all";
export type Locale = "zh" | "en";
export type ThemeKey =
  | "light"
  | "dark"
  | "duotone"
  | "ocean"
  | "forest"
  | "sunset"
  | "rose"
  | "slate"
  | "custom"
  | "auto";

export interface LedgerRecord {
  id: string;
  type: RecordType;
  /** 英文分类键，见 lib/categories.ts */
  category: string;
  /** 元，最多两位小数；求和时换算为整数分 */
  amount: number;
  /** YYYY-MM-DD（本地时区） */
  date: string;
  note: string;
  /** ISO 时间戳，用于同日排序 */
  createdAt: string;
}

export type RecordInput = Omit<LedgerRecord, "id" | "createdAt">;

export interface Budget {
  id: string;
  /** 空字符串表示整体月度预算，否则为支出分类键 */
  category: string;
  monthlyLimit: number;
}

export interface CustomTheme {
  base: "light" | "dark";
  primary: string;
  income: string;
  expense: string;
}

export interface AppSettings {
  theme: ThemeKey;
  custom: CustomTheme;
  locale: Locale;
  /** 货币符号，如 ¥ / $ */
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" },
  locale: "zh",
  currency: "¥",
};

/** 纯 UI 偏好，不进备份（换设备无需保留）。 */
export interface UIPrefs {
  habitView: HabitView;
  todoLayout: "list" | "ring";
}

export const DEFAULT_PREFS: UIPrefs = {
  habitView: "grid",
  todoLayout: "list",
};

/** ===== 阶段二：习惯打卡 ===== */

export const HABIT_ICONS = [
  "🎯", "📖", "🏃", "💪", "🧘", "💧", "😴", "🥗", "🚭", "📚",
  "✍️", "🎸", "🧹", "💊", "🌱", "☀️", "🦷", "🚶", "🚴", "🧠",
  "💰", "🙏", "🎨", "🐶",
] as const;

export const HABIT_COLORS = [
  "#3dd6a3", "#6d86ff", "#ff6b7a", "#ffb84d", "#a07bff", "#4dd2ff", "#ff8fcf", "#5fd06f",
] as const;

export type HabitView = "grid" | "ring" | "week" | "month";

export interface Habit {
  id: string;
  name: string;
  /** Emoji，见 HABIT_ICONS */
  icon: string;
  /** 十六进制颜色，用于热力网格 */
  color: string;
  /** 每周目标打卡次数，0 表示不设目标 */
  weeklyTarget: number;
  /** 已打卡日期 YYYY-MM-DD，按字典序升序 */
  checkins: string[];
}

export type HabitInput = Omit<Habit, "id" | "checkins">;

/** ===== 阶段二：每日清单 ===== */

export type Priority = 0 | 1 | 2;

export interface TodoItem {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  text: string;
  done: boolean;
  /** 0 低 / 1 中 / 2 高 */
  priority: Priority;
  /** HH:mm，可选 */
  startTime: string;
  endTime: string;
  createdAt: string;
}

export type TodoInput = Omit<TodoItem, "id" | "createdAt">;

/** ===== 阶段二：周期交易 ===== */

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface RecurringRule {
  id: string;
  type: RecordType;
  category: string;
  amount: number;
  note: string;
  frequency: Frequency;
  /** 下次到期日 YYYY-MM-DD */
  nextRunDate: string;
  active: boolean;
}

export type RecurringInput = Omit<RecurringRule, "id">;

/** 备份文件结构。version 用于格式演进；v1 备份仍可导入。 */
export interface BackupPayload {
  app: "daily-bookkeeping";
  /** v1 = 仅记录与预算；v2 = 追加习惯、清单、周期规则 */
  version: 1 | 2;
  exportedAt: string;
  records: LedgerRecord[];
  budgets: Budget[];
  settings?: AppSettings;
  habits?: Habit[];
  todos?: TodoItem[];
  rules?: RecurringRule[];
}
