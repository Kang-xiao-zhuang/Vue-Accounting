"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import { clearWriteError, hasWriteError, subscribeWriteError } from "@/lib/storage";
import { useT } from "@/lib/i18n";

export function StorageWarning() {
  const failed = useSyncExternalStore(subscribeWriteError, hasWriteError, () => false);
  const { t } = useT();
  if (!failed) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[70] mx-auto flex max-w-app items-start gap-2 bg-expense px-4 py-3 text-sm text-white">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <span className="flex-1">{t("storage.warning")}</span>
      <button type="button" onClick={clearWriteError} className="shrink-0 underline">
        OK
      </button>
    </div>
  );
}
