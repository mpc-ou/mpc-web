/**
 * Upload a file through `/api/upload` (SSO session checked server-side, stored with the service role)
 * and return its public URL. Buckets: "media", "gallery".
 */
export async function uploadToStorage(file: File, bucket: string, folder?: string): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("bucket", bucket);
  if (folder) {
    body.append("folder", folder);
  }

  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!(res.ok && json?.url)) {
    throw new Error(json?.error ?? `Upload failed (${res.status})`);
  }
  return json.url;
}
