import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  return ["", "/about", "/menu"].flatMap((suffix) =>
    ["mn", "ko", "en"].map((l) => ({
      url: `${base}/${l}${suffix}`,
      alternates: {
        languages: {
          mn: `${base}/mn${suffix}`,
          ko: `${base}/ko${suffix}`,
          en: `${base}/en${suffix}`,
        },
      },
    })),
  );
}
