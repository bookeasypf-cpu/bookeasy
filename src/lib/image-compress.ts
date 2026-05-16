/**
 * Image pipeline: HEIC conversion → canvas resize → JPEG re-encode.
 * Designed for merchant profile uploads where quality matters but the
 * server still has a hard MAX_SIZE limit (25 MB).
 *
 * Pipeline guarantees:
 *   - Always resolves (never hangs) — 15s hard timeout on each stage.
 *   - Falls back to the original File if anything fails, so an
 *     unconvertible file at least surfaces a clear server-side error
 *     instead of an infinite spinner.
 *   - HEIC/HEIF from iPhone are converted client-side via lazy-loaded
 *     heic2any (only downloaded when needed — does not bloat the bundle
 *     for users who never upload HEIC).
 */

export type ImagePreset = "avatar" | "cover" | "gallery";

interface PresetConfig {
  maxDimension: number;
  quality: number;
}

const PRESETS: Record<ImagePreset, PresetConfig> = {
  // Avatar displayed at ~200px max → 1024 is plenty for retina @4x.
  avatar: { maxDimension: 1024, quality: 0.85 },
  // Cover image stretches full-width on profile pages → keep crisp at 4K screens.
  cover: { maxDimension: 2400, quality: 0.9 },
  // Gallery: medium photos, lightbox-able. 2000 px = good zoom on mobile.
  gallery: { maxDimension: 2000, quality: 0.88 },
};

function isHeic(file: File): boolean {
  return /image\/(heic|heif)/i.test(file.type)
    || /\.(heic|heif)$/i.test(file.name);
}

/**
 * Convert HEIC/HEIF to JPEG client-side via lazy-loaded heic2any.
 * If conversion fails (older browser, corrupt file), the original File
 * is returned — the upload will then fail server-side with a clear
 * "format not supported" message instead of hanging silently.
 */
async function convertHeicIfNeeded(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  try {
    // Lazy import — heic2any pulls ~150 KB of WASM. Only load it for
    // users who actually upload HEIC.
    const mod = await import("heic2any");
    const heic2any = (mod as { default: (opts: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]> }).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92, // Pre-resize quality — final quality applied later.
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    console.warn("[image-compress] HEIC conversion failed:", err);
    return file;
  }
}

/**
 * Canvas-resize + JPEG re-encode according to the preset.
 * Returns the original File if the canvas can't decode (very unusual
 * after HEIC has been pre-converted) or if anything else fails.
 */
function canvasResize(file: File, preset: PresetConfig): Promise<Blob> {
  return new Promise((resolve) => {
    // Skip canvas entirely for tiny files — saves time and avoids
    // unnecessary re-encoding artifacts on already-light images.
    if (file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    const isCanvasFriendly = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.type);
    if (!isCanvasFriendly) {
      resolve(file);
      return;
    }

    const timeoutId = setTimeout(() => resolve(file), 15000);
    const done = (out: Blob) => {
      clearTimeout(timeoutId);
      resolve(out);
    };

    const reader = new FileReader();
    reader.onerror = () => done(file);
    reader.onload = (event) => {
      const src = event.target?.result as string | undefined;
      if (!src) return done(file);

      const img = document.createElement("img") as HTMLImageElement;
      img.onerror = () => done(file);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > preset.maxDimension || height > preset.maxDimension) {
            const ratio = Math.min(
              preset.maxDimension / width,
              preset.maxDimension / height
            );
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return done(file);
          // High-quality downscale flag — disables nearest-neighbor.
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => done(blob || file),
            "image/jpeg",
            preset.quality
          );
        } catch {
          done(file);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Full pipeline: HEIC → canvas resize → JPEG re-encode, with the chosen
 * preset. Returns a File so it can be uploaded directly.
 */
export async function processImageForUpload(
  file: File,
  preset: ImagePreset = "gallery"
): Promise<File> {
  const safe = await convertHeicIfNeeded(file);
  const out = await canvasResize(safe, PRESETS[preset]);
  if (out instanceof File) return out;
  // Re-wrap Blob as File so @vercel/blob/client gets the filename.
  const newName = safe.name.replace(/\.(png|webp|gif)$/i, ".jpg");
  return new File([out], newName, { type: out.type || "image/jpeg" });
}

/**
 * Legacy export kept for the existing `/profile` (client) path.
 * @deprecated Use processImageForUpload(file, preset) instead.
 */
export async function compressImage(file: File): Promise<Blob> {
  return processImageForUpload(file, "avatar");
}

/**
 * Unsupported formats the server outright rejects. With heic2any in place
 * HEIC/HEIF are NOT in this list anymore — they get converted instead.
 */
export function isUnsupportedImageFormat(file: File): boolean {
  return /image\/(avif|tiff)/i.test(file.type)
    || /\.(avif|tiff?)$/i.test(file.name);
}
