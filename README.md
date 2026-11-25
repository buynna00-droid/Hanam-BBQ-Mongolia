# Hanam BBQ Mongolia

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL and Prisma. Public pages: `/mn`, `/ko`, `/en`. Protected menu management: `/admin`. No deployment, ordering, reservations, payment or customer accounts.

## Local setup

Use Node.js 22+ and PostgreSQL 16+. Run `npm ci`, copy `.env.example` to `.env`, and set `DATABASE_URL`, a random `SESSION_SECRET` of at least 32 characters, and `SITE_URL` (the exact browser origin, without a trailing slash). Never commit `.env`.

```sh
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

The initial admin command reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (12–72 characters) from the environment / `.env`. It creates a SUPER_ADMIN and refuses to overwrite an existing account. Remove the password from your environment after creation. No default admin credentials exist.

For this workspace, existing PostgreSQL 18 binaries were reused to initialize an isolated cluster at `.local/postgres`, listening only on `127.0.0.1:55439`. Random local database credentials and a session secret are in the ignored `.env`. The pre-existing PostgreSQL service was not modified. Restart the isolated cluster, if needed, with:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D "$PWD\.local\postgres" -l "$PWD\.local\postgres.log" -o '-p 55439 -h 127.0.0.1' start
```

## Source menu and seed

**The Word source was not supplied.** `npm run db:seed` deliberately refuses a source-verified import without `docs/source/Hanam_BBQ_Mongolia_Menu.docx` and a reviewed `docs/source/menu.verified.json`. See [source instructions](docs/source/README.md).

The supplied prompt contains **48 entries, not 47**, including eight soft drinks. All are preserved in `prisma/menu-candidates.ts` as unverified transcription, with no guessed English translations or soju flavors. To import these as hidden drafts in development:

```powershell
$env:ALLOW_UNVERIFIED_SEED='true'
npm run db:seed
Remove-Item Env:ALLOW_UNVERIFIED_SEED
```

Seeds are idempotent and do not overwrite existing edits or restore deleted items. Categories and items are initially hidden. Verify against the document before publishing both the category and its items. Source changes to existing items must be reviewed and entered through the admin.

## Assets

The supplied original PNG logo is installed at `public/images/logo/hanam-bbq-logo.png`, without cropping or stretching. Replace that static file manually when needed. Place three different photos at:

- `public/images/hero/hero-bbq.jpg`
- `public/images/about/about-grilling.jpg`
- `public/images/special/charcoal-grilling.jpg`

The supplied 1555 × 1012 food photograph is installed as the hero, the 2000 × 1333 grilling photograph in About, and the 1154 × 1440 grilled-meat photograph in Special. Original PNGs are retained beside the web JPEGs. All three sections use different supplied photographs. The site checks existence before rendering and displays labeled placeholders if files are removed. Static brand assets have no admin upload controls. Noto Sans, Noto Serif, and Noto Sans KR are self-hosted through Fontsource for Cyrillic and Hangul support.

## Storage and environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random CSRF signing secret, at least 32 characters |
| `SITE_URL` | Canonical origin, e.g. `http://localhost:3000`; used by CSRF and SEO |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin CLI only |
| `S3_ENDPOINT`, `S3_REGION` | S3-compatible endpoint and region (`auto` for R2) |
| `S3_BUCKET` | Persistent image bucket |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Server-only bucket credentials |
| `S3_PUBLIC_URL` | Public HTTPS bucket/CDN prefix; restart after changing |
| `ALLOW_UNVERIFIED_SEED` | Explicit opt-in for hidden, unverified prompt drafts |

Development uploads use ignored `public/uploads/`. Production uploads require Vercel Blob or the S3 variables and fail closed without either. Configure a private write credential and public read access through your CDN. Uploaded files are decoded, resized, stripped of metadata and re-encoded as uniquely named WEBP files. Requests are limited to 4 MB image files to stay within the Vercel server upload limit. Removing an image detaches its database reference; objects remain for deliberate storage cleanup and recovery.

## Validation and build

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

On Windows, stop `npm run dev` before building so Prisma can regenerate its native engine without a DLL lock.

`npm run verify` runs functional Chromium/Edge checks against a running development server at `SITE_URL`. It requires Microsoft Edge, uses temporary random staff accounts and fixture items, cleans database fixtures afterward, and writes results to `.local/verification.json`. Run only on an isolated development database with the 48 draft entries. No credentials are printed. Production S3 checks need a configured test bucket and are separate.

`node --env-file=.env --import tsx scripts/verify-language.ts` additionally clicks the actual desktop/mobile language controls and checks all section headings, footer labels, menu group labels and pending-image/map messages.

See `REPORT.md` for executed checks and limitations, `docs/ADMIN_GUIDE.md` for staff instructions, and `docs/CONTENT_STATUS.md` for pending content. No deployment has been performed.

## English menu names

English names for the 48 supplied items and 11 categories are maintained in `prisma/menu-english.ts` and used for new seed records. To fill missing English names in an existing database, run `node --env-file=.env --import tsx scripts/translate-menu-english.ts`. This audited, idempotent script preserves existing English edits and verifies the MN/KO source names before updating. Public routes query Prisma on each request (`force-dynamic`), so the next page load reflects the changes. English descriptions remain pending.

## Local database availability

This workspace opts in to `LOCAL_POSTGRES_AUTOSTART=true` in its ignored `.env`. `npm run dev` and `npm start` run a readiness check first. Public menu requests also recover a stopped local database and wait for PostgreSQL to accept queries. Concurrent requests share startup work; separate workers tolerate another worker starting the same cluster.

Recovery is restricted to Windows, the existing `.local/postgres` cluster, PostgreSQL 18 binaries and DATABASE_URL host `127.0.0.1:55439`. It never initializes, reseeds or republishes data, and does not start remote databases. When recovery cannot succeed, the page reports temporary menu unavailability rather than claiming the menu awaits verification.

This is local development recovery, not 24/7 hosting. A powered-off computer cannot serve the website. Production requires an always-running host and PostgreSQL service/managed database; nothing has been deployed.


### Vercel Blob uploads
Connect a **Public** Vercel Blob store to this project for Production. The integration sets the server-only `BLOB_READ_WRITE_TOKEN`; redeploy after connecting so Next Image permits the exact store hostname. Blob takes priority over S3 when both are configured. No token is sent to the browser. Uploads go under `menu/<uuid>.webp`. Files are validated and optimized before storage; JPEG/PNG/WEBP up to 4 MB only. Save the item after upload to publish the image. Replace/remove detaches the previous database reference; old objects stay available for recovery and can be cleaned up later. Local development still uses public/uploads when no remote storage is configured.
