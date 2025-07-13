interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingSkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-700 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
      <div className="h-3 bg-gray-600 rounded w-1/2"></div>
      <div className="h-3 bg-gray-600 rounded w-5/6"></div>
    </div>
  );
}

export function LoadingSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeletonCard key={i} />
      ))}
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
        <LoadingSpinner size="lg" />
        <span className="text-lg font-medium">{message}</span>
      </div>
    </div>
  );
}