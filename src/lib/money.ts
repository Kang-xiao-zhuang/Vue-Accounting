import type { LedgerRecord } from "@/types";

/** 避免 0.1 + 0.2 漂移：所有求和在整数分上完成，最后再除回元。 */
export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function toCents(n: number): number {
  return Math.round(Number(n) * 100);
}

/** 按整数分求和，杜绝浮点误差。 */
export function sumAmount(records: readonly LedgerRecord[]): number {
  return records.reduce((s, r) => s + toCents(r.amount), 0) / 100;
}

export function sumNumbers(values: readonly number[]): number {
  return values.reduce((s, v) => s + toCents(v), 0) / 100;
}

/** 千分位 + 固定两位小数。 */
export function formatMoney(n: number): string {
  return round2(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function money(n: number, symbol: string): string {
  return `${symbol}${formatMoney(n)}`;
}

export const CURRENCY_OPTIONS = ["¥", "$", "NT$", "€", "£", "₩", "₫", "฿"] as const;
