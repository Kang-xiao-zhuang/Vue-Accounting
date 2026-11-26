/**
 * 逐页截图，用于视觉审查。数据直接灌进 localStorage，避免空页面。
 * 用法：node scripts/shots.mjs [outDir]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:4173";
const OUT = process.argv[2] ?? ".shots";
const TODAY = "2026-11-26";

const pad = (n) => String(n).padStart(2, "0");
const day = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

let seq = 0;
const rec = (date, type, category, amount, note) => ({
  id: `r${++seq}`,
  type,
  category,
  amount,
  date,
  note,
  createdAt: `${date}T${pad(8 + (seq % 10))}:${pad((seq * 7) % 60)}:00.000Z`,
});

const records = [
  rec(day(2026, 11, 26), "expense", "Dining", 38.5, "午饭 · 牛肉面"),
  rec(day(2026, 11, 26), "expense", "Drinks", 16, "美式"),
  rec(day(2026, 11, 26), "expense", "Transport", 6, "地铁"),
  rec(day(2026, 11, 25), "expense", "Shopping", 268, "外套"),
  rec(day(2026, 11, 25), "expense", "Dining", 52, "晚饭"),
  rec(day(2026, 11, 24), "income", "Part-time", 1200, "外包尾款"),
  rec(day(2026, 11, 24), "expense", "Utilities", 186.4, "电费"),
  rec(day(2026, 11, 23), "expense", "Entertainment", 88, "电影 + 爆米花"),
  rec(day(2026, 11, 22), "expense", "Fuel", 320, "加满"),
  rec(day(2026, 11, 21), "expense", "Medical", 145, "体检"),
  rec(day(2026, 11, 20), "expense", "Housing", 2600, "房租"),
  rec(day(2026, 11, 18), "expense", "Pets", 96, "猫粮"),
  rec(day(2026, 11, 15), "income", "Salary", 12000, "11 月工资"),
  rec(day(2026, 11, 12), "expense", "Education", 199, "网课"),
  rec(day(2026, 11, 8), "expense", "Clothing", 430, "冬装"),
  rec(day(2026, 10, 28), "expense", "Dining", 3200, "十月合计"),
  rec(day(2026, 10, 15), "income", "Salary", 12000, "10 月工资"),
  rec(day(2026, 9, 15), "income", "Salary", 11800, "9 月工资"),
  rec(day(2026, 9, 20), "expense", "Travel", 2100, "出游"),
  rec(day(2026, 8, 15), "income", "Salary", 11800, "8 月工资"),
  rec(day(2026, 8, 22), "expense", "Shopping", 1500, "数码"),
  rec(day(2026, 7, 15), "income", "Salary", 11500, "7 月工资"),
  rec(day(2026, 7, 10), "expense", "Housing", 2600, "房租"),
  rec(day(2026, 6, 15), "income", "Salary", 11500, "6 月工资"),
];

const budgets = [
  { id: "b1", category: "", monthlyLimit: 6000 },
  { id: "b2", category: "Dining", monthlyLimit: 800 },
  { id: "b3", category: "Shopping", monthlyLimit: 500 },
  { id: "b4", category: "Transport", monthlyLimit: 300 },
  { id: "b5", category: "Entertainment", monthlyLimit: 200 },
];

const habitCheckins = (dates) => dates;
const habits = [
  {
    id: "h1",
    name: "阅读 30 分钟",
    icon: "📖",
    color: "#6d86ff",
    weeklyTarget: 5,
    checkins: [
      "2026-11-01", "2026-11-02", "2026-11-04", "2026-11-05", "2026-11-06",
      "2026-11-08", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-13",
      "2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-19",
      "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-24", "2026-11-25", "2026-11-26",
    ],
  },
  {
    id: "h2",
    name: "跑步 3 公里",
    icon: "🏃",
    color: "#3dd6a3",
    weeklyTarget: 3,
    checkins: [
      "2026-11-03", "2026-11-05", "2026-11-08", "2026-11-11",
      "2026-11-14", "2026-11-18", "2026-11-21", "2026-11-24",
    ],
  },
  {
    id: "h3",
    name: "喝够 8 杯水",
    icon: "💧",
    color: "#4dd2ff",
    weeklyTarget: 7,
    checkins: [
      "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23",
      "2026-11-24", "2026-11-25", "2026-11-26",
    ],
  },
  {
    id: "h4",
    name: "早睡 23:00 前",
    icon: "😴",
    color: "#a07bff",
    weeklyTarget: 5,
    checkins: ["2026-11-22", "2026-11-23", "2026-11-25"],
  },
  habitCheckins,
];

const todos = [
  { id: "t1", date: TODAY, text: "提交季度预算表", done: true, priority: 2, startTime: "09:00", endTime: "10:30", createdAt: `${TODAY}T08:00:00.000Z` },
  { id: "t2", date: TODAY, text: "和设计师对首页改版稿", done: false, priority: 2, startTime: "14:00", endTime: "15:00", createdAt: `${TODAY}T08:10:00.000Z` },
  { id: "t3", date: TODAY, text: "整理上月账单", done: false, priority: 1, startTime: "", endTime: "", createdAt: `${TODAY}T08:20:00.000Z` },
  { id: "t4", date: TODAY, text: "买猫粮", done: false, priority: 0, startTime: "", endTime: "", createdAt: `${TODAY}T08:30:00.000Z` },
  { id: "t5", date: TODAY, text: "跑步 3 公里", done: false, priority: 1, startTime: "19:30", endTime: "20:10", createdAt: `${TODAY}T08:40:00.000Z` },
];

const rules = [
  { id: "ru1", type: "expense", category: "Housing", amount: 2600, note: "房租", frequency: "MONTHLY", nextRunDate: "2026-12-01", active: true },
  { id: "ru2", type: "expense", category: "Phone & Internet", amount: 99, note: "话费套餐", frequency: "MONTHLY", nextRunDate: "2026-12-05", active: true },
  { id: "ru3", type: "income", category: "Salary", amount: 12000, note: "工资", frequency: "MONTHLY", nextRunDate: "2026-12-15", active: true },
  { id: "ru4", type: "expense", category: "Entertainment", amount: 25, note: "会员订阅", frequency: "WEEKLY", nextRunDate: "2026-11-30", active: false },
];

const settings = {
  theme: "dark",
  custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" },
  locale: "zh",
  currency: "¥",
};

const seed = {
  "bk-records": records,
  "bk-budgets": budgets,
  "bk-habits": habits.slice(0, 4),
  "bk-todos": todos,
  "bk-rules": rules,
  "bk-settings": settings,
  "bk-prefs": { habitView: "grid", todoLayout: "list" },
};

const pages = [
  ["home", "/"],
  ["home-all", "/?x=1"],
  ["add", "/add"],
  ["budgets", "/budgets"],
  ["more", "/more"],
  ["history", "/history"],
  ["habits", "/habits"],
  ["todos", "/todos"],
  ["recurring", "/recurring"],
  ["settings", "/settings"],
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((data) => {
  for (const [k, v] of Object.entries(data)) {
    window.localStorage.setItem(k, JSON.stringify(v));
  }
}, seed);

const page = await ctx.newPage();
for (const [name, path] of pages) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log("shot", name, path);
}

// 统计已并入记录页，切到「统计」标签后截图
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "统计" }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/stats.png`, fullPage: true });
console.log("shot stats / (tab)");

await browser.close();