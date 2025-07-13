import { storage } from "../storage";
import { LayerQuest, InsertLayerQuest } from "@shared/schema";

export interface LayerQuestDefinition {
  layer: number;
  title: string;
  description: string;
  xpReward: number;
  checkProgress: (userId: string, currentProgress: number) => Promise<number>;
  maxProgress: number;
}

// Predefined layer quests - one per layer
export const LAYER_QUEST_DEFINITIONS: LayerQuestDefinition[] = [
  {
    layer: 1,
    title: "Edge of the Abyss",
    description: "Send 3 boulder problems graded V2 or higher to prove your readiness for the depths ahead.",
    xpReward: 150,
    maxProgress: 3,
    checkProgress: async (userId: string, currentProgress: number) => {
      // Count completed problems V2 or higher
      const sessions = await storage.getUserClimbingSessions(userId);
      let completedProblems = 0;
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        completedProblems += problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 2
        ).length;
      }
      
      return Math.min(completedProblems, 3);
    }
  },
  {
    layer: 2,
    title: "Forest of Temptation",
    description: "Complete 3 overhang problems in a single session to master the challenging angles ahead.",
    xpReward: 200,
    maxProgress: 1,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        const overhangProblems = problems.filter(p => 
          p.completed && 
          (p.wallAngle === 'overhang' || p.style?.toLowerCase().includes('overhang'))
        );
        
        if (overhangProblems.length >= 3) {
          return 1;
        }
      }
      
      return 0;
    }
  },
  {
    layer: 3,
    title: "Great Fault",
    description: "Send 5 problems graded V4 or higher to prove your technical mastery.",
    xpReward: 300,
    maxProgress: 5,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let completedProblems = 0;
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        completedProblems += problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 4
        ).length;
      }
      
      return Math.min(completedProblems, 5);
    }
  },
  {
    layer: 4,
    title: "Goblets of Giants",
    description: "Complete 10 problems using diverse grip types (crimps, slopers, pinches) to show your adaptability.",
    xpReward: 400,
    maxProgress: 10,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let diverseProblems = 0;
      const usedGripTypes = new Set<string>();
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        problems.filter(p => p.completed && p.holdType).forEach(p => {
          if (p.holdType && ['crimps', 'slopers', 'pinches'].includes(p.holdType.toLowerCase())) {
            usedGripTypes.add(p.holdType.toLowerCase());
            diverseProblems++;
          }
        });
      }
      
      // Only count if at least 2 different grip types were used
      return usedGripTypes.size >= 2 ? Math.min(diverseProblems, 10) : 0;
    }
  },
  {
    layer: 5,
    title: "Sea of Corpses",
    description: "Send 3 problems graded V5 or higher to demonstrate your elite climbing ability.",
    xpReward: 500,
    maxProgress: 3,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let completedProblems = 0;
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        completedProblems += problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 5
        ).length;
      }
      
      return Math.min(completedProblems, 3);
    }
  },
  {
    layer: 6,
    title: "Capital of the Unreturned",
    description: "Complete 15 problems across 3 different sessions to prove your consistency at advanced levels.",
    xpReward: 750,
    maxProgress: 1,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let validSessions = 0;
      let totalProblems = 0;
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        const completedProblems = problems.filter(p => p.completed).length;
        totalProblems += completedProblems;
        
        if (completedProblems >= 1) {
          validSessions++;
        }
      }
      
      return (validSessions >= 3 && totalProblems >= 15) ? 1 : 0;
    }
  },
  {
    layer: 7,
    title: "Final Maelstrom",
    description: "Send 1 problem graded V6 or higher to conquer the ultimate challenge of the Abyss.",
    xpReward: 1000,
    maxProgress: 1,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        const highGradeProblems = problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 6
        );
        
        if (highGradeProblems.length >= 1) {
          return 1;
        }
      }
      
      return 0;
    }
  }
];

export class LayerQuestService {
  async initializeLayerQuest(userId: string, layer: number): Promise<LayerQuest | null> {
    const definition = LAYER_QUEST_DEFINITIONS.find(d => d.layer === layer);
    if (!definition) return null;

    // Check if quest already exists
    const existingQuest = await storage.getLayerQuestByLayer(userId, layer);
    if (existingQuest) return existingQuest;

    // Create new layer quest
    const layerQuest: InsertLayerQuest = {
      userId,
      layer,
      title: definition.title,
      description: definition.description,
      xpReward: definition.xpReward,
      completed: false,
      progress: 0,
      maxProgress: definition.maxProgress,
    };

    return await storage.createLayerQuest(layerQuest);
  }

  async updateLayerQuestProgress(userId: string, layer: number): Promise<LayerQuest | null> {
    const definition = LAYER_QUEST_DEFINITIONS.find(d => d.layer === layer);
    if (!definition) return null;

    const layerQuest = await storage.getLayerQuestByLayer(userId, layer);
    if (!layerQuest || layerQuest.completed) return layerQuest;

    const newProgress = await definition.checkProgress(userId, layerQuest.progress);
    const isCompleted = newProgress >= definition.maxProgress;

    if (newProgress !== layerQuest.progress) {
      return await storage.updateLayerQuest(layerQuest.id, {
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      });
    }

    return layerQuest;
  }

  async completeLayerQuest(userId: string, layer: number): Promise<LayerQuest | null> {
    const layerQuest = await storage.getLayerQuestByLayer(userId, layer);
    if (!layerQuest || layerQuest.completed) return layerQuest;

    // Award XP to user
    const user = await storage.getUser(userId);
    if (user) {
      await storage.upsertUser({
        ...user,
        totalXP: (user.totalXP || 0) + layerQuest.xpReward,
      });
    }

    return await storage.updateLayerQuest(layerQuest.id, {
      completed: true,
      completedAt: new Date(),
    });
  }

  async canProgressToNextLayer(userId: string, currentLayer: number): Promise<{
    canProgress: boolean;
    hasEnoughXP: boolean;
    hasCompletedQuest: boolean;
    nextLayerXP: number;
    currentXP: number;
  }> {
    const layerProgress = await storage.getLayerProgressInfo(userId);
    const layerQuest = await storage.getLayerQuestByLayer(userId, currentLayer);

    const hasEnoughXP = layerProgress.currentXP >= layerProgress.nextLayerXP;
    const hasCompletedQuest = layerQuest?.completed || false;

    return {
      canProgress: hasEnoughXP && hasCompletedQuest,
      hasEnoughXP,
      hasCompletedQuest,
      nextLayerXP: layerProgress.nextLayerXP,
      currentXP: layerProgress.currentXP,
    };
  }

  async progressToNextLayer(userId: string): Promise<{ success: boolean; newLayer: number }> {
    const user = await storage.getUser(userId);
    if (!user) return { success: false, newLayer: 0 };

    const currentLayer = await storage.getLayerProgressInfo(userId);
    const canProgress = await this.canProgressToNextLayer(userId, currentLayer.currentLayer);

    if (!canProgress.canProgress) {
      return { success: false, newLayer: currentLayer.currentLayer };
    }

    const newLayer = Math.min(currentLayer.currentLayer + 1, 7);
    
    // Update user's current layer
    await storage.upsertUser({
      ...user,
      currentLayer: newLayer,
    });

    // Initialize next layer quest if not at max layer
    if (newLayer < 7) {
      await this.initializeLayerQuest(userId, newLayer);
    }

    return { success: true, newLayer };
  }
}

export const layerQuestService = new LayerQuestService();