import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateRequired } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: data || null });
}

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const body = await request.json();

    const nameCheck = validateRequired(body.full_name, "Full Name", 2, 80);
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

    const headlineCheck = validateRequired(body.role_headline, "Headline", 2, 120);
    if (!headlineCheck.valid) return NextResponse.json({ error: headlineCheck.error }, { status: 400 });

    const payload = {
      ...(body.id ? { id: body.id } : {}),
      full_name: body.full_name.trim(),
      role_headline: body.role_headline.trim(),
      location: body.location ? String(body.location).trim() : "Remote",
      avatar_url: body.avatar_url ? String(body.avatar_url).trim() : null,
      bio_paragraphs: Array.isArray(body.bio_paragraphs) ? body.bio_paragraphs : [],
      current_focus: Array.isArray(body.current_focus) ? body.current_focus : [],
      education: Array.isArray(body.education) ? body.education : [],
      interests: Array.isArray(body.interests) ? body.interests : [],
      updated_at: new Date().toISOString(),
    };

    // If existing record exists, update it, otherwise insert
    const { data: existing } = await supabase.from("profile").select("id").limit(1).maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase
        .from("profile")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("profile")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: result.data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
