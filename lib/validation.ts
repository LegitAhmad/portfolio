/**
 * Validation utilities for Admin CMS.
 * 
 * Rules:
 * - Validate URLs, slugs, required fields, and ordering.
 * - Validate uploaded images: MIME types, maximum file size (5MB), and dimensions.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a URL string (must be valid http, https, or mailto).
 */
export function validateUrl(url: string | null | undefined, required = false): ValidationResult {
  if (!url || !url.trim()) {
    if (required) {
      return { valid: false, error: "URL is required" };
    }
    return { valid: true };
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("mailto:")) {
    const emailPart = trimmed.slice(7);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPart)) {
      return { valid: false, error: "Invalid mailto email address" };
    }
    return { valid: true };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "URL protocol must be http: or https:" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validates a project or resource slug.
 * Format: 2-48 lowercase alphanumeric characters and hyphens. No consecutive or edge hyphens.
 */
export function validateSlug(slug: string | null | undefined): ValidationResult {
  if (!slug || !slug.trim()) {
    return { valid: false, error: "Slug is required" };
  }

  const trimmed = slug.trim();

  if (trimmed.length < 2 || trimmed.length > 48) {
    return { valid: false, error: "Slug must be between 2 and 48 characters" };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return {
      valid: false,
      error: "Slug must be lowercase alphanumeric with single hyphens (e.g. 'my-project')",
    };
  }

  return { valid: true };
}

/**
 * Validates a required text field.
 */
export function validateRequired(
  value: string | null | undefined,
  fieldName: string,
  minLength = 1,
  maxLength = 500
): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validates an integer sort ordering value (>= 0).
 */
export function validateOrdering(order: unknown): ValidationResult {
  const num = Number(order);

  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valid: false, error: "Ordering must be a non-negative integer" };
  }

  return { valid: true };
}

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
export const MAX_IMAGE_DIMENSION_PX = 4096;

/**
 * Validates uploaded image file metadata.
 */
export function validateImageUpload(metadata: {
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}): ValidationResult {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(metadata.mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format. Allowed: PNG, JPEG, WebP, AVIF, SVG`,
    };
  }

  if (metadata.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(metadata.sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit`,
    };
  }

  if (metadata.width && metadata.width > MAX_IMAGE_DIMENSION_PX) {
    return {
      valid: false,
      error: `Image width (${metadata.width}px) exceeds max ${MAX_IMAGE_DIMENSION_PX}px`,
    };
  }

  if (metadata.height && metadata.height > MAX_IMAGE_DIMENSION_PX) {
    return {
      valid: false,
      error: `Image height (${metadata.height}px) exceeds max ${MAX_IMAGE_DIMENSION_PX}px`,
    };
  }

  return { valid: true };
}
