"use client";

import { useRef, useState } from "react";
import { Database, Download, FileUp, HardDrive, Trash2 } from "lucide-react";
import type { BackupPayload, ThemeKey } from "@/types";
import { CURRENCY_OPTIONS } from "@/lib/money";
import { formatBytes, STORAGE_QUOTA, storageUsage } from "@/lib/storage";
import { THEMES, THEME_LABELS } from "@/lib/theme";
import { buildBackup, lastExported, markExported, mergeById, parseBackup, saveSnapshot, saveTextFile, toCsv } from "@/lib/backup";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useRecordsStore } from "@/store/records.store";
import { useBudgetsStore } from "@/store/budgets.store";
import { useSettingsStore } from "@/store/settings.store";
import { useHabitsStore } from "@/store/habits.store";
import { useTodosStore } from "@/store/todos.store";
import { useRulesStore } from "@/store/rules.store";
import { PageHeader } from "@/components/layout/page-header";

const THEME_KEYS: ThemeKey[] = ["light", "dark", "duotone", "ocean", "forest", "sunset", "rose", "slate", "auto", "custom"];

export default function SettingsPage() {
  const { t } = useT();
  const settings = useSettingsStore((s) => s.settings);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setCustom = useSettingsStore((s) => s.setCustom);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupPayload | null>(null);
  const [mode, setMode] = useState<"merge" | "overwrite">("merge");
  const [exportedAt, setExportedAt] = useState<string | null>(lastExported());

  const used = storageUsage();
  const usagePct = Math.min(100, Math.round((used / STORAGE_QUOTA) * 100));

  const exportJson = async () => {
    const payload = buildBackup(
      useRecordsStore.getState().records,
      useBudgetsStore.getState().budgets,
      useSettingsStore.getState().settings,
      useHabitsStore.getState().habits,
      useTodosStore.getState().todos,
      useRulesStore.getState().rules,
    );
    await saveTextFile(JSON.stringify(payload, null, 2), "bookkeeping-backup", "json", "application/json");
    markExported();
    setExportedAt(lastExported());
    toast(t("toast.exported"));
  };

  const exportCsv = async () => {
    await saveTextFile(toCsv(useRecordsStore.getState().records), "bookkeeping", "csv", "text/csv;charset=utf-8");
    toast(t("toast.exported"));
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const payload = parseBackup(await file.text());
    if (!payload) { toast(t("settings.importBad")); return; }
    setPending(payload);
  };

  const applyImport = () => {
    if (!pending) return;
    const records = useRecordsStore.getState();
    const budgets = useBudgetsStore.getState();
    const habits = useHabitsStore.getState();
    const todos = useTodosStore.getState();
    const rules = useRulesStore.getState();
    if (mode === "overwrite") {
      saveSnapshot(buildBackup(
        records.records, budgets.budgets, useSettingsStore.getState().settings,
        habits.habits, todos.todos, rules.rules,
      ));
      records.replaceAll(pending.records);
      budgets.replaceAll(pending.budgets);
      habits.replaceAll(pending.habits ?? []);
      todos.replaceAll(pending.todos ?? []);
      rules.replaceAll(pending.rules ?? []);
      if (pending.settings) useSettingsStore.getState().replaceSettings(pending.settings);
    } else {
      records.replaceAll(mergeById(records.records, pending.records));
      budgets.replaceAll(mergeById(budgets.budgets, pending.budgets));
      habits.replaceAll(mergeById(habits.habits, pending.habits ?? []));
      todos.replaceAll(mergeById(todos.todos, pending.todos ?? []));
      rules.replaceAll(mergeById(rules.rules, pending.rules ?? []));
    }
    setPending(null);
    toast(t("toast.imported"));
  };

  const clearAll = () => {
    if (!window.confirm(t("settings.clearConfirm"))) return;
    useRecordsStore.getState().clear();
    useBudgetsStore.getState().clear();
    useHabitsStore.getState().clear();
    useTodosStore.getState().clear();
    useRulesStore.getState().clear();
    toast(t("toast.cleared"));
  };

  return (
    <main>
      <PageHeader title={t("settings.title")} />
      <div className="space-y-5 px-4 pt-4">
        <p className="rounded-card border border-line bg-card p-3 text-xs text-muted">{t("settings.localOnly")}</p>

        <section>
          <h2 className="mb-2 text-sm font-medium text-text">{t("settings.theme")}</h2>
          <div className="flex flex-wrap gap-2">
            {THEME_KEYS.map((key) => {
              const vars = THEMES[key === "custom" || key === "auto" ? "dark" : key];
              const active = settings.theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-pill border px-3 py-1.5 text-xs",
                    active ? "border-primary text-primary" : "border-line bg-card text-muted",
                  )}
                >
                  <span className="h-3 w-3 rounded-full border border-line" style={{ background: vars.primary }} />
                  {THEME_LABELS[key]}
                </button>
              );
            })}
          </div>
          {settings.theme === "custom" && (
            <div className="mt-3 space-y-2 rounded-card border border-line bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{t("settings.customBase")}</span>
                <div className="flex gap-1">
                  {(["dark", "light"] as const).map((b) => (
                    <button key={b} type="button" onClick={() => setCustom({ base: b })} className={cn("rounded-btn px-2 py-1", settings.custom.base === b ? "bg-primary text-white" : "bg-input")}>
                      {b === "dark" ? THEME_LABELS.dark : THEME_LABELS.light}
                    </button>
                  ))}
                </div>
              </div>
              {([
                ["primary", "settings.customPrimary"],
                ["income", "settings.customIncome"],
                ["expense", "settings.customExpense"],
              ] as const).map(([field, label]) => (
                <label key={field} className="flex items-center justify-between text-xs text-muted">
                  {t(label)}
                  <input
                    type="color"
                    value={settings.custom[field]}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustom(field === "primary" ? { primary: v } : field === "income" ? { income: v } : { expense: v });
                    }}
                    className="h-8 w-14 cursor-pointer rounded-btn border border-line bg-input"
                  />
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text">{t("settings.language")}</span>
            <select value={settings.locale} onChange={(e) => setLocale(e.target.value as "zh" | "en")} className="w-full rounded-btn border border-line bg-card px-3 py-2 text-sm text-text">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text">{t("settings.currency")}</span>
            <select value={settings.currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-btn border border-line bg-card px-3 py-2 text-sm text-text">
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-text"><Database size={16} /> {t("settings.data")}</h2>
          <div className="space-y-2">
            <button type="button" onClick={exportJson} className="flex w-full items-center gap-2 rounded-btn border border-line bg-card px-3 py-2.5 text-sm text-text hover:border-primary">
              <Download size={16} /> {t("settings.exportJson")}
            </button>
            <button type="button" onClick={exportCsv} className="flex w-full items-center gap-2 rounded-btn border border-line bg-card px-3 py-2.5 text-sm text-text hover:border-primary">
              <Download size={16} /> {t("settings.exportCsv")}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-btn border border-line bg-card px-3 py-2.5 text-sm text-text hover:border-primary">
              <FileUp size={16} /> {t("settings.importJson")}
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onPickFile} className="hidden" />

            {pending && (
              <div className="rounded-card border border-primary bg-card p-3">
                <p className="mb-2 text-xs text-text">{t("settings.importPreview", { n: pending.records.length, b: pending.budgets.length })}</p>
                {pending.version === 2 && (
                  <p className="mb-2 text-xs text-muted">{t("settings.importPreview2", { h: pending.habits?.length ?? 0, t: pending.todos?.length ?? 0, r: pending.rules?.length ?? 0 })}</p>
                )}
                <div className="mb-3 flex gap-2">
                  {(["merge", "overwrite"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setMode(m)} className={cn("flex-1 rounded-btn border py-1.5 text-xs", mode === m ? "border-primary text-primary" : "border-line text-muted")}>
                      {m === "merge" ? t("settings.modeMerge") : t("settings.modeOverwrite")}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={applyImport} className="flex-1 rounded-btn bg-primary py-2 text-xs text-white">{t("common.confirm")}</button>
                  <button type="button" onClick={() => setPending(null)} className="flex-1 rounded-btn border border-line py-2 text-xs text-muted">{t("common.cancel")}</button>
                </div>
              </div>
            )}

            <button type="button" onClick={clearAll} className="flex w-full items-center gap-2 rounded-btn border border-expense bg-card px-3 py-2.5 text-sm text-expense">
              <Trash2 size={16} /> {t("settings.clearAll")}
            </button>
          </div>
        </section>

        <section className="rounded-card border border-line bg-card p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1"><HardDrive size={14} /> {t("settings.storage")}</span>
            <span className="tabular-nums">{formatBytes(used)} / {formatBytes(STORAGE_QUOTA)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-input">
            {/* 占比极小时仍留 2% 宽度，否则进度条看起来像坏的 */}
            <div className={cn("h-full rounded-pill", usagePct > 80 ? "bg-expense" : "bg-primary")} style={{ width: `${Math.max(2, usagePct)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("settings.lastExport")}: {exportedAt ? new Date(exportedAt).toLocaleString() : t("settings.never")}
          </p>
        </section>

        <section className="flex items-center justify-between pb-4 text-xs text-muted">
          <span>{t("settings.about")}</span>
          <span>{t("settings.version")} {process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </section>
      </div>
    </main>
  );
}
