"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RecordList } from "@/components/common/record-list";
import { EntrySheet } from "@/components/common/entry-sheet";
import { categoryLabel } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useRecordsStore } from "@/store/records.store";
import type { LedgerRecord, RecordType } from "@/types";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const { t, locale } = useT();
  const records = useRecordsStore((s) => s.records);
  const remove = useRecordsStore((s) => s.remove);

  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | RecordType>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<LedgerRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return records.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (needle && !r.note.toLowerCase().includes(needle) && !categoryLabel(r.category, locale).toLowerCase().includes(needle) && !r.category.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [records, q, type, from, to, locale]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilter = q.trim() !== "" || type !== "all" || from !== "" || to !== "";

  const onFilter = (fn: () => void) => { fn(); setPage(1); };
  const go = (p: number) => setPage(Math.min(pages, Math.max(1, p)));
  const clearFilter = () => onFilter(() => { setQ(""); setType("all"); setFrom(""); setTo(""); });
  const onRemove = (id: string) => {
    if (!window.confirm(t("history.deleteConfirm"))) return;
    remove(id);
    toast(t("toast.deleted"));
    if (items.length === 1 && current > 1) setPage(current - 1);
  };

  const dateCls = "w-full rounded-btn border border-line bg-input px-2.5 py-2 text-sm text-text outline-none focus:border-primary";

  return (
    <main>
      <PageHeader title={t("history.title")} subtitle={t("history.count", { n: filtered.length })} />

      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center gap-2 rounded-btn border border-line bg-input px-3">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => onFilter(() => setQ(e.target.value))}
            placeholder={t("history.search")}
            className="w-full bg-transparent py-2 text-sm text-text outline-none placeholder:text-muted"
          />
        </div>

        {/* 类型：分段控件；日期：独占一行，避免原生 date 输入被挤成「年/月/日」 */}
        <div className="mb-2 grid grid-cols-3 gap-1 rounded-btn bg-input p-1">
          {(["all", "expense", "income"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onFilter(() => setType(v))}
              className={cn(
                "rounded-btn py-1.5 text-xs",
                type === v ? "bg-card font-medium text-text" : "text-muted",
              )}
            >
              {v === "all" ? t("common.all") : t(`common.${v}`)}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted">{t("history.from")}</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => onFilter(() => setFrom(e.target.value))} className={dateCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted">{t("history.to")}</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => onFilter(() => setTo(e.target.value))} className={dateCls} />
          </label>
        </div>

        {hasFilter && (
          <button type="button" onClick={clearFilter} className="mb-3 text-xs text-primary">
            {t("history.clear")}
          </button>
        )}

        <RecordList
          records={items}
          group={false}
          emptyText={t("history.empty")}
          onEdit={(r) => setEditing(r)}
          onRemove={onRemove}
        />

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button type="button" onClick={() => go(current - 1)} disabled={current <= 1} aria-label="Previous page" className="flex h-10 w-10 items-center justify-center rounded-btn border border-line bg-card text-text disabled:opacity-40">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-muted">{t("history.pageOf", { c: current, p: pages })}</span>
            <button type="button" onClick={() => go(current + 1)} disabled={current >= pages} aria-label="Next page" className="flex h-10 w-10 items-center justify-center rounded-btn border border-line bg-card text-text disabled:opacity-40">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <EntrySheet open editing={editing} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}
