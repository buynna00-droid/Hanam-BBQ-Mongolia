import { z } from "zod";
import { blobPublicOrigin } from "./storage-config";
const optionalText = z
  .string()
  .trim()
  .max(4000)
  .transform((v) => v || null);
const price = z.preprocess(
  (v) => (v === "" || v === null ? null : Number(v)),
  z.number().int().min(0).max(100000000).nullable(),
);
const translated = {
  nameMn: z.string().trim().min(1).max(200),
  nameKo: optionalText,
  nameEn: optionalText,
  descriptionMn: optionalText,
  descriptionKo: optionalText,
  descriptionEn: optionalText,
};
export const categorySchema = z.object({
  ...translated,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  group: z.enum(["FOOD", "DRINKS"]),
  displayOrder: z.coerce.number().int().min(0).max(100000),
  isActive: z.boolean(),
});
export const itemSchema = z.object({
  ...translated,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  categoryId: z.string().min(1),
  price,
  currency: z.literal("MNT"),
  size: optionalText,
  imageUrl: optionalText,
  displayOrder: z.coerce.number().int().min(0).max(100000),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});
export const variantSchema = z.object({
  nameMn: z.string().trim().min(1).max(200),
  nameKo: optionalText,
  nameEn: optionalText,
  price,
  isActive: z.boolean(),
  displayOrder: z.coerce.number().int().min(0).max(100000),
});
export const imageSchema = z.object({
  url: z.string().min(1),
  altMn: z.string().trim().min(1).max(500),
  altKo: optionalText,
  altEn: optionalText,
  displayOrder: z.coerce.number().int().min(0).max(100000),
});
export function canWrite(role: string) {
  return role === "SUPER_ADMIN" || role === "MENU_MANAGER";
}
export function canManageStaff(role: string) {
  return role === "SUPER_ADMIN";
}
export function validImageUrl(url: string | null) {
  if (!url) return true;
  const blobOrigin = blobPublicOrigin();
  if (blobOrigin && url.startsWith(`${blobOrigin}/menu/`)) {
    return /^[a-f0-9-]+\.webp$/.test(url.slice(`${blobOrigin}/menu/`.length));
  }
  // Bundled, user-approved menu photos can also be retained during admin edits.
  if (
    [
      "/images/menu/galmaegisal.webp",
      "/images/menu/gabrisal.webp",
      "/images/menu/hangjeongsal.webp",
    ].includes(url)
  )
    return true;
  if (/^\/uploads\/[a-f0-9-]+\.webp$/.test(url))
    return process.env.NODE_ENV !== "production";
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  return (
    !!base &&
    url.startsWith(base + "/") &&
    /^[a-f0-9-]+\.webp$/.test(url.slice(base.length + 1))
  );
}
