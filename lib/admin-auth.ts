// Signed, HttpOnly session cookie for the admin dashboard APIs.
//
// The storefront keeps its user in localStorage (see AuthProvider), which a server
// cannot trust. Signing in as an admin therefore also sets this cookie: the API
// routes verify the signature and re-check the role in `users`, so a forged
// localStorage entry or a demoted account cannot call them.
import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabase } from "./supabase";

export const ADMIN_COOKIE = "zw_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;

type AdminRole = "admin" | "super_admin";

interface SessionPayload {
  uid: number;
  role: AdminRole;
  exp: number;
}

function sessionSecret(): string {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (or SUPABASE_SECRET_KEY) for admin sessions.");
  }
  return secret;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

/** Called by the sign-in route after the password check succeeds. */
export function createAdminSessionToken(user: { id: number; role: string }): string {
  const payload: SessionPayload = {
    uid: Number(user.id),
    role: user.role === "super_admin" ? "super_admin" : "admin",
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function readAdminSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(body));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      !payload ||
      typeof payload.uid !== "number" ||
      typeof payload.exp !== "number" ||
      (payload.role !== "admin" && payload.role !== "super_admin")
    ) {
      return null;
    }
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export interface AdminSession {
  userId: number;
  role: AdminRole;
}

/**
 * Verifies the cookie signature and then re-reads the role from `users`, so
 * revoking admin access takes effect immediately instead of at token expiry.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const store = await cookies();
    const payload = readAdminSessionToken(store.get(ADMIN_COOKIE)?.value);
    if (!payload) return null;

    const { data, error } = await getSupabase()
      .from("users")
      .select("id, role")
      .eq("id", payload.uid)
      .maybeSingle();

    if (error) {
      console.error("[admin-auth] role check failed:", error);
      return null;
    }
    if (!data || (data.role !== "admin" && data.role !== "super_admin")) return null;

    return { userId: Number(data.id), role: data.role as AdminRole };
  } catch (error) {
    console.error("[admin-auth] session check failed:", error);
    return null;
  }
}

/** Returns a 401 response for non-admins, or null when the request may proceed. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (session) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
