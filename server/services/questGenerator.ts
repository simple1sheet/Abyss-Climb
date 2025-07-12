import { storage } from "../storage";
import { generateQuest } from "./openai";
import { type InsertQuest } from "@shared/schema";

export class QuestGenerator {
  private readonly LAYER_CONFIGS = {
    1: { name: "Edge of the Abyss", grades: ["V0", "V1", "V2"], maxQuests: 3 },
    2: { name: "Forest of Temptation", grades: ["V3", "V4", "V5"], maxQuests: 4 },
    3: { name: "Great Fault", grades: ["V6", "V7", "V8"], maxQuests: 5 },
    4: { name: "Goblets of Giants", grades: ["V9", "V10", "V11"], maxQuests: 6 },
    5: { name: "Sea of Corpses", grades: ["V12", "V13", "V14"], maxQuests: 7 },
    6: { name: "Capital of the Unreturned", grades: ["V15", "V16", "V17"], maxQuests: 8 },
    7: { name: "Final Maelstrom", grades: ["V18+"], maxQuests: 10 },
  };

  async generateQuestForUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const activeQuests = await storage.getUserQuests(userId, "active");
    const layerConfig = this.LAYER_CONFIGS[user.currentLayer as keyof typeof this.LAYER_CONFIGS];
    
    // Don't generate more quests if user has max active quests for their layer
    if (activeQuests.length >= layerConfig.maxQuests) {
      return;
    }

    // Get user skills to determine quest type
    const userSkills = await storage.getUserSkills(userId);
    const hasSkillQuest = activeQuests.some(q => q.questType === "daily");
    
    try {
      let questData;
      let questType = "weekly";
      
      // 70% chance to generate a daily skill-focused quest if user doesn't have one
      if (!hasSkillQuest && userSkills.length > 0 && Math.random() < 0.7) {
        questData = await this.generateDailySkillQuest(user, userSkills);
        questType = "daily";
      } else {
        // Generate regular quest
        const recentSessions = await storage.getUserClimbingSessions(userId, 5);
        const recentGrades: string[] = [];
        
        for (const session of recentSessions) {
          const problems = await storage.getBoulderProblemsForSession(session.id);
          recentGrades.push(...problems.map(p => p.grade));
        }

        questData = await generateQuest(
          user.currentLayer || 1,
          user.whistleLevel || 1,
          "mixed",
          recentGrades.slice(0, 10)
        );
      }

      const quest: InsertQuest = {
        userId,
        title: questData.title,
        description: questData.description,
        layer: user.currentLayer || 1,
        difficulty: questData.difficulty,
        xpReward: questData.xpReward,
        requirements: questData.requirements,
        maxProgress: questData.requirements.count || 1,
        questType,
        expiresAt: new Date(Date.now() + (questType === "daily" ? 24 : 7 * 24) * 60 * 60 * 1000),
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("Failed to generate quest:", error);
      await this.generateFallbackQuest(userId, user.currentLayer || 1);
    }
  }

