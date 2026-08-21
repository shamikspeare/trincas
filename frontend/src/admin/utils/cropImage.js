export async function getCroppedImg(image, crop, targetWidth = 1200) {
  if (!image || !crop || !crop.width || !crop.height) {
    throw new Error("Invalid crop area");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropWidthNatural = crop.width * scaleX;
  const cropHeightNatural = crop.height * scaleY;

  const outputWidth = Math.min(targetWidth, cropWidthNatural);
  const outputHeight = outputWidth * (cropHeightNatural / cropWidthNatural);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(outputWidth);
  canvas.height = Math.round(outputHeight);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    cropWidthNatural,
    cropHeightNatural,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}