import type { RecordType, Locale } from "@/types";

export interface CategoryDef {
  name: string;
  icon: string;
}

/** 与 v1.x 完全一致的分类键，保证 CSV / 备份语义不变。 */
export const CATEGORIES: Record<RecordType, CategoryDef[]> = {
  expense: [
    { name: "Dining", icon: "🍜" },
    { name: "Breakfast", icon: "🥐" },
    { name: "Drinks", icon: "🧃" },
    { name: "Transport", icon: "🚌" },
    { name: "Fuel", icon: "⛽" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Clothing", icon: "👕" },
    { name: "Housing", icon: "🏠" },
    { name: "Utilities", icon: "💡" },
    { name: "Phone & Internet", icon: "📱" },
    { name: "Entertainment", icon: "🎮" },
    { name: "Travel", icon: "✈️" },
    { name: "Medical", icon: "💊" },
    { name: "Education", icon: "📚" },
    { name: "Beauty", icon: "💅" },
    { name: "Sports", icon: "🏃" },
    { name: "Pets", icon: "🐾" },
    { name: "Gifts", icon: "🎀" },
    { name: "Taxes & Fees", icon: "🧾" },
    { name: "Insurance", icon: "🛡️" },
    { name: "Family", icon: "👨‍👩‍👧" },
    { name: "Other", icon: "📦" },
  ],
  income: [
    { name: "Salary", icon: "💵" },
    { name: "Bonus", icon: "🎁" },
    { name: "Part-time", icon: "🧑‍💻" },
    { name: "Investment", icon: "📈" },
    { name: "Interest", icon: "🏦" },
    { name: "Refund", icon: "↩️" },
    { name: "Red Packet", icon: "🧧" },
    { name: "Rent", icon: "🏘️" },
    { name: "Other", icon: "📦" },
  ],
};

const ZH: Record<string, string> = {
  Dining: "餐饮", Breakfast: "早餐", Drinks: "饮品", Transport: "交通", Fuel: "加油",
  Shopping: "购物", Clothing: "服饰", Housing: "住房", Utilities: "水电", "Phone & Internet": "话费网费",
  Entertainment: "娱乐", Travel: "旅行", Medical: "医疗", Education: "教育", Beauty: "美容",
  Sports: "运动", Pets: "宠物", Gifts: "礼物", "Taxes & Fees": "税费", Insurance: "保险",
  Family: "家庭", Other: "其他", Salary: "工资", Bonus: "奖金", "Part-time": "兼职",
  Investment: "投资", Interest: "利息", Refund: "退款", "Red Packet": "红包", Rent: "租金",
};

export function categoryLabel(name: string, locale: Locale): string {
  return locale === "zh" ? ZH[name] ?? name : name;
}

export function iconFor(type: RecordType, category: string): string {
  return CATEGORIES[type].find((c) => c.name === category)?.icon ?? "📦";
}

export const HABIT_ICONS = [
  "🎯", "📖", "🏃", "💪", "🧘", "💧", "😴", "🥗", "🚭", "📚",
  "✍️", "🎸", "🧹", "💊", "🌱", "☀️", "🦷", "🚶", "🚴", "🧠",
  "💰", "🙏", "🎨", "🐶",
];

export const PALETTE = [
  "#6d86ff", "#3dd6a3", "#ff6b7a", "#ffb84d", "#a07bff", "#4dd2ff",
  "#ff8fcf", "#ffe066", "#5fd06f", "#ff9a6b", "#7be0d0", "#c98aff",
];
