"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Habit, HabitView } from "@/types";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings.store";
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

/** 热力图几何：53 列 × 7 行，画在 canvas 上（371 个按钮的 DOM 方案在低端安卓上会卡）。 */
const CELL = 16;
const GAP = 4;
const PITCH = CELL + GAP;
const COLS = 53;
const ROWS = 7;

/** 53 周热力图，按列（周）渲染，每列 7 格。 */
function gridWeeks(checkins: Set<string>, today: string) {
  const anchor = weekAnchor(today, 0);
  anchor.setDate(anchor.getDate() - 52 * 7);
  const weeks: { date: string; checked: boolean; future: boolean }[][] = [];
  for (let w = 0; w < COLS; w++) {
    const col = [];
    for (let d = 0; d < ROWS; d++) {
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

  const ringDays = view === "ring" ? lastNDays(30, ringEnd) : [];
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

  // 三种视图只有一种会渲染，只算当前视图的数据（网格 371 格 × N 张卡片，全算会明显拖慢切页）。
  const weekDates = useMemo(() => {
    if (view !== "week") return [];
    const start = weekAnchor(today, offset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const date = fmt(d);
      return { date, checked: checkins.has(date), future: date > today, today: date === today, dayNum: d.getDate(), label: dow[i] };
    });
  }, [view, today, offset, checkins, dow]);

  const monthKey = monthAnchor(today, offset);
  const [year, mon] = monthKey.split("-").map(Number);
  const cells = useMemo(() => {
    if (view !== "month") return [];
    return monthGrid(year, mon - 1).map((date) => (
      date ? { date, day: Number(date.slice(-2)), checked: checkins.has(date), future: date > today, today: date === today } : null
    ));
  }, [view, year, mon, checkins, today]);

  const weeks = useMemo(() => (view === "grid" ? gridWeeks(checkins, today) : []), [view, checkins, today]);

  /**
   * 热力图用 canvas 绘制：整张图只有 1 个 DOM 节点，点击时按坐标反算日期。
   * 颜色取自 CSS 变量，切换主题时重绘。
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeKey = useSettingsStore((s) => s.settings.theme);
  const themeCustom = useSettingsStore((s) => s.settings.custom);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || view !== "grid") return;
    const cssW = COLS * PITCH;
    const cssH = ROWS * PITCH;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const vars = getComputedStyle(document.documentElement);
    const emptyColor = vars.getPropertyValue("--input").trim() || "#232a40";
    const borderColor = vars.getPropertyValue("--border").trim() || "#2c3450";
    // 旧版 WebView 没有 roundRect，退化为直角方块，不影响点击。
    const hasRoundRect = typeof (ctx as CanvasRenderingContext2D & { roundRect?: unknown }).roundRect === "function";
    const box = (x: number, y: number) => {
      ctx.beginPath();
      if (hasRoundRect) ctx.roundRect(x, y, CELL, CELL, 4);
      else ctx.rect(x, y, CELL, CELL);
    };

    weeks.forEach((col, ci) => {
      col.forEach((cell, ri) => {
        const x = ci * PITCH;
        const y = ri * PITCH;
        ctx.globalAlpha = cell.future ? 0.25 : 1;
        box(x, y);
        if (cell.checked) {
          ctx.fillStyle = habit.color;
          ctx.fill();
        } else {
          ctx.fillStyle = emptyColor;
          ctx.fill();
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
    ctx.globalAlpha = 1;
  }, [view, weeks, habit.color, themeKey, themeCustom]);

  const onGridClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    // 画布可能被 CSS 缩放（窄屏 / 浏览器缩放），按比例换算回画布坐标。
    const scale = (COLS * PITCH) / rect.width;
    const ci = Math.floor(((e.clientX - rect.left) * scale) / PITCH);
    const ri = Math.floor(((e.clientY - rect.top) * scale) / PITCH);
    const cell = weeks[ci]?.[ri];
    if (!cell || cell.future) return;
    onToggle(cell.date);
  }, [weeks, onToggle]);

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

      {/* 网格热力图（canvas：整块 1 个节点） */}
      {view === "grid" && (
        <div ref={gridRef} className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
          <canvas
            ref={canvasRef}
            onClick={onGridClick}
            role="img"
            aria-label={t("habit.gridAria", { n: total })}
            className="block cursor-pointer"
            style={{ width: COLS * PITCH, height: ROWS * PITCH }}
          />
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
