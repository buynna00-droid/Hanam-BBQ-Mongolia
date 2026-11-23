import { chromium, expect, type Page } from "@playwright/test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { db } from "../lib/db";
import { spawnSync } from "node:child_process";
const base = process.env.SITE_URL ?? "http://localhost:3000";
const prefix = `verification-${Date.now()}`;
const password = randomBytes(20).toString("hex");
const results: { check: string; status: string; detail?: string }[] = [];
const browser = await chromium.launch({ channel: "msedge", headless: true });
let categoryId = "";
async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ check: name, status: "passed" });
    console.log("PASS", name);
  } catch (e) {
    results.push({
      check: name,
      status: "failed",
      detail: e instanceof Error ? e.message : String(e),
    });
    console.error("FAIL", name, e instanceof Error ? e.message : e);
  }
}
async function login(page: Page, email: string) {
  await page.goto(base + "/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(base + "/admin");
}
try {
  const passwordHash = await hash(password, 12);
  const manager = await db.adminUser.create({
    data: {
      name: "Verification manager",
      email: `${prefix}-manager@example.invalid`,
      passwordHash,
      role: "MENU_MANAGER",
    },
  });
  const viewer = await db.adminUser.create({
    data: {
      name: "Verification viewer",
      email: `${prefix}-viewer@example.invalid`,
      passwordHash,
      role: "VIEWER",
    },
  });
  const category = await db.menuCategory.create({
    data: {
      slug: prefix,
      nameMn: "Verification category",
      nameEn: "Verification category",
      nameKo: "Verification category",
      isActive: true,
    },
  });
  categoryId = category.id;
  const context = await browser.newContext();
  context.setDefaultTimeout(20000);
  const page = await context.newPage();
  await check("Unauthenticated admin pages redirect to login", async () => {
    for (const route of [
      "/admin",
      "/admin/categories",
      "/admin/items/new",
      "/admin/staff",
      "/admin/audit",
    ]) {
      await page.goto(base + route);
      assert.ok(page.url().endsWith("/admin/login"));
    }
  });
  await check(
    "All three language routes render translated navigation and correct HTML language",
    async () => {
      for (const [lang, heading] of [
        ["mn", "Бидний тухай"],
        ["ko", "소개"],
        ["en", "About"],
      ]) {
        await page.goto(`${base}/${lang}`);
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.ok(
          await page
            .getByRole("heading", { name: heading, exact: true })
            .isVisible(),
        );
        assert.equal(await page.locator(".photo-placeholder").count(), 3);
      }
    },
  );
  await check(
    "Responsive layouts have no document overflow at 375, 768, and 1440px",
    async () => {
      for (const lang of ["mn", "ko", "en"])
        for (const width of [375, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`${base}/${lang}`);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${lang} at ${width}`,
          );
        }
      await page.setViewportSize({ width: 1440, height: 1000 });
    },
  );
  await check("Manager login and item create", async () => {
    await login(page, manager.email);
    await page.goto(base + "/admin/items/new");
    await page.getByLabel("Name · MN *", { exact: true }).fill(prefix);
    await page.getByLabel("Slug *", { exact: true }).fill(prefix);
    await page.getByLabel(/^Category/).selectOption(category.id);
    await page
      .getByLabel("Price · MNT (blank = pending)", { exact: true })
      .fill("12345");
    await page
      .getByLabel("Publish item (only visible in an active category)")
      .check();
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    assert.equal(
      (await db.menuItem.findUnique({ where: { slug: prefix } }))?.price,
      12345,
    );
  });
  const item = await db.menuItem.findUnique({ where: { slug: prefix } });
  if (!item)
    throw new Error("Cannot continue item flow without created fixture");
  let captured: { body: string; headers: Record<string, string> } | undefined;
  await check("Item create and price edits appear on public menu", async () => {
    const publicPage = await context.newPage();
    await publicPage.goto(base + "/mn");
    assert.ok(
      await publicPage
        .getByRole("heading", { name: prefix, exact: true })
        .isVisible(),
    );
    await page.goto(`${base}/admin/items/${item.id}`);
    await page
      .getByLabel("Price · MNT (blank = pending)", { exact: true })
      .first()
      .fill("23456");
    page.on("request", (req) => {
      if (req.method() === "POST" && req.headers()["next-action"])
        captured = { body: req.postData() ?? "", headers: req.headers() };
    });
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    await publicPage.reload();
    assert.ok(
      (
        await publicPage
          .locator(".menu-item")
          .filter({
            has: publicPage.getByRole("heading", { name: prefix, exact: true }),
          })
          .innerText()
      ).includes("23,456"),
    );
    await publicPage.close();
  });
  await check("Main image upload, replace, and remove", async () => {
    await page.goto(`${base}/admin/items/${item.id}`);
    const fileInput = page.locator("input[type=file]").first();
    const first = await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#aa8866" },
    })
      .png()
      .toBuffer();
    await fileInput.setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: first,
    });
    await page
      .getByText("Uploaded. Save the form to attach this image.")
      .waitFor();
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    const before = (
      await db.menuItem.findUniqueOrThrow({ where: { id: item.id } })
    ).imageUrl;
    assert.ok(before);
    assert.equal((await context.request.get(base + before)).status(), 200);
    await page.reload();
    const second = await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#335544" },
    })
      .jpeg()
      .toBuffer();
    await page.locator("input[type=file]").first().setInputFiles({
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer: second,
    });
    await page
      .getByText("Uploaded. Save the form to attach this image.")
      .waitFor();
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    const after = (
      await db.menuItem.findUniqueOrThrow({ where: { id: item.id } })
    ).imageUrl;
    assert.ok(after && after !== before);
    await page.reload();
    await page
      .getByRole("button", { name: "Remove image", exact: true })
      .click();
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    assert.equal(
      (await db.menuItem.findUniqueOrThrow({ where: { id: item.id } }))
        .imageUrl,
      null,
    );
  });
  await check("Variant creation and publication", async () => {
    await page.goto(`${base}/admin/items/${item.id}`);
    const form = page.locator("form").filter({
      has: page.getByRole("button", { name: "Add variant", exact: true }),
    });
    await form
      .getByLabel("Name · MN *", { exact: true })
      .fill("Verification variant");
    await form
      .getByLabel("Price · MNT (blank = pending)", { exact: true })
      .fill("6000");
    await form.getByLabel("Active variant", { exact: true }).check();
    await form
      .getByRole("button", { name: "Add variant", exact: true })
      .click();
    await form.getByText("Variant saved.").waitFor();
    const publicPage = await context.newPage();
    await publicPage.goto(base + "/mn");
    assert.ok(
      await publicPage
        .getByText("Verification variant", { exact: true })
        .isVisible(),
    );
    await publicPage.close();
  });
  await check("Extra image upload, alt text and removal", async () => {
    await page.goto(`${base}/admin/items/${item.id}`);
    const form = page.locator("form").filter({
      has: page.getByRole("button", { name: "Save image", exact: true }),
    });
    const buffer = await sharp({
      create: { width: 20, height: 20, channels: 3, background: "#665544" },
    })
      .png()
      .toBuffer();
    await form
      .locator("input[type=file]")
      .setInputFiles({ name: "extra.png", mimeType: "image/png", buffer });
    await form
      .getByText("Uploaded. Save the form to attach this image.")
      .waitFor();
    await form
      .getByLabel("Alt text · MN *", { exact: true })
      .fill("Verification alt text");
    await form.getByRole("button", { name: "Save image", exact: true }).click();
    await page.getByText("Image saved.").waitFor();
    assert.equal(
      await db.menuItemImage.count({ where: { itemId: item.id } }),
      1,
    );
    await page.reload();
    const removal = page.locator("form").filter({
      has: page.getByRole("button", { name: "Remove image", exact: true }),
    });
    await removal.getByLabel("Type DELETE to remove this image").fill("DELETE");
    await removal
      .getByRole("button", { name: "Remove image", exact: true })
      .click();
    await expect
      .poll(() => db.menuItemImage.count({ where: { itemId: item.id } }))
      .toBe(0);
  });
  await check(
    "Category deactivation hides items without deleting them",
    async () => {
      await page.goto(base + "/admin/categories");
      const details = page.locator("details").filter({
        has: page.locator('input[name=id][value="' + category.id + '"]'),
      });
      await details.locator("summary").click();
      await details.getByLabel("Active category", { exact: true }).uncheck();
      await details.getByRole("button", { name: "Save", exact: true }).click();
      await details.getByText("Category saved.").waitFor();
      const publicPage = await context.newPage();
      await publicPage.goto(base + "/mn");
      assert.equal(
        await publicPage
          .getByRole("heading", { name: prefix, exact: true })
          .count(),
        0,
      );
      assert.equal(
        (await db.menuItem.findUniqueOrThrow({ where: { id: item.id } }))
          .isActive,
        true,
      );
      await details.getByLabel("Active category", { exact: true }).check();
      await details.getByRole("button", { name: "Save", exact: true }).click();
      await details.getByText("Category saved.").waitFor();
      await publicPage.close();
    },
  );
  await check("Hidden items disappear from public menu", async () => {
    await page.goto(`${base}/admin/items/${item.id}`);
    await page
      .getByLabel("Publish item (only visible in an active category)")
      .uncheck();
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await page.getByText("Item saved. Public menu refreshed.").waitFor();
    const publicPage = await context.newPage();
    await publicPage.goto(base + "/mn");
    assert.equal(
      await publicPage
        .getByRole("heading", { name: prefix, exact: true })
        .count(),
      0,
    );
    await publicPage.close();
  });
  await check(
    "Viewer cannot upload or replay a menu write action",
    async () => {
      const vc = await browser.newContext();
      const vp = await vc.newPage();
      await login(vp, viewer.email);
      await vp.goto(`${base}/admin/items/${item.id}`);
      assert.ok(
        await vp
          .getByRole("button", { name: "Save item", exact: true })
          .isDisabled(),
      );
      const upload = await vc.request.post(base + "/admin/upload");
      assert.equal(upload.status(), 403);
      assert.ok(captured);
      const before = await db.menuItem.findUniqueOrThrow({
        where: { id: item.id },
      });
      const response = await vc.request.post(`${base}/admin/items/${item.id}`, {
        headers: {
          "next-action": captured.headers["next-action"],
          "content-type": captured.headers["content-type"],
          origin: base,
        },
        data: captured.body,
      });
      assert.ok(response.status() >= 400);
      const after = await db.menuItem.findUniqueOrThrow({
        where: { id: item.id },
      });
      assert.equal(
        after.updatedAt.toISOString(),
        before.updatedAt.toISOString(),
      );
      await vc.close();
    },
  );
  await check(
    "CSRF rejects authenticated upload with missing token",
    async () => {
      const response = await context.request.post(base + "/admin/upload", {
        headers: { origin: base },
        multipart: {
          file: {
            name: "bad.png",
            mimeType: "image/png",
            buffer: Buffer.from("invalid"),
          },
        },
      });
      assert.equal(response.status(), 400);
    },
  );
  await check(
    "Draft seed contains exactly 48 unique items and 11 categories",
    async () => {
      const items = await db.menuItem.count({
        where: { slug: { not: prefix } },
      });
      assert.equal(items, 48);
      assert.equal(
        await db.menuCategory.count({ where: { id: { not: categoryId } } }),
        11,
      );
      assert.equal(
        await db.menuItem.count({
          where: { slug: { not: prefix }, isActive: true },
        }),
        0,
      );
    },
  );
  await check(
    "Soft delete requires confirmation and retains audit history",
    async () => {
      await page.goto(`${base}/admin/items/${item.id}`);
      await page
        .getByLabel("Type DELETE to confirm", { exact: true })
        .fill("DELETE");
      await page
        .getByRole("button", { name: "Delete item", exact: true })
        .click();
      await page.waitForURL(base + "/admin");
      assert.ok(
        (await db.menuItem.findUniqueOrThrow({ where: { id: item.id } }))
          .deletedAt,
      );
      assert.ok(
        await db.auditLog.count({
          where: { entityId: item.id, action: "SOFT_DELETE" },
        }),
      );
    },
  );
  await check(
    "Environment-based first admin CLI and staff creation",
    async () => {
      const email = `${prefix}-super@example.invalid`;
      const created = spawnSync(
        process.execPath,
        ["--import", "tsx", "scripts/create-admin.ts"],
        {
          env: {
            ...process.env,
            ADMIN_EMAIL: email,
            ADMIN_PASSWORD: password,
            ADMIN_NAME: "Verification super admin",
          },
          encoding: "utf8",
        },
      );
      assert.equal(created.status, 0, created.stderr);
      const sc = await browser.newContext();
      const sp = await sc.newPage();
      await login(sp, email);
      await sp.goto(base + "/admin/staff");
      const section = sp
        .locator("details")
        .filter({ has: sp.getByText("Create staff account", { exact: true }) });
      await section
        .getByLabel("Name", { exact: true })
        .fill("Verification staff");
      await section
        .getByLabel("Email", { exact: true })
        .fill(`${prefix}-staff@example.invalid`);
      await section.getByLabel(/^Password/).fill(password);
      await section.getByRole("button", { name: "Save", exact: true }).click();
      await section
        .getByText("Staff account saved. Existing sessions revoked.")
        .waitFor();
      const staff = await db.adminUser.findUniqueOrThrow({
        where: { email: `${prefix}-staff@example.invalid` },
      });
      assert.equal(staff.role, "VIEWER");
      assert.notEqual(staff.passwordHash, password);
      await sc.close();
    },
  );
  await context.close();
} catch (e) {
  results.push({
    check: "Verification runner",
    status: "failed",
    detail: e instanceof Error ? e.message : String(e),
  });
  console.error(e);
} finally {
  await browser.close();
  const users = await db.adminUser.findMany({
    where: { email: { startsWith: prefix } },
    select: { id: true },
  });
  await db.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: users.map((u) => u.id) } },
        { entityId: categoryId },
      ],
    },
  });
  await db.menuItem.deleteMany({ where: { slug: prefix } });
  if (categoryId) await db.menuCategory.delete({ where: { id: categoryId } });
  await db.adminUser.deleteMany({
    where: { id: { in: users.map((u) => u.id) } },
  });
  mkdirSync(".local", { recursive: true });
  writeFileSync(".local/verification.json", JSON.stringify(results, null, 2));
  await db.$disconnect();
}
if (results.some((r) => r.status === "failed")) process.exitCode = 1;
