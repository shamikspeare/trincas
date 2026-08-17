export async function getCroppedImg(imageSrc, pixelCrop, maxSize = 1200) {
  if (!imageSrc || !pixelCrop) {
    throw new Error("No crop data available.");
  }

  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Could not load image for cropping."));
  });

  const cropWidth = Math.max(1, Math.floor(pixelCrop.width));
  const cropHeight = Math.max(1, Math.floor(pixelCrop.height));
  const outputWidth = Math.min(cropWidth, maxSize);
  const outputHeight = Math.min(cropHeight, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser does not support canvas cropping.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    Math.max(0, pixelCrop.x),
    Math.max(0, pixelCrop.y),
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not generate cropped image."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

export default getCroppedImg;
