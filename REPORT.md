# Build and verification report

Date: 2026-11-23. Built locally; **not deployed**.

Menu publication update: the user subsequently explicitly approved the supplied menu (`tsesiig batalgaajuul`). All 48 items and 11 categories were checked against the original prompt transcription, then activated in one transaction with per-record `USER_APPROVED_PUBLISH` audit entries. Existing pending prices/translations remain unchanged. The hidden-draft statements below describe the initial build, not the current publication state. The Word document has still not been verified.

Logo update: the user subsequently supplied a transparent 648 × 212 PNG. Its original bytes are now installed at `public/images/logo/hanam-bbq-logo.png` and used in the header and footer with proportional sizing. The missing-logo notes below describe the initial build; only the three photos remain missing among the visual assets.

## Workspace inspection

The workspace was empty: no application, package manifest, Prisma schema, assets or source document existed. Node.js 24.12.0 and npm 11.6.2 were available. PostgreSQL 18 was installed under `C:\Program Files\PostgreSQL\18`, with an existing service on port 5432. Its binaries were reused to create a separate project-local PostgreSQL cluster on `127.0.0.1:55439`; the existing service/database was not changed.

Installed application versions include Next.js 16.4.6 and Prisma 6.19.3. Dependencies are locked in `package-lock.json`. Native image processing uses patched Sharp 0.35.5. Prisma's transitive Effect and deepmerge-ts dependencies have explicit patched overrides; generation, migration and runtime tests passed with those overrides.

## Delivered

- Responsive dark editorial public page at `/mn`, `/ko`, `/en`: sticky navigation, mobile menu, active section state, language switch, hero, exact supplied Mongolian about/special copy, menu filters, branches and footer.
- Self-hosted Noto font families with extended Cyrillic support for Mongolian and Hangul coverage. Original brand/image assets are checked before rendering. Missing files receive explicit placeholders.
- PostgreSQL-backed categories, items, integer MNT prices, nullable prices, translations, featured items, variants and additional images. Public queries exclude hidden/deleted content and inactive variants.
- Protected admin overview, search, filters, pagination, item/category management, images, variants, soft deletion, staff roles and audit history.
- Bcrypt password hashes, hashed opaque sessions, server authorization, signed CSRF tokens and origin checks, database-backed login limiting, validated input, safe user-facing errors and write-triggered revalidation.
- Development image storage and production S3-compatible storage integration, image decoding/validation, optimization and unique filenames. No upload controls for the logo or the three static photographs.
- Metadata, Open Graph text, sitemap, robots rules, hreflang, documentation and repeatable verification scripts.

## Missing sources and count discrepancy

**Not read because absent:** `docs/source/Hanam_BBQ_Mongolia_Menu.docx`.

**Missing assets:** `public/images/logo/hanam-bbq-logo.svg`, `public/images/hero/hero-exterior.jpg`, `public/images/about/about-restaurant.jpg`, `public/images/special/charcoal-grilling.jpg`. No logo or restaurant photographs were fabricated. Distinct-photo verification cannot be performed until the files exist.

The supplied list totals **48**, despite the stated total of **47**. It contains **eight soft drinks**, not seven. All 48 supplied entries were preserved in 11 categories as **hidden, unverified drafts**. No entry was dropped to force the expected count. Candidate source data is outside UI components.

The draft seed ran twice with explicit `ALLOW_UNVERIFIED_SEED=true`. The normal source-verified seed intentionally refuses to import without the actual Word document and a hash-bound reviewed manifest. Automatic interpretation of the missing document's unknown table structure is not implemented; the documented reviewed-manifest workflow requires the actual source and a field-by-field review. Existing records are preserved on seed reruns.

SET C cheese, Мёнгинамуль price, fruit-soju flavors, English menu translations, marketing translations, map coordinates and independent phone verification remain pending. Finlandia and Shiguderi supplied prices remain 180,000 and 150,000 MNT, respectively.

## Executed verification

