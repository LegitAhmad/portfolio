/**
 * Server-only Admin Authentication & Authorization.
 * 
 * Rules:
 * - Uses Supabase Auth and GitHub-backed admin identity.
 * - NO custom password authentication.
 * - Protects admin routes strictly on the server side.
 * - NEVER trusts client-provided admin flags or localStorage.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_COOKIE_NAME = "portfolio_admin_session";

interface AdminSessionResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
}

/**
 * Generates an HMAC-signed admin session token.
 */
export function signAdminToken(userId: string, email: string): string {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.ADMIN_SESSION_SECRET || "admin-dev-secret-key-32chars!";
  const payload = JSON.stringify({
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  });

  const b64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(b64Payload).digest("base64url");

  return `${b64Payload}.${signature}`;
}

/**
 * Verifies an HMAC-signed admin session token.
 */
export function verifyAdminToken(token: string): AdminSessionResult {
  if (!token || !token.includes(".")) {
    return { isAdmin: false };
  }

  const [b64Payload, signature] = token.split(".");
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.ADMIN_SESSION_SECRET || "admin-dev-secret-key-32chars!";

  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(b64Payload).digest("base64url");

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { isAdmin: false };
    }

    const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf-8"));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { isAdmin: false }; // Expired
    }

    return {
      isAdmin: true,
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return { isAdmin: false };
  }
}

/**
 * Server-side admin verification.
 * Checks request headers (Authorization: Bearer <token>) and HTTP-only cookies.
 */
export async function verifyAdminSession(request?: Request): Promise<AdminSessionResult> {
  if (typeof window !== "undefined") {
    throw new Error("verifyAdminSession is server-only.");
  }

  // 1. Check dev bypass flag (strictly for offline local verification if enabled)
  if (process.env.ADMIN_DEV_BYPASS === "true" && process.env.NODE_ENV !== "production") {
    return {
      isAdmin: true,
      userId: "dev-admin",
      email: process.env.ADMIN_EMAIL || "owner@portfolio.local",
    };
  }

  // 2. Check Authorization header
  const authHeader = request?.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // Test token with HMAC session
    const hmacRes = verifyAdminToken(token);
    if (hmacRes.isAdmin) {
      return hmacRes;
    }

    // Verify token with Supabase Auth
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        const isAdminRole = user.app_metadata?.role === "admin";

        const adminEmailConfig = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const userEmail = user.email?.trim().toLowerCase();
        const isEmailMatch = Boolean(adminEmailConfig && userEmail && userEmail === adminEmailConfig);

        const adminGithubConfig = process.env.GITHUB_ADMIN_USERNAME?.trim().toLowerCase();
        const githubUsername = (
          (user.user_metadata?.user_name as string | undefined) ||
          (user.user_metadata?.preferred_username as string | undefined)
        )?.trim().toLowerCase();
        const isGithubMatch = Boolean(adminGithubConfig && githubUsername && githubUsername === adminGithubConfig);

        const noFilterConfigured = !adminEmailConfig && !adminGithubConfig;

        if (isAdminRole || isEmailMatch || isGithubMatch || noFilterConfigured) {
          return {
            isAdmin: true,
            userId: user.id,
            email: user.email,
          };
        }
      }
    }
  }

  // 3. Check Next.js Cookie Store
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const hmacRes = verifyAdminToken(sessionCookie);
      if (hmacRes.isAdmin) {
        return hmacRes;
      }
    }
  } catch {
    // Cookie store might not be available in non-Next context
  }

  return { isAdmin: false };
}
