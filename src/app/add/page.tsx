"use client";

import { useState } from "react";
import type { RecordType } from "@/types";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useRecordsStore } from "@/store/records.store";
import { frequentCategories } from "@/utils/stats";
import { EntrySheet } from "@/components/common/entry-sheet";

export default function AddPage() {
  const { t, locale } = useT();
  const records = useRecordsStore((s) => s.records);
  const [type, setType] = useState<RecordType>("expense");
  const [sheet, setSheet] = useState<{ open: boolean; category: string } | null>(null);

  const frequent = frequentCategories(records, type);
  const frequentDefs = frequent
    .map((name) => CATEGORIES[type].find((c) => c.name === name))
    .filter((c): c is { name: string; icon: string } => Boolean(c));

  return (
    <main className="px-4 pt-4">
      <h1 className="mb-3 text-xl font-medium text-text">{t("add.title")}</h1>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["expense", "income"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setType(v)}
            className={cn(
              "rounded-btn border py-2.5 text-sm font-medium transition-colors",
              type === v
                ? v === "expense" ? "border-expense bg-input text-expense" : "border-income bg-input text-income"
                : "border-line bg-card text-muted",
            )}
          >
            {t(`common.${v}`)}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-muted">{t("add.hint", { type: t(`common.${type}`) })}</p>

      {/* 常用：横向胶囊，只作快捷入口，不再和下面的完整网格抢版面 */}
      {frequentDefs.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t("add.frequent")}</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {frequentDefs.map((c) => (
              <button
                key={`fav-${c.name}`}
                type="button"
                onClick={() => setSheet({ open: true, category: c.name })}
                className="flex shrink-0 items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 text-xs text-text active:bg-input"
              >
                <span className="text-base">{c.icon}</span>
                {categoryLabel(c.name, locale)}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t("common.category")}</h2>
        <div className="grid grid-cols-4 gap-2 pb-4">
          {CATEGORIES[type].map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSheet({ open: true, category: c.name })}
              className="flex flex-col items-center gap-1 rounded-card border border-line bg-card px-1 py-3 transition-colors active:border-primary"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="w-full truncate text-center text-[11px] text-muted">{categoryLabel(c.name, locale)}</span>
            </button>
          ))}
        </div>
      </section>

      {sheet && (
        <EntrySheet
          open={sheet.open}
          editing={null}
          initial={{ type, category: sheet.category }}
          onClose={() => setSheet(null)}
        />
      )}
    </main>
  );
}
