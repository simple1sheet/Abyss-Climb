import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  sizes?: string;
  width?: number;
  height?: number;
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMyNCAyOCAyOCAyNCAyOCAyMEMyOCAxNiAyNCAxMiAyMCAxMkMxNiAxMiAxMiAxNiAxMiAyMEMxMiAyNCAxNiAyOCAyMCAyOFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+',
  quality = 75,
  priority = false,
  onLoad,
  onError,
  sizes,
  width,
  height
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setCurrentSrc(src);
    onLoad?.();
  }, [src, onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.('Failed to load image');
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    if (!hasError) {
      handleLoad();
    }
  }, [hasError, handleLoad]);

  // Preload the image if priority is true
  React.useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = src;
      img.onload = handleImageLoad;
      img.onerror = handleError;
    }
  }, [src, priority, handleImageLoad, handleError]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError ? 'filter-grayscale' : '',
          className
        )}
        onLoad={priority ? undefined : handleImageLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;