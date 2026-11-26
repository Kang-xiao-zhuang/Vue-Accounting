"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { LedgerRecord } from "@/types";
import { iconFor, categoryLabel } from "@/lib/categories";
import { money } from "@/lib/money";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
import { cn } from "@/lib/cn";
import { groupByDate } from "@/utils/stats";

interface RecordListProps {
  records: LedgerRecord[];
  emptyText: string;
  /** 关闭按日期分组（历史页分页后分组会被切断）。 */
  group?: boolean;
  onEdit: (record: LedgerRecord) => void;
  onRemove: (id: string) => void;
}

export function RecordList({ records, emptyText, group = true, onEdit, onRemove }: RecordListProps) {
  const { t, locale } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  /** 点击行展开操作，替代常驻的两个 14px 图标（移动端目标过小且噪音大）。 */
  const [openId, setOpenId] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-card px-4 py-10 text-center text-sm text-muted">
        {emptyText}
      </div>
    );
  }

  const row = (r: LedgerRecord, first: boolean) => {
    const expanded = openId === r.id;
    return (
      <div key={r.id} className={cn(!first && "border-t border-line")}>
        <button
          type="button"
          onClick={() => setOpenId(expanded ? null : r.id)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-input"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-input text-lg">
            {iconFor(r.type, r.category)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-text">{categoryLabel(r.category, locale)}</span>
            <span className="block truncate text-xs text-muted">
              {[group ? "" : r.date, r.note].filter(Boolean).join(" · ")}
            </span>
          </span>
          <span className={cn("shrink-0 text-sm font-medium tabular-nums", r.type === "income" ? "text-income" : "text-expense")}>
            {r.type === "income" ? "+" : "−"}{money(r.amount, symbol)}
          </span>
        </button>

        {expanded && (
          <div className="flex gap-2 border-t border-line bg-input px-3 py-2">
            <button
              type="button"
              onClick={() => { setOpenId(null); onEdit(r); }}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-btn border border-line bg-card text-xs text-text"
            >
              <Pencil size={14} /> {t("common.edit")}
            </button>
            <button
              type="button"
              onClick={() => { setOpenId(null); onRemove(r.id); }}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-btn border border-line bg-card text-xs text-expense"
            >
              <Trash2 size={14} /> {t("common.delete")}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!group) {
    return (
      <div className="overflow-hidden rounded-card border border-line bg-card">
        {records.map((r, i) => row(r, i === 0))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupByDate(records).map((g) => (
        <section key={g.date}>
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
            <span>{g.date}</span>
            <span>
              {t("rec.dailyNet")} · <span className={g.net >= 0 ? "text-income" : "text-expense"}>{money(g.net, symbol)}</span>
            </span>
          </div>
          <div className="overflow-hidden rounded-card border border-line bg-card">
            {g.items.map((r, i) => row(r, i === 0))}
          </div>
        </section>
      ))}
    </div>
  );
}