  private async generateDailySkillQuest(user: any, userSkills: any[]): Promise<any> {
    const weakestSkill = userSkills.sort((a, b) => a.level - b.level)[0];
    const layerConfig = this.LAYER_CONFIGS[user.currentLayer as keyof typeof this.LAYER_CONFIGS];
    
    const skillQuests = {
      crimps: {
        title: "Crimson Grip Challenge",
        description: "Master the art of crimping in the depths of the Abyss. Even the smallest holds can be conquered with proper technique.",
        requirements: { skillType: "crimps", count: 3, grade: layerConfig.grades[0] }
      },
      dynos: {
        title: "Leaping Through the Void",
        description: "Channel your inner cave raider and make dynamic movements to reach distant holds. The Abyss rewards the bold.",
        requirements: { skillType: "dynos", count: 2, grade: layerConfig.grades[0] }
      },
      movement: {
        title: "Fluid Cave Navigation",
        description: "Develop the flowing movement of a seasoned cave raider. Grace and efficiency will guide you deeper.",
        requirements: { skillType: "movement", count: 4, grade: layerConfig.grades[0] }
      },
      strength: {
        title: "Forge of the Depths",
        description: "Build the strength needed to haul heavy relics from the Abyss. Power is essential for any true cave raider.",
        requirements: { skillType: "strength", count: 3, grade: layerConfig.grades[1] || layerConfig.grades[0] }
      },
      balance: {
        title: "Equilibrium of the Abyss",
        description: "Find your center in the unstable depths. Balance is the difference between ascent and the curse of the Abyss.",
        requirements: { skillType: "balance", count: 3, grade: layerConfig.grades[0] }
      },
      flexibility: {
        title: "Serpentine Adaptation",
        description: "Adapt to the twisted formations of the Abyss. Flexibility opens paths that strength alone cannot.",
        requirements: { skillType: "flexibility", count: 3, grade: layerConfig.grades[0] }
      }
    };

    const skillQuest = skillQuests[weakestSkill.skillType as keyof typeof skillQuests];
    
    return {
      title: skillQuest.title,
      description: skillQuest.description,
      difficulty: "easy",
      xpReward: 75,
      requirements: skillQuest.requirements
    };
  }

  private async generateFallbackQuest(userId: string, layer: number): Promise<void> {
    const layerConfig = this.LAYER_CONFIGS[layer as keyof typeof this.LAYER_CONFIGS];
    
    const fallbackQuest: InsertQuest = {
      userId,
      title: `${layerConfig.name} Challenge`,
      description: `Complete climbing problems in ${layerConfig.name} to gain experience and progress deeper into the Abyss.`,
      layer,
      difficulty: "medium",
      xpReward: 100 + (layer * 25),
      requirements: {
        type: "problems",
        count: 3,
        grade: layerConfig.grades[0],
      },
      maxProgress: 3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(fallbackQuest);
  }

  async updateQuestProgress(userId: string, grade: string, style?: string): Promise<void> {
    // Award skill XP based on climb type
    if (style) {
      const skillXP = this.calculateSkillXP(grade, style);
      await storage.upsertUserSkill(userId, style, skillXP);
    }
    
    // Update quest progress
    await this.updateQuestProgressLegacy(userId, grade, style);
  }

  private calculateSkillXP(grade: string, style: string): number {
    const gradeValue = parseInt(grade.replace('V', '')) || 0;
    const baseXP = Math.max(10, gradeValue * 5);
    
    // Different styles give different XP amounts
    const styleMultipliers = {
      'crimps': 1.0,
      'dynos': 1.2,
      'movement': 1.1,
      'strength': 1.3,
      'balance': 1.1,
      'flexibility': 1.0,
    };
    
    const multiplier = styleMultipliers[style as keyof typeof styleMultipliers] || 1.0;
    return Math.round(baseXP * multiplier);
  }

  async updateQuestProgressLegacy(userId: string, grade: string, style?: string): Promise<void> {
    // This is the old quest progress method, keeping for backward compatibility
    const activeQuests = await storage.getUserQuests(userId, "active");
    
    for (const quest of activeQuests) {
      const requirements = quest.requirements as any;
      let shouldUpdate = false;

      // Check if this climb matches quest requirements
      if (requirements.type === "problems") {
        if (!requirements.grade || requirements.grade === grade) {
          shouldUpdate = true;
        }
      } else if (requirements.type === "style") {
        if (requirements.style === style) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate && quest.progress < quest.maxProgress) {
        const newProgress = quest.progress + 1;
        const updates: Partial<typeof quest> = {
          progress: newProgress,
        };

        // Complete quest if progress reaches max
        if (newProgress >= quest.maxProgress) {
          updates.status = "completed";
          updates.completedAt = new Date();
          
          // Award XP to user
          const user = await storage.getUser(userId);
          if (user) {
            await storage.upsertUser({
              ...user,
              totalXP: (user.totalXP || 0) + quest.xpReward,
              updatedAt: new Date(),
            });
          }
        }

        await storage.updateQuest(quest.id, updates);
      }
    }
  }
}

export const questGenerator = new QuestGenerator();
