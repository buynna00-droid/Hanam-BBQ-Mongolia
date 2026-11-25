import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { put } from "@vercel/blob";
import { blobPublicOrigin } from "@/lib/storage-config";
import { currentUser, verifyCsrf } from "@/lib/auth";
import { canWrite } from "@/lib/validation";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(req.headers.get("content-length") ?? 0) > 4.25 * 1024 * 1024)
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  try {
    const form = await req.formData();
    await verifyCsrf(form);
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 4 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !/\.(jpe?g|png|webp)$/i.test(file.name)
    )
      return NextResponse.json(
        { error: "Use a JPEG, PNG, or WEBP up to 4 MB." },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const decoder = sharp(bytes, {
      limitInputPixels: 40000000,
      animated: false,
    });
    const meta = await decoder.metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 1
    )
      throw new Error();
    const optimized = await decoder
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const key = `${randomUUID()}.webp`;
    let url: string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      if (!blobPublicOrigin()) throw new Error("Invalid Blob configuration");
      const blob = await put(`menu/${key}`, optimized, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 31536000,
      });
      url = blob.url;
    } else if (process.env.S3_BUCKET) {
      const client = new S3Client({
        region: process.env.S3_REGION ?? "auto",
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
      if (!process.env.S3_PUBLIC_URL) throw new Error();
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: optimized,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      url = process.env.S3_PUBLIC_URL.replace(/\/$/, "") + "/" + key;
    } else {
      if (process.env.NODE_ENV === "production")
        return NextResponse.json(
          { error: "Persistent image storage is not configured." },
          { status: 503 },
        );
      const directory = path.join(process.cwd(), "public", "uploads");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, key), optimized, { flag: "wx" });
      url = "/uploads/" + key;
    }
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "UPLOAD",
        entity: "Storage",
        entityId: key,
        details: { url },
      },
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      {
        error:
          "Image upload failed. Check file format and storage configuration.",
      },
      { status: 400 },
    );
  }
}
