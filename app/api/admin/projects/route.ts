import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  validateSlug,
  validateRequired,
  validateUrl,
  validateOrdering,
} from "@/lib/validation";

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
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, projects: data || [] });
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

    // 1. Validation
    const slugCheck = validateSlug(body.slug);
    if (!slugCheck.valid) {
      return NextResponse.json({ error: slugCheck.error }, { status: 400 });
    }

    const titleCheck = validateRequired(body.title, "Title", 2, 100);
    if (!titleCheck.valid) {
      return NextResponse.json({ error: titleCheck.error }, { status: 400 });
    }

    const descCheck = validateRequired(body.short_description, "Description", 5, 500);
    if (!descCheck.valid) {
      return NextResponse.json({ error: descCheck.error }, { status: 400 });
    }

    const demoUrlCheck = validateUrl(body.demo_url);
    if (!demoUrlCheck.valid) {
      return NextResponse.json({ error: `Demo URL: ${demoUrlCheck.error}` }, { status: 400 });
    }

    const githubUrlCheck = validateUrl(body.github_url);
    if (!githubUrlCheck.valid) {
      return NextResponse.json({ error: `GitHub URL: ${githubUrlCheck.error}` }, { status: 400 });
    }

    const orderCheck = validateOrdering(body.sort_order ?? 0);
    if (!orderCheck.valid) {
      return NextResponse.json({ error: orderCheck.error }, { status: 400 });
    }

    // 2. Fetch existing project if editing to protect GitHub stats
    let existingGitHubData: Record<string, unknown> = {};
    if (body.id) {
      const { data: existing } = await supabase
        .from("projects")
        .select("github_repo_id, github_repo_full_name, github_stars, github_forks, github_primary_language, github_topics, github_last_pushed_at, github_synced_at")
        .eq("id", body.id)
        .maybeSingle();

      if (existing) {
        existingGitHubData = existing;
      }
    }

    // 3. Upsert with clean editorial values
    const payload = {
      ...(body.id ? { id: body.id } : {}),
      slug: body.slug.trim(),
      title: body.title.trim(),
      short_description: body.short_description.trim(),
      overview: body.overview ? String(body.overview).trim() : null,
      category: body.category || "Platform",
      featured: Boolean(body.featured),
      visible: Boolean(body.visible),
      status: body.status || "Active",
      thumbnail_url: body.thumbnail_url || null,
      demo_url: body.demo_url ? String(body.demo_url).trim() : null,
      github_url: body.github_url ? String(body.github_url).trim() : null,
      sort_order: Number(body.sort_order ?? 0),
      features: Array.isArray(body.features) ? body.features : [],
      technical_details: Array.isArray(body.technical_details) ? body.technical_details : [],
      challenges_decisions: Array.isArray(body.challenges_decisions) ? body.challenges_decisions : [],
      hero_media: body.hero_media || null,
      updated_at: new Date().toISOString(),
      ...existingGitHubData, // Preserve synchronized GitHub stats
    };

    const { data: project, error } = await supabase
      .from("projects")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err) {
    console.warn("Project upsert error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save project" },
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
    const { id, visible, featured, sort_order } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const updates: Database["public"]["Tables"]["projects"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    if (visible !== undefined) updates.visible = Boolean(visible);
    if (featured !== undefined) updates.featured = Boolean(featured);
    if (sort_order !== undefined) {
      const orderCheck = validateOrdering(sort_order);
      if (!orderCheck.valid) return NextResponse.json({ error: orderCheck.error }, { status: 400 });
      updates.sort_order = Number(sort_order);
    }

    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

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

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