| Check | Result | Evidence / scope |
| --- | --- | --- |
| `prisma migrate deploy` | **passed** | Initial migration applied to real PostgreSQL; second run reported no pending migrations |
| Draft seed, twice | **passed** | 11 categories, 48 items, 48 seed audit entries; no duplicates |
| Source-verified seed | **failed — missing input** | Default command refused the absent Word document; no source-verified import claimed |
| Every name/price checked against Word | **not run** | Word document missing |
| `npm run build` | **passed** | Production build generated all public/admin routes |
| `npm run typecheck` | **passed** | TypeScript completed without errors |
| `npm run lint` | **passed** | ESLint completed without errors |
| `npm test` | **passed** | Four tests covering transcription count, sensitive ambiguities, role boundaries and input validation |
| Unauthenticated `/admin` access | **passed** | Five admin routes redirected to login |
| VIEWER cannot write | **passed** | Disabled UI, upload HTTP 403, replayed server write rejected; database timestamp unchanged |
| Login and item creation | **passed** | Temporary manager signed in and created an item through the UI |
| Public menu refresh | **passed** | Created item and changed price appeared on the public page; hidden item disappeared |
| Main image upload / replace / remove | **passed** | Real PNG/JPEG uploads converted to unique WEBP URLs; served file checked; reference removal checked |
| Extra images | **passed** | Upload, alt text, database attachment and confirmed removal checked |
| Variants | **passed** | Variant created and visible on public menu |
| Category deactivation | **passed** | Public item disappeared; item record and its own active state remained intact |
| Soft delete and audit | **passed** | Confirmed deletion retained item record and audit entry |
| First-admin CLI and staff creation | **passed** | Env-based CLI created a temporary SUPER_ADMIN; staff UI created a hashed-password VIEWER |
| CSRF missing-token rejection | **passed** | Authenticated upload without token rejected |
| Language routes | **passed** | MN/KO/EN routes and initial HTML language checked |
| Language switch across sections | **passed** | Actual desktop/mobile links checked: headings, footer, menu group labels, map/image pending messages and mobile menu closure |
| Responsive document width | **passed** | No horizontal document overflow at 375, 768 and 1440px for all three languages |
| Dependency audit | **passed** | Installation audit and final production dependency audit reported zero vulnerabilities |
| Production S3 upload | **not run** | No bucket/credentials supplied; production local-storage fallback is intentionally disabled |
| Verified map markers / links | **not run** | No verified coordinates supplied; none rendered |
| Final photography, cropping and logo inspection | **not run** | Real assets missing |
| Full manual accessibility/browser matrix and load testing | **not run** | Automated Chromium/Edge checks only; no claim of exhaustive coverage |

The functional runner's final result was **15 passed, 0 failed**. The separate language-switch check also passed. Temporary test accounts, items, categories, variants and image references were removed. The database was checked afterward: **48 items, 11 categories, zero active items and zero administrators**. Create the real initial administrator with the documented environment-based CLI.

Earlier verification attempts exposed a test locator ambiguity around image controls and asynchronous navigation/removal timing. The extra-image selection control was relabeled, and assertions were corrected to wait for the actual resulting state. A Windows production-build attempt hit a Prisma DLL lock while development was running; stopping the development server resolved it. Final successful runs supersede those intermediate failures.

## Operational limits

Local menu data is unpublished until reviewed. Without the missing source and assets, this is a working application with pending content, not a verified restaurant publication. No real administrator credentials were invented. Production S3 credentials, canonical domain, backups and operating configuration remain environment setup tasks. Image removal detaches references; old objects are retained for deliberate cleanup/recovery. No deployment occurred.

Setup: `README.md`. Staff instructions: `docs/ADMIN_GUIDE.md`. Detailed content status: `docs/CONTENT_STATUS.md`.

## Food menu recheck — 2026-11-23

