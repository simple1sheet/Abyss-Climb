import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-abyss-amber/30 border-t-abyss-amber",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className={cn(
          "text-abyss-ethereal/70",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingCard({ 
  title = "Loading...", 
  className 
}: { 
  title?: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 rounded-lg p-6 text-center",
      className
    )}>
      <LoadingSpinner size="md" text={title} />
    </div>
  );
}