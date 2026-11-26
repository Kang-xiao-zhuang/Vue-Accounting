"use client";

import { useSettingsStore } from "@/store/settings.store";
import type { Locale } from "@/types";

type Dict = Record<string, string>;

const zh: Dict = {
  "app.name": "每日记账",
  "nav.records": "记录", "nav.add": "记账", "nav.habits": "习惯", "nav.more": "更多",
  "common.cancel": "取消", "common.save": "保存", "common.today": "今天", "common.delete": "删除",
  "common.expense": "支出", "common.income": "收入", "common.balance": "结余",
  "common.all": "全部", "common.day": "日", "common.week": "周", "common.month": "月",
  "common.note": "备注", "common.amount": "金额", "common.category": "分类", "common.date": "日期",
  "common.edit": "编辑", "common.confirm": "确认", "common.total": "合计",

  "rec.title": "记录", "rec.search": "搜索备注或分类…",
  "rec.filterAmount": "金额区间", "rec.min": "最小", "rec.max": "最大", "rec.clear": "清除",
  "rec.empty": "本期还没有记录，去记一笔吧", "rec.emptyFiltered": "没有符合筛选条件的记录",
  "rec.exportCsv": "导出 CSV", "rec.dailyNet": "当日净额",
  "rec.emptyTitle": "还没有任何记录", "rec.emptyHint": "所有数据只保存在本机，不需要注册账号。",
  "rec.emptyCta": "记第一笔",

  "add.title": "记一笔", "add.hint": "点一个分类开始录入{type}", "add.frequent": "常用分类",

  "sheet.new": "新增记录", "sheet.edit": "编辑记录", "sheet.optional": "可选…",
  "sheet.save": "保存", "sheet.update": "更新", "sheet.clearAmount": "清空金额",
  "sheet.errAmount": "请输入大于 0 的金额", "sheet.backspace": "退格",
  "sheet.notePlaceholder": "备注（可选）",

  "stats.title": "统计", "stats.breakdown": "分类占比", "stats.noData": "本期没有{type}数据",
  "stats.count": "{n} 笔", "stats.monthCompare": "本月 vs 上月", "stats.vsLast": "较上月",
  "stats.lastMonth": "上月", "stats.trend": "近 6 个月收支趋势", "stats.budgets": "预算",
  "stats.otherCategories": "其他 {n} 类", "stats.trendEmpty": "记录几笔后就会显示趋势",
  "stats.compareEmpty": "本月与上月都还没有记录", "stats.noPrev": "上月无记录",

  "budget.title": "预算", "budget.overall": "整体月度预算", "budget.byCategory": "分类预算",
  "budget.none": "还没有分类预算", "budget.pick": "选择分类…", "budget.limit": "月度限额",
  "budget.add": "添加", "budget.left": "剩余 {x}", "budget.over": "超支 {x}",
  "budget.alertOver": "{label} 本月已超支 {over}", "budget.remove": "移除", "budget.overallLabel": "整体",
  "budget.setHint": "留空或 0 表示不设整体预算", "budget.near": "接近上限，还剩 {x}",
  "budget.monthUsed": "本月已用 {x}",

  "settings.title": "设置", "settings.theme": "主题", "settings.language": "语言",
  "settings.currency": "货币符号", "settings.custom": "自定义配色",
  "settings.customPrimary": "主色", "settings.customIncome": "收入色", "settings.customExpense": "支出色",
  "settings.customBase": "明暗底色", "settings.data": "数据管理",
  "settings.exportJson": "导出 JSON 备份", "settings.importJson": "导入备份 / 恢复",
  "settings.exportCsv": "导出 CSV", "settings.clearAll": "清空所有数据",
  "settings.clearConfirm": "确定清空全部数据（含习惯、清单、周期规则）？此操作不可撤销，建议先导出备份。",
  "settings.storage": "存储占用", "settings.lastExport": "上次备份",
  "settings.never": "从未备份", "settings.about": "关于", "settings.version": "版本",
  "settings.localOnly": "数据仅保存在本机，无账号、无云端。换机请导出备份。",
  "settings.importMode": "导入方式", "settings.modeMerge": "合并（按 id 去重）",
  "settings.modeOverwrite": "覆盖恢复（自动留快照）", "settings.importPreview": "备份包含 {n} 笔记录、{b} 条预算",
  "settings.importBad": "备份文件格式不正确，未做任何改动",

  "storage.warning": "本地存储写入失败或已满，数据可能未保存。请导出备份并清理空间。",
  "toast.saved": "已保存", "toast.updated": "已更新", "toast.deleted": "已删除",
  "toast.budgetSaved": "预算已保存", "toast.budgetRemoved": "预算已移除",
  "toast.imported": "导入完成", "toast.exported": "备份已导出", "toast.cleared": "已清空",

  "more.title": "更多", "more.phase2": "以下模块将在阶段二迁移",
  "more.comingSoon": "待迁移", "more.habits": "习惯打卡", "more.todos": "每日清单",
  "more.recurring": "周期交易", "more.history": "历史分页查询",
  "more.groupLedger": "记账与统计", "more.groupLife": "生活模块", "more.groupSystem": "系统",
  "more.summary": "已记录 {n} 笔，数据只保存在本机",

  "settings.importPreview2": "另含 {h} 个习惯、{t} 条清单、{r} 条周期规则",
  "settings.clearConfirm2": "确定清空全部数据（含习惯、清单、周期规则）？此操作不可撤销，建议先导出备份。",

  "history.title": "全部记录", "history.search": "搜索备注或分类…",
  "history.count": "共 {n} 条", "history.from": "起", "history.to": "止",
  "history.empty": "没有找到记录。", "history.pageOf": "第 {c} / {p} 页",
  "history.deleteConfirm": "确定删除这条记录？", "history.clear": "清除筛选",

  "habit.title": "习惯", "habit.new": "新建习惯", "habit.editName": "编辑习惯名称…",
  "habit.newName": "新习惯名称…", "habit.addBtn": "添加习惯", "habit.saveBtn": "保存",
  "habit.icon": "图标", "habit.color": "颜色", "habit.weeklyGoal": "每周目标（次/周）",
  "habit.goalNone": "不限", "habit.none": "还没有习惯，点 ＋ 创建一个，开始你的连续打卡！",
  "habit.viewGrid": "网格", "habit.viewRing": "圆环", "habit.viewWeek": "本周", "habit.viewMonth": "月历",
  "habit.best": "最佳", "habit.day": "天", "habit.days": "天", "habit.ringSub": "{n}/30 天",
  "habit.doneFab": "打卡", "habit.checked": "今日已打卡（点击撤销）", "habit.checkin": "今日打卡",
  "habit.confirmDelete": "删除习惯「{name}」及其全部打卡记录？", "habit.deleted": "习惯已删除",

  "todo.title": "每日清单", "todo.addPh": "添加这一天的一项任务…",
  "todo.done": "{done} / {total} 已完成", "todo.none": "今天还没有任务，在上方添加第一项吧！",
  "todo.byPriority": "按优先级", "todo.byTime": "按时间", "todo.priority": "优先级",
  "todo.addTime": "设置时间", "todo.edit": "编辑任务", "todo.saveTime": "保存时间",
  "todo.markDone": "标记完成", "todo.markUndone": "标记未完成", "todo.delete": "删除任务",
  "todo.startTime": "开始时间", "todo.endTime": "结束时间",

  "recur.title": "周期交易", "recur.runNow": "立即执行", "recur.newRule": "新建规则",
  "recur.editRule": "编辑规则", "recur.frequency": "频率", "recur.daily": "每天",
  "recur.weekly": "每周", "recur.monthly": "每月", "recur.nextRun": "下次执行",
  "recur.notePh": "备注（选填）", "recur.addBtn": "添加周期", "recur.saveBtn": "保存修改",
  "recur.none": "还没有周期规则，在上面添加一个（比如每月房租）。",
  "recur.nextLabel": "下次 {date}", "recur.created": "生成了 {n} 条记录",
  "recur.nothingDue": "当前没有到期的", "recur.pause": "暂停", "recur.resume": "启用",
  "recur.edit": "编辑规则", "recur.delete": "删除规则", "recur.confirmDelete": "删除这条周期规则？",
  "recur.paused": "已暂停",

  "common.back": "返回", "common.optional": "选填", "common.start": "开始", "common.end": "结束",
};

