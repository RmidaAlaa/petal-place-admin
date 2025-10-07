import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { getBlurDataURL } from '@/utils/imageOptimization';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading and blur placeholder
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '',
  priority = false,
  loading,
  width,
  height,
  ...props 
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : getBlurDataURL());
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };
    } else {
      setImageLoaded(true);
    }
  }, [src, priority]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={priority ? 'eager' : (loading || 'lazy')}
      decoding="async"
      width={width}
      height={height}
      {...props}
    />
  );
};

export default OptimizedImage;
