/**
 * Image optimization utilities for performance
 */

/**
 * Get optimized image srcset for responsive images
 */
export const getImageSrcSet = (imagePath: string, sizes: number[] = [320, 640, 960, 1280, 1920]) => {
  const extension = imagePath.split('.').pop();
  const basePath = imagePath.replace(`.${extension}`, '');
  
  return sizes.map(size => `${basePath}-${size}w.${extension} ${size}w`).join(', ');
};

/**
 * Get blur data URL for lazy loading placeholder
 */
export const getBlurDataURL = (width: number = 10, height: number = 10) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur">
        <feGaussianBlur stdDeviation="2" />
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)" />
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = (() => {
  let supported: boolean | undefined;
  
  return () => {
    if (supported !== undefined) return supported;
    
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      supported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } else {
      supported = false;
    }
    
    return supported;
  };
})();
