"use client";

import Link from "next/link";
import { ChevronRight, History, ListChecks, Repeat2, Settings, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useRecordsStore } from "@/store/records.store";

const GROUPS = [
  {
    titleKey: "more.groupLedger",
    links: [
      { href: "/history", key: "more.history", Icon: History },
      { href: "/budgets", key: "budget.title", Icon: Target },
      { href: "/recurring", key: "more.recurring", Icon: Repeat2 },
    ],
  },
  {
    titleKey: "more.groupLife",
    links: [
      { href: "/todos", key: "more.todos", Icon: ListChecks },
    ],
  },
  {
    titleKey: "more.groupSystem",
    links: [{ href: "/settings", key: "settings.title", Icon: Settings }],
  },
] as const;

export default function MorePage() {
  const { t } = useT();
  const count = useRecordsStore((s) => s.records.length);

  return (
    <main className="px-4 pt-4">
      <h1 className="mb-1 text-xl font-medium text-text">{t("more.title")}</h1>
      <p className="mb-4 text-xs text-muted">{t("more.summary", { n: count })}</p>

      <div className="space-y-4">
        {GROUPS.map((group) => (
          <section key={group.titleKey}>
            <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted">{t(group.titleKey)}</h2>
            <div className="overflow-hidden rounded-card border border-line bg-card">
              {group.links.map(({ href, key, Icon }, i) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-3.5 text-sm text-text active:bg-input ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <Icon size={17} className="shrink-0 text-primary" />
                  <span className="flex-1">{t(key)}</span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className="px-1 pb-4 text-xs leading-relaxed text-muted">{t("settings.localOnly")}</p>
      </div>
    </main>
  );
}
