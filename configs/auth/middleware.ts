import { type NextRequest, NextResponse } from "next/server";
import { _LOCALES } from "@/constants/lang";
import { _ROUTE_AUTH, _ROUTE_PRIVATES } from "@/constants/route";
import { refreshAccessToken } from "@/services/sso";
import { decrypt, encrypt } from "@/utils/session";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const sessionCookie = request.cookies.get("mpc_session")?.value;
  let session = sessionCookie ? await decrypt(sessionCookie) : null;

  const privateGroup: string[] = _LOCALES.flatMap((locale) => _ROUTE_PRIVATES.map((route) => `/${locale}${route}`));
  const authGroup: string[] = _LOCALES.map((locale) => `/${locale}${_ROUTE_AUTH}`);

  if (session && session.expiresAt <= Date.now()) {
    try {
      const tokenRes = await refreshAccessToken(session.refreshToken);
      const { access_token, refresh_token, expires_in } = tokenRes;

      session.accessToken = access_token;
      session.refreshToken = refresh_token;
      session.expiresAt = Date.now() + expires_in * 1000;

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const newCookieValue = await encrypt(session, expiresAt);

      request.cookies.set("mpc_session", newCookieValue);
      response.cookies.set("mpc_session", newCookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/"
      });
    } catch (err) {
      console.error("Session refresh failed in middleware:", err);
      session = null;
      response.cookies.set("mpc_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/"
      });
    }
  }

  if (!session && privateGroup.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = _ROUTE_AUTH;
    return NextResponse.redirect(url);
  }

  if (session && authGroup.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
