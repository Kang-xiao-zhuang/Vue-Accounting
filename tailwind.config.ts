import type { Config } from "tailwindcss";

/**
 * 颜色 token 全部映射到 CSS 变量（在 globals.css / lib/theme.ts 中定义），
 * 这样 8 套主题切换时无需重建任何 class。
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      maxWidth: { app: "480px" },
      colors: {
        page: "var(--page-bg)",
        bg: "var(--bg)",
        card: "var(--card)",
        input: "var(--input)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        income: "var(--income)",
        expense: "var(--expense)",
        text: "var(--text)",
        muted: "var(--muted)",
        line: "var(--border)",
      },
      borderRadius: { card: "16px", btn: "12px", pill: "999px" },
      boxShadow: { card: "0 2px 12px rgba(0,0,0,0.18)" },
    },
  },
  plugins: [],
};

export default config;
