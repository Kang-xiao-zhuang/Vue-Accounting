"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/toast";

export function Toast() {
  const message = useToastStore((s) => s.message);
  const options = useToastStore((s) => s.options);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    // 带撤销按钮时停留 5 秒，普通提示 2.2 秒。
    const id = setTimeout(hide, options.duration ?? (options.actionLabel ? 5000 : 2200));
    return () => clearTimeout(id);
  }, [message, options, hide]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="animate-fade fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-pill border border-line bg-card px-4 py-2 text-sm text-text shadow-card"
    >
      <span>{message}</span>
      {options.actionLabel && (
        <button
          type="button"
          onClick={() => {
            options.onAction?.();
            hide();
          }}
          className="-my-1 rounded-pill px-2 py-1 text-sm font-medium text-primary"
        >
          {options.actionLabel}
        </button>
      )}
    </div>
  );
}
