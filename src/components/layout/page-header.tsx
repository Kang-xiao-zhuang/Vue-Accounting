"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  subtitle?: string;
  /** 一级入口（如习惯）不需要返回箭头。 */
  back?: boolean;
}

export function PageHeader({ title, action, subtitle, back = true }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg px-4 py-3">
      {back && (
        <Link
          href="/"
          aria-label="返回"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn border border-line bg-card text-text"
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-medium text-text">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
