"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LedgerRecord } from "@/types";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import { monthCompare } from "@/utils/stats";
import { todayString } from "@/utils/date";

export function MonthCompare({ records }: { records: LedgerRecord[] }) {
  const { t } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const { current, previous } = monthCompare(records, todayString());

  const rows = [
    { key: "income", label: t("common.income"), cur: current.income, prev: previous.income, color: "text-income" },
    { key: "expense", label: t("common.expense"), cur: current.expense, prev: previous.expense, color: "text-expense" },
  ];

  const hasAny = current.income + current.expense + previous.income + previous.expense > 0;
  if (!hasAny) {
    return (
      <div className="mb-3 rounded-card border border-line bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-text">{t("stats.monthCompare")}</h2>
        <p className="py-6 text-center text-sm text-muted">{t("stats.compareEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-card border border-line bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-text">{t("stats.monthCompare")}</h2>
      <div className="space-y-3">
        {rows.map((r) => {
          const diff = Math.round((r.cur - r.prev) * 100) / 100;
          const pct = r.prev > 0 ? Math.round((diff / r.prev) * 100) : null;
          const flat = diff === 0;
          return (
            <div key={r.key} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted">{r.label}</span>
              <div className="text-right">
                <div className={`text-sm font-medium tabular-nums ${r.color}`}>{money(r.cur, symbol)}</div>
                <div className="flex items-center justify-end gap-1 text-xs tabular-nums text-muted">
                  {/* 上月为 0 时「+¥14,000.00」没有参照意义，直接说明无记录。 */}
                  {r.prev === 0 ? (
                    <span>{r.cur > 0 ? t("stats.noPrev") : `${t("stats.lastMonth")} ${money(0, symbol)}`}</span>
                  ) : (
                    <>
                      {flat ? <Minus size={12} /> : diff > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      <span>
                        {t("stats.lastMonth")} {money(r.prev, symbol)} · {diff > 0 ? "+" : diff < 0 ? "-" : ""}
                        {money(Math.abs(diff), symbol)}
                        {pct !== null && !flat ? ` (${pct > 0 ? "+" : ""}${pct}%)` : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
