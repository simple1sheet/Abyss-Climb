import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const GradeSystemContext = React.createContext<{
  gradeSystem: string;
  setGradeSystem: (system: string) => void;
  isLoading: boolean;
} | null>(null);

export function GradeSystemProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  const updateGradeSystemMutation = useMutation({
    mutationFn: async (gradeSystem: string) => {
      const response = await fetch('/api/user/grade-system', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeSystem }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update grade system');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/layer-progress'] });
    },
  });

  const setGradeSystem = (system: string) => {
    updateGradeSystemMutation.mutate(system);
  };

  const gradeSystem = userProfile?.preferredGradeSystem || 'V-Scale';

  return React.createElement(
    GradeSystemContext.Provider,
    { value: { gradeSystem, setGradeSystem, isLoading } },
    children
  );
}

export function useGradeSystem() {
  const context = React.useContext(GradeSystemContext);
  if (!context) {
    throw new Error('useGradeSystem must be used within a GradeSystemProvider');
  }
  return context;
}