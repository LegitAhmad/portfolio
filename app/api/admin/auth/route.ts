import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminSession,
  signAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  return NextResponse.json({
    isAdmin: session.isAdmin,
    email: session.email || null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    const supabase = getSupabaseServerClient(true);
    let verifiedEmail = email;
    let verifiedUserId = "admin-user";

    if (token && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Invalid Supabase authentication token" }, { status: 401 });
      }

      const isAdminRole = user.app_metadata?.role === "admin";
      const isEmailMatch = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
      const isGithubMatch =
        process.env.GITHUB_ADMIN_USERNAME &&
        user.user_metadata?.user_name === process.env.GITHUB_ADMIN_USERNAME;

      if (!isAdminRole && !isEmailMatch && !isGithubMatch) {
        return NextResponse.json({ error: "User is not authorized as portfolio administrator" }, { status: 403 });
      }

      verifiedEmail = user.email || email;
      verifiedUserId = user.id;
    } else if (process.env.ADMIN_DEV_BYPASS === "true" && process.env.NODE_ENV !== "production") {
      verifiedEmail = email || process.env.ADMIN_EMAIL || "owner@portfolio.local";
      verifiedUserId = "dev-admin-id";
    } else {
      return NextResponse.json({ error: "Authentication credentials required" }, { status: 401 });
    }

    const sessionToken = signAdminToken(verifiedUserId, verifiedEmail);
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      email: verifiedEmail,
    });
  } catch (err) {
    console.warn("Error in admin auth POST handler:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
