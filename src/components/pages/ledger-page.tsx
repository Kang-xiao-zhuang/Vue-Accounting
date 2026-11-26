"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import type { LedgerRecord } from "@/types";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { toCsv, saveTextFile } from "@/lib/backup";
import { cn } from "@/lib/cn";
import { useRecordsStore } from "@/store/records.store";
import { filterByPeriod, totals } from "@/utils/stats";
import { PeriodNav } from "@/components/common/period-nav";
import { SummaryCards } from "@/components/common/summary-cards";
import { RecordList } from "@/components/common/record-list";
import { EntrySheet } from "@/components/common/entry-sheet";
import { BudgetAlert } from "@/components/common/budget-alert";

/** recharts 体积较大，切到「统计」标签时才加载。 */
const StatsPanel = dynamic(() => import("@/components/pages/stats-panel").then((m) => m.StatsPanel), {
  ssr: false,
  loading: () => <div className="py-12 text-center text-sm text-muted">…</div>,
});

type LedgerTab = "records" | "stats";

/**
 * 记录与统计合并为一个页面：共用周期导航与汇总卡，
 * 顶部标签在「记录列表」和「图表分析」之间切换，避免两个页面重复同一套筛选。
 */
export function LedgerPage() {
  const { t } = useT();
  const records = useRecordsStore((s) => s.records);
  const hydrated = useRecordsStore((s) => s.hydrated);
  const period = useRecordsStore((s) => s.period);
  const anchor = useRecordsStore((s) => s.anchor);
  const remove = useRecordsStore((s) => s.remove);

  const [tab, setTab] = useState<LedgerTab>("records");
  const [query, setQuery] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; editing: LedgerRecord | null }>({ open: false, editing: null });

  const periodRecords = useMemo(() => filterByPeriod(records, period, anchor), [records, period, anchor]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return periodRecords.filter((r) => {
      if (q && !`${r.note} ${r.category}`.toLowerCase().includes(q)) return false;
      if (min && r.amount < Number(min)) return false;
      if (max && r.amount > Number(max)) return false;
      return true;
    });
  }, [periodRecords, query, min, max]);

  const hasFilter = Boolean(query || min || max);
  /** 首次使用：全量无数据时给一个明确入口，而不是三张 ¥0.00 卡片。 */
  const isEmptyAll = hydrated && records.length === 0;

  const exportCsv = async () => {
    await saveTextFile(toCsv(filtered), "bookkeeping", "csv", "text/csv;charset=utf-8");
    toast(t("toast.exported"));
  };

  return (
    <main className="px-4 pt-4">
      <header className="sticky top-0 z-20 -mx-4 mb-3 flex items-center gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur">
        <div className="flex rounded-pill border border-line bg-card p-0.5" role="tablist">
          {(["records", "stats"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === key ? "bg-primary text-white" : "text-muted hover:text-text",
              )}
            >
              {t(key === "records" ? "rec.title" : "stats.title")}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {tab === "records" ? (
            <>
              <button
                type="button"
                aria-label={t("rec.filterAmount")}
                onClick={() => setShowFilter((v) => !v)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-btn border",
                  showFilter ? "border-primary bg-primary/10 text-primary" : "border-line bg-card text-muted",
                )}
              >
                <SlidersHorizontal size={16} />
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="flex h-8 items-center gap-1 rounded-btn border border-line bg-card px-2.5 text-xs text-muted"
              >
                <Download size={14} /> CSV
              </button>
            </>
          ) : (
            <Link href="/budgets" className="rounded-pill border border-line bg-card px-3 py-1.5 text-xs text-primary">
              {t("stats.budgets")}
            </Link>
          )}
        </div>
      </header>

      {isEmptyAll ? (
        <div className="mt-8 rounded-card border border-dashed border-line bg-card px-6 py-12 text-center">
          <div className="mb-3 text-3xl">🧾</div>
          <p className="mb-1 text-sm text-text">{t("rec.emptyTitle")}</p>
          <p className="mb-4 text-xs text-muted">{t("rec.emptyHint")}</p>
          <Link href="/add" className="inline-flex rounded-pill bg-primary px-6 py-2.5 text-sm font-medium text-white">
            {t("rec.emptyCta")}
          </Link>
        </div>
      ) : (
        <>
          <BudgetAlert records={records} />
          <PeriodNav />
          <SummaryCards totals={totals(periodRecords)} />

          {tab === "records" ? (
            <>
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-2 rounded-btn border border-line bg-card px-3">
                  <Search size={16} className="text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("rec.search")}
                    className="w-full bg-transparent py-2.5 text-sm text-text outline-none placeholder:text-muted"
                  />
                </div>
                {showFilter && (
                  <div className="flex items-center gap-2 rounded-btn border border-line bg-card p-2">
                    <span className="shrink-0 text-xs text-muted">{t("rec.filterAmount")}</span>
                    <input type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder={t("rec.min")} className="w-full rounded-btn bg-input px-2 py-1.5 text-xs text-text outline-none" />
                    <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder={t("rec.max")} className="w-full rounded-btn bg-input px-2 py-1.5 text-xs text-text outline-none" />
                    <button type="button" onClick={() => { setMin(""); setMax(""); setQuery(""); }} className="shrink-0 text-xs text-primary">
                      {t("rec.clear")}
                    </button>
                  </div>
                )}
              </div>

              {!hydrated ? (
                <div className="py-10 text-center text-sm text-muted">…</div>
              ) : (
                <RecordList
                  records={filtered}
                  emptyText={hasFilter ? t("rec.emptyFiltered") : t("rec.empty")}
                  onEdit={(r) => setSheet({ open: true, editing: r })}
                  onRemove={(id) => {
                    if (!window.confirm(t("history.deleteConfirm"))) return;
                    remove(id);
                    toast(t("toast.deleted"));
                  }}
                />
              )}
            </>
          ) : (
            <StatsPanel periodRecords={periodRecords} allRecords={records} />
          )}
        </>
      )}

      <EntrySheet open={sheet.open} editing={sheet.editing} onClose={() => setSheet({ open: false, editing: null })} />
    </main>
  );
}
