import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.SSO_JWT_SECRET || "default_local_sso_jwt_secret_for_development_only_change_in_production_123456"
);

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function encrypt(payload: UserSession, expiresAt: Date) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET);
}

export async function decrypt(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"]
    });
    return payload as UserSession;
  } catch (_err) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mpc_session")?.value;
  if (!sessionCookie) {
    return null;
  }
  return await decrypt(sessionCookie);
}

export async function setSession(session: UserSession) {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const encrypted = await encrypt(session, expiresAt);

  cookieStore.set("mpc_session", encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("mpc_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/"
  });
}
