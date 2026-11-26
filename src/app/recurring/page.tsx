"use client";

import { useState } from "react";
import { Pause, Pencil, Play, PlayCircle, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CATEGORIES, categoryLabel, iconFor } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import { money } from "@/lib/money";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useRecordsStore } from "@/store/records.store";
import { useRulesStore } from "@/store/rules.store";
import { useSettingsStore } from "@/store/settings.store";
import type { Frequency, RecurringInput, RecordType } from "@/types";
import { todayString } from "@/utils/date";

const blank = (): RecurringInput => ({
  type: "expense",
  category: CATEGORIES.expense[0].name,
  amount: 0,
  note: "",
  frequency: "MONTHLY",
  nextRunDate: todayString(),
  active: true,
});

const FREQ_LABEL: Record<Frequency, string> = {
  DAILY: "recur.daily", WEEKLY: "recur.weekly", MONTHLY: "recur.monthly",
};

export default function RecurringPage() {
  const { t, locale } = useT();
  const rules = useRulesStore((s) => s.rules);
  const create = useRulesStore((s) => s.create);
  const update = useRulesStore((s) => s.update);
  const remove = useRulesStore((s) => s.remove);
  const runDue = useRulesStore((s) => s.runDue);
  const loadRecords = useRecordsStore((s) => s.hydrate);
  const currency = useSettingsStore((s) => s.settings.currency);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RecurringInput>(blank);

  const setType = (type: RecordType) => {
    const category = CATEGORIES[type].some((c) => c.name === form.category) ? form.category : CATEGORIES[type][0].name;
    setForm({ ...form, type, category });
  };

  const submit = () => {
    if (!(form.amount > 0)) return;
    const payload = { ...form, amount: Math.round(form.amount * 100) / 100, note: form.note.trim() };
    if (editingId) update(editingId, payload);
    else create(payload);
    setForm(blank());
    setEditingId(null);
    setShowForm(false);
    toast(t("toast.saved"));
  };

  const startEdit = (r: (typeof rules)[number]) => {
    setEditingId(r.id);
    setForm({
      type: r.type, category: r.category, amount: r.amount, note: r.note,
      frequency: r.frequency, nextRunDate: r.nextRunDate, active: r.active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(blank()); };

  const onRunNow = () => {
    const created = runDue();
    loadRecords();
    toast(created > 0 ? t("recur.created", { n: created }) : t("recur.nothingDue"));
  };

  const fieldCls = "w-full rounded-btn border border-line bg-input px-3 py-2 text-sm text-text outline-none focus:border-primary";

  return (
    <main>
      <PageHeader
        title={t("recur.title")}
        action={
          <button
            type="button" onClick={onRunNow} title={t("recur.runNow")}
            className="flex items-center gap-1 rounded-btn border border-line bg-card px-2.5 py-1.5 text-xs text-text"
          >
            <PlayCircle size={15} /> {t("recur.runNow")}
          </button>
        }
      />

      <div className="px-4 pt-4">
        {showForm ? (
          <div className="mb-4 rounded-card border border-line bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-text">{editingId ? t("recur.editRule") : t("recur.newRule")}</span>
              {editingId && <button type="button" onClick={cancel} className="text-xs text-muted">{t("common.cancel")}</button>}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-1 rounded-btn bg-input p-1">
              {(["expense", "income"] as RecordType[]).map((ty) => (
                <button
                  key={ty} type="button" onClick={() => setType(ty)}
                  className={cn(
                    "rounded-btn py-1.5 text-xs",
                    form.type === ty ? (ty === "expense" ? "bg-expense/15 font-medium text-expense" : "bg-income/15 font-medium text-income") : "text-muted",
                  )}
                >{t(ty === "expense" ? "common.expense" : "common.income")}</button>
              ))}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <label className="text-xs text-muted">
                {t("common.category")}
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cn(fieldCls, "mt-1")}>
                  {CATEGORIES[form.type].map((c) => <option key={c.name} value={c.name}>{c.icon} {categoryLabel(c.name, locale)}</option>)}
                </select>
              </label>
              <label className="text-xs text-muted">
                {t("common.amount")}
                <input type="number" min="0" step="0.01" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" className={cn(fieldCls, "mt-1")} />
              </label>
              <label className="text-xs text-muted">
                {t("recur.frequency")}
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })} className={cn(fieldCls, "mt-1")}>
                  {(["DAILY", "WEEKLY", "MONTHLY"] as Frequency[]).map((f) => <option key={f} value={f}>{t(FREQ_LABEL[f])}</option>)}
                </select>
              </label>
              <label className="text-xs text-muted">
                {t("recur.nextRun")}
                <input type="date" value={form.nextRunDate} onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })} className={cn(fieldCls, "mt-1")} />
              </label>
            </div>

            <input value={form.note} maxLength={255} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("recur.notePh")} className={cn(fieldCls, "mb-3")} />

            <button type="button" onClick={submit} disabled={!(form.amount > 0)} className="w-full rounded-btn bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-40">
              {editingId ? t("recur.saveBtn") : `＋ ${t("recur.addBtn")}`}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowForm(true)} className="mb-4 flex w-full items-center justify-center gap-1 rounded-btn border border-dashed border-line py-2.5 text-sm text-muted hover:border-primary hover:text-primary">
            <Plus size={16} /> {t("recur.newRule")}
          </button>
        )}

        {rules.length === 0 && !showForm && (
          <div className="rounded-card border border-dashed border-line px-4 py-12 text-center text-sm text-muted">{t("recur.none")}</div>
        )}

        <div className="space-y-2 pb-4">
          {rules.map((r) => (
            <div key={r.id} className={cn("flex items-center gap-3 rounded-card border border-line bg-card p-3", !r.active && "opacity-60")}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-input text-xl">{iconFor(r.type, r.category)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-text">{categoryLabel(r.category, locale)}</span>
                  {!r.active && (
                    <span className="shrink-0 rounded-pill bg-input px-1.5 py-0.5 text-[10px] text-muted">{t("recur.paused")}</span>
                  )}
                  <span className={cn("shrink-0 text-sm font-semibold", r.type === "income" ? "text-income" : "text-expense")}>
                    {r.type === "income" ? "+" : "-"}{money(r.amount, currency)}
                  </span>
                </div>
                <div className="truncate text-xs text-muted">
                  {t(FREQ_LABEL[r.frequency])} · {t("recur.nextLabel", { date: r.nextRunDate })}
                </div>
                {r.note && <div className="truncate text-xs text-muted">{r.note}</div>}
              </div>
              <div className="flex shrink-0 gap-0.5">
                <button type="button" onClick={() => startEdit(r)} aria-label={t("recur.edit")} className="rounded-btn p-2 text-muted hover:text-text"><Pencil size={15} /></button>
                <button
                  type="button"
                  onClick={() => update(r.id, { ...r, active: !r.active })}
                  aria-label={r.active ? t("recur.pause") : t("recur.resume")}
                  className="rounded-btn p-2 text-muted hover:text-text"
                >{r.active ? <Pause size={15} /> : <Play size={15} />}</button>
                <button
                  type="button"
                  onClick={() => { if (window.confirm(t("recur.confirmDelete"))) remove(r.id); }}
                  aria-label={t("recur.delete")}
                  className="rounded-btn p-2 text-muted hover:text-expense"
                ><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
