/**
 * Supabase Storage path convention and sanitization utilities.
 * 
 * Rules:
 * - Never trust arbitrary client filenames.
 * - Strip path traversal characters (../, \, /).
 * - Enforce standardized bucket and folder structures.
 */

export const PORTFOLIO_MEDIA_BUCKET = "portfolio-media";

const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "svg",
  "pdf",
]);

/**
 * Sanitizes an untrusted filename, extracting its safe extension and generating
 * a collision-resistant, URL-safe base name.
 */
export function sanitizeFilename(untrustedName: string): {
  safeFilename: string;
  extension: string;
} {
  // Strip null bytes and path separators
  const clean = untrustedName.replace(/\0/g, "").replace(/[\/\\]/g, "");

  const parts = clean.split(".");
  const rawExt = (parts.length > 1 ? parts.pop() : "")?.toLowerCase() || "bin";
  const extension = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : "bin";

  const rawBase = parts
    .join("-")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now();

  const safeFilename = `${rawBase || "file"}_${timestamp}_${randomSuffix}.${extension}`;
  return { safeFilename, extension };
}

/**
 * Generates a storage path for project thumbnail images.
 * Format: projects/<projectSlug>/thumbnail_<timestamp>_<hash>.<ext>
 */
export function getProjectThumbnailPath(
  projectSlug: string,
  originalFilename: string
): string {
  const safeSlug = projectSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const { safeFilename } = sanitizeFilename(originalFilename);
  return `projects/${safeSlug}/thumbnail_${safeFilename}`;
}

/**
 * Generates a storage path for project screenshots.
 * Format: projects/<projectSlug>/screenshots/<timestamp>_<hash>.<ext>
 */
export function getProjectScreenshotPath(
  projectSlug: string,
  originalFilename: string
): string {
  const safeSlug = projectSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const { safeFilename } = sanitizeFilename(originalFilename);
  return `projects/${safeSlug}/screenshots/${safeFilename}`;
}

/**
 * Generates a storage path for profile media (avatar, resume document).
 * Format: profile/<category>_<timestamp>_<hash>.<ext>
 */
export function getProfileMediaPath(
  category: "avatar" | "resume",
  originalFilename: string
): string {
  const { safeFilename } = sanitizeFilename(originalFilename);
  return `profile/${category}_${safeFilename}`;
}

/**
 * Resolves a storage path into a public Supabase CDN URL.
 */
export function getPublicStorageUrl(
  storagePath: string | null | undefined,
  bucket = PORTFOLIO_MEDIA_BUCKET
): string | null {
  if (!storagePath) return null;

  // If already an absolute URL or local path, preserve it
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("/")) {
    return storagePath;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project")) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}
