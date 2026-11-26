"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/toast";

export function Toast() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(hide, 2200);
    return () => clearTimeout(id);
  }, [message, hide]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="animate-fade fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-pill border border-line bg-card px-4 py-2 text-sm text-text shadow-card"
    >
      {message}
    </div>
  );
}
