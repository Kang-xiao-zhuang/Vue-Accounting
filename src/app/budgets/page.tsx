"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useBudgetsStore } from "@/store/budgets.store";
import { useRecordsStore } from "@/store/records.store";
import { useSettingsStore } from "@/store/settings.store";
import { PageHeader } from "@/components/layout/page-header";
import { monthKey, todayString } from "@/utils/date";

export default function BudgetsPage() {
  const { t, locale } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const budgets = useBudgetsStore((s) => s.budgets);
  const upsert = useBudgetsStore((s) => s.upsert);
  const remove = useBudgetsStore((s) => s.remove);
  const records = useRecordsStore((s) => s.records);

  const overall = budgets.find((b) => b.category === "");
  const [overallInput, setOverallInput] = useState("");
  const [pick, setPick] = useState(CATEGORIES.expense[0].name);
  const [limitInput, setLimitInput] = useState("");

  /**
   * budgets 由 AppShell 在 layout effect 中 hydrate，首帧必然为空。
   * 用 effect 跟随 store 回填，否则输入框永远显示空值（而列表里却有已保存的额度）。
   */
  useEffect(() => {
    setOverallInput(overall ? String(overall.monthlyLimit) : "");
  }, [overall?.id, overall?.monthlyLimit]);

  const month = monthKey(todayString());
  const monthExpense = records.filter((r) => r.type === "expense" && monthKey(r.date) === month);
  const spentFor = (category: string): number => {
    const items = category === "" ? monthExpense : monthExpense.filter((r) => r.category === category);
    return items.reduce((s, r) => s + Math.round(r.amount * 100), 0) / 100;
  };

  const saveOverall = () => {
    const value = Number(overallInput);
    if (!Number.isFinite(value) || value <= 0) {
      if (overall) remove(overall.id);
      setOverallInput("");
    } else {
      upsert("", value);
    }
    toast(t("toast.budgetSaved"));
  };

  const addCategory = () => {
    const value = Number(limitInput);
    if (!Number.isFinite(value) || value <= 0) return;
    upsert(pick, value);
    setLimitInput("");
    toast(t("toast.budgetSaved"));
  };

  const card = (id: string, label: string, limit: number, spent: number, removable: boolean) => {
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const over = spent > limit;
    const near = !over && pct >= 80;
    return (
      <div key={id} className="mb-2 rounded-card border border-line bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-sm text-text">{label}</span>
          <span className={cn("shrink-0 text-xs tabular-nums", over ? "text-expense" : near ? "text-text" : "text-muted")}>
            {pct}%
          </span>
          {removable && (
            <button
              type="button"
              aria-label={t("budget.remove")}
              onClick={() => { remove(id); toast(t("toast.budgetRemoved")); }}
              className="shrink-0 rounded-btn p-1.5 text-muted hover:text-expense"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
        <div className="mb-1.5 text-xs tabular-nums text-muted">
          <span className={over ? "text-expense" : "text-text"}>{money(spent, symbol)}</span>
          <span> / {money(limit, symbol)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-pill bg-input">
          <div
            className={cn("h-full rounded-pill transition-all", over ? "bg-expense" : "bg-primary")}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className={cn("mt-1.5 text-xs", over ? "text-expense" : "text-muted")}>
          {over
            ? t("budget.over", { x: money(spent - limit, symbol) })
            : near
              ? t("budget.near", { x: money(limit - spent, symbol) })
              : t("budget.left", { x: money(limit - spent, symbol) })}
        </div>
      </div>
    );
  };

  return (
    <main>
      <PageHeader title={t("budget.title")} />
      <div className="px-4 pt-4">
        <section className="mb-5 rounded-card border border-line bg-card p-4">
          <h2 className="mb-1 text-sm font-medium text-text">{t("budget.overall")}</h2>
          <p className="mb-3 text-xs text-muted">{t("budget.setHint")}</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={overallInput}
              onChange={(e) => setOverallInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-btn border border-line bg-input px-3 py-2 text-sm tabular-nums text-text outline-none"
            />
            <button type="button" onClick={saveOverall} className="shrink-0 rounded-btn bg-primary px-4 text-sm text-white">
              {t("common.save")}
            </button>
          </div>

          {overall && (() => {
            const spent = spentFor("");
            const pct = Math.round((spent / overall.monthlyLimit) * 100);
            const over = spent > overall.monthlyLimit;
            return (
              <div className="mt-3 border-t border-line pt-3">
                <div className="mb-1.5 flex items-baseline justify-between text-xs tabular-nums">
                  <span className={over ? "text-expense" : "text-text"}>{t("budget.monthUsed", { x: money(spent, symbol) })}</span>
                  <span className={over ? "text-expense" : "text-muted"}>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-input">
                  <div
                    className={cn("h-full rounded-pill transition-all", over ? "bg-expense" : "bg-primary")}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {t("budget.left", { x: money(Math.abs(overall.monthlyLimit - spent), symbol) })}
                </p>
              </div>
            );
          })()}
        </section>

        <h2 className="mb-2 text-sm font-medium text-text">{t("budget.byCategory")}</h2>
        {budgets.filter((b) => b.category).length === 0 && (
          <p className="mb-3 text-xs text-muted">{t("budget.none")}</p>
        )}
        {budgets.filter((b) => b.category).map((b) =>
          card(b.id, categoryLabel(b.category, locale), b.monthlyLimit, spentFor(b.category), true),
        )}

        <div className="mt-4 rounded-card border border-line bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="min-w-0 flex-1 rounded-btn border border-line bg-input px-2 py-2 text-sm text-text">
              {CATEGORIES.expense.map((c) => <option key={c.name} value={c.name}>{c.icon} {categoryLabel(c.name, locale)}</option>)}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder={t("budget.limit")}
              className="w-24 rounded-btn border border-line bg-input px-2 py-2 text-sm text-text outline-none"
            />
            <button type="button" onClick={addCategory} className="flex items-center gap-1 rounded-btn bg-primary px-3 py-2 text-sm text-white">
              <Plus size={15} /> {t("budget.add")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
