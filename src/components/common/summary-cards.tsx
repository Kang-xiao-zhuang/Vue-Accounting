"use client";

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import type { Totals } from "@/utils/stats";

export function SummaryCards({ totals }: { totals: Totals }) {
  const { t } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);

  const items = [
    { label: t("common.income"), value: totals.income, color: "text-income", Icon: ArrowDownLeft },
    { label: t("common.expense"), value: totals.expense, color: "text-expense", Icon: ArrowUpRight },
    { label: t("common.balance"), value: totals.balance, color: "text-text", Icon: Wallet },
  ];

  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {items.map(({ label, value, color, Icon }) => (
        <div key={label} className="rounded-card border border-line bg-card p-3">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted">
            <Icon size={13} /> {label}
          </div>
          <div className={`truncate text-sm font-medium ${color}`} title={money(value, symbol)}>
            {money(value, symbol)}
          </div>
        </div>
      ))}
    </div>
  );
}