- Passed: restarted the existing local PostgreSQL cluster after it was found stopped.
- Passed: database records match the supplied prompt transcription for all 48 entries (names, prices, sizes and Mongolian descriptions).
- Passed: all 24 food items and all 6 food categories are active, with no hidden food items. No content or prices were overwritten.
- Passed: `/mn` returned HTTP 200 and included food menu records.
- Pending: Мёнгинамуль price remains null. Word-document verification was not run because the source file is still missing.

## English menu names — 2026-11-23

- Passed: 48 item names and 11 category names translated and saved in PostgreSQL with audit entries, at the user's request.
- Passed: translation script run twice; first run updated 59 records, second run updated zero and preserved 59.
- Passed: all 48 records still match source MN/KO names, prices, sizes and Mongolian descriptions.
- Passed: English public menu shows all 24 food and 24 drink names without pending-name placeholders after View all.
- Passed: TypeScript check and ESLint for changed source files.
- Pending: English descriptions, Word-document verification and previously unresolved source details. No flavors or missing prices invented.

## Menu availability repair

- Cause: local PostgreSQL was stopped; the page previously hid the database error behind an empty/unverified-menu state.
- Added opt-in local PostgreSQL startup for npm dev/start and request-time recovery, with readiness checks and bounded concurrent startup handling.
- Passed: intentionally stopped the isolated cluster, requested MN/EN/KO concurrently, and all three requests recovered and returned menu records.
- Passed: all 48 menu records still match the transcription (including the subsequently requested English names); missing Мёнгинамуль price remains null.
- No seed rerun, menu content overwrite, deployment or remote database changes.

## About detail page

Added `/mn/about`, `/ko/about`, `/en/about` with localized history/experience sections, supplied branch addresses and verified map links. No founding dates, milestones or new brand claims invented: detailed chronology remains pending. Replaced the overlapping editorial inset with a Learn more link; header/footer About links open the dedicated route and language switching preserves it. Shared footer retained. Typecheck and targeted ESLint passed. Local browser checks cover navigation, language switching, sitemap and responsive widths. Not deployed; existing transfer ZIP does not include these changes.


## Dedicated menu page ? 2026-11-24
- Added /mn/menu, /ko/menu, /en/menu; header/footer navigation and language switch retain the menu route. Existing home preview remains.
- Shared server-only PostgreSQL query; full page displays all active items per selected group, category filters, two-column dark editorial cards (one column on narrow phones). No new photos, menu records, prices or unverified descriptions were added. Existing admin item/category/image actions remain connected; layout revalidation covers the new route.
- PASSED: TypeScript check and ESLint for changed TS/TSX files. Headless Edge: all three menu routes return 200; each has 24 foods and 24 drinks; category filtering, active header link, home-to-menu navigation and language switching. No horizontal overflow at 1440/768/390px; two columns at 1440/768, one at 390.
- Initial geometry assertion ran before styles settled; rerun after network idle passed using actual card rectangles.
- NOT RUN this change: production build, admin write/upload regression tests, deployment. Source Word document remains unavailable; no claim of Word validation.


## Three menu photos ? 2026-11-24
- Cropped the user-confirmed pU5A3UQU.jpg poster into galmaegisal.webp, gabrisal.webp and hangjeongsal.webp under public/images/menu. No generated food imagery. Linked to existing matching MN/KO records; verified prices 30,900 / 29,900 / 31,900 MNT. Names and prices already matched and were preserved.
- Import script scripts/import-menu-photos.ts adds audit records and preserves existing image fields. Ran twice: 3 updates, then 0 updates. Both public routes read uncached database content.
- Allowed these exact bundled image URLs in admin validation so later edits can retain them. Upload/replace/remove functionality remains existing admin functionality.
- PASSED: typecheck, targeted ESLint, bundled URL validation and untrusted/path traversal URL rejection; headless Edge image decode and price checks on /mn/menu, /ko/menu, /en/menu and /mn.
- NOT RUN: production build, admin upload regression, deployment. Only local database updated; production requires the bundled files and running the import against its database.
