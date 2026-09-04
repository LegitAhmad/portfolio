import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateRequired, validateOrdering } from "@/lib/validation";

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
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, experience: data || [] });
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

    const roleCheck = validateRequired(body.role_title, "Role Title", 2, 100);
    if (!roleCheck.valid) return NextResponse.json({ error: roleCheck.error }, { status: 400 });

    const companyCheck = validateRequired(body.company_name, "Company Name", 2, 100);
    if (!companyCheck.valid) return NextResponse.json({ error: companyCheck.error }, { status: 400 });

    const timeframeCheck = validateRequired(body.timeframe, "Timeframe", 2, 50);
    if (!timeframeCheck.valid) return NextResponse.json({ error: timeframeCheck.error }, { status: 400 });

    const summaryCheck = validateRequired(body.summary, "Summary", 5, 500);
    if (!summaryCheck.valid) return NextResponse.json({ error: summaryCheck.error }, { status: 400 });

    const orderCheck = validateOrdering(body.sort_order ?? 0);
    if (!orderCheck.valid) return NextResponse.json({ error: orderCheck.error }, { status: 400 });

    const payload = {
      ...(body.id ? { id: body.id } : {}),
      role_title: body.role_title.trim(),
      company_name: body.company_name.trim(),
      location: body.location ? String(body.location).trim() : "Remote",
      timeframe: body.timeframe.trim(),
      is_current: Boolean(body.is_current),
      summary: body.summary.trim(),
      achievements: Array.isArray(body.achievements) ? body.achievements : [],
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      sort_order: Number(body.sort_order ?? 0),
      updated_at: new Date().toISOString(),
    };

    const { data: exp, error } = await supabase
      .from("experience")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, experience: exp });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save experience" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
