import { storage } from "../storage";
import { type InsertQuest } from "@shared/schema";

export class QuestGenerator {
  private readonly LAYER_CONFIGS = {
    1: { name: "Edge of the Abyss", grades: ["V0", "V1", "V2"], maxQuests: 2 },
    2: { name: "Forest of Temptation", grades: ["V3", "V4", "V5"], maxQuests: 3 },
    3: { name: "Great Fault", grades: ["V6", "V7", "V8"], maxQuests: 3 },
    4: { name: "Goblets of Giants", grades: ["V9", "V10", "V11"], maxQuests: 4 },
    5: { name: "Sea of Corpses", grades: ["V12", "V13", "V14"], maxQuests: 4 },
    6: { name: "Capital of the Unreturned", grades: ["V15", "V16", "V17"], maxQuests: 5 },
    7: { name: "Final Maelstrom", grades: ["V18+"], maxQuests: 5 },
  };

  private readonly SIMPLE_QUESTS = [
    { type: "problems", text: "problems", styles: ["any"] },
    { type: "grade", text: "grade", styles: ["any"] },
    { type: "style", text: "style", styles: ["crimps", "dynos", "overhangs", "slabs", "technical"] },
    { type: "session", text: "session", styles: ["any"] },
  ];

  async generateQuestForUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const activeQuests = await storage.getUserQuests(userId, "active");
    const layerConfig = this.LAYER_CONFIGS[user.currentLayer as keyof typeof this.LAYER_CONFIGS];
    
    // Don't generate more quests if user has max active quests for their layer
    if (activeQuests.length >= layerConfig.maxQuests) {
      return;
    }

    // Generate simple, climbing-focused quest
    const questData = this.generateSimpleQuest(user.currentLayer || 1);

    const quest: InsertQuest = {
      userId,
      title: questData.title,
      description: questData.description,
      layer: user.currentLayer || 1,
      difficulty: questData.difficulty,
      xpReward: questData.xpReward,
      requirements: questData.requirements,
      maxProgress: questData.requirements.count,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await storage.createQuest(quest);
  }

  private generateSimpleQuest(layer: number): {
    title: string;
    description: string;
    requirements: { type: string; count: number; grade?: string; style?: string };
    xpReward: number;
    difficulty: string;
  } {
    const layerConfig = this.LAYER_CONFIGS[layer as keyof typeof this.LAYER_CONFIGS];
    const questTypes = [
      {
        type: "problems",
        template: (count: number, grade?: string) => ({
          title: grade ? `Climb ${count} ${grade} problems` : `Climb ${count} problems`,
          description: grade ? `Complete ${count} ${grade} boulder problems to progress.` : `Complete ${count} boulder problems to progress.`,
          requirements: { type: "problems", count, grade },
        }),
      },
      {
        type: "grade",
        template: (count: number, grade?: string) => ({
          title: `Send ${count} ${grade} problems`,
          description: `Successfully complete ${count} ${grade} problems.`,
          requirements: { type: "problems", count, grade },
        }),
      },
      {
        type: "style",
        template: (count: number, style?: string) => ({
          title: `Master ${count} ${style} problems`,
          description: `Complete ${count} problems focusing on ${style} technique.`,
          requirements: { type: "style", count, style },
        }),
      },
    ];

    // Choose random quest type
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)];
    
    // Set count based on layer (higher layers = more problems)
    const count = Math.max(3, Math.min(10, 2 + layer));
    
    // Choose appropriate grade for layer
    const grade = layerConfig.grades[Math.floor(Math.random() * layerConfig.grades.length)];
    
    // Choose style if style quest
    const styles = ["crimps", "dynos", "overhangs", "slabs", "technical"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    const questData = questType.template(count, questType.type === "problems" ? grade : undefined);
    
    if (questType.type === "style") {
      questData.requirements.style = style;
    }

    return {
      ...questData,
      xpReward: 50 + (layer * 25) + (count * 10),
      difficulty: layer <= 2 ? "easy" : layer <= 4 ? "medium" : layer <= 6 ? "hard" : "extreme",
    };
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
