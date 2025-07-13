export function handleCommonErrors(error: unknown, toast: any) {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('401')) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue.',
        variant: 'destructive'
      });
      return;
    }
    
    if (errorMessage.includes('403')) {
      toast({
        title: 'Access Forbidden',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive'
      });
      return;
    }
    
    if (errorMessage.includes('404')) {
      toast({
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        variant: 'destructive'
      });
      return;
    }
    
    if (errorMessage.includes('500')) {
      toast({
        title: 'Server Error',
        description: 'An internal server error occurred. Please try again.',
        variant: 'destructive'
      });
      return;
    }
  }
  
  // Generic error fallback
  toast({
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    variant: 'destructive'
  });
}

export function isUnauthorizedError(error: unknown): boolean {
  return !!(error && typeof error === 'object' && 'message' in error && 
           (error as Error).message.includes('401'));
}