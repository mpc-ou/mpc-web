import { NextResponse } from "next/server";
import { revokeSsoSession } from "@/services/sso";
import { clearSession, getSession } from "@/utils/session";

export async function GET() {
  const session = await getSession();
  if (session) {
    await revokeSsoSession(session.accessToken, session.refreshToken);
  }
  await clearSession();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${siteUrl}/auth`);
}
