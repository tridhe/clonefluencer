/**
 * Converts an image URL to a blob using fetch (bypasses CORS issues)
 */
const urlToBlob = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    // If fetch fails, try with a proxy or fallback
    console.warn('Direct fetch failed, trying alternative method:', error);
    throw error;
  }
};

/**
 * Loads an image from URL or blob with proper CORS handling
 */
const loadImageFromSource = (source: string | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      if (typeof source === 'string' && source.startsWith('blob:')) {
        URL.revokeObjectURL(source);
      }
      resolve(img);
    };
    
    img.onerror = () => {
      if (typeof source === 'string' && source.startsWith('blob:')) {
        URL.revokeObjectURL(source);
      }
      reject(new Error('Failed to load image'));
    };

    if (typeof source === 'string') {
      // If it's already a data URL or blob URL, use directly
      if (source.startsWith('data:') || source.startsWith('blob:')) {
        img.src = source;
      } else {
        // For external URLs, try to load with crossOrigin first
        img.crossOrigin = 'anonymous';
        img.src = source;
      }
    } else {
      // Convert blob to object URL
      const objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
};

/**
 * Merges two images side by side using server-side processing to avoid CORS issues
 * @param leftImageUrl - URL of the left image (AI model)
 * @param rightImageUrl - URL of the right image (product)
 * @param targetWidth - Target width for each image (default: 512)
 * @param targetHeight - Target height for each image (default: 512)
 * @returns Promise<string> - Base64 data URL of the merged image
 */
export const mergeImagesSideBySide = async (
  leftImageUrl: string,
  rightImageUrl: string,
  targetWidth: number = 512,
  targetHeight: number = 512
): Promise<string> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/image/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        left_url: leftImageUrl,
        right_url: rightImageUrl,
        target_width: targetWidth,
        target_height: targetHeight
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to merge images');
    }

    return data.merged_image;
    
  } catch (error) {
    console.error('Failed to merge images:', error);
    throw new Error(`Failed to merge images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Downloads an image as a blob for API upload
 * @param imageUrl - URL of the image to download
 * @returns Promise<Blob> - Image blob
 */
export const downloadImageAsBlob = async (imageUrl: string): Promise<Blob> => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.blob();
};

/**
 * Converts a data URL to a Blob
 * @param dataUrl - Base64 data URL
 * @returns Blob
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}; 