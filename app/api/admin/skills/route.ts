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
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, skills: data || [] });
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

    const nameCheck = validateRequired(body.name, "Skill Name", 1, 50);
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

    const catCheck = validateRequired(body.category_name, "Category", 2, 80);
    if (!catCheck.valid) return NextResponse.json({ error: catCheck.error }, { status: 400 });

    const focusCheck = validateRequired(body.focus, "Focus", 2, 100);
    if (!focusCheck.valid) return NextResponse.json({ error: focusCheck.error }, { status: 400 });

    const contextCheck = validateRequired(body.context, "Context", 2, 200);
    if (!contextCheck.valid) return NextResponse.json({ error: contextCheck.error }, { status: 400 });

    const orderCheck = validateOrdering(body.sort_order ?? 0);
    if (!orderCheck.valid) return NextResponse.json({ error: orderCheck.error }, { status: 400 });

    const payload = {
      ...(body.id ? { id: body.id } : {}),
      name: body.name.trim(),
      category_name: body.category_name.trim(),
      focus: body.focus.trim(),
      context: body.context.trim(),
      sort_order: Number(body.sort_order ?? 0),
    };

    const { data: skill, error } = await supabase
      .from("skills")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, skill });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save skill" },
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

    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
