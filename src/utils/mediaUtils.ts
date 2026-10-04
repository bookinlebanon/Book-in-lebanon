/**
 * Media processing utilities for photos and videos uploaded from phone studio / gallery or computer.
 */

export interface ProcessedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  sizeFormatted: string;
  isCover?: boolean;
}

/**
 * Format bytes to readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if a URL or data string represents a video
 */
export function isVideoSource(src?: string): boolean {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.startsWith('data:video/') ||
    lower.startsWith('blob:') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.includes('.mp4?') ||
    lower.includes('video/mp4')
  );
}

/**
 * Optimizes and resizes an image file client-side using Canvas.
 * This prevents localStorage quota overflow and speeds up rendering
 * for high-resolution smartphone camera photos.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve) => {
    // If not standard image or if canvas isn't supported, fallback to FileReader
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        resolve(e.target?.result as string || URL.createObjectURL(file));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Reads a video file from phone studio or computer and prepares it for HTML5 playback.
 */
export async function processVideoFile(file: File): Promise<string> {
  // If file is reasonably small (< 8MB), convert to data URL so it persists seamlessly.
  // Otherwise, create an object URL.
  if (file.size <= 8 * 1024 * 1024) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  }

  return URL.createObjectURL(file);
}
