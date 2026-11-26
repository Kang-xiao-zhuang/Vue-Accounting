import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:4173";
const OUT = ".shots";
const TODAY = "2026-11-26";
const pad = (n) => String(n).padStart(2, "0");

let seq = 0;
const rec = (date, type, category, amount, note) => ({
  id: `r${++seq}`, type, category, amount, date, note,
  createdAt: `${date}T09:00:00.000Z`,
});

const seed = {
  "bk-records": [
    rec(TODAY, "expense", "Dining", 38.5, "午饭 · 牛肉面"),
    rec(TODAY, "expense", "Drinks", 16, "美式"),
    rec(TODAY, "expense", "Transport", 6, "地铁"),
    rec("2026-11-25", "expense", "Shopping", 268, "外套"),
    rec("2026-11-24", "income", "Part-time", 1200, "外包尾款"),
    rec("2026-11-15", "income", "Salary", 12000, "11 月工资"),
    rec("2026-11-20", "expense", "Housing", 2600, "房租"),
  ],
  "bk-budgets": [{ id: "b1", category: "", monthlyLimit: 6000 }],
  "bk-habits": [
    { id: "h1", name: "阅读 30 分钟", icon: "📖", color: "#6d86ff", weeklyTarget: 5,
      checkins: ["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26"] },
  ],
  "bk-todos": [
    { id: "t1", date: TODAY, text: "提交季度预算表", done: true, priority: 2, startTime: "09:00", endTime: "10:30", createdAt: `${TODAY}T08:00:00.000Z` },
    { id: "t2", date: TODAY, text: "和设计师对首页改版稿", done: false, priority: 2, startTime: "14:00", endTime: "15:00", createdAt: `${TODAY}T08:10:00.000Z` },
    { id: "t3", date: TODAY, text: "整理上月账单", done: false, priority: 0, startTime: "", endTime: "", createdAt: `${TODAY}T08:20:00.000Z` },
  ],
  "bk-settings": { theme: "dark", custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" }, locale: "zh", currency: "¥" },
  "bk-prefs": { habitView: "grid", todoLayout: "list" },
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => {
  for (const [k, v] of Object.entries(d)) window.localStorage.setItem(k, JSON.stringify(v));
}, seed);
const page = await ctx.newPage();

// 1. 记账面板（点击分类后）
await page.goto(BASE + "/add", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /餐饮/ }).first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/add-sheet.png` });

// 2. 习惯 圆环 / 周 / 月历
for (const [tab, file] of [["圆环", "habits-ring"], ["本周", "habits-week"], ["月历", "habits-month"]]) {
  await page.goto(BASE + "/habits", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: tab }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${file}.png` });
}

// 3. 首页滚到底，检查是否被底部导航遮挡
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/home-bottom.png` });

// 4. 记账页滚到底
await page.goto(BASE + "/add", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/add-bottom.png` });

const metrics = await page.evaluate(() => {
  const main = document.querySelector("main");
  const nav = document.querySelector("nav");
  return {
    bodyScrollHeight: document.body.scrollHeight,
    mainPaddingBottom: main ? getComputedStyle(main).paddingBottom : "n/a",
    navHeight: nav ? nav.getBoundingClientRect().height : "n/a",
    navTop: nav ? Math.round(nav.getBoundingClientRect().top) : "n/a",
  };
});
console.log(JSON.stringify(metrics, null, 2));
await browser.close();
