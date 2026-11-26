"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LedgerRecord } from "@/types";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import { sixMonthTrend } from "@/utils/stats";
import { todayString } from "@/utils/date";

export function TrendChart({ records }: { records: LedgerRecord[] }) {
  const { t } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const data = sixMonthTrend(records, todayString()).map((d) => ({ ...d, month: d.month.slice(5) }));
  const empty = data.every((d) => d.income === 0 && d.expense === 0);

  /** 金额轴用 k 缩写；非整千保留一位小数，避免 3500 被写成误导性的 4k。 */
  const tick = (v: number): string => {
    if (Math.abs(v) < 1000) return String(v);
    const k = v / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  };

  if (empty) {
    return (
      <div className="mb-3 rounded-card border border-line bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-text">{t("stats.trend")}</h2>
        <p className="py-10 text-center text-sm text-muted">{t("stats.trendEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-card border border-line bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-text">{t("stats.trend")}</h2>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
              allowDecimals={false}
              tickFormatter={tick}
            />
            <Tooltip
              formatter={(value, name) => [money(Number(value), symbol), String(name) === "income" ? t("common.income") : t("common.expense")]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }}
            />
            <Legend formatter={(value) => (value === "income" ? t("common.income") : t("common.expense"))} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
