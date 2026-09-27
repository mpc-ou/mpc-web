import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { _DEFAULT_LOCALE, _LOCALES } from "@/constants/lang";
import { revokeSsoSession } from "@/services/sso";
import { clearSession, getSession } from "@/utils/session";

export async function GET() {
  const session = await getSession();
  if (session) {
    await revokeSsoSession(session.accessToken, session.refreshToken);
  }
  await clearSession();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const saved = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = _LOCALES.includes(saved as (typeof _LOCALES)[number]) ? saved : _DEFAULT_LOCALE;
  return NextResponse.redirect(`${siteUrl}/${locale}/auth`);
}
