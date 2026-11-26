import { create } from "zustand";
import { DEFAULT_PREFS, DEFAULT_SETTINGS, type AppSettings, type CustomTheme, type Locale, type ThemeKey, type UIPrefs } from "@/types";
import { applyTheme } from "@/lib/theme";
import { setMoneyLocale } from "@/lib/money";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

interface SettingsState {
  settings: AppSettings;
  prefs: UIPrefs;
  hydrated: boolean;
  hydrate: () => void;
  setPref: (patch: Partial<UIPrefs>) => void;
  setTheme: (theme: ThemeKey) => void;
  setCustom: (patch: Partial<CustomTheme>) => void;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: string) => void;
  replaceSettings: (settings: AppSettings) => void;
}

/** 语言同步到 <html lang> 与金额格式，供读屏、拼写检查与搜索引擎使用。 */
const applyLocale = (locale: Locale): void => {
  setMoneyLocale(locale);
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
};

const persist = (settings: AppSettings): void => {
  writeJSON(STORAGE_KEYS.settings, settings);
  applyTheme(settings.theme, settings.custom);
  applyLocale(settings.locale);
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  prefs: DEFAULT_PREFS,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readJSON<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      custom: { ...DEFAULT_SETTINGS.custom, ...(stored.custom ?? {}) },
    };
    const storedPrefs = readJSON<Partial<UIPrefs>>(STORAGE_KEYS.prefs, {});
    applyTheme(settings.theme, settings.custom);
    applyLocale(settings.locale);
    set({
      settings,
      prefs: { ...DEFAULT_PREFS, ...storedPrefs },
      hydrated: true,
    });
  },

  setPref: (patch) => {
    const prefs = { ...get().prefs, ...patch };
    writeJSON(STORAGE_KEYS.prefs, prefs);
    set({ prefs });
  },

  setTheme: (theme) => {
    const settings = { ...get().settings, theme };
    persist(settings);
    set({ settings });
  },

  setCustom: (patch) => {
    const settings = {
      ...get().settings,
      theme: "custom" as ThemeKey,
      custom: { ...get().settings.custom, ...patch },
    };
    persist(settings);
    set({ settings });
  },

  setLocale: (locale) => {
    const settings = { ...get().settings, locale };
    persist(settings);
    set({ settings });
  },

  setCurrency: (currency) => {
    const settings = { ...get().settings, currency };
    persist(settings);
    set({ settings });
  },

  replaceSettings: (incoming) => {
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...incoming,
      custom: { ...DEFAULT_SETTINGS.custom, ...(incoming.custom ?? {}) },
    };
    persist(settings);
    set({ settings, hydrated: true });
  },
}));
