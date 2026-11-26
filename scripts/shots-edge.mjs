import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:4173";
const OUT = ".shots";
const TODAY = "2026-11-26";

let seq = 0;
const rec = (date, type, category, amount, note) => ({
  id: `r${++seq}`, type, category, amount, date, note, createdAt: `${date}T09:00:00.000Z`,
});

const many = [
  rec(TODAY, "expense", "Dining", 38.5, ""),
  rec(TODAY, "expense", "Drinks", 16, ""),
  rec(TODAY, "expense", "Transport", 6, ""),
  rec(TODAY, "expense", "Shopping", 268, "外套"),
  rec(TODAY, "expense", "Utilities", 186.4, ""),
  rec(TODAY, "expense", "Entertainment", 88, ""),
  rec(TODAY, "expense", "Fuel", 320, ""),
  rec(TODAY, "expense", "Medical", 145, ""),
  rec(TODAY, "expense", "Pets", 96, ""),
  rec(TODAY, "expense", "Education", 199, ""),
  rec(TODAY, "expense", "Clothing", 430, ""),
  rec(TODAY, "expense", "Housing", 2600, "房租"),
  rec(TODAY, "income", "Salary", 12000, "工资"),
  rec(TODAY, "income", "Bonus", 2000, "季度奖"),
];

const settings = { theme: "dark", custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" }, locale: "zh", currency: "¥" };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });

// A. 空数据首页
const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctxA.addInitScript((s) => window.localStorage.setItem("bk-settings", JSON.stringify(s)), settings);
const pageA = await ctxA.newPage();
await pageA.goto(BASE + "/", { waitUntil: "networkidle" });
await pageA.waitForTimeout(500);
await pageA.screenshot({ path: `${OUT}/empty-home.png` });
await pageA.getByRole("tab", { name: "统计" }).click();
await pageA.waitForTimeout(500);
await pageA.screenshot({ path: `${OUT}/empty-stats.png` });

// B. 多分类统计
const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctxB.addInitScript(
  (d) => {
    for (const [k, v] of Object.entries(d)) window.localStorage.setItem(k, JSON.stringify(v));
  },
  { "bk-records": many, "bk-settings": settings },
);
const pageB = await ctxB.newPage();
await pageB.goto(BASE + "/", { waitUntil: "networkidle" });
await pageB.getByRole("tab", { name: "统计" }).click();
await pageB.waitForTimeout(700);
await pageB.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await pageB.waitForTimeout(400);
await pageB.screenshot({ path: `${OUT}/stats-bottom.png` });

// C. 首页筛选面板
await pageB.goto(BASE + "/", { waitUntil: "networkidle" });
await pageB.waitForTimeout(400);
const sliders = pageB.locator('button[aria-label]').first();
await sliders.click().catch(() => {});
await pageB.waitForTimeout(400);
await pageB.screenshot({ path: `${OUT}/home-filter.png` });

await browser.close();
console.log("done");
