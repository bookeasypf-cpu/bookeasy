/**
 * Compress an image before upload. Always resolves (never hangs).
 *
 * Skips compression for:
 *   - small files (<800 KB — already light enough)
 *   - non-canvas-friendly formats like iPhone HEIC, AVIF, RAW
 *     (browser canvas can't decode them, would silently hang)
 *
 * Forces canvas → JPEG @0.7 quality, max dimension 2000 px. A 10s hard
 * timeout guarantees the upload flow never gets stuck on a corrupt or
 * undecodable image — the original File is returned instead.
 *
 * If the original file is HEIC and over 10 MB, the upload will likely
 * be rejected server-side (Vercel Blob limit) — but that's a clear
 * error returned to the user, not an infinite spinner.
 */
export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const isCanvasFriendly = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.type);
    if (!isCanvasFriendly || file.size < 800 * 1024) {
      resolve(file);
      return;
    }

    const timeoutId = setTimeout(() => resolve(file), 10000);
    const done = (blob: Blob) => {
      clearTimeout(timeoutId);
      resolve(blob);
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
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > 2000 || height > 2000) {
            const ratio = Math.min(2000 / width, 2000 / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return done(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => done(blob || file), "image/jpeg", 0.7);
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
 * Detect formats the server rejects (HEIC, AVIF, etc.) so we can warn the
 * user up-front instead of letting the upload silently fail.
 */
export function isUnsupportedImageFormat(file: File): boolean {
  return /image\/(heic|heif|avif|tiff)/i.test(file.type)
    || /\.(heic|heif|avif|tiff?)$/i.test(file.name);
}
