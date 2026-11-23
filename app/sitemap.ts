import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  return ["mn", "ko", "en"].map((l) => ({
    url: `${base}/${l}`,
    alternates: {
      languages: { mn: `${base}/mn`, ko: `${base}/ko`, en: `${base}/en` },
    },
  }));
}
