import { Quest as SchemaQuest } from "@shared/schema";

export interface Quest extends SchemaQuest {
  id: number;
  userId: string;
  title: string;
  description: string;
  layer: number;
  difficulty: string;
  difficultyRating?: number;
  xpReward: number;
  requirements: any;
  status: 'active' | 'completed' | 'failed' | 'discarded';
  progress: number;
  maxProgress: number;
  questType: 'daily' | 'weekly' | 'layer';
  generatedByAi: boolean;
  expiresAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type QuestApiResponse = ApiResponse<Quest[]>;

/**
 * Helper function to ensure quests is always handled as an array
 * Handles cases where quests might be undefined, null, object, or nested in API response
 */
export const toQuestArray = (questData: unknown): Quest[] => {
  // If it's already an array, return as-is
  if (Array.isArray(questData)) {
    return questData as Quest[];
  }
  
  // If it's an API response object with data property
  if (questData && typeof questData === 'object' && 'data' in questData) {
    const apiResponse = questData as ApiResponse<any>;
    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data as Quest[];
    }
  }
  
  // If it's an object but not an array, try to extract values
  if (questData && typeof questData === 'object') {
    const values = Object.values(questData as Record<string, any>);
    if (values.length > 0 && values.every(item => item && typeof item === 'object' && 'id' in item)) {
      return values as Quest[];
    }
  }
  
  // Fallback to empty array
  return [];
};

/**
 * Type guard to check if data is a valid quest
 */
export const isQuest = (item: unknown): item is Quest => {
  return item != null && 
         typeof item === 'object' && 
         'id' in item && 
         'title' in item && 
         'status' in item;
};

/**
 * Filter quests by status
 */
export const filterQuestsByStatus = (quests: unknown, status: Quest['status']): Quest[] => {
  const questArray = toQuestArray(quests);
  return questArray.filter(quest => quest.status === status);
};

/**
 * Filter quests by layer
 */
export const filterQuestsByLayer = (quests: unknown, layer: number): Quest[] => {
  const questArray = toQuestArray(quests);
  return questArray.filter(quest => quest.layer === layer);
};

/**
 * Get active quests for a specific layer
 */
export const getActiveLayerQuests = (quests: unknown, layer: number): Quest[] => {
  const questArray = toQuestArray(quests);
  return questArray.filter(quest => 
    quest.status === 'active' && quest.layer === layer
  );
};