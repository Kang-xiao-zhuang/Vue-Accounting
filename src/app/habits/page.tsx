"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HabitCard } from "@/components/common/habit-card";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { useHabitsStore } from "@/store/habits.store";
import { useSettingsStore } from "@/store/settings.store";
import { HABIT_COLORS, HABIT_ICONS, type HabitInput, type HabitView } from "@/types";
import { fmt, parseDate, shiftDays, todayString, weekRange } from "@/utils/date";

const VIEWS: { key: HabitView; labelKey: string }[] = [
  { key: "grid", labelKey: "habit.viewGrid" },
  { key: "ring", labelKey: "habit.viewRing" },
  { key: "week", labelKey: "habit.viewWeek" },
  { key: "month", labelKey: "habit.viewMonth" },
];

const blank = (): HabitInput => ({
  name: "", icon: HABIT_ICONS[0], color: HABIT_COLORS[0], weeklyTarget: 0,
});

export default function HabitsPage() {
  const { t, locale } = useT();
  const habits = useHabitsStore((s) => s.habits);
  const create = useHabitsStore((s) => s.create);
  const update = useHabitsStore((s) => s.update);
  const remove = useHabitsStore((s) => s.remove);
  const toggle = useHabitsStore((s) => s.toggle);
  const persistPrefs = useSettingsStore((s) => s.setPref);
  const initialView = useSettingsStore((s) => s.prefs.habitView);
  const prefsHydrated = useSettingsStore((s) => s.hydrated);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HabitInput>(blank);
  const [view, setView] = useState<HabitView>(initialView);
  const [offset, setOffset] = useState(0);

  /** 偏好来自 localStorage，首帧还是默认值；hydrate 完成后同步一次（之后以用户选择为准）。 */
  useEffect(() => {
    if (prefsHydrated) setView(initialView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsHydrated]);

  const today = todayString();
  /** 圆环视图 30 天窗口的结束日：offset=0 为今天，往前每次整 30 天。 */
  const ringEnd = shiftDays(today, offset * 30);
  const setViewAndPersist = (v: HabitView) => { setView(v); setOffset(0); persistPrefs({ habitView: v }); };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editingId) update(editingId, { ...form, name: form.name.trim() });
    else create({ ...form, name: form.name.trim() });
    setForm(blank());
    setEditingId(null);
    setShowForm(false);
    toast(t("toast.saved"));
  };

  const startEdit = (h: (typeof habits)[number]) => {
    setEditingId(h.id);
    setForm({ name: h.name, icon: h.icon, color: h.color, weeklyTarget: h.weeklyTarget });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(blank()); };
  const onDelete = (id: string, name: string) => {
    if (!window.confirm(t("habit.confirmDelete", { name }))) return;
    remove(id);
    toast(t("habit.deleted"));
  };

  const navLabel = (() => {
    const base = parseDate(today);
    if (view === "week") {
      const shifted = parseDate(today);
      shifted.setDate(shifted.getDate() + offset * 7);
      const { start, end } = weekRange(shifted);
      return `${fmt(start)} – ${fmt(end)}`;
    }
    if (view === "month") {
      const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      return locale === "zh" ? `${d.getFullYear()} 年 ${d.getMonth() + 1} 月` : d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    }
    if (view === "ring") {
      return `${shiftDays(ringEnd, -29)} – ${ringEnd}`;
    }
    return today;
  })();

  const fieldLabel = "mb-2 block text-xs text-muted";

  return (
    <main>
      <PageHeader
        title={t("habit.title")}
        back={false}
        action={
          <button
            type="button"
            onClick={() => (showForm ? cancel() : setShowForm(true))}
            aria-label={t("habit.new")}
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-card text-text"
          >
            <Plus size={19} className={cn(showForm && "rotate-45 transition-transform")} />
          </button>
        }
      />

      <div className="px-4 pt-4">
        {showForm && (
          <div className="mb-4 rounded-card border border-line bg-card p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-btn text-xl" style={{ backgroundColor: form.color }}>{form.icon}</span>
              <input
                autoFocus
                value={form.name}
                maxLength={64}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={editingId ? t("habit.editName") : t("habit.newName")}
                className="min-w-0 flex-1 rounded-btn border border-line bg-input px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            <span className={fieldLabel}>{t("habit.icon")}</span>
            <div className="mb-3 grid grid-cols-8 gap-1">
              {HABIT_ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })} className={cn("flex h-8 items-center justify-center rounded-btn border border-line text-base", form.icon === ic && "border-primary bg-primary/10")}>{ic}</button>
              ))}
            </div>

            <span className={fieldLabel}>{t("habit.color")}</span>
            <div className="mb-3 flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setForm({ ...form, color: c })} aria-label={c}
                  className={cn("h-7 w-7 rounded-full border-2", form.color === c ? "border-text" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <span className={fieldLabel}>{t("habit.weeklyGoal")}</span>
            <div className="mb-4 grid grid-cols-9 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, weeklyTarget: n })} className={cn("h-8 rounded-btn border border-line text-xs text-text", form.weeklyTarget === n && "border-primary bg-primary/10 font-semibold")}>
                  {n === 0 ? t("habit.goalNone") : n}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={submit} disabled={!form.name.trim()} className="flex-1 rounded-btn bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-40">{editingId ? t("habit.saveBtn") : t("habit.addBtn")}</button>
              <button type="button" onClick={cancel} className="rounded-btn border border-line px-4 py-2 text-sm text-muted">{t("common.cancel")}</button>
            </div>
          </div>
        )}

        {habits.length === 0 && !showForm && (
          <div className="rounded-card border border-dashed border-line px-4 py-14 text-center text-sm text-muted">{t("habit.none")}</div>
        )}

        {habits.length > 0 && (
          <>
            <div className="mb-3 grid grid-cols-4 gap-1 rounded-btn bg-input p-1">
              {VIEWS.map((v) => (
                <button key={v.key} type="button" onClick={() => setViewAndPersist(v.key)} className={cn("rounded-btn py-1.5 text-xs", view === v.key ? "bg-card font-medium text-text" : "text-muted")}>{t(v.labelKey)}</button>
              ))}
            </div>

            {view !== "grid" && (
              <div className="mb-3 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setOffset(offset - 1)} aria-label="Previous" className="flex h-8 w-8 items-center justify-center rounded-btn border border-line bg-card text-text"><ChevronLeft size={16} /></button>
                <span className="text-xs text-muted">{navLabel}</span>
                <button
                  type="button" onClick={() => setOffset(offset + 1)} disabled={offset >= 0} aria-label="Next"
                  className="flex h-8 w-8 items-center justify-center rounded-btn border border-line bg-card text-text disabled:opacity-30"
                ><ChevronRight size={16} /></button>
              </div>
            )}

            <div className="space-y-3 pb-4">
              {habits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  today={today}
                  view={view}
                  offset={offset}
                  ringEnd={ringEnd}
                  locale={locale}
                  onToggle={(date) => toggle(h.id, date)}
                  onEdit={() => startEdit(h)}
                  onDelete={() => onDelete(h.id, h.name)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
