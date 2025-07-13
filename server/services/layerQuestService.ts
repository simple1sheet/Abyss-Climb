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
    description: "Send 8 problems V4+ using all 4 grip types (crimps, jugs, slopers, pinches) to prove your technical mastery.",
    xpReward: 600,
    maxProgress: 8,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let validProblems = 0;
      const usedGripTypes = new Set<string>();
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        problems.filter(p => 
          p.completed && 
          p.holdType &&
          storage.getGradeNumericValue(p.grade) >= 4
        ).forEach(p => {
          if (p.holdType && ['crimps', 'jugs', 'slopers', 'pinches'].includes(p.holdType.toLowerCase())) {
            usedGripTypes.add(p.holdType.toLowerCase());
            validProblems++;
          }
        });
      }
      
      // Must use all 4 grip types and complete 8 problems
      return usedGripTypes.size >= 4 ? Math.min(validProblems, 8) : 0;
    }
  },
  {
    layer: 5,
    title: "Sea of Corpses",
    description: "Send 5 problems V5+ including at least 2 overhangs and 2 technical problems in different sessions.",
    xpReward: 800,
    maxProgress: 5,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let totalProblems = 0;
      let overhangCount = 0;
      let technicalCount = 0;
      const sessionsWithProblems = new Set<number>();
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        const validProblems = problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 5
        );
        
        if (validProblems.length > 0) {
          sessionsWithProblems.add(session.id);
          totalProblems += validProblems.length;
          
          overhangCount += validProblems.filter(p => 
            p.wallAngle === 'overhang' || p.style?.toLowerCase().includes('overhang')
          ).length;
          
          technicalCount += validProblems.filter(p => 
            p.style?.toLowerCase().includes('technical') || 
            p.style?.toLowerCase().includes('balance') ||
            p.style?.toLowerCase().includes('coordination')
          ).length;
        }
      }
      
      // Must have at least 2 sessions, 2 overhangs, 2 technical, and 5 total problems
      return (sessionsWithProblems.size >= 2 && overhangCount >= 2 && technicalCount >= 2) 
        ? Math.min(totalProblems, 5) : 0;
    }
  },
  {
    layer: 6,
    title: "Capital of the Unreturned",
    description: "Send 25 problems V4+ across 5 sessions including 10 different styles and 3 outdoor problems.",
    xpReward: 1200,
    maxProgress: 25,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let totalProblems = 0;
      let outdoorProblems = 0;
      const usedStyles = new Set<string>();
      const validSessions = new Set<number>();
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        const validProblems = problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 4
        );
        
        if (validProblems.length > 0) {
          validSessions.add(session.id);
          totalProblems += validProblems.length;
          
          // Count outdoor problems
          if (session.sessionType === 'outdoor') {
            outdoorProblems += validProblems.length;
          }
          
          // Track unique styles
          validProblems.forEach(p => {
            if (p.style) {
              p.style.split(',').forEach(style => {
                usedStyles.add(style.trim().toLowerCase());
              });
            }
          });
        }
      }
      
      // Must have 5 sessions, 10 styles, 3 outdoor problems, and 25 total problems
      return (validSessions.size >= 5 && usedStyles.size >= 10 && outdoorProblems >= 3) 
        ? Math.min(totalProblems, 25) : 0;
    }
  },
  {
    layer: 7,
    title: "Final Maelstrom",
    description: "Send 3 problems V6+ including 1 V7+ overhang and complete a perfect session (5+ problems, no failures).",
    xpReward: 1500,
    maxProgress: 3,
    checkProgress: async (userId: string, currentProgress: number) => {
      const sessions = await storage.getUserClimbingSessions(userId);
      let v6PlusProblems = 0;
      let v7PlusOverhang = false;
      let hasPerfectSession = false;
      
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        
        // Check for V6+ problems
        const v6Plus = problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 6
        );
        v6PlusProblems += v6Plus.length;
        
        // Check for V7+ overhang
        const v7PlusOverhangs = problems.filter(p => 
          p.completed && 
          storage.getGradeNumericValue(p.grade) >= 7 &&
          (p.wallAngle === 'overhang' || p.style?.toLowerCase().includes('overhang'))
        );
        if (v7PlusOverhangs.length > 0) {
          v7PlusOverhang = true;
        }
        
        // Check for perfect session (5+ completed, no failures)
        const completedProblems = problems.filter(p => p.completed);
        const failedProblems = problems.filter(p => !p.completed && p.attempts > 0);
        if (completedProblems.length >= 5 && failedProblems.length === 0) {
          hasPerfectSession = true;
        }
      }
      
      // Must have 3 V6+ problems, 1 V7+ overhang, and 1 perfect session
      return (v6PlusProblems >= 3 && v7PlusOverhang && hasPerfectSession) 
        ? 3 : Math.min(v6PlusProblems, 3);
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