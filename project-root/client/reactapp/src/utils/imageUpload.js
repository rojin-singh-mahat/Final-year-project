export async function optimizeProfileImage(file, options = {}) {
  const {
    size = 512,
    quality = 0.82,
    outputType = "image/webp",
  } = options;

  const image = await loadImage(file);

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const cropSize = Math.min(sourceWidth, sourceHeight);
  const cropX = Math.floor((sourceWidth - cropSize) / 2);
  const cropY = Math.floor((sourceHeight - cropSize) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not process image.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    size,
    size
  );

  const preferred = canvas.toDataURL(outputType, quality);
  if (preferred && preferred.startsWith(`data:${outputType}`)) {
    return preferred;
  }

  return canvas.toDataURL("image/jpeg", quality);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file."));
    };

    image.src = objectUrl;
  });
}
