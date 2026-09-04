import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { validateRequired, validateUrl, validateOrdering } from "@/lib/validation";

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
    .from("links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, links: data || [] });
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

    const titleCheck = validateRequired(body.title, "Title", 1, 50);
    if (!titleCheck.valid) return NextResponse.json({ error: titleCheck.error }, { status: 400 });

    const catCheck = validateRequired(body.category, "Category", 2, 50);
    if (!catCheck.valid) return NextResponse.json({ error: catCheck.error }, { status: 400 });

    const handleCheck = validateRequired(body.handle, "Handle", 1, 50);
    if (!handleCheck.valid) return NextResponse.json({ error: handleCheck.error }, { status: 400 });

    const urlCheck = validateUrl(body.url, true);
    if (!urlCheck.valid) return NextResponse.json({ error: urlCheck.error }, { status: 400 });

    const descCheck = validateRequired(body.description, "Description", 3, 200);
    if (!descCheck.valid) return NextResponse.json({ error: descCheck.error }, { status: 400 });

    const orderCheck = validateOrdering(body.sort_order ?? 0);
    if (!orderCheck.valid) return NextResponse.json({ error: orderCheck.error }, { status: 400 });

    const payload = {
      ...(body.id ? { id: body.id } : {}),
      title: body.title.trim(),
      category: body.category.trim(),
      handle: body.handle.trim(),
      url: body.url.trim(),
      description: body.description.trim(),
      type: body.type || "github",
      verified: Boolean(body.verified ?? true),
      visible: Boolean(body.visible ?? true),
      sort_order: Number(body.sort_order ?? 0),
    };

    const { data: link, error } = await supabase
      .from("links")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, link });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
  }

  try {
    const { id, visible, sort_order, verified } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing link id" }, { status: 400 });
    }

    const updates: Database["public"]["Tables"]["links"]["Update"] = {};
    if (visible !== undefined) updates.visible = Boolean(visible);
    if (verified !== undefined) updates.verified = Boolean(verified);
    if (sort_order !== undefined) {
      const orderCheck = validateOrdering(sort_order);
      if (!orderCheck.valid) return NextResponse.json({ error: orderCheck.error }, { status: 400 });
      updates.sort_order = Number(sort_order);
    }

    const { error } = await supabase.from("links").update(updates).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
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

    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
