import sharp from "sharp";

export const config = {
  api: { bodyParser: false },
};

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_OPTIONS = { maxWidth: 1920, maxHeight: 1920, quality: 80 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_UPLOAD_BYTES) throw new Error("Image must be 10 MB or smaller");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseOptions(header) {
  if (!header) return DEFAULT_OPTIONS;
  try {
    const input = JSON.parse(header);
    return {
      crop: input.crop,
      maxWidth: Number.isFinite(input.maxWidth) ? clamp(Math.round(input.maxWidth), 1, 4096) : DEFAULT_OPTIONS.maxWidth,
      maxHeight: Number.isFinite(input.maxHeight) ? clamp(Math.round(input.maxHeight), 1, 4096) : DEFAULT_OPTIONS.maxHeight,
      quality: Number.isFinite(input.quality) ? clamp(Math.round(input.quality), 1, 100) : DEFAULT_OPTIONS.quality,
    };
  } catch {
    throw new Error("Invalid image-processing options");
  }
}

function cropPixels(crop, width, height) {
  if (!crop) return null;
  const x = clamp(Number(crop.x), 0, 1);
  const y = clamp(Number(crop.y), 0, 1);
  const right = clamp(x + Number(crop.width), 0, 1);
  const bottom = clamp(y + Number(crop.height), 0, 1);
  const leftPx = Math.floor(x * width);
  const topPx = Math.floor(y * height);
  const cropWidth = Math.floor((right - x) * width);
  const cropHeight = Math.floor((bottom - y) * height);
  if (!Number.isFinite(cropWidth) || !Number.isFinite(cropHeight) || cropWidth < 1 || cropHeight < 1) {
    throw new Error("Invalid crop area");
  }
  return { left: leftPx, top: topPx, width: Math.min(cropWidth, width - leftPx), height: Math.min(cropHeight, height - topPx) };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const contentType = request.headers["content-type"]?.split(";")[0]?.toLowerCase();
    if (!ALLOWED_TYPES.has(contentType)) {
      return response.status(415).json({ error: "Only JPG, JPEG, and PNG images are supported" });
    }

    const source = await readBody(request);
    if (!source.length) return response.status(400).json({ error: "Image file is required" });

    const options = parseOptions(request.headers["x-image-options"]);
    const image = sharp(source, { failOn: "error", limitInputPixels: 40_000_000 }).rotate();
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || !["jpeg", "png"].includes(metadata.format)) {
      return response.status(415).json({ error: "Only valid JPG, JPEG, and PNG images are supported" });
    }

    const crop = cropPixels(options.crop, metadata.width, metadata.height);
    let pipeline = image;
    if (crop) pipeline = pipeline.extract(crop);
    const output = await pipeline
      .resize({ width: options.maxWidth, height: options.maxHeight, fit: "inside", withoutEnlargement: true })
      .webp({ quality: options.quality, effort: 4 })
      .toBuffer();

    response.setHeader("Content-Type", "image/webp");
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).send(output);
  } catch (error) {
    console.error("Image processing failed", error);
    return response.status(400).json({ error: error.message || "Could not process image" });
  }
}
