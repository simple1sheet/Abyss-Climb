/**
 * Error handling utilities for the frontend
 */

export interface APIError {
  message: string;
  statusCode?: number;
  data?: any;
}

/**
 * Check if an error is an unauthorized error
 */
export function isUnauthorizedError(error: any): boolean {
  return error?.response?.status === 401 || 
         error?.statusCode === 401 || 
         /^401:.*Unauthorized/.test(error?.message);
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('network') ||
         error?.message?.includes('fetch');
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.response?.status === 400 || 
         error?.statusCode === 400 ||
         error?.message?.includes('validation');
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Format error for display to user
 */
export function formatErrorForDisplay(error: any): {
  title: string;
  message: string;
  variant: 'destructive' | 'default';
} {
  const message = getErrorMessage(error);
  
  if (isUnauthorizedError(error)) {
    return {
      title: 'Authentication Required',
      message: 'You need to log in to access this feature',
      variant: 'destructive'
    };
  }
  
  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive'
    };
  }
  
  if (isValidationError(error)) {
    return {
      title: 'Invalid Input',
      message: message || 'Please check your input and try again',
      variant: 'destructive'
    };
  }
  
  return {
    title: 'Error',
    message: message || 'Something went wrong. Please try again.',
    variant: 'destructive'
  };
}

/**
 * Handle common error scenarios
 */
export function handleCommonErrors(error: any, toast: any) {
  const errorDisplay = formatErrorForDisplay(error);
  
  if (isUnauthorizedError(error)) {
    toast({
      title: errorDisplay.title,
      description: errorDisplay.message,
      variant: errorDisplay.variant,
    });
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/api/login';
    }, 1000);
    
    return;
  }
  
  toast({
    title: errorDisplay.title,
    description: errorDisplay.message,
    variant: errorDisplay.variant,
  });
}

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (isUnauthorizedError(error) || isValidationError(error)) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}