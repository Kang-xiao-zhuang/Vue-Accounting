"use client";

import { useEffect, useMemo, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Habit, HabitView } from "@/types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { fmt } from "@/utils/date";
import { currentStreak, lastNDays, longestStreak, monthAnchor, monthGrid, weekAnchor, weeklyDone } from "@/utils/habits";

interface HabitCardProps {
  habit: Habit;
  today: string;
  view: HabitView;
  offset: number;
  /** 圆环视图统计窗口的结束日（默认今天），由页面按 offset 计算。 */
  ringEnd: string;
  locale: "zh" | "en";
  onToggle: (date: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DOW_ZH = ["一", "二", "三", "四", "五", "六", "日"];
const DOW_EN = ["M", "T", "W", "T", "F", "S", "S"];

/** 53 周热力图，按列（周）渲染，每列 7 格。 */
function gridWeeks(checkins: Set<string>, today: string) {
  const anchor = weekAnchor(today, 0);
  anchor.setDate(anchor.getDate() - 52 * 7);
  const weeks: { date: string; checked: boolean; future: boolean }[][] = [];
  for (let w = 0; w < 53; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = fmt(anchor);
      col.push({ date, checked: checkins.has(date), future: date > today });
      anchor.setDate(anchor.getDate() + 1);
    }
    weeks.push(col);
  }
  return weeks;
}

export function HabitCard({ habit, today, view, offset, ringEnd, locale, onToggle, onEdit, onDelete }: HabitCardProps) {
  const { t } = useT();
  const checkins = useMemo(() => new Set(habit.checkins), [habit.checkins]);
  const streak = currentStreak(habit.checkins, today);
  const best = longestStreak(habit.checkins);
  const total = habit.checkins.length;
  const doneThisWeek = weeklyDone(habit.checkins, today);
  const checkedToday = checkins.has(today);
  const dow = locale === "zh" ? DOW_ZH : DOW_EN;

  const ringDays = lastNDays(30, ringEnd);
  const ringDone = ringDays.filter((d) => checkins.has(d)).length;
  const ringPct = Math.round((ringDone / 30) * 100);
  const RING_C = 2 * Math.PI * 54;

  /**
   * 53 周热力图横向溢出，浏览器默认停在最左（一年前）。
   * 挂载后滚到最右侧，让用户一进来就看见最近几周。
   */
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (view !== "grid") return;
    const el = gridRef.current;
    if (!el) return;
    // 首帧宽度可能还没完成布局，等下一帧再滚到最右。
    const id = requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
    return () => cancelAnimationFrame(id);
  }, [view]);

  const weekDates = useMemo(() => {
    const start = weekAnchor(today, offset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const date = fmt(d);
      return { date, checked: checkins.has(date), future: date > today, today: date === today, dayNum: d.getDate(), label: dow[i] };
    });
  }, [today, offset, checkins, dow]);

  const monthKey = monthAnchor(today, offset);
  const [year, mon] = monthKey.split("-").map(Number);
  const cells = useMemo(() => monthGrid(year, mon - 1).map((date) => (
    date ? { date, day: Number(date.slice(-2)), checked: checkins.has(date), future: date > today, today: date === today } : null
  )), [year, mon, checkins, today]);

  const weeks = useMemo(() => gridWeeks(checkins, today), [checkins, today]);
  const monthTitle = locale === "zh" ? `${year} 年 ${mon} 月` : new Date(year, mon - 1, 1).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <section className="rounded-card border border-line bg-card p-3">
      {/* 统计条 */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span className={cn(streak > 0 && "text-expense")}>🔥 {streak} {streak === 1 ? t("habit.day") : t("habit.days")}</span>
          <span>🏆 {best} {t("habit.best")}</span>
          <span>✅ {total}</span>
          {habit.weeklyTarget > 0 && (
            <span className={cn(doneThisWeek >= habit.weeklyTarget && "text-income")}>
              🎯 {doneThisWeek}/{habit.weeklyTarget}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} aria-label={t("recur.edit")} className="rounded-btn p-2 text-muted hover:text-text"><Pencil size={16} /></button>
          <button type="button" onClick={onDelete} aria-label={t("recur.delete")} className="rounded-btn p-2 text-muted hover:text-expense"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* 网格热力图 */}
      {view === "grid" && (
        <div ref={gridRef} className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex w-max gap-[3px]">
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell) => (
                  <button
                    key={cell.date}
                    type="button"
                    disabled={cell.future}
                    onClick={() => !cell.future && onToggle(cell.date)}
                    title={cell.date}
                    aria-label={cell.date}
                    className={cn(
                      "h-[11px] w-[11px] rounded-[3px] border border-line bg-input transition-colors",
                      cell.checked && "border-transparent",
                      cell.future && "opacity-25",
                    )}
                    style={cell.checked ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 近 30 天圆环 */}
      {view === "ring" && (
        <div className="flex flex-col items-center py-1">
          <div className="relative h-[140px] w-[140px]">
            <svg viewBox="0 0 140 140" className="h-full w-full">
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--input)" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="54" fill="none" stroke={habit.color} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - ringPct / 100)}
                transform="rotate(-90 70 70)" className="transition-all"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold text-text">{ringPct}%</div>
              <div className="text-xs text-muted">{t("habit.ringSub", { n: ringDone })}</div>
            </div>
          </div>
        </div>
      )}

      {/* 周视图 */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d) => (
            <button
              key={d.date}
              type="button"
              disabled={d.future}
              onClick={() => !d.future && onToggle(d.date)}
              className={cn("flex flex-col items-center gap-1 rounded-btn py-1 text-xs", d.future && "opacity-30")}
            >
              <span className={cn("text-muted", d.today && "font-semibold text-primary")}>{d.label}</span>
              <span
                className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-line text-text", d.checked && "border-transparent text-white")}
                style={d.checked ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
              >{d.dayNum}</span>
            </button>
          ))}
        </div>
      )}

      {/* 月历 */}
      {view === "month" && (
        <div>
          <div className="mb-2 text-center text-sm font-medium text-text">{monthTitle}</div>
          <div className="grid grid-cols-7 gap-1">
            {dow.map((d, i) => <div key={i} className="text-center text-[11px] text-muted">{d}</div>)}
            {cells.map((c, i) => (
              c ? (
                <button
                  key={c.date}
                  type="button"
                  disabled={c.future}
                  onClick={() => !c.future && onToggle(c.date)}
                  title={c.date}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-btn border border-transparent text-xs text-text",
                    c.today && "border-primary", c.checked && "border-transparent font-semibold text-white", c.future && "opacity-25",
                  )}
                  style={c.checked ? { backgroundColor: habit.color } : undefined}
                >{c.day}</button>
              ) : <div key={`e${i}`} />
            ))}
          </div>
        </div>
      )}

      {/* 底部：名称 + 今日打卡 */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-btn text-sm" style={{ backgroundColor: habit.color }}>{habit.icon || "🎯"}</span>
          <span className="truncate text-sm font-medium text-text">{habit.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(today)}
          title={checkedToday ? t("habit.checked") : t("habit.checkin")}
          className={cn(
            "shrink-0 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
            checkedToday ? "text-white" : "border border-line bg-input text-text hover:border-primary",
          )}
          style={checkedToday ? { backgroundColor: habit.color } : undefined}
        >
          {checkedToday ? "✓ " + t("habit.doneFab") : "+ " + t("habit.doneFab")}
        </button>
      </div>
    </section>
  );
}
