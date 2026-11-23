import { writeFile } from "node:fs/promises";
import { db } from "../lib/db";

try {
  const [categories, items, images, variants] = await db.$transaction([
    db.menuCategory.findMany(),
    db.menuItem.findMany(),
    db.menuItemImage.findMany(),
    db.menuItemVariant.findMany(),
  ]);
  await writeFile(
    process.argv[2] ?? "menu-backup.json",
    JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        categories,
        items,
        images,
        variants,
      },
      null,
      2,
    ),
  );
  console.log(
    `Exported ${categories.length} categories and ${items.length} items; no users, passwords or sessions.`,
  );
} finally {
  await db.$disconnect();
}
