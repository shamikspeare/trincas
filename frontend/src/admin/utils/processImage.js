const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png"]);

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

function formatFromMimeType(type) {
  if (!type) return "Unknown";
  if (type === "image/jpeg") return "JPEG";
  if (type === "image/png") return "PNG";
  if (type === "image/webp") return "WEBP";
  const [, subtype = ""] = type.split("/");
  return subtype.toUpperCase() || type;
}

function readResolution(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image resolution"));
    };
    image.src = objectUrl;
  });
}

async function buildImageStats(file) {
  const resolution = await readResolution(file);
  return {
    type: file.type || "",
    format: formatFromMimeType(file.type),
    size: file.size || 0,
    width: resolution.width,
    height: resolution.height,
  };
}

export function getImageProcessingSummary(file) {
  return file?.processingSummary || null;
}

export function formatImageBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}

export function formatImageResolution({ width, height } = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return "Unknown resolution";
  return `${width}×${height}`;
}

export function validateImage(file) {
  if (!(file instanceof File) || !SUPPORTED_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, JPEG, or PNG image");
  }
  if (file.size > 100 * 1024 * 1024) throw new Error("Image must be 100 MB or smaller");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Process an image entirely in the browser using Canvas API.
 * Handles: crop → resize → convert to WebP.
 * No server roundtrip — avoids the 4.5 MB serverless payload limit.
 */
function processInBrowser(file, options = {}) {
  const maxWidth = options.maxWidth ?? 1920;
  const maxHeight = options.maxHeight ?? 1920;
  const quality = (options.quality ?? 80) / 100;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

      // Apply crop (normalised 0–1 values)
      if (options.crop) {
        const crop = options.crop;
        const cx = clamp(Number(crop.x) || 0, 0, 1);
        const cy = clamp(Number(crop.y) || 0, 0, 1);
        const cw = clamp(Number(crop.width) || 1, 0, 1 - cx);
        const ch = clamp(Number(crop.height) || 1, 0, 1 - cy);
        sx = Math.floor(cx * img.naturalWidth);
        sy = Math.floor(cy * img.naturalHeight);
        sw = Math.max(1, Math.floor(cw * img.naturalWidth));
        sh = Math.max(1, Math.floor(ch * img.naturalHeight));
      }

      // Resize to fit within maxWidth × maxHeight (without enlargement)
      let dw = sw;
      let dh = sh;
      if (dw > maxWidth || dh > maxHeight) {
        const scale = Math.min(maxWidth / dw, maxHeight / dh);
        dw = Math.round(dw * scale);
        dh = Math.round(dh * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = dw;
      canvas.height = dh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Browser could not convert image to WebP"));
          const baseName = (file.name || "image").replace(/\.[^/.]+$/, "");
          const processed = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(processed);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load the image for processing"));
    };

    img.src = url;
  });
}

export async function processImage(file, options = {}) {
  validateImage(file);
  const original = await buildImageStats(file);

  const processed = await processInBrowser(file, options);
  const converted = await buildImageStats(processed);

  processed.processingSummary = { original, converted };

  return processed;
}
