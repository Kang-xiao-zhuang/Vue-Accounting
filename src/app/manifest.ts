import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "每日记账 · Daily Bookkeeping",
    short_name: "记账",
    description: "本地优先的个人记账应用",
    start_url: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#0F1320",
    lang: "zh",
  };
}
