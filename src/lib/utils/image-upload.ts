import imageCompression from "browser-image-compression";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for raw uploads

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export function validateImageFile(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    // 1. Check extension and MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      resolve({
        valid: false,
        error: "Unsupported file format. Please upload JPG, PNG, or WebP.",
      });
      return;
    }

    // 2. Check file size
    if (file.size > MAX_FILE_SIZE) {
      resolve({
        valid: false,
        error: "File is too large. Maximum size allowed is 10MB.",
      });
      return;
    }

    // 3. Read image to check dimensions and verify it's a valid image loadable by browser (checks fake MIME types)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const maxDimension = 4096;
      if (img.width > maxDimension || img.height > maxDimension) {
        resolve({
          valid: false,
          error: `Image dimensions exceed the maximum allowed limit of ${maxDimension}x${maxDimension}px.`,
        });
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: "Invalid image file or corrupted file data.",
      });
    };

    img.src = objectUrl;
  });
}

export async function compressAndConvertToWebp(file: File): Promise<File> {
  const options = {
    maxSizeMB: 2.0, // target max size of 2MB
    maxWidthOrHeight: 2048, // scale down if extremely large
    useWebWorker: true,
    fileType: "image/webp", // Convert to WebP format
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Keep name prefix, but change extension to .webp
    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));
    const newName = `${originalNameWithoutExt || "image"}.webp`;
    
    return new File([compressedBlob], newName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Compression failed, using original file:", error);
    return file;
  }
}

export function generateUniqueFilename(fileName: string): string {
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const extIndex = sanitized.lastIndexOf(".");
  const name = extIndex !== -1 ? sanitized.substring(0, extIndex) : sanitized;
  const ext = extIndex !== -1 ? sanitized.substring(extIndex) : ".webp";
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${name}-${Date.now()}-${uniqueId}${ext}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
