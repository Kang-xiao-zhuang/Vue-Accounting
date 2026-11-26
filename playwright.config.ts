import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
    // 使用完整 Chromium 的新版 headless 模式，避免额外下载 chrome-headless-shell。
    channel: "chromium",
  },
  webServer: {
    command: "node scripts/serve-out.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
