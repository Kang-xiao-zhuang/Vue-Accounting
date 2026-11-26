"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LedgerRecord, RecordType } from "@/types";
import { PALETTE, categoryLabel } from "@/lib/categories";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import { categoryBreakdown } from "@/utils/stats";

interface CategoryChartProps {
  records: LedgerRecord[];
  initialType?: RecordType;
}

/** 超过该数量后，环形图的扇区已无法与图例对应，改用排行条形图。 */
const DONUT_LIMIT = 6;
/** 条形图最多展示的条目，其余合并为「其他」。 */
const BAR_LIMIT = 8;

export function CategoryChart({ records, initialType = "expense" }: CategoryChartProps) {
  const { t, locale } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const [type, setType] = useState<RecordType>(initialType);
  const [active, setActive] = useState<string | null>(null);
  const slices = categoryBreakdown(records, type);
  const total = slices.reduce((s, x) => s + Math.round(x.value * 100), 0) / 100;

  const header = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="min-w-0 truncate text-sm font-medium text-text">
        {t("stats.breakdown")}
        <span className="ml-1 text-xs font-normal tabular-nums text-muted">{money(total, symbol)}</span>
      </h2>
      {/* 支出/收入切换收进卡片标题，省掉统计页首屏一整行 */}
      <div className="flex shrink-0 rounded-pill bg-input p-0.5">
        {(["expense", "income"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => { setType(v); setActive(null); }}
            className={`rounded-pill px-2.5 py-1 text-xs ${
              type === v ? "bg-card font-medium text-text" : "text-muted"
            }`}
          >
            {t(`common.${v}`)}
          </button>
        ))}
      </div>
    </div>
  );

  if (slices.length === 0) {
    return (
      <div className="mb-3 rounded-card border border-line bg-card p-4">
        {header}
        <p className="py-8 text-center text-sm text-muted">{t("stats.noData", { type: t(`common.${type}`) })}</p>
      </div>
    );
  }

  const pctOf = (value: number): number => (total > 0 ? Math.round((value / total) * 1000) / 10 : 0);
  const colorOf = (i: number): string => PALETTE[i % PALETTE.length] ?? PALETTE[0];

  // 分类较多时：环形图会变成彩虹且颜色循环重复，改用排行条形图，占比一目了然。
  if (slices.length > DONUT_LIMIT) {
    const top = slices.slice(0, BAR_LIMIT);
    const restValue = slices.slice(BAR_LIMIT).reduce((s, x) => s + x.value, 0);
    const rows = restValue > 0 ? [...top, { category: "__rest__", value: restValue, count: 0 }] : top;
    return (
      <div className="mb-3 rounded-card border border-line bg-card p-4">
        {header}
        <div className="space-y-3">
          {rows.map((s, i) => {
            const pct = pctOf(s.value);
            const rest = s.category === "__rest__";
            return (
              <div key={s.category}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate text-text">
                    {rest ? t("stats.otherCategories", { n: slices.length - BAR_LIMIT }) : categoryLabel(s.category, locale)}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {money(s.value, symbol)} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-pill bg-input">
                  <div
                    className="h-full rounded-pill"
                    style={{ width: `${Math.max(2, pct)}%`, backgroundColor: rest ? "var(--muted)" : colorOf(i) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const shown = active ? slices.filter((s) => s.category === active) : slices;

  return (
    <div className="mb-3 rounded-card border border-line bg-card p-4">
      {header}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="category"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
              onClick={(entry) => {
                const name = (entry as unknown as { category?: string }).category;
                setActive((prev) => (prev === name ? null : name ?? null));
              }}
            >
              {shown.map((s) => (
                <Cell
                  key={s.category}
                  fill={colorOf(slices.findIndex((x) => x.category === s.category))}
                  opacity={active && active !== s.category ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [money(Number(value), symbol), categoryLabel(String(name), locale)]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {slices.map((s) => (
          <button
            key={s.category}
            type="button"
            onClick={() => setActive((prev) => (prev === s.category ? null : s.category))}
            className={`flex items-center gap-1.5 rounded-pill border px-2 py-1 text-xs ${
              active === s.category ? "border-primary text-primary" : "border-line text-muted"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: colorOf(slices.findIndex((x) => x.category === s.category)) }}
            />
            {categoryLabel(s.category, locale)} · {money(s.value, symbol)} · {pctOf(s.value)}%
          </button>
        ))}
      </div>
      {active && (
        <p className="mt-2 text-xs text-muted">
          {categoryLabel(active, locale)} · {t("stats.count", { n: slices.find((s) => s.category === active)?.count ?? 0 })}
        </p>
      )}
    </div>
  );
}
