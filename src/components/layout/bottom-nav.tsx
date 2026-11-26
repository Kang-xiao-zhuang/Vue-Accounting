"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutGrid, List, PlusCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";

/** 记账在前、记录在后，统计已并入记录页，习惯提为一级入口。 */
const TABS = [
  { href: "/add", key: "nav.add", Icon: PlusCircle },
  { href: "/", key: "nav.records", Icon: List },
  { href: "/habits", key: "nav.habits", Icon: Flame },
  { href: "/more", key: "nav.more", Icon: LayoutGrid },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-app border-t border-line bg-bg">
      <div className="flex items-stretch justify-around px-2 py-2">
        {TABS.map(({ href, key, Icon }) => {
          const active = pathname === href;
          const label = t(key);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-btn py-1.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted hover:text-text",
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
