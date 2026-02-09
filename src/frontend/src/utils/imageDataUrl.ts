/**
 * Utility functions for converting image files to Data URLs
 * and validating image uploads for admin photo management.
 */

// Allowed MIME types for image uploads
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Maximum file size: 5MB (to keep embedded data manageable)
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Validates an image file against allowed types and size limits
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please select a PNG, JPG, or WebP image.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`,
    };
  }

  return { valid: true };
}

/**
 * Reads a File object and returns a Data URL string
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File to a Data URL with validation
 */
export async function convertImageToDataUrl(file: File): Promise<{ dataUrl?: string; error?: string }> {
  const validation = validateImageFile(file);
  
  if (!validation.valid) {
    return { error: validation.error };
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    return { dataUrl };
  } catch (error) {
    return { error: 'Failed to process image file' };
  }
}
