import { createClient } from "@/configs/supabase/client";

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Buckets must be created in Supabase Dashboard → Storage → New bucket (Public).
 *
 * Buckets used by this app:
 *   - "media"  : avatars, editor images, gallery
 *
 * @param file   - File to upload
 * @param bucket - Storage bucket name (must exist in Supabase)
 * @param folder - Optional subfolder path (e.g. "avatars", "editor")
 * @returns Public URL string
 */
export async function uploadToStorage(file: File, bucket: string, folder?: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "png";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    if (error.message.includes("Bucket not found")) {
      throw new Error(
        `Bucket "${bucket}" is not found.\n` +
          `Please create bucket "${bucket}" in Supabase Dashboard → Storage → New bucket (Public).`
      );
    }
    if (error.message.includes("row-level security") || error.message.includes("Unauthorized")) {
      throw new Error(
        `No permission to upload to bucket "${bucket}".\n` +
          `Please configure policies in Supabase Dashboard → Storage → Policies → bucket "${bucket}" → add:\n` +
          `  INSERT: auth.role() = 'authenticated'\n` +
          "  SELECT: true"
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
