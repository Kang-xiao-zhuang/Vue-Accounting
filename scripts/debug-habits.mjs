import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const TODAY = "2026-11-26";

const seed = {
  "bk-habits": [
    {
      id: "h1", name: "阅读 30 分钟", icon: "📖", color: "#6d86ff", weeklyTarget: 5,
      checkins: ["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26"],
    },
  ],
  "bk-settings": { theme: "dark", custom: { base: "dark", primary: "#6d86ff", income: "#3dd6a3", expense: "#ff6b7a" }, locale: "zh", currency: "¥" },
  "bk-prefs": { habitView: "grid", todoLayout: "list" },
};

const browser = await chromium.launch({ channel: "chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((d) => {
  for (const [k, v] of Object.entries(d)) window.localStorage.setItem(k, JSON.stringify(v));
}, seed);
const page = await ctx.newPage();
await page.goto(BASE + "/habits", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const info = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button[aria-label]')].filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.getAttribute("aria-label") || ""));
  const colored = btns.filter((b) => b.style.backgroundColor);
  const sample = btns.slice(0, 3).map((b) => ({
    label: b.getAttribute("aria-label"),
    inline: b.getAttribute("style"),
    computed: getComputedStyle(b).backgroundColor,
    cls: b.className,
  }));
  return {
    total: btns.length,
    colored: colored.length,
    coloredLabels: colored.map((b) => b.getAttribute("aria-label")),
    sample,
    prefs: localStorage.getItem("bk-prefs"),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
