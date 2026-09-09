import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/configs/prisma/db";

async function runCleanup(request: NextRequest) {
  // 1. Auth check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also check query param secret just in case
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");
    if (querySecret !== cronSecret) {
      return NextResponse.json({ error: { message: "Unauthorized" }, data: null }, { status: 401 });
    }
  }

  // 2. Fetch all temp images created > 24 hours ago
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tempImages = await prisma.image.findMany({
    where: {
      isTemp: true,
      createdAt: {
        lt: oneDayAgo
      }
    }
  });

  if (tempImages.length === 0) {
    return NextResponse.json({
      error: null,
      data: {
        status: 200,
        payload: {
          message: "No temporary images to clean up.",
          deletedCount: 0
        }
      }
    });
  }

  // 3. Initialize supabase admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(supabaseUrl && supabaseServiceKey)) {
    return NextResponse.json(
      { error: { message: "Missing Supabase admin environment variables" }, data: null },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // 4. Delete files from storage and records from database
  const deletedUrls: string[] = [];
  const failedUrls: { url: string; error: string }[] = [];

  for (const img of tempImages) {
    const path = getStoragePathFromUrl(img.url);
    if (path) {
      const { error } = await supabaseAdmin.storage.from("media").remove([path]);
      if (error) {
        failedUrls.push({ url: img.url, error: error.message });
        continue;
      }
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: img.id }
    });
    deletedUrls.push(img.url);
  }

  return NextResponse.json({
    error: null,
    data: {
      status: 200,
      payload: {
        message: `Successfully cleaned up ${deletedUrls.length} temporary images.`,
        deletedCount: deletedUrls.length,
        deletedUrls,
        failedCount: failedUrls.length,
        failedUrls
      }
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    return await runCleanup(request);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message: errorMessage }, data: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await runCleanup(request);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message: errorMessage }, data: null }, { status: 500 });
  }
}

function getStoragePathFromUrl(url: string, bucket = "media"): string | null {
  const prefix = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(prefix);
  if (index !== -1) {
    return url.substring(index + prefix.length);
  }
  return null;
}
