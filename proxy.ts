import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/configs/i18n/routing";
import { updateSession } from "./configs/auth/middleware";

const handleI18nRouting = createMiddleware(routing);

const LOCALE_PREFIX_RE = /^\/(vi|en)(\/|$)/;
const UNLOCALIZED_ROUTES = ["/admin", "/api-docs"];
const FALLBACK_LOCALE = "en";

const isUnlocalizedRoute = (pathname: string) =>
  UNLOCALIZED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnlocalizedRoute(pathname)) {
    return await updateSession(request, NextResponse.next());
  }

  if (!LOCALE_PREFIX_RE.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${FALLBACK_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 308);
  }

  return await updateSession(request, handleI18nRouting(request));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|apple-touch-icon.png|favicon.svg|icons|manifest|sitemap.xml|robots.txt|models).*)"
  ]
};
