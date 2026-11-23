import assert from "node:assert/strict";
import { db } from "../lib/db";
import { candidates } from "../prisma/menu-candidates";

// Safe to re-run: only fills missing English names and preserves admin edits.
try {
  const result = await db.$transaction(
    async (tx) => {
      let updated = 0;
      let preserved = 0;
      for (const source of candidates) {
        const category = await tx.menuCategory.findUniqueOrThrow({
          where: { slug: source.slug },
        });
        assert.equal(
          category.nameMn,
          source.nameMn,
          `Changed category: ${source.slug}`,
        );
        assert.equal(category.deletedAt, null);
        assert.ok(source.nameEn);
        if (!category.nameEn) {
          await tx.menuCategory.update({
            where: { id: category.id },
            data: { nameEn: source.nameEn },
          });
          await tx.auditLog.create({
            data: {
              action: "USER_REQUESTED_EN_TRANSLATION",
              entity: "MenuCategory",
              entityId: category.id,
              details: {
                authorization:
                  "User requested English menu translation in conversation",
                previousNameEn: category.nameEn,
                nameEn: source.nameEn,
              },
            },
          });
          updated++;
        } else preserved++;
        for (const expected of source.items) {
          const item = await tx.menuItem.findUniqueOrThrow({
            where: { slug: expected.slug },
          });
          assert.equal(
            item.nameMn,
            expected.nameMn,
            `Changed item: ${expected.slug}`,
          );
          assert.equal(
            item.nameKo,
            expected.nameKo,
            `Changed Korean name: ${expected.slug}`,
          );
          assert.equal(item.categoryId, category.id);
          assert.equal(item.deletedAt, null);
          assert.ok(expected.nameEn);
          if (!item.nameEn) {
            await tx.menuItem.update({
              where: { id: item.id },
              data: { nameEn: expected.nameEn },
            });
            await tx.auditLog.create({
              data: {
                action: "USER_REQUESTED_EN_TRANSLATION",
                entity: "MenuItem",
                entityId: item.id,
                details: {
                  authorization:
                    "User requested English menu translation in conversation",
                  previousNameEn: item.nameEn,
                  nameEn: expected.nameEn,
                },
              },
            });
            updated++;
          } else preserved++;
        }
      }
      return { updated, preserved };
    },
    { isolationLevel: "Serializable", timeout: 30000 },
  );
  // Public pages use force-dynamic and uncached Prisma queries: next request reads these changes.
  console.log(JSON.stringify(result));
} finally {
  await db.$disconnect();
}
