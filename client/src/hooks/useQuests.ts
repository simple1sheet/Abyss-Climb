import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Quest, toQuestArray, filterQuestsByStatus } from '@/types/quest';
import { apiRequest } from '@/lib/queryClient';
import { handleCommonErrors } from '@/utils/errorUtils';

/**
 * Custom hook for fetching quests with robust error handling
 */
export function useQuests(status?: Quest['status']) {
  const { data: questsResponse, isLoading, error } = useQuery<Quest[]>({
    queryKey: ["/api/quests", ...(status ? [`?status=${status}`] : [])],
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Convert to array with fallback
  const quests = toQuestArray(questsResponse);
  const filteredQuests = status ? filterQuestsByStatus(quests, status) : quests;

  return {
    quests: filteredQuests,
    allQuests: quests,
    isLoading,
    error,
    hasQuests: filteredQuests.length > 0
  };
}

/**
 * Hook for quest mutations with proper error handling
 */
export function useQuestMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateQuest = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/quests/generate', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/daily-count'] });
      toast({
        title: 'Quest Generated',
        description: 'A new quest has been added to your journey!',
        variant: 'default'
      });
    },
    onError: (error) => {
      handleCommonErrors(error, toast);
    }
  });

  const completeQuest = useMutation({
    mutationFn: async (questId: number) => {
      return apiRequest(`/api/quests/${questId}/complete`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/completion-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Quest Completed!',
        description: 'Congratulations! XP has been awarded.',
        variant: 'default'
      });
    },
    onError: (error) => {
      handleCommonErrors(error, toast);
    }
  });

  const discardQuest = useMutation({
    mutationFn: async (questId: number) => {
      return apiRequest(`/api/quests/${questId}/discard`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      toast({
        title: 'Quest Discarded',
        description: 'The quest has been removed from your active list.',
        variant: 'default'
      });
    },
    onError: (error) => {
      handleCommonErrors(error, toast);
    }
  });

  return {
    generateQuest,
    completeQuest,
    discardQuest
  };
}