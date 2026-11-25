import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { db } from "../lib/db";
import { ensureLocalPostgres } from "./local-postgres.mjs";

// User-approved crops from the supplied three-dish menu poster.
// Only fills empty image fields so subsequent admin changes are preserved.
const photos = [
  {
    nameMn: "Гальмэгисаль",
    nameKo: "갈매기살",
    price: 30900,
    file: "galmaegisal.webp",
  },
  {
    nameMn: "Габрисаль",
    nameKo: "가브리살",
    price: 29900,
    file: "gabrisal.webp",
  },
  {
    nameMn: "Ханжонсаль",
    nameKo: "항정살",
    price: 31900,
    file: "hangjeongsal.webp",
  },
];

try {
  await ensureLocalPostgres();
  const result = await db.$transaction(
    async (tx) => {
      let updated = 0;
      for (const photo of photos) {
        const imageUrl = `/images/menu/${photo.file}`;
        assert.ok(existsSync(path.join(process.cwd(), "public", imageUrl)));
        const matches = await tx.menuItem.findMany({
          where: { nameKo: photo.nameKo, deletedAt: null },
        });
        assert.equal(matches.length, 1, `Expected one item: ${photo.nameKo}`);
        const item = matches[0];
        assert.equal(item.nameMn, photo.nameMn);
        assert.equal(item.price, photo.price);
        if (item.imageUrl) continue;
        await tx.menuItem.update({
          where: { id: item.id },
          data: { imageUrl },
        });
        await tx.auditLog.create({
          data: {
            action: "USER_REQUESTED_MENU_PHOTO_IMPORT",
            entity: "MenuItem",
            entityId: item.id,
            details: {
              source:
                "User-supplied pU5A3UQU.jpg menu poster; confirmed in conversation",
              previousImageUrl: item.imageUrl,
              imageUrl,
            },
          },
        });
        updated++;
      }
      return { updated, preserved: photos.length - updated };
    },
    { isolationLevel: "Serializable" },
  );
  // Both public menu routes are force-dynamic: next request reads these updates.
  console.log(JSON.stringify(result));
} finally {
  await db.$disconnect();
}
