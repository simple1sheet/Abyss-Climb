import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for optimistic updates with rollback capability
 */
export function useOptimisticUpdate<T>(queryKey: string[], initialData: T) {
  const queryClient = useQueryClient();
  const [optimisticData, setOptimisticData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateOptimistically = useCallback(async (
    updater: (current: T) => T,
    mutationFn: () => Promise<T>
  ) => {
    // Store the current state for rollback
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    try {
      // Apply optimistic update
      const newData = updater(optimisticData);
      setOptimisticData(newData);
      setIsOptimistic(true);
      
      // Update the query cache optimistically
      queryClient.setQueryData(queryKey, newData);
      
      // Perform the actual mutation
      const result = await mutationFn();
      
      // Update with real data
      setOptimisticData(result);
      setIsOptimistic(false);
      queryClient.setQueryData(queryKey, result);
      
      return result;
    } catch (error) {
      // Rollback on error
      setOptimisticData(previousData || initialData);
      setIsOptimistic(false);
      queryClient.setQueryData(queryKey, previousData);
      throw error;
    }
  }, [queryClient, queryKey, optimisticData, initialData]);

  const resetOptimistic = useCallback(() => {
    setIsOptimistic(false);
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    data: optimisticData,
    isOptimistic,
    updateOptimistically,
    resetOptimistic
  };
}