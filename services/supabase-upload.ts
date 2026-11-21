/**
 * Upload a file through `/api/upload` (SSO session checked server-side, stored with the service role)
 * and return its public URL. Buckets: "media", "gallery".
 * Supports optional upload progress callback (0 -> 100).
 */
export function uploadToStorage(
  file: File,
  bucket: string,
  folder?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("bucket", bucket);
  if (folder) {
    body.append("folder", folder);
  }

  if (typeof XMLHttpRequest !== "undefined") {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const pct = Math.min(99, Math.max(1, Math.round((event.loaded / event.total) * 100)));
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        let json: { url?: string; error?: string } | null = null;
        try {
          json = JSON.parse(xhr.responseText) as { url?: string; error?: string };
        } catch {
          json = null;
        }
        if (xhr.status >= 200 && xhr.status < 300 && json?.url) {
          onProgress?.(100);
          resolve(json.url);
        } else {
          reject(new Error(json?.error ?? `Upload failed (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Lỗi kết nối khi tải tệp lên"));
      };

      xhr.send(body);
    });
  }

  return fetch("/api/upload", { method: "POST", body }).then(async (res) => {
    const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!(res.ok && json?.url)) {
      throw new Error(json?.error ?? `Upload failed (${res.status})`);
    }
    onProgress?.(100);
    return json.url;
  });
}
