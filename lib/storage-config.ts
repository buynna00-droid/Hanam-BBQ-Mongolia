// Server configuration only. Never expose the read/write token to a client.
export function blobPublicOrigin(): string | null {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(
    /^vercel_blob_rw_([a-zA-Z0-9]+)_/,
  )?.[1];
  return storeId
    ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com`
    : null;
}
