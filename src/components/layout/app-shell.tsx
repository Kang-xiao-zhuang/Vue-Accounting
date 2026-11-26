"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useRecordsStore } from "@/store/records.store";
import { useBudgetsStore } from "@/store/budgets.store";
import { useSettingsStore } from "@/store/settings.store";
import { useHabitsStore } from "@/store/habits.store";
import { useTodosStore } from "@/store/todos.store";
import { useRulesStore } from "@/store/rules.store";
import { toast } from "@/lib/toast";
import { translate } from "@/lib/i18n";
import { Toast } from "@/components/common/toast";
import { StorageWarning } from "@/components/common/storage-warning";
import { PwaRegister } from "@/components/system/pwa-register";
import { BottomNav } from "./bottom-nav";

const NAV_ROUTES = ["/", "/add", "/habits", "/more"];

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrateRecords = useRecordsStore((s) => s.hydrate);
  const hydrateBudgets = useBudgetsStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateHabits = useHabitsStore((s) => s.hydrate);
  const hydrateTodos = useTodosStore((s) => s.hydrate);
  const hydrateRules = useRulesStore((s) => s.hydrate);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    hydrateSettings();
    hydrateRecords();
    hydrateBudgets();
    hydrateHabits();
    hydrateTodos();
    hydrateRules();
    // 替代旧后端每日 00:05 的 Quartz 任务：打开 App 时补齐到期记录。
    // hydrate 是同步的，runDue 内部按 id 新建记录，重复打开不会二次生成。
    const created = useRulesStore.getState().runDue();
    if (created > 0) {
      const locale = useSettingsStore.getState().settings.locale;
      toast(translate(locale, "recur.created", { n: created }));
    }
  }, [hydrateSettings, hydrateRecords, hydrateBudgets, hydrateHabits, hydrateTodos, hydrateRules]);

  const showNav = NAV_ROUTES.includes(pathname);

  return (
    <div className="relative mx-auto min-h-screen max-w-app bg-bg">
      <PwaRegister />
      <Toast />
      <StorageWarning />
      <div className={showNav ? "pb-24" : "pb-10"}>{children}</div>
      {showNav && <BottomNav />}
    </div>
  );
}
