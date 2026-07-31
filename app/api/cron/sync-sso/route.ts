import { NextResponse } from "next/server";
import { syncFromSso } from "@/services/sso";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET || process.env.SSO_SERVICE_API_KEY;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncFromSso();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to sync";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
