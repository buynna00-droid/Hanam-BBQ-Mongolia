import { test } from "node:test";
import assert from "node:assert/strict";
import { candidates } from "../prisma/menu-candidates";
import {
  canWrite,
  canManageStaff,
  itemSchema,
  validImageUrl,
} from "../lib/validation";
test("transcription includes all 48 supplied entries, with eight soft drinks", () => {
  assert.equal(
    candidates.reduce((n, c) => n + c.items.length, 0),
    48,
  );
  assert.equal(
    candidates.find((c) => c.slug === "soft-drinks")?.items.length,
    8,
  );
  assert.equal(
    new Set(candidates.flatMap((c) => c.items.map((i) => i.slug))).size,
    48,
  );
});
test("sensitive source ambiguities remain intact", () => {
  const all = candidates.flatMap((c) => c.items);
  assert.equal(all.find((i) => i.nameMn === "Finlandia Vodka")?.price, 180000);
  assert.equal(all.find((i) => i.nameMn === "Shiguderi Shimi")?.price, 150000);
  assert.equal(all.find((i) => i.nameMn === "Мёнгинамуль")?.price, null);
  assert.ok(
    !all
      .find((i) => i.nameMn === "SET C")
      ?.descriptionMn?.includes("бяслагтай"),
  );
  assert.ok(all.every((i) => i.nameEn === null));
});
test("role boundaries deny viewer writes and manager staff management", () => {
  assert.equal(canWrite("VIEWER"), false);
  assert.equal(canWrite("MENU_MANAGER"), true);
  assert.equal(canWrite("SUPER_ADMIN"), true);
  assert.equal(canWrite("other"), false);
  assert.equal(canManageStaff("MENU_MANAGER"), false);
  assert.equal(canManageStaff("SUPER_ADMIN"), true);
});
test("prices reject floats and negative money; untrusted image URLs rejected", () => {
  const data = {
    nameMn: "test",
    nameKo: "",
    nameEn: "",
    descriptionMn: "",
    descriptionKo: "",
    descriptionEn: "",
    slug: "test",
    categoryId: "id",
    price: "1.5",
    currency: "MNT",
    size: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: false,
    isFeatured: false,
  };
  assert.equal(itemSchema.safeParse(data).success, false);
  assert.equal(itemSchema.safeParse({ ...data, price: "-1" }).success, false);
  assert.equal(itemSchema.parse({ ...data, price: "" }).price, null);
  assert.equal(validImageUrl("https://untrusted.test/x.png"), false);
  assert.equal(validImageUrl("/uploads/../../secret"), false);
});
