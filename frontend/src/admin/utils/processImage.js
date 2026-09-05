const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png"]);

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

export function validateImage(file) {
  if (!(file instanceof File) || !SUPPORTED_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, JPEG, or PNG image");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("Image must be 10 MB or smaller");
}

export async function processImage(file, options = {}) {
  validateImage(file);
  const response = await fetch("/api/process-image", {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "X-Image-Options": JSON.stringify(options),
    },
    body: file,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Could not process image");
  }

  const baseName = (file.name || "image").replace(/\.[^/.]+$/, "");
  return new File([await response.blob()], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
}
