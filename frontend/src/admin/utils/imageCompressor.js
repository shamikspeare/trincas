import imageCompression from 'browser-image-compression';

/**
 * Compress an image File before upload.
 * @param {File} file - original image file (e.g. from <input type="file">)
 * @param {Object} [opts] - override defaults
 * @returns {Promise<File>} compressed file
 */
export async function compressImage(file, opts = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('compressImage: not an image file');
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    ...opts
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.error('Image compression failed:', err);
    throw err;
  }
}