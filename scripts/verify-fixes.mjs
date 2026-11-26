import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const TODAY = "2026-11-26";
const settings = { theme: "dark", custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" }, locale: "zh", currency: "¥" };

const browser = await chromium.launch({ channel: "chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((d) => {
  for (const [k, v] of Object.entries(d)) window.localStorage.setItem(k, JSON.stringify(v));
}, {
  "bk-settings": settings,
  "bk-habits": [
    { id: "h1", name: "阅读", icon: "📖", color: "#6d86ff", weeklyTarget: 5,
      checkins: ["2026-10-05", "2026-10-06", "2026-10-07", "2026-11-25", "2026-11-26"] },
  ],
  "bk-prefs": { habitView: "ring", todoLayout: "list" },
});
const page = await ctx.newPage();
await page.goto(BASE + "/habits", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const read = async () => await page.evaluate(() => {
  const label = document.querySelector("main span.text-xs.text-muted")?.textContent ?? "";
  const pct = [...document.querySelectorAll("div")].map((d) => d.textContent).find((x) => /^\d+%$/.test(x ?? "")) ?? "";
  return { label, pct };
});

const before = await read();
await page.getByRole("button", { name: "Previous" }).click();
await page.waitForTimeout(400);
const after = await read();

// 网格视图滚动位置
await page.getByRole("button", { name: "网格" }).click();
await page.waitForTimeout(500);
const scroll = await page.evaluate(() => {
  const el = document.querySelector("main .overflow-x-auto");
  return el ? { left: Math.round(el.scrollLeft), max: Math.round(el.scrollWidth - el.clientWidth) } : null;
});

console.log(JSON.stringify({ before, after, scroll }, null, 2));
await browser.close();
