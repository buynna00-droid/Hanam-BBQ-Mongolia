"use client";
import Image from "next/image";
import { useState } from "react";
export function ImageUpload({
  name = "imageUrl",
  initial = "",
  csrf,
}: {
  name?: string;
  initial?: string | null;
  csrf: string;
}) {
  const [url, setUrl] = useState(initial ?? ""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <label>
        <span>
          {name === "imageUrl" ? "Main image" : "Extra image"} · JPEG / PNG /
          WEBP · max 4 MB
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 4 * 1024 * 1024) {
              setStatus("Use an image up to 4 MB.");
              e.target.value = "";
              return;
            }
            setBusy(true);
            setStatus("Uploading…");
            try {
              const form = new FormData();
              form.set("file", file);
              form.set("csrf", csrf);
              const res = await fetch("/admin/upload", {
                method: "POST",
                body: form,
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Upload failed");
              setUrl(data.url);
              setStatus("Uploaded. Save the form to attach this image.");
            } catch (err) {
              setStatus(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {url && (
        <>
          <Image
            src={url}
            width={180}
            height={130}
            alt="Menu image preview"
            className="upload-preview"
            unoptimized
          />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setStatus(
                name === "imageUrl"
                  ? "Image removed. Save to apply."
                  : "Selection cleared. Use the confirmed removal form to delete a saved extra image.",
              );
            }}
          >
            {name === "imageUrl" ? "Remove image" : "Clear image selection"}
          </button>
        </>
      )}
      <p role="status">{status}</p>
    </div>
  );
}
