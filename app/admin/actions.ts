"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { digest, requireUser, startSession, verifyCsrf } from "@/lib/auth";
import {
  categorySchema,
  itemSchema,
  variantSchema,
  imageSchema,
  validImageUrl,
} from "@/lib/validation";
export type Result = { error?: string; success?: string };
function fields(form: FormData) {
  return {
    ...Object.fromEntries(form.entries()),
    isActive: form.get("isActive") === "on",
    isFeatured: form.get("isFeatured") === "on",
  };
}
function refresh() {
  for (const p of ["/mn", "/ko", "/en", "/admin"]) revalidatePath(p, "layout");
}
async function limited(key: string, max: number) {
  const now = new Date();
  await db.loginAttempt.upsert({
    where: { key },
    create: { key, count: 0, resetAt: new Date(Date.now() + 900000) },
    update: {},
  });
  await db.loginAttempt.updateMany({
    where: { key, resetAt: { lt: now } },
    data: { count: 0, resetAt: new Date(Date.now() + 900000) },
  });
  const a = await db.loginAttempt.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return a.count > max;
}
export async function login(_: Result, form: FormData): Promise<Result> {
  let ok = false;
  try {
    await verifyCsrf(form);
    const email = z.email().max(254).parse(form.get("email")).toLowerCase();
    const password = z.string().min(1).max(128).parse(form.get("password"));
    if ((await limited("global", 100)) || (await limited(digest(email), 5)))
      return { error: "Too many attempts. Try again in 15 minutes." };
    const user = await db.adminUser.findUnique({ where: { email } });
    const valid = await compare(
      password,
      user?.passwordHash ??
        "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW",
    );
    if (!user || !valid || !user.isActive)
      return { error: "Invalid email or password." };
    await startSession(user.id);
    ok = true;
  } catch {
    return {
      error: "Sign-in unavailable. Check credentials and server configuration.",
    };
  }
  if (ok) redirect("/admin");
  return {};
}
export async function logout(form: FormData) {
  await verifyCsrf(form);
  const jar = await cookies();
  const token = jar.get("hanam_session")?.value;
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
  jar.delete("hanam_session");
  redirect("/admin/login");
}
export async function saveItem(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    const data = itemSchema.parse(fields(form));
    if (!validImageUrl(data.imageUrl))
      return { error: "Use the image upload control." };
    const id = String(form.get("id") ?? "");
    const category = await db.menuCategory.findFirst({
      where: { id: data.categoryId, deletedAt: null },
    });
    if (!category) return { error: "Select an existing category." };
    await db.$transaction(async (tx) => {
      const before = id
        ? await tx.menuItem.findFirst({ where: { id, deletedAt: null } })
        : null;
      if (id && !before) throw new Error();
      const item = id
        ? await tx.menuItem.update({ where: { id }, data })
        : await tx.menuItem.create({ data });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: id ? "UPDATE" : "CREATE",
          entity: "MenuItem",
          entityId: item.id,
          details: {
            before: before ? JSON.parse(JSON.stringify(before)) : null,
            after: data,
          },
        },
      });
    });
    refresh();
    return { success: "Item saved. Public menu refreshed." };
  } catch {
    return {
      error:
        "Could not save. Check required names, unique slug, price, and field lengths.",
    };
  }
}
export async function deleteItem(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    if (form.get("confirm") !== "DELETE")
      return { error: "Type DELETE to confirm." };
    const id = String(form.get("id"));
    await db.$transaction(async (tx) => {
      await tx.menuItem.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "SOFT_DELETE",
          entity: "MenuItem",
          entityId: id,
        },
      });
    });
    refresh();
  } catch {
    return { error: "Could not delete this item." };
  }
  redirect("/admin");
}
export async function saveCategory(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    const data = categorySchema.parse(fields(form));
    const id = String(form.get("id") ?? "");
    await db.$transaction(async (tx) => {
      const before = id
        ? await tx.menuCategory.findUnique({ where: { id } })
        : null;
      const c = id
        ? await tx.menuCategory.update({ where: { id }, data })
        : await tx.menuCategory.create({ data });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: id ? "UPDATE" : "CREATE",
          entity: "MenuCategory",
          entityId: c.id,
          details: {
            before: before ? JSON.parse(JSON.stringify(before)) : null,
            after: data,
          },
        },
      });
    });
    refresh();
    return { success: "Category saved." };
  } catch {
    return { error: "Could not save category. Check names, slug, and order." };
  }
}
export async function moveItems(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    const from = String(form.get("from")),
      to = String(form.get("to"));
    if (from === to) return { error: "Choose different categories." };
    await db.$transaction(async (tx) => {
      const categories = await tx.menuCategory.count({
        where: { id: { in: [from, to] }, deletedAt: null },
      });
      if (categories !== 2) throw new Error();
      const items = await tx.menuItem.findMany({
        where: { categoryId: from, deletedAt: null },
        select: { id: true },
      });
      await tx.menuItem.updateMany({
        where: { categoryId: from, deletedAt: null },
        data: { categoryId: to },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "MOVE_ITEMS",
          entity: "MenuCategory",
          entityId: from,
          details: { to, itemIds: items.map((i) => i.id) },
        },
      });
    });
    refresh();
    return { success: "Items moved." };
  } catch {
    return { error: "Could not move items." };
  }
}
export async function saveVariant(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    const itemId = String(form.get("itemId"));
    const id = String(form.get("id") ?? "");
    const data = variantSchema.parse(fields(form));
    await db.$transaction(async (tx) => {
      const parent = await tx.menuItem.findFirst({
        where: { id: itemId, deletedAt: null },
      });
      if (!parent) throw new Error();
      const v = id
        ? await tx.menuItemVariant.update({ where: { id, itemId }, data })
        : await tx.menuItemVariant.create({ data: { ...data, itemId } });
      await tx.menuItem.update({
        where: { id: itemId },
        data: { updatedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "SAVE_VARIANT",
          entity: "MenuItem",
          entityId: itemId,
          details: { variantId: v.id, ...data },
        },
      });
    });
    refresh();
    return { success: "Variant saved." };
  } catch {
    return { error: "Could not save variant." };
  }
}
export async function saveImage(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    const data = imageSchema.parse(fields(form));
    if (!validImageUrl(data.url)) throw new Error();
    const id = String(form.get("id") ?? ""),
      itemId = String(form.get("itemId"));
    await db.$transaction(async (tx) => {
      const parent = await tx.menuItem.findFirst({
        where: { id: itemId, deletedAt: null },
      });
      if (!parent) throw new Error();
      const img = id
        ? await tx.menuItemImage.update({ where: { id, itemId }, data })
        : await tx.menuItemImage.create({ data: { ...data, itemId } });
      await tx.menuItem.update({
        where: { id: itemId },
        data: { updatedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "SAVE_IMAGE",
          entity: "MenuItem",
          entityId: itemId,
          details: { imageId: img.id, ...data },
        },
      });
    });
    refresh();
    return { success: "Image saved." };
  } catch {
    return { error: "Upload an image and enter Mongolian alt text." };
  }
}
export async function removeChild(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true);
  try {
    await verifyCsrf(form);
    if (form.get("confirm") !== "DELETE")
      return { error: "Type DELETE to confirm." };
    const id = String(form.get("id")),
      itemId = String(form.get("itemId")),
      kind = String(form.get("kind"));
    if (!["image", "variant"].includes(kind)) throw new Error();
    await db.$transaction(async (tx) => {
      if (kind === "image")
        await tx.menuItemImage.delete({ where: { id, itemId } });
      else await tx.menuItemVariant.delete({ where: { id, itemId } });
      await tx.menuItem.update({
        where: { id: itemId },
        data: { updatedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: `REMOVE_${kind.toUpperCase()}`,
          entity: "MenuItem",
          entityId: itemId,
          details: { id },
        },
      });
    });
    refresh();
    return { success: "Removed from menu." };
  } catch {
    return { error: "Could not remove." };
  }
}
export async function saveStaff(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser(true, true);
  try {
    await verifyCsrf(form);
    const id = String(form.get("id") ?? "");
    const data = z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.email().max(254),
        role: z.enum(["SUPER_ADMIN", "MENU_MANAGER", "VIEWER"]),
        isActive: z.boolean(),
        password: z
          .string()
          .max(72)
          .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
      })
      .parse({ ...fields(form), password: String(form.get("password") ?? "") });
    if (id === user.id && (!data.isActive || data.role !== "SUPER_ADMIN"))
      return { error: "You cannot deactivate or demote your own account." };
    if ((!id || data.password) && data.password.length < 12)
      return { error: "Use a password of at least 12 characters." };
    const passwordHash = data.password
      ? await hash(data.password, 12)
      : undefined;
    await db.$transaction(async (tx) => {
      const values = {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        isActive: data.isActive,
        ...(passwordHash ? { passwordHash } : {}),
      };
      const staff = id
        ? await tx.adminUser.update({ where: { id }, data: values })
        : await tx.adminUser.create({
            data: { ...values, passwordHash: passwordHash! },
          });
      if (id) await tx.session.deleteMany({ where: { userId: id } });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "SAVE_STAFF",
          entity: "AdminUser",
          entityId: staff.id,
          details: { role: data.role, isActive: data.isActive },
        },
      });
    });
    refresh();
    return { success: "Staff account saved. Existing sessions revoked." };
  } catch {
    return { error: "Could not save staff. Check email, role, and password." };
  }
}
