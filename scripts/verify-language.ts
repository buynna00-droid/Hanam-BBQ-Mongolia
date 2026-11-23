import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { copy, type Lang } from "../lib/content";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const base = process.env.SITE_URL ?? "http://localhost:3000";
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(base + "/mn");
  for (const lang of ["en", "ko", "mn"] as Lang[]) {
    await page
      .locator(".languages")
      .getByRole("link", { name: lang.toUpperCase(), exact: true })
      .click();
    await page.waitForURL(base + "/" + lang);
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    for (const title of [
      copy[lang].about,
      copy[lang].special,
      copy[lang].menu,
      copy[lang].branches,
    ]) {
      assert.ok(
        await page
          .getByRole("heading", { name: title, exact: true })
          .first()
          .isVisible(),
      );
    }
    assert.ok(
      await page
        .locator(".map-placeholder")
        .getByText(copy[lang].map, { exact: true })
        .isVisible(),
    );
    assert.ok(
      await page
        .locator("footer")
        .getByRole("heading", { name: copy[lang].contact, exact: true })
        .isVisible(),
    );
    assert.ok(
      await page
        .getByRole("button", { name: copy[lang].food, exact: true })
        .isVisible(),
    );
    assert.ok(
      await page
        .locator(".hero")
        .getByText(copy[lang].photo, { exact: true })
        .isVisible(),
    );
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page
    .getByRole("button", { name: copy.mn.openMenu, exact: true })
    .click();
  await page
    .locator(".languages")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await page.waitForURL(base + "/en");
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  assert.equal(
    await page
      .getByRole("button", { name: copy.en.openMenu, exact: true })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  mkdirSync(".local", { recursive: true });
  writeFileSync(
    ".local/language-verification.json",
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "Desktop language links update all section headings, menu group labels, footer, map status and photo placeholders",
          "Mobile language switch closes navigation and preserves a layout without document overflow",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS language switch: all sections, footer, placeholders, mobile navigation",
  );
} finally {
  await browser.close();
}
