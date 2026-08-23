/**
 * Centralized Client-Side Image Compression Utility
 *
 * Requirements:
 * - Validate file type & size
 * - Never compress PDFs or sensitive documents destructively
 * - Preserves aspect ratio & converts heavy images to optimized WebP/JPEG
 * - Preserves transparency for PNG logos
 * - Returns a standard File object compatible with FormData
 */

export const CompressionPresets = {
  // Aggressive compression for standard photos (profile, gallery, dharamshala)
  PHOTO: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.8,
    maxSizeMB: 1,
  },
  // Higher resolution & quality for verification / identity documents to preserve readability
  DOCUMENT: {
    maxWidth: 2400,
    maxHeight: 2400,
    quality: 0.92,
    maxSizeMB: 5,
  },
  // Avatar / Profile photo thumbnail preset
  AVATAR: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    maxSizeMB: 0.5,
  },
  // Logo / Icon preset (preserves PNG transparency)
  LOGO: {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 0.9,
    maxSizeMB: 1,
  },
};

/**
 * Optimizes an image file before upload.
 * If file is not an image (e.g. PDF), returns the original file untouched.
 *
 * @param {File} file - The file to compress
 * @param {Object} options - Compression preset or custom options
 * @returns {Promise<File>} - Resolves with compressed File or original if compression not applicable
 */
export async function compressImage(file, options = CompressionPresets.PHOTO) {
  if (!file || !(file instanceof File)) {
    return file;
  }

  // Non-image files (e.g., application/pdf) MUST NOT be compressed by canvas
  if (!file.type || !file.type.startsWith("image/")) {
    return file;
  }

  // If image is already very small (e.g., < 150KB), skip canvas to preserve speed
  if (file.size < 150 * 1024) {
    return file;
  }

  // SVG images shouldn't be rasterized via canvas
  if (file.type === "image/svg+xml") {
    return file;
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
  } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve(file); // Fallback to original
          }

          // Maintain smooth bicubic downscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // If PNG and transparent, fill transparently; otherwise white background for JPEG
          const isPng = file.type === "image/png";
          if (!isPng) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Output MIME type: prefer original if PNG (to keep alpha), else webp / jpeg
          const outputType = isPng ? "image/png" : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              // Only use compressed blob if it's actually smaller than the original
              if (blob.size < file.size) {
                const compressedFile = new File([blob], file.name, {
                  type: outputType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            outputType,
            quality
          );
        } catch (err) {
          console.warn("Image compression error, falling back to original file:", err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default compressImage;
