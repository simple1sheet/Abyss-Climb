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

    // Get recent climbing data to inform quest generation
    const recentSessions = await storage.getUserClimbingSessions(userId, 5);
    const recentGrades: string[] = [];
    
    for (const session of recentSessions) {
      const problems = await storage.getBoulderProblemsForSession(session.id);
      recentGrades.push(...problems.map(p => p.grade));
    }

    try {
      const questData = await generateQuest(
        user.currentLayer || 1,
        user.whistleLevel || 1,
        "mixed", // TODO: Determine user's preferred style
        recentGrades.slice(0, 10) // Last 10 grades
      );

      const quest: InsertQuest = {
        userId,
        title: questData.title,
        description: questData.description,
        layer: user.currentLayer || 1,
        difficulty: questData.difficulty,
        xpReward: questData.xpReward,
        requirements: questData.requirements,
        maxProgress: questData.requirements.count,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("Failed to generate quest:", error);
      // Fallback to a simple quest
      await this.generateFallbackQuest(userId, user.currentLayer || 1);
    }
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
