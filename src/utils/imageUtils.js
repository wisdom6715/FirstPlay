/**
 * Image processing utilities for FirstPlay promotional uploads
 */

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and optimize an image file to stay performant and lightweight
 * @param {File} file - Original user image file
 * @param {number} maxWidth - Maximum allowed width (e.g. 400 for logo, 1280 for banner)
 * @param {number} maxHeight - Maximum allowed height (e.g. 400 for logo, 720 for banner)
 * @param {number} quality - JPEG/WebP compression quality (0.1 to 1.0)
 * @returns {Promise<{ blob: Blob, dataUrl: string, width: number, height: number }>}
 */
export async function optimizeImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image.');
  }

  // SVG files do not require raster resizing
  if (file.type === 'image/svg+xml') {
    const dataUrl = await readFileAsDataUrl(file);
    return { blob: file, dataUrl, width: 256, height: 256 };
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({ blob: file, dataUrl: rawDataUrl, width: img.width, height: img.height });
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(outputType, quality);

      canvas.toBlob(
        (blob) => {
          resolve({
            blob: blob || file,
            dataUrl: compressedDataUrl,
            width,
            height
          });
        },
        outputType,
        quality
      );
    };

    img.onerror = (err) => reject(new Error('Failed to load image for processing: ' + err.message));
    img.src = rawDataUrl;
  });
}
