import { test } from "node:test";
import assert from "node:assert/strict";
import { blobPublicOrigin } from "../lib/storage-config";
import { validImageUrl } from "../lib/validation";

test("Blob uploads are restricted to this store and safe menu image keys", () => {
  const previous = process.env.BLOB_READ_WRITE_TOKEN;
  try {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_TestStore_testOnly";
    const origin = "https://teststore.public.blob.vercel-storage.com";
    assert.equal(blobPublicOrigin(), origin);
    assert.equal(validImageUrl(`${origin}/menu/abcdef-1234.webp`), true);
    for (const url of [
      "https://otherstore.public.blob.vercel-storage.com/menu/abc.webp",
      `${origin}.evil.test/menu/abc.webp`,
      `${origin}/menu/../abc.webp`,
      `${origin}/menu/abc.svg`,
      `${origin}/menu/abc.webp?unexpected=1`,
    ])
      assert.equal(validImageUrl(url), false);
    delete process.env.BLOB_READ_WRITE_TOKEN;
    assert.equal(validImageUrl(`${origin}/menu/abc.webp`), false);
  } finally {
    if (previous === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = previous;
  }
});
