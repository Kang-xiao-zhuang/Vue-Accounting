"use client";

import { AlertTriangle } from "lucide-react";
import { money } from "@/lib/money";
import { todayString } from "@/utils/date";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import { useBudgetsStore } from "@/store/budgets.store";
import { monthKey } from "@/utils/date";
import { categoryLabel } from "@/lib/categories";

/** 当月超支提醒：整体预算 + 分类预算，与原 BudgetAlert.vue 语义一致。 */
export function BudgetAlert({ records }: { records: { type: string; category: string; amount: number; date: string }[] }) {
  const { t, locale } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const budgets = useBudgetsStore((s) => s.budgets);
  const currentMonth = monthKey(todayString());
  const inMonth = records.filter((r) => r.type === "expense" && monthKey(r.date) === currentMonth);
  const spentCents = (items: typeof inMonth): number =>
    items.reduce((s, r) => s + Math.round(r.amount * 100), 0);

  const overs: { label: string; amount: number }[] = [];
  const overall = budgets.find((b) => b.category === "");
  if (overall) {
    const spent = spentCents(inMonth) / 100;
    if (spent > overall.monthlyLimit) {
      overs.push({ label: t("budget.overallLabel"), amount: spent - overall.monthlyLimit });
    }
  }
  for (const b of budgets.filter((x) => x.category)) {
    const cents = spentCents(inMonth.filter((r) => r.category === b.category));
    if (cents / 100 > b.monthlyLimit) {
      overs.push({ label: categoryLabel(b.category, locale), amount: cents / 100 - b.monthlyLimit });
    }
  }

  if (overs.length === 0) return null;
  return (
    <div className="mb-3 space-y-1">
      {overs.map((o) => (
        <div key={o.label} className="flex items-center gap-2 rounded-btn border border-expense bg-card px-3 py-2 text-xs text-expense">
          <AlertTriangle size={15} className="shrink-0" />
          {t("budget.alertOver", { label: o.label, over: money(o.amount, symbol) })}
        </div>
      ))}
    </div>
  );
}
