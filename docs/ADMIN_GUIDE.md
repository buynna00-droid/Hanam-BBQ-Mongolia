# Menu administration

Sign in at `/admin/login`. Initial setup uses `npm run admin:create`; there is no registration or shared default password. Sessions expire after eight hours. Five failed/attempted sign-ins per account in a 15-minute window trigger a temporary limit; a shared global limit also applies. Contact a SUPER_ADMIN to reset a password.

## Roles

- **SUPER_ADMIN:** menu and category management, uploads, staff account creation, role changes, password resets and deactivation.
- **MENU_MANAGER:** menu, categories, variants, prices, images and publishing. Cannot manage staff.
- **VIEWER:** view menu and audit data. Server actions and image uploads reject writes, even if a disabled form is bypassed.

## Items

Use **Add item** on the overview. Enter a unique lowercase ASCII slug, the exact Mongolian name and category. Preserve original Mongolian and Korean spellings. Leave unverified translations blank. Enter integer MNT prices; leave missing prices blank rather than entering zero. Size is source text, such as `200 гр`.

Save a draft with **Publish item** unchecked. To publish, verify its source and activate both the item and its category. Use **Featured** to display a featured label. Lower display order numbers appear first. The overview supports name search, category/status filters, 20-item pagination, totals and recently updated records.

Edit a saved item to add separately priced variants and extra images. Each variant has its own translations, price, order and active switch. Do not create fruit-soju flavor variants until verified. SET C cheese remains unconfirmed.

To hide an item, uncheck **Publish item** and save. To delete, type `DELETE` in its delete section. Item deletion is soft: it disappears from normal lists and the public menu, while its database record and audit history remain. Recovery currently requires an authorized database maintenance operation.

## Categories

Create or edit under **Categories**. Set FOOD or DRINKS, names/descriptions, unique slug and display order. Deactivation hides the category and its items publicly without changing or deleting the items. Move one item by changing its category in the item editor. Use **Move all items** to move a category's non-deleted items to another category.

## Images

Only menu images are managed here. The hero, about, charcoal photo and original logo are manually maintained files with no upload controls.

Use a JPEG/JPG, PNG or WEBP up to 4 MB and 40 million pixels. Upload shows a preview; **save the form** to attach the uploaded image. Upload another file and save to replace it. **Remove image** clears the main image after saving. Extra-image removal requires typing `DELETE`. Extra images require Mongolian alt text; enter other alt translations only when verified.

Image bytes are decoded on the server, EXIF orientation applied, metadata stripped, maximum dimensions reduced to 1800 × 1800, and re-encoded as WEBP under a random UUID. Database fields store only URLs. Unsupported files and unauthorized requests are rejected. A removed/replaced object remains in storage; arrange periodic orphan cleanup with a retention window rather than deleting recoverable objects immediately.

For production, connect Vercel Blob as described below, or configure all S3 variables in README.md and restart the app. The public bucket/CDN URL must serve uploaded files and match `S3_PUBLIC_URL`. Production will not write to a temporary local filesystem. Use a dedicated bucket credential with only the permissions needed to write menu objects. Local development uploads go to `public/uploads`.

## Staff and history

SUPER_ADMIN can create staff, change roles, set a new password or deactivate access. Blank password on an existing account keeps its password. Account changes revoke that user's existing sessions. You cannot deactivate or demote your own SUPER_ADMIN account. Staff records are deactivated rather than deleted.

**Audit log** shows the latest 100 actions, actor, UTC time and change details. Menu saves invalidate public paths immediately; public menus are also read from PostgreSQL on each request. Hidden categories, hidden items, deleted items and inactive variants are excluded on the server.

All mutations use server authorization, validated input and origin-bound CSRF tokens. If a form expires, reload it and sign in again if needed. Safe errors intentionally do not expose database details.


### Vercel Blob uploads
Connect a **Public** Vercel Blob store to this project for Production. The integration sets the server-only `BLOB_READ_WRITE_TOKEN`; redeploy after connecting so Next Image permits the exact store hostname. Blob takes priority over S3 when both are configured. No token is sent to the browser. Uploads go under `menu/<uuid>.webp`. Files are validated and optimized before storage; JPEG/PNG/WEBP up to 4 MB only. Save the item after upload to publish the image. Replace/remove detaches the previous database reference; old objects stay available for recovery and can be cleaned up later. Local development still uses public/uploads when no remote storage is configured.
