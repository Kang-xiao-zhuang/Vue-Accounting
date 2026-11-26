"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock3, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settings.store";
import { useTodosStore } from "@/store/todos.store";
import type { Priority, TodoItem } from "@/types";
import { parseDate } from "@/utils/date";

const PRIORITY_COLORS: Record<Priority, string> = {
  0: "var(--muted)",
  1: "var(--primary)",
  2: "var(--expense)",
};

export default function TodosPage() {
  const { t, locale } = useT();
  const todos = useTodosStore((s) => s.todos);
  const anchor = useTodosStore((s) => s.anchor);
  const today = useTodosStore((s) => s.today);
  const shift = useTodosStore((s) => s.shift);
  const goToday = useTodosStore((s) => s.goToday);
  const create = useTodosStore((s) => s.create);
  const toggle = useTodosStore((s) => s.toggle);
  const update = useTodosStore((s) => s.update);
  const remove = useTodosStore((s) => s.remove);
  const layout = useSettingsStore((s) => s.prefs.todoLayout);
  const setPref = useSettingsStore((s) => s.setPref);

  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>(0);
  const [showTime, setShowTime] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sort, setSort] = useState<"priority" | "time">("priority");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [timeId, setTimeId] = useState<string | null>(null);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  const items = useMemo(() => {
    const list = todos.filter((t) => t.date === anchor);
    return [...list].sort((a, b) => {
      if (sort === "priority") {
        if (a.priority !== b.priority) return b.priority - a.priority;
        if (a.done !== b.done) return a.done ? 1 : -1;
        return a.startTime.localeCompare(b.startTime);
      }
      const sa = a.startTime || "99:99";
      const sb = b.startTime || "99:99";
      if (sa !== sb) return sa.localeCompare(sb);
      return b.priority - a.priority;
    });
  }, [todos, anchor, sort]);

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const RING_C = 2 * Math.PI * 40;

  const dateLabel = useMemo(() => {
    const d = parseDate(anchor);
    const pretty = d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
    return `${anchor === today ? t("common.today") + " · " : ""}${pretty}`;
  }, [anchor, today, locale, t]);

  const add = () => {
    if (!text.trim()) return;
    create({
      date: anchor,
      text: text.trim(),
      priority,
      done: false,
      startTime: start,
      endTime: end,
    });
    setText(""); setStart(""); setEnd(""); setShowTime(false);
    toast(t("toast.saved"));
  };

  const cyclePriority = (item: TodoItem) => {
    const next = ((item.priority + 1) % 3) as Priority;
    update(item.id, { priority: next });
  };

  const saveEdit = (item: TodoItem) => {
    if (editId !== item.id) return;
    if (editText.trim()) update(item.id, { text: editText });
    setEditId(null);
  };

  const saveTime = (item: TodoItem) => {
    update(item.id, { startTime: timeStart, endTime: timeEnd });
    setTimeId(null);
    toast(t("toast.saved"));
  };

  const inputCls = "rounded-btn border border-line bg-input px-2 py-1.5 text-xs text-text outline-none focus:border-primary";

  return (
    <main>
      <PageHeader
        title={t("todo.title")}
        action={
          <button
            type="button"
            onClick={() => setPref({ todoLayout: layout === "ring" ? "list" : "ring" })}
            aria-label="Toggle layout"
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-card text-text"
          >
            {layout === "ring" ? <Clock3 size={17} /> : <span className="text-lg leading-none">◐</span>}
          </button>
        }
      />

      <div className="px-4 pt-4">
        {/* 日期导航 */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous day" className="flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-card text-text"><ChevronLeft size={17} /></button>
          <div className="text-center">
            <div className="text-sm font-medium text-text">{dateLabel}</div>
            {anchor !== today && (
              <button type="button" onClick={goToday} className="mt-0.5 text-xs text-primary">{t("common.today")}</button>
            )}
          </div>
          <button type="button" onClick={() => shift(1)} aria-label="Next day" className="flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-card text-text"><ChevronRight size={17} /></button>
        </div>

        {/* 新增：日期固定为当前浏览的这一天，时间收进可选展开区，不再挤一行 */}
        <div className="mb-3 rounded-card border border-line bg-card p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              maxLength={255}
              placeholder={t("todo.addPh")}
              className="min-w-0 flex-1 rounded-btn border border-line bg-input px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
            />
            <button type="button" onClick={add} disabled={!text.trim()} aria-label={t("add.title")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-primary text-white disabled:opacity-40"><Plus size={18} /></button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted">{t("todo.priority")}</span>
            {([2, 1, 0] as Priority[]).map((p) => (
              <button
                key={p} type="button" onClick={() => setPriority(p)} title={t("todo.priority")} aria-pressed={priority === p}
                className={cn("flex h-8 w-8 items-center justify-center rounded-btn border", priority === p ? "border-primary bg-input" : "border-line")}
                style={{ color: PRIORITY_COLORS[p] }}
              >⚑</button>
            ))}
            <button
              type="button"
              onClick={() => setShowTime((v) => !v)}
              className="ml-auto flex items-center gap-1 rounded-btn border border-line px-2.5 py-1.5 text-xs text-muted"
            >
              <Clock3 size={13} />
              {start ? `${start}${end ? `~${end}` : ""}` : t("todo.addTime")}
            </button>
          </div>

          {showTime && (
            <div className="mt-2 flex items-center gap-2">
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} aria-label={t("todo.startTime")} className={cn(inputCls, "min-w-0 flex-1")} />
              <span className="text-xs text-muted">~</span>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} aria-label={t("todo.endTime")} className={cn(inputCls, "min-w-0 flex-1")} />
            </div>
          )}
        </div>

        {total === 0 ? (
          <div className="rounded-card border border-dashed border-line px-4 py-14 text-center text-sm text-muted">{t("todo.none")}</div>
        ) : (
          <>
            {/* 完成进度 */}
            <div className="mb-3 flex items-center gap-3 rounded-card border border-line bg-card p-3">
              {layout === "ring" ? (
                <div className="relative h-[80px] w-[80px] shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--input)" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke={percent === 100 ? "var(--income)" : "var(--primary)"}
                      strokeWidth="10" strokeLinecap="round" strokeDasharray={RING_C}
                      strokeDashoffset={RING_C * (1 - percent / 100)} transform="rotate(-90 50 50)"
                      className="transition-all"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-sm font-semibold text-text">{percent}%</div>
                    <div className="text-[10px] text-muted">{doneCount}/{total}</div>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                    <span>{t("todo.done", { done: doneCount, total })}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-pill bg-input">
                    <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )}
              {layout === "ring" && (
                <div className="flex-1 text-sm text-muted">{t("todo.done", { done: doneCount, total })}</div>
              )}
            </div>

            <div className="mb-2 flex gap-1">
              {(["priority", "time"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSort(s)} className={cn("rounded-btn px-3 py-1 text-xs", sort === s ? "bg-primary/15 font-medium text-primary" : "text-muted")}>
                  {t(s === "priority" ? "todo.byPriority" : "todo.byTime")}
                </button>
              ))}
            </div>

            <div className="space-y-2 pb-4">
              {items.map((item) => (
                <div key={item.id} className={cn("flex items-start gap-2 rounded-card border border-line bg-card p-3", item.done && "opacity-60")}>
                  <button
                    type="button" onClick={() => toggle(item.id)} aria-label={item.done ? t("todo.markUndone") : t("todo.markDone")}
                    className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-btn border", item.done ? "border-income bg-income text-white" : "border-line")}
                  >{item.done && <Check size={14} />}</button>

                  <button type="button" onClick={() => cyclePriority(item)} title={t("todo.priority")} className="mt-0.5 shrink-0 text-base leading-none" style={{ color: PRIORITY_COLORS[item.priority] }}>⚑</button>

                  <div className="min-w-0 flex-1">
                    {editId === item.id ? (
                      <input
                        autoFocus value={editText} maxLength={255}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => saveEdit(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(item);
                          if (e.key === "Escape") setEditId(null);
                        }}
                        className="w-full rounded-btn border border-line bg-input px-2 py-1 text-sm text-text outline-none"
                      />
                    ) : (
                      <div
                        onClick={() => { setEditId(item.id); setEditText(item.text); }}
                        className={cn("cursor-text text-sm text-text", item.done && "line-through")}
                      >{item.text}</div>
                    )}

                    {timeId === item.id ? (
                      <div className="mt-1.5 flex items-center gap-1">
                        <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className={inputCls} />
                        <span className="text-xs text-muted">~</span>
                        <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className={inputCls} />
                        <button type="button" onClick={() => saveTime(item)} aria-label={t("todo.saveTime")} className="rounded-btn p-1 text-income"><Check size={15} /></button>
                        <button type="button" onClick={() => setTimeId(null)} aria-label={t("common.cancel")} className="rounded-btn p-1 text-muted"><X size={15} /></button>
                      </div>
                    ) : item.startTime ? (
                      <button type="button" onClick={() => { setTimeId(item.id); setTimeStart(item.startTime); setTimeEnd(item.endTime); }} className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Clock3 size={12} /> {item.startTime}{item.endTime ? `~${item.endTime}` : ""}
                      </button>
                    ) : (
                      <button type="button" onClick={() => { setTimeId(item.id); setTimeStart(""); setTimeEnd(""); }} className="mt-1 text-xs text-muted hover:text-primary">+ {t("todo.addTime")}</button>
                    )}
                  </div>

                  {/* 点标题即可行内编辑，不再重复放铅笔；只保留删除，并放大点击区 */}
                  <button type="button" onClick={() => remove(item.id)} aria-label={t("todo.delete")} className="shrink-0 rounded-btn p-2 text-muted active:text-expense"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
