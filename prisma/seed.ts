import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { db } from "../lib/db";
import { candidates } from "./menu-candidates";
const source = "docs/source/Hanam_BBQ_Mongolia_Menu.docx";
const nullable = z.string().nullable();
const manifest = z.object({
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  reviewedBy: z.string().min(1),
  categories: z.array(
    z.object({
      slug: z.string().min(1),
      nameMn: z.string().min(1),
      nameKo: nullable,
      nameEn: nullable,
      group: z.enum(["FOOD", "DRINKS"]),
      items: z.array(
        z.object({
          slug: z.string().min(1),
          nameMn: z.string().min(1),
          nameKo: nullable,
          nameEn: nullable,
          price: z.number().int().nonnegative().nullable(),
          size: nullable,
          descriptionMn: nullable,
        }),
      ),
    }),
  ),
});
async function main() {
  let data = candidates;
  let provenance = "UNVERIFIED_USER_TRANSCRIPTION";
  if (process.env.ALLOW_UNVERIFIED_SEED !== "true") {
    if (!existsSync(source))
      throw new Error(
        `Missing source: ${source}. Nothing imported. Use ALLOW_UNVERIFIED_SEED=true only for unpublished transcription drafts.`,
      );
    const verified = manifest.parse(
      JSON.parse(readFileSync("docs/source/menu.verified.json", "utf8")),
    );
    const hash = createHash("sha256")
      .update(readFileSync(source))
      .digest("hex");
    if (hash !== verified.sourceSha256)
      throw new Error(
        "Source hash mismatch. Review the current Word document before importing.",
      );
    data = verified.categories;
    provenance = `WORD_REVIEW:${hash}:${verified.reviewedBy}`;
  }
  const count = data.reduce((n, c) => n + c.items.length, 0);
  if (new Set(data.flatMap((c) => c.items.map((i) => i.slug))).size !== count)
    throw new Error("Duplicate item slugs in source.");
  await db.$transaction(
    async (tx) => {
      for (const [order, c] of data.entries()) {
        const { items, ...values } = c;
        const category = await tx.menuCategory.upsert({
          where: { slug: c.slug },
          update: {},
          create: { ...values, displayOrder: order, isActive: false },
        });
        for (const [displayOrder, item] of items.entries()) {
          const existing = await tx.menuItem.findUnique({
            where: { slug: item.slug },
          });
          if (existing) continue;
          const created = await tx.menuItem.upsert({
            where: { slug: item.slug },
            update: {},
            create: {
              ...item,
              categoryId: category.id,
              displayOrder,
              isActive: false,
              currency: "MNT",
            },
          });
          await tx.auditLog.create({
            data: {
              action: "SEED_DRAFT",
              entity: "MenuItem",
              entityId: created.id,
              details: { provenance },
            },
          });
        }
      }
    },
    { timeout: 30000 },
  );
  console.log(
    `Seed complete: ${data.length} categories / ${count} source entries. Existing content preserved; new content hidden. Provenance: ${provenance.startsWith("WORD") ? "reviewed Word manifest" : provenance}.`,
  );
}
main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : "Seed failed");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
