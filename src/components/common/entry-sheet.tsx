"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Delete, X } from "lucide-react";
import type { LedgerRecord, RecordInput, RecordType } from "@/types";
import { CATEGORIES, categoryLabel, iconFor } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { useRecordsStore } from "@/store/records.store";
import { useSettingsStore } from "@/store/settings.store";
import { noteSuggestions } from "@/utils/stats";
import { todayString } from "@/utils/date";
import { cn } from "@/lib/cn";

interface EntrySheetProps {
  open: boolean;
  editing: LedgerRecord | null;
  initial?: { type: RecordType; category: string };
  onClose: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;
const MAX_DIGITS = 9;

export function EntrySheet({ open, editing, initial, onClose }: EntrySheetProps) {
  const { t, locale } = useT();
  const symbol = useSettingsStore((s) => s.settings.currency);
  const records = useRecordsStore((s) => s.records);
  const createRecord = useRecordsStore((s) => s.create);
  const updateRecord = useRecordsStore((s) => s.update);

  const [type, setType] = useState<RecordType>("expense");
  const [category, setCategory] = useState(CATEGORIES.expense[0].name);
  const [amountText, setAmountText] = useState("");
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState("");
  const [showMeta, setShowMeta] = useState(false);
  const [error, setError] = useState(false);

  /** 每次打开都按当前来源重置，避免残留上一次的输入。 */
  useEffect(() => {
    if (!open) return;
    const t0 = editing?.type ?? initial?.type ?? "expense";
    setType(t0);
    setCategory(editing?.category ?? initial?.category ?? CATEGORIES[t0][0].name);
    setAmountText(editing ? String(editing.amount) : "");
    setDate(editing?.date ?? todayString());
    setNote(editing?.note ?? "");
    setShowMeta(false);
    setError(false);
  }, [open, editing?.id, initial?.type, initial?.category]);

  const suggestions = useMemo(
    () => (open ? noteSuggestions(records, category) : []),
    [open, records, category],
  );

  const amount = Number(amountText);
  const valid = Number.isFinite(amount) && amount > 0;

  const press = (key: (typeof KEYS)[number]) => {
    setError(false);
    if (key === "del") {
      setAmountText((prev) => prev.slice(0, -1));
      return;
    }
    if (key === ".") {
      setAmountText((prev) => (prev.includes(".") ? prev : prev === "" ? "0." : `${prev}.`));
      return;
    }
    setAmountText((prev) => {
      if (prev === "0") return key;
      const next = prev + key;
      if (next.replace(".", "").length > MAX_DIGITS) return prev;
      const decimals = next.split(".")[1];
      if (decimals && decimals.length > 2) return prev;
      return next;
    });
  };

  const submit = () => {
    if (!valid) {
      setError(true);
      return;
    }
    const input: RecordInput = { type, category, amount, date, note: note.trim() };
    if (editing) {
      updateRecord(editing.id, input);
      toast(t("toast.updated"));
    } else {
      createRecord(input);
      toast(t("toast.saved"));
    }
    onClose();
  };

  const switchType = (next: RecordType) => {
    setType(next);
    setCategory((prev) => (CATEGORIES[next].some((c) => c.name === prev) ? prev : CATEGORIES[next][0].name));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button type="button" aria-label={t("common.cancel")} onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="animate-sheet relative z-10 w-full max-w-app rounded-t-[20px] border-t border-line bg-bg px-4 pb-5 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium text-text">{editing ? t("sheet.edit") : t("sheet.new")}</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} aria-label={t("common.cancel")} className="rounded-btn p-1.5 text-muted hover:text-text">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 分类摘要：点击才展开类型/分类选择，避免和上一步重复 */}
        <button
          type="button"
          onClick={() => setShowMeta((v) => !v)}
          className="mb-2 flex w-full items-center gap-2 rounded-btn border border-line bg-input px-3 py-2.5 text-left"
        >
          <span className="text-lg">{iconFor(type, category)}</span>
          <span className="text-sm text-text">{categoryLabel(category, locale)}</span>
          <span className={cn("text-xs", type === "expense" ? "text-expense" : "text-income")}>{t(`common.${type}`)}</span>
          <ChevronDown size={15} className={cn("ml-auto text-muted transition-transform", showMeta && "rotate-180")} />
        </button>

        {showMeta && (
          <div className="mb-2 space-y-2 rounded-btn border border-line bg-card p-2">
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => switchType(v)}
                  className={cn(
                    "rounded-btn border py-2 text-sm font-medium",
                    type === v
                      ? v === "expense" ? "border-expense bg-input text-expense" : "border-income bg-input text-income"
                      : "border-line bg-card text-muted",
                  )}
                >
                  {t(`common.${v}`)}
                </button>
              ))}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-btn border border-line bg-input px-3 py-2 text-sm text-text"
            >
              {CATEGORIES[type].map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {categoryLabel(c.name, locale)}</option>
              ))}
            </select>
          </div>
        )}

        {/* 金额显示 */}
        <div className="mb-1 flex items-baseline justify-end gap-1 px-1">
          <span className="text-xl text-muted">{symbol}</span>
          <span className={cn("text-4xl font-semibold tabular-nums", amountText ? "text-text" : "text-muted/60")}>
            {amountText || "0"}
          </span>
        </div>
        <div className={cn("mb-2 h-4 text-right text-xs", error ? "text-expense" : "text-transparent")}>
          {t("sheet.errAmount")}
        </div>

        {/* 数字键盘 */}
        <div className="mb-2 grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === "del" ? t("sheet.backspace") : k}
              className="flex h-12 items-center justify-center rounded-btn border border-line bg-card text-lg font-medium text-text active:bg-input"
            >
              {k === "del" ? <Delete size={20} /> : k}
            </button>
          ))}
        </div>

        {/* 日期与备注 */}
        <div className="mb-3 grid grid-cols-[128px_1fr] gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label={t("common.date")}
            className="w-full rounded-btn border border-line bg-input px-2 py-2 text-sm text-text"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            list="bk-note-suggestions"
            maxLength={64}
            placeholder={t("sheet.notePlaceholder")}
            className="w-full rounded-btn border border-line bg-input px-3 py-2 text-sm text-text"
          />
          <datalist id="bk-note-suggestions">
            {suggestions.map((n) => <option key={n} value={n} />)}
          </datalist>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!valid}
          className="w-full rounded-btn bg-primary py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {editing ? t("sheet.update") : t("sheet.save")}
        </button>
      </div>
    </div>
  );
}
