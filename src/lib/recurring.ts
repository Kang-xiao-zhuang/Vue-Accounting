/** 周期规则的纯函数，便于单测；对应旧后端 RecurringService.materialize。 */
import type { Frequency, LedgerRecord, RecurringRule } from "@/types";
import { createId } from "./id";
import { round2 } from "./money";
import { shiftDays, shiftMonth } from "@/utils/date";

/** 单次执行最多补齐的条数，防止极旧日期导致卡死。 */
export const MAX_OCCURRENCES = 1000;

export function advance(date: string, frequency: Frequency): string {
  switch (frequency) {
    case "DAILY": return shiftDays(date, 1);
    case "WEEKLY": return shiftDays(date, 7);
    case "MONTHLY": return shiftMonth(date, 1);
  }
}

export interface DueResult {
  records: LedgerRecord[];
  /** 更新了 nextRunDate 的规则 */
  rules: RecurringRule[];
  changed: boolean;
}

/**
 * 计算所有到期规则应生成的记录；不写存储，由调用方决定何时落盘。
 * 注意：跳过 inactive 规则；nextRunDate 严格 <= today 才生成。
 */
export function materializeDue(
  rules: readonly RecurringRule[],
  today: string,
  now = new Date().toISOString(),
): DueResult {
  const records: LedgerRecord[] = [];
  let changed = false;
  const updated = rules.map((rule) => {
    if (!rule.active || rule.nextRunDate > today) return rule;
    let next = rule.nextRunDate;
    let guard = 0;
    while (next <= today && guard < MAX_OCCURRENCES) {
      records.push({
        id: createId(),
        type: rule.type,
        category: rule.category,
        amount: round2(rule.amount),
        date: next,
        note: rule.note ?? "",
        createdAt: now,
      });
      next = advance(next, rule.frequency);
      guard++;
    }
    if (next !== rule.nextRunDate) {
      changed = true;
      return { ...rule, nextRunDate: next };
    }
    return rule;
  });
  return { records, rules: updated, changed };
}
