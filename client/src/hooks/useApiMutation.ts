import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { handleCommonErrors } from '@/utils/errorUtils';

interface ApiMutationOptions<TData, TVariables> {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  invalidateQueries?: string[][] | string[];
  successMessage?: string;
  errorMessage?: string;
  optimisticUpdate?: {
    queryKey: string[];
    updater: (variables: TVariables) => (old: any) => any;
  };
}

export function useApiMutation<TData = any, TVariables = any>({
  url,
  method = 'POST',
  onSuccess,
  onError,
  invalidateQueries = [],
  successMessage,
  errorMessage,
  optimisticUpdate
}: ApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return apiRequest(url, {
        method,
        body: variables
      });
    },
    onMutate: async (variables) => {
      // Optimistic update
      if (optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: optimisticUpdate.queryKey });
        
        const previousData = queryClient.getQueryData(optimisticUpdate.queryKey);
        
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          optimisticUpdate.updater(variables)
        );
        
        return { previousData };
      }
    },
    onSuccess: (data, variables) => {
      // Show success message
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        });
      }
      
      // Invalidate queries
      if (Array.isArray(invalidateQueries)) {
        if (invalidateQueries.length > 0 && Array.isArray(invalidateQueries[0])) {
          // Multiple query keys
          (invalidateQueries as string[][]).forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        } else {
          // Single query key
          queryClient.invalidateQueries({ queryKey: invalidateQueries as string[] });
        }
      }
      
      // Call custom success handler
      onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(optimisticUpdate.queryKey, context.previousData);
      }
      
      // Handle error
      if (errorMessage) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        handleCommonErrors(error, toast);
      }
      
      // Call custom error handler
      onError?.(error, variables);
    }
  });
}

/**
 * Specialized hook for creating resources
 */
export function useCreateMutation<TData = any, TVariables = any>(
  url: string,
  options: Omit<ApiMutationOptions<TData, TVariables>, 'method'> = {}
) {
  return useApiMutation({
    ...options,
    url,
    method: 'POST'
  });
}

/**
 * Specialized hook for updating resources
 */
export function useUpdateMutation<TData = any, TVariables = any>(
  url: string,
  options: Omit<ApiMutationOptions<TData, TVariables>, 'method'> = {}
) {
  return useApiMutation({
    ...options,
    url,
    method: 'PATCH'
  });
}

/**
 * Specialized hook for deleting resources
 */
export function useDeleteMutation<TVariables = any>(
  url: string,
  options: Omit<ApiMutationOptions<void, TVariables>, 'method'> = {}
) {
  return useApiMutation({
    ...options,
    url,
    method: 'DELETE'
  });
}