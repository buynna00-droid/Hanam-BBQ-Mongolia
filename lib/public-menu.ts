import "server-only";
import { db } from "@/lib/db";
import { ensureLocalPostgres } from "@/scripts/local-postgres.mjs";

export async function getMenu() {
  await ensureLocalPostgres();
  return db.menuCategory.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        where: { isActive: true, deletedAt: null },
        orderBy: { displayOrder: "asc" },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          images: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });
}
