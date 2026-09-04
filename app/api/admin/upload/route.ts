import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  PORTFOLIO_MEDIA_BUCKET,
  getProjectThumbnailPath,
  getProjectScreenshotPath,
  getProfileMediaPath,
} from "@/lib/storage";
import { validateImageUpload } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return NextResponse.json({ error: "Storage service unavailable" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "thumbnail";
    const slug = (formData.get("slug") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Validate image metadata (MIME type, size <= 5MB)
    const validation = validateImageUpload({
      mimeType: file.type,
      sizeBytes: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Generate safe storage path
    let storagePath: string;
    if (category === "thumbnail") {
      storagePath = getProjectThumbnailPath(slug, file.name);
    } else if (category === "screenshot") {
      storagePath = getProjectScreenshotPath(slug, file.name);
    } else {
      storagePath = getProfileMediaPath("avatar", file.name);
    }

    // 3. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(PORTFOLIO_MEDIA_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(PORTFOLIO_MEDIA_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storagePath,
    });
  } catch (err) {
    console.warn("Upload handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
