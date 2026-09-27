import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/_actions/admin/helpers";
import { getSession } from "@/utils/session";

const ALLOWED_BUCKETS = new Set(["media", "gallery"]);
const MEMBER_FOLDERS = ["avatars", "covers", "editor", "blogs"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME = [/^image\//, /^audio\//, /^application\/pdf$/];
const SAFE_FOLDER_RE = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const SAFE_EXT_RE = /^[a-z0-9]{1,8}$/;

const fail = (status: number, message: string) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return fail(401, "Unauthorized");
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const bucket = String(form?.get("bucket") ?? "");
  const folder = String(form?.get("folder") ?? "");

  if (!(file instanceof File)) {
    return fail(400, "Missing file");
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return fail(400, `Bucket "${bucket}" is not allowed`);
  }
  if (folder && !SAFE_FOLDER_RE.test(folder)) {
    return fail(400, "Invalid folder");
  }
  if (file.size > MAX_FILE_SIZE) {
    return fail(413, "File too large (max 20MB)");
  }
  if (!ALLOWED_MIME.some((re) => re.test(file.type))) {
    return fail(415, `File type "${file.type || "unknown"}" is not allowed`);
  }

  const isMemberFolder = bucket === "media" && MEMBER_FOLDERS.includes(folder.split("/")[0]);
  if (!isMemberFolder) {
    try {
      await requireAdmin(user);
    } catch {
      return fail(403, "Forbidden");
    }
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = SAFE_EXT_RE.test(rawExt) ? rawExt : "bin";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = folder ? `${folder}/${fileName}` : fileName;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    {
      auth: { persistSession: false }
    }
  );
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });
  if (error) {
    console.error("[upload]", error);
    return fail(500, `Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
