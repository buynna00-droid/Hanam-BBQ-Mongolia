# Missing source and reviewed import

Place the actual source at `Hanam_BBQ_Mongolia_Menu.docx` here. It was absent when the project was built. No automated reader or person has verified it in this workspace.

The source's table layout is unknown, so the importer intentionally does not guess which cell means a price, item, description or variant. A reviewer must transcribe **all** document entries to `menu.verified.json`, compare every field against the Word document, and attach its SHA-256 digest. Keep this reviewed manifest beside the original source for provenance. Do not merely rename the unverified prompt transcription.

Manifest structure:

```json
{
  "sourceSha256": "64-character lowercase SHA-256 digest of the actual docx bytes",
  "reviewedBy": "Reviewer name",
  "categories": [
    {
      "slug": "unique-category-slug",
      "nameMn": "Exact source name",
      "nameKo": null,
      "nameEn": null,
      "group": "FOOD",
      "items": [
        {
          "slug": "unique-item-slug",
          "nameMn": "Exact source name",
          "nameKo": null,
          "nameEn": null,
          "price": null,
          "size": null,
          "descriptionMn": null
        }
      ]
    }
  ]
}
```

The example names are schema illustrations, not restaurant content. Use integer MNT prices or null. Preserve spelling, count every entry, and leave uncertain translations null. Use `DRINKS` for drink categories. Reuse candidate slugs when referring to the same existing draft item; update existing draft content through the admin, since seed never overwrites edits.

Compute the hash with `Get-FileHash -Algorithm SHA256 docs/source/Hanam_BBQ_Mongolia_Menu.docx` and lowercase the result. `npm run db:seed` requires the source file and matching reviewed manifest; it inserts new rows hidden and records provenance. It does not itself certify the reviewer’s transcription. A changed Word file invalidates the hash and requires a fresh review.
