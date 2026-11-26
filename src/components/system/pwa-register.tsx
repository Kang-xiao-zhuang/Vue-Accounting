"use client";

import { useEffect } from "react";

/** 注册 Service Worker；Capacitor WebView 内不需要（资源已是本地文件）。 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const isWebView = /wv|Android.*Version\/[0-9]/.test(navigator.userAgent) && !navigator.userAgent.includes("Chrome/");
    if (isWebView) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
