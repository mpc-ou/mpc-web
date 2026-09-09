import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const issuer = process.env.SSO_ISSUER || "https://auth.mpclub.dev";
  const clientId = process.env.SSO_CLIENT_ID || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/auth/callback`;

  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest().toString("base64url");

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/"
  };

  cookieStore.set("oidc_state", state, cookieOptions);
  cookieStore.set("oidc_code_verifier", codeVerifier, cookieOptions);

  const authorizeUrl = new URL(`${issuer}/authorize`);
  authorizeUrl.searchParams.append("response_type", "code");
  authorizeUrl.searchParams.append("client_id", clientId);
  authorizeUrl.searchParams.append("redirect_uri", redirectUri);
  authorizeUrl.searchParams.append("scope", "openid profile email");
  authorizeUrl.searchParams.append("state", state);
  authorizeUrl.searchParams.append("code_challenge", codeChallenge);
  authorizeUrl.searchParams.append("code_challenge_method", "S256");

  return NextResponse.redirect(authorizeUrl.toString());
}
