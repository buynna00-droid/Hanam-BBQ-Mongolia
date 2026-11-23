import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
const assetName = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const text = z.object({
  mn: z.string().max(1000).optional(),
  ko: z.string().max(1000).optional(),
  en: z.string().max(1000).optional(),
});
const entry = z.object({
  id: z.string().min(1),
  type: z.enum(["image", "video"]),
  file: assetName,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  poster: assetName.optional(),
  captions: assetName.optional(),
  captionLanguage: z.enum(["mn", "ko", "en"]).optional(),
  alt: text.optional(),
  caption: text.optional(),
});
export type GalleryEntry = z.infer<typeof entry>;
export async function getGallery(): Promise<GalleryEntry[]> {
  const directory = path.join(process.cwd(), "public", "images", "gallery");
  try {
    const entries = z
      .array(entry)
      .parse(
        JSON.parse(
          await readFile(path.join(directory, "gallery.json"), "utf8"),
        ),
      );
    return entries
      .filter(
        (item, index) =>
          entries.findIndex((other) => other.id === item.id) === index,
      )
      .filter(
        (item) =>
          (item.type === "image"
            ? /\.(jpe?g|png|webp)$/i
            : /\.(mp4|webm)$/i
          ).test(item.file) && existsSync(path.join(directory, item.file)),
      )
      .map((item) => ({
        ...item,
        poster:
          item.poster &&
          /\.(jpe?g|png|webp)$/i.test(item.poster) &&
          existsSync(path.join(directory, item.poster))
            ? item.poster
            : undefined,
        captions:
          item.captions &&
          /\.vtt$/i.test(item.captions) &&
          existsSync(path.join(directory, item.captions))
            ? item.captions
            : undefined,
      }));
  } catch {
    return [];
  }
}
