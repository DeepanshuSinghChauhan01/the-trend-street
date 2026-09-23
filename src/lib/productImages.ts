import { ProductImage } from '../types/index.js';

/**
 * Resolves which images to show for a given selected color:
 * 1. That color's own images, if any exist.
 * 2. Otherwise the product's fallback images (color-less — this is how every
 *    pre-existing product's images are stored, so this is the path they
 *    always take).
 * 3. Otherwise whatever images exist at all, as a last resort.
 */
export function getGalleryImages(images: ProductImage[], selectedColor: string): ProductImage[] {
  const colorImages = images.filter(img => img.color === selectedColor);
  if (colorImages.length > 0) return colorImages;

  const fallbackImages = images.filter(img => !img.color);
  if (fallbackImages.length > 0) return fallbackImages;

  return images;
}
