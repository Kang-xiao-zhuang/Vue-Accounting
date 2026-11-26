import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "每日记账 · Daily Bookkeeping",
  description: "本地优先的个人记账应用：记账、预算、统计，无账号、无云端。",
};

export const viewport: Viewport = {
  themeColor: "#0F1320",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