const en: Dict = {
  "app.name": "Daily Bookkeeping",
  "nav.records": "Records", "nav.add": "Add", "nav.habits": "Habits", "nav.more": "More",
  "common.cancel": "Cancel", "common.save": "Save", "common.today": "Today", "common.delete": "Delete",
  "common.expense": "Expense", "common.income": "Income", "common.balance": "Balance",
  "common.all": "All", "common.day": "Day", "common.week": "Week", "common.month": "Month",
  "common.note": "Note", "common.amount": "Amount", "common.category": "Category", "common.date": "Date",
  "common.edit": "Edit", "common.confirm": "Confirm", "common.total": "Total",

  "rec.title": "Records", "rec.search": "Search note or category…",
  "rec.filterAmount": "Amount filter", "rec.min": "Min", "rec.max": "Max", "rec.clear": "Clear",
  "rec.empty": "No records for this period", "rec.emptyFiltered": "No records match your filters",
  "rec.exportCsv": "Export CSV", "rec.dailyNet": "Daily net",
  "rec.emptyTitle": "No records yet", "rec.emptyHint": "Everything stays on this device — no account needed.",
  "rec.emptyCta": "Add your first record",

  "add.title": "Add record", "add.hint": "Tap a category to add an {type}", "add.frequent": "Frequent",

  "sheet.new": "New record", "sheet.edit": "Edit record", "sheet.optional": "Optional…",
  "sheet.save": "Save", "sheet.update": "Update", "sheet.clearAmount": "Clear amount",
  "sheet.errAmount": "Enter an amount greater than 0", "sheet.backspace": "Backspace",
  "sheet.notePlaceholder": "Note (optional)",

  "stats.title": "Statistics", "stats.breakdown": "Breakdown by category", "stats.noData": "No {type} data",
  "stats.count": "{n} records", "stats.monthCompare": "This month vs last", "stats.vsLast": "vs last month",
  "stats.lastMonth": "Last", "stats.trend": "6-month trend", "stats.budgets": "Budgets",
  "stats.otherCategories": "Other {n} categories", "stats.trendEmpty": "Add a few records to see the trend",
  "stats.compareEmpty": "No records this month or last", "stats.noPrev": "No records last month",

  "budget.title": "Budgets", "budget.overall": "Overall monthly budget", "budget.byCategory": "By category",
  "budget.none": "No category budgets yet", "budget.pick": "Pick a category…", "budget.limit": "Monthly limit",
  "budget.add": "Add", "budget.left": "{x} left", "budget.over": "{x} over",
  "budget.alertOver": "{label} over budget by {over}", "budget.remove": "Remove", "budget.overallLabel": "Overall",
  "budget.setHint": "Leave empty or 0 for no overall budget", "budget.near": "Close to limit, {x} left",
  "budget.monthUsed": "{x} used this month",

  "settings.title": "Settings", "settings.theme": "Theme", "settings.language": "Language",
  "settings.currency": "Currency", "settings.custom": "Custom colors",
  "settings.customPrimary": "Primary", "settings.customIncome": "Income", "settings.customExpense": "Expense",
  "settings.customBase": "Base", "settings.data": "Data",
  "settings.exportJson": "Export JSON backup", "settings.importJson": "Import / restore backup",
  "settings.exportCsv": "Export CSV", "settings.clearAll": "Clear all data",
  "settings.clearConfirm": "Delete all data including habits, to-dos and recurring rules? This cannot be undone. Export a backup first.",
  "settings.storage": "Storage used", "settings.lastExport": "Last backup",
  "settings.never": "Never", "settings.about": "About", "settings.version": "Version",
  "settings.localOnly": "Data stays on this device. No account, no cloud. Export a backup before switching devices.",
  "settings.importMode": "Import mode", "settings.modeMerge": "Merge (dedupe by id)",
  "settings.modeOverwrite": "Overwrite (auto snapshot)", "settings.importPreview": "Backup has {n} records and {b} budgets",
  "settings.importBad": "Invalid backup file — nothing was changed",

  "storage.warning": "Local storage write failed or is full. Data may not be saved. Export a backup now.",
  "toast.saved": "Saved", "toast.updated": "Updated", "toast.deleted": "Deleted",
  "toast.budgetSaved": "Budget saved", "toast.budgetRemoved": "Budget removed",
  "toast.imported": "Import complete", "toast.exported": "Backup exported", "toast.cleared": "Cleared",

  "more.title": "More", "more.phase2": "These modules are scheduled for phase 2",
  "more.comingSoon": "Coming soon", "more.habits": "Habits", "more.todos": "Daily checklist",
  "more.recurring": "Recurring transactions", "more.history": "Paginated history",
  "more.groupLedger": "Records & stats", "more.groupLife": "Daily life", "more.groupSystem": "System",
  "more.summary": "{n} records, stored only on this device",

  "settings.importPreview2": "plus {h} habits, {t} to-dos and {r} recurring rules",
  "settings.clearConfirm2": "Delete all data including habits, to-dos and recurring rules? This cannot be undone. Export a backup first.",

  "history.title": "All records", "history.search": "Search note or category…",
  "history.count": "{n} total", "history.from": "From", "history.to": "To",
  "history.empty": "No records found.", "history.pageOf": "Page {c} / {p}",
  "history.deleteConfirm": "Delete this record?", "history.clear": "Clear filters",

  "habit.title": "Habits", "habit.new": "New habit", "habit.editName": "Edit habit name…",
  "habit.newName": "New habit name…", "habit.addBtn": "Add habit", "habit.saveBtn": "Save",
  "habit.icon": "Icon", "habit.color": "Color", "habit.weeklyGoal": "Weekly goal (times/week)",
  "habit.goalNone": "None", "habit.none": "No habits yet. Tap ＋ to create one and start your streak!",
  "habit.viewGrid": "Grid", "habit.viewRing": "Ring", "habit.viewWeek": "Week", "habit.viewMonth": "Month",
  "habit.best": "best", "habit.day": "day", "habit.days": "days", "habit.ringSub": "{n}/30 days",
  "habit.doneFab": "done!", "habit.checked": "Checked in today (tap to undo)", "habit.checkin": "Check in today",
  "habit.confirmDelete": "Delete habit \"{name}\" and all its check-ins?", "habit.deleted": "Habit deleted",

  "todo.title": "Daily Checklist", "todo.addPh": "Add a task for this day…",
  "todo.done": "{done} / {total} done", "todo.none": "Nothing for this day yet. Add your first task!",
  "todo.byPriority": "By priority", "todo.byTime": "By time", "todo.priority": "Priority",
  "todo.addTime": "+ Time", "todo.edit": "Edit task", "todo.saveTime": "Save time",
  "todo.markDone": "Mark done", "todo.markUndone": "Mark incomplete", "todo.delete": "Delete task",
  "todo.startTime": "Start time", "todo.endTime": "End time",

  "recur.title": "Recurring", "recur.runNow": "Run now", "recur.newRule": "New rule",
  "recur.editRule": "Edit rule", "recur.frequency": "Frequency", "recur.daily": "Daily",
  "recur.weekly": "Weekly", "recur.monthly": "Monthly", "recur.nextRun": "Next run",
  "recur.notePh": "Note (optional)", "recur.addBtn": "Add recurring", "recur.saveBtn": "Save changes",
  "recur.none": "No recurring rules yet. Add one above (e.g. monthly rent).",
  "recur.nextLabel": "next {date}", "recur.created": "Created {n} record(s)",
  "recur.nothingDue": "Nothing due right now", "recur.pause": "Pause", "recur.resume": "Resume",
  "recur.edit": "Edit rule", "recur.delete": "Delete rule", "recur.confirmDelete": "Delete this recurring rule?",
  "recur.paused": "Paused",

  "common.back": "Back", "common.optional": "Optional", "common.start": "Start", "common.end": "End",
};

const DICTS: Record<Locale, Dict> = { zh, en };

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let text = DICTS[locale][key] ?? DICTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function useT(): { t: TFunction; locale: Locale } {
  const locale = useSettingsStore((s) => s.settings.locale);
  return { t: (key, params) => translate(locale, key, params), locale };
}
