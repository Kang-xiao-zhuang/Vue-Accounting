"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Period } from "@/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { useRecordsStore, periodRangeLabel } from "@/store/records.store";

const PERIODS: Period[] = ["day", "week", "month", "all"];

export function PeriodNav() {
  const { t } = useT();
  const period = useRecordsStore((s) => s.period);
  const anchor = useRecordsStore((s) => s.anchor);
  const today = useRecordsStore((s) => s.today);
  const setPeriod = useRecordsStore((s) => s.setPeriod);
  const shift = useRecordsStore((s) => s.shift);
  const goToday = useRecordsStore((s) => s.goToday);

  const isCurrent = period === "all"
    || (period === "day" && anchor === today)
    || (period === "month" && anchor.slice(0, 7) === today.slice(0, 7));
  const label = period === "all" ? t("common.all") : periodRangeLabel(period, anchor);

  return (
    <div className="mb-3 rounded-card border border-line bg-card p-3">
      <div className="no-scrollbar mb-3 flex gap-1 overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-btn px-3 py-1.5 text-xs font-medium transition-colors",
              period === p ? "bg-primary text-white" : "bg-input text-muted hover:text-text",
            )}
          >
            {t(`common.${p}`)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="上一期"
          disabled={period === "all"}
          onClick={() => shift(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-line text-text disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-medium text-text">{label}</div>
          {!isCurrent && (
            <button type="button" onClick={goToday} className="text-xs text-primary underline">
              {t("common.today")}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="下一期"
          disabled={period === "all"}
          onClick={() => shift(1)}
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-line text-text disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
