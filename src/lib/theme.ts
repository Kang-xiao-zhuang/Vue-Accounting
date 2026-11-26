import type { CustomTheme, ThemeKey } from "@/types";

/** 主题变量直接写到 :root，Tailwind token 全部引用这些变量。 */
export interface ThemeVars {
  pageBg: string;
  bg: string;
  card: string;
  input: string;
  primary: string;
  primaryDark: string;
  income: string;
  expense: string;
  text: string;
  muted: string;
  border: string;
}

const DARK_BASE: ThemeVars = {
  pageBg: "#05070d", bg: "#0f1320", card: "#1a1f30", input: "#232a40",
  primary: "#6d86ff", primaryDark: "#5670f0", income: "#3dd6a3", expense: "#ff6b7a",
  text: "#e8ebf5", muted: "#8a90a6", border: "#2c3450",
};

export const THEMES: Record<Exclude<ThemeKey, "custom" | "auto">, ThemeVars> = {
  dark: DARK_BASE,
  light: {
    pageBg: "#dde2ee", bg: "#f4f6fb", card: "#ffffff", input: "#eef1f8",
    primary: "#4f6ef7", primaryDark: "#3a55d9", income: "#1f9d6b", expense: "#e25563",
    text: "#2a2f45", muted: "#7a8099", border: "#e2e6f0",
  },
  duotone: {
    pageBg: "#150a26", bg: "#241043", card: "#32195c", input: "#3d2270",
    primary: "#ff5fa2", primaryDark: "#e6478c", income: "#2bd9c4", expense: "#ff8a5c",
    text: "#f3ecff", muted: "#b3a2d6", border: "#4a2f7a",
  },
  ocean: {
    pageBg: "#04121a", bg: "#0b1f2a", card: "#12303d", input: "#17414f",
    primary: "#33c9dc", primaryDark: "#23b3c6", income: "#3dd6a3", expense: "#ff7a8a",
    text: "#e6f6fb", muted: "#84a6b3", border: "#1e4a5c",
  },
  forest: {
    pageBg: "#071108", bg: "#0e1f12", card: "#16301c", input: "#1d4026",
    primary: "#4caf6a", primaryDark: "#3d9557", income: "#6fd08c", expense: "#ff7a6b",
    text: "#e8f5ea", muted: "#8aa892", border: "#234a2e",
  },
  sunset: {
    pageBg: "#1a0f08", bg: "#2a1710", card: "#3a2016", input: "#4a2a1c",
    primary: "#ff9f45", primaryDark: "#f0862e", income: "#ffd24d", expense: "#ff6b6b",
    text: "#fce9d9", muted: "#c9a288", border: "#5a3624",
  },
  rose: {
    pageBg: "#f6e9ee", bg: "#fdf5f7", card: "#ffffff", input: "#f8e9ef",
    primary: "#e6568c", primaryDark: "#cf3f75", income: "#1f9d6b", expense: "#e2556a",
    text: "#3a2430", muted: "#9b7a88", border: "#efd8e1",
  },
  slate: {
    pageBg: "#0a0b0e", bg: "#16181d", card: "#1e2128", input: "#282c34",
    primary: "#7c8aa5", primaryDark: "#66738c", income: "#5fb08c", expense: "#d9707e",
    text: "#e6e9ef", muted: "#8b929f", border: "#30353f",
  },
};

export const THEME_LABELS: Record<ThemeKey, string> = {
  light: "浅色", dark: "深色", duotone: "双拼", ocean: "海洋", forest: "森林",
  sunset: "日落", rose: "玫瑰", slate: "石板", custom: "自定义", auto: "跟随系统",
};

function darken(hex: string, amt = 0.15): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const parts = [n >> 16, (n >> 8) & 255, n & 255].map((c) =>
    Math.round((c & 255) * (1 - amt)).toString(16).padStart(2, "0"),
  );
  return `#${parts.join("")}`;
}

export function resolveTheme(key: ThemeKey, custom: CustomTheme): ThemeVars {
  const base = key === "auto"
    ? (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : key === "custom" ? custom.base : key;
  const vars = { ...THEMES[base as keyof typeof THEMES] };
  if (key === "custom") {
    vars.primary = custom.primary;
    vars.primaryDark = darken(custom.primary);
    vars.income = custom.income;
    vars.expense = custom.expense;
  }
  return vars;
}

export function applyTheme(key: ThemeKey, custom: CustomTheme): void {
  if (typeof document === "undefined") return;
  const vars = resolveTheme(key, custom);
  const root = document.documentElement;
  const map: Record<keyof ThemeVars, string> = {
    pageBg: "--page-bg", bg: "--bg", card: "--card", input: "--input",
    primary: "--primary", primaryDark: "--primary-dark", income: "--income",
    expense: "--expense", text: "--text", muted: "--muted", border: "--border",
  };
  (Object.keys(map) as (keyof ThemeVars)[]).forEach((k) => {
    root.style.setProperty(map[k], vars[k]);
  });
  const base = key === "custom" ? custom.base
    : key === "auto" ? (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : key;
  root.setAttribute("data-theme", base === "light" ? "light" : "dark");
  root.setAttribute("data-theme-key", key);
}
