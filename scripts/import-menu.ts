import { readFile } from "node:fs/promises";
import { z } from "zod";
import { db } from "../lib/db";

const nullable = z.string().nullable();
const translated = { nameMn: z.string(), nameKo: nullable, nameEn: nullable };
const descriptions = {
  descriptionMn: nullable,
  descriptionKo: nullable,
  descriptionEn: nullable,
};
const dates = {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
};
const price = z.number().int().nonnegative().nullable();
const order = z.number().int();
const schema = z.object({
  version: z.literal(1),
  categories: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      group: z.enum(["FOOD", "DRINKS"]),
      ...translated,
      ...descriptions,
      displayOrder: order,
      isActive: z.boolean(),
      ...dates,
    }),
  ),
  items: z.array(
    z.object({
      id: z.string(),
      categoryId: z.string(),
      slug: z.string(),
      ...translated,
      ...descriptions,
      price,
      currency: z.literal("MNT"),
      size: nullable,
      imageUrl: nullable,
      isActive: z.boolean(),
      isFeatured: z.boolean(),
      displayOrder: order,
      ...dates,
    }),
  ),
  images: z.array(
    z.object({
      id: z.string(),
      itemId: z.string(),
      url: z.string(),
      altMn: z.string(),
      altKo: nullable,
      altEn: nullable,
      displayOrder: order,
    }),
  ),
  variants: z.array(
    z.object({
      id: z.string(),
      itemId: z.string(),
      ...translated,
      price,
      isActive: z.boolean(),
      displayOrder: order,
    }),
  ),
});
try {
  const data = schema.parse(
    JSON.parse(await readFile(process.argv[2] ?? "menu-backup.json", "utf8")),
  );
  await db.$transaction(
    async (tx) => {
      if ((await tx.menuCategory.count()) || (await tx.menuItem.count()))
        throw new Error(
          "Menu database is not empty. Import stopped; nothing overwritten.",
        );
      await tx.menuCategory.createMany({ data: data.categories });
      await tx.menuItem.createMany({ data: data.items });
      await tx.menuItemImage.createMany({ data: data.images });
      await tx.menuItemVariant.createMany({ data: data.variants });
      await tx.auditLog.create({
        data: {
          action: "TRANSFER_IMPORT",
          entity: "Menu",
          entityId: "transfer",
          details: {
            categories: data.categories.length,
            items: data.items.length,
          },
        },
      });
    },
    { timeout: 30000, isolationLevel: "Serializable" },
  );
  console.log(
    `Imported ${data.categories.length} categories / ${data.items.length} items with original publication status.`,
  );
} finally {
  await db.$disconnect();
}
