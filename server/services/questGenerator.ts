import { storage } from "../storage";
import { InsertQuest } from "../../shared/schema";
import { generateQuest } from "./openai";

export class QuestGenerator {
  private readonly LAYER_CONFIGS = {
    1: { name: "Edge of the Abyss", grades: ["V0", "V1", "V2"], maxQuests: 2 },
    2: { name: "Forest of Temptation", grades: ["V3", "V4", "V5"], maxQuests: 3 },
    3: { name: "Great Fault", grades: ["V6", "V7", "V8"], maxQuests: 4 },
    4: { name: "Goblets of Giants", grades: ["V9", "V10", "V11"], maxQuests: 5 },
    5: { name: "Sea of Corpses", grades: ["V12", "V13", "V14"], maxQuests: 6 },
    6: { name: "Capital of the Unreturned", grades: ["V15", "V16", "V17"], maxQuests: 8 },
    7: { name: "Final Maelstrom", grades: ["V18+"], maxQuests: 10 },
  };

  private readonly DAILY_QUEST_TEMPLATES = [
    // Fun & Light Daily Quests
    {
      title: "Morning Warm-Up",
      description: "Complete 3 easy boulder problems to start your day",
      requirements: { type: "problems", count: 3, gradeRange: "easy" },
      xpReward: 50,
      difficulty: "easy"
    },
    {
      title: "Technique Focus",
      description: "Complete 2 boulder problems with perfect technique",
      requirements: { type: "problems", style: "technique", count: 2 },
      xpReward: 75,
      difficulty: "easy"
    },
    {
      title: "Crimp Master",
      description: "Complete 3 boulder problems focusing on crimp holds",
      requirements: { type: "problems", style: "crimps", count: 3 },
      xpReward: 80,
      difficulty: "easy"
    },
    {
      title: "Sloper Challenge",
      description: "Complete 2 boulder problems with sloper holds",
      requirements: { type: "problems", style: "slopers", count: 2 },
      xpReward: 85,
      difficulty: "medium"
    },
    {
      title: "Pinch Power",
      description: "Complete 3 boulder problems with pinch holds",
      requirements: { type: "problems", style: "pinches", count: 3 },
      xpReward: 90,
      difficulty: "medium"
    },
    {
      title: "Dynamic Flow",
      description: "Complete 2 boulder problems with dynamic movements",
      requirements: { type: "problems", style: "dynos", count: 2 },
      xpReward: 100,
      difficulty: "medium"
    },
    {
      title: "Balance Beam",
      description: "Complete 3 boulder problems focusing on balance",
      requirements: { type: "problems", style: "balance", count: 3 },
      xpReward: 75,
      difficulty: "easy"
    },
    {
      title: "Overhang Adventure",
      description: "Complete 2 overhang boulder problems",
      requirements: { type: "problems", wallAngle: "overhang", count: 2 },
      xpReward: 95,
      difficulty: "medium"
    },
    {
      title: "Slab Explorer",
      description: "Complete 2 slab boulder problems",
      requirements: { type: "problems", wallAngle: "slab", count: 2 },
      xpReward: 80,
      difficulty: "easy"
    },
    {
      title: "Endurance Builder",
      description: "Complete 5 boulder problems in one session",
      requirements: { type: "problems", count: 5, sessionBased: true },
      xpReward: 120,
      difficulty: "medium"
    },
    {
      title: "Flash Attempt",
      description: "Complete 1 boulder problem on your first attempt",
      requirements: { type: "problems", count: 1, maxAttempts: 1 },
      xpReward: 110,
      difficulty: "medium"
    },
    {
      title: "Outdoor Explorer",
      description: "Complete 2 outdoor boulder problems",
      requirements: { type: "problems", location: "outdoor", count: 2 },
      xpReward: 130,
      difficulty: "medium"
    },
    {
      title: "Grade Comfort",
      description: "Complete 3 boulder problems at your comfort grade",
      requirements: { type: "problems", count: 3, gradeRange: "comfort" },
      xpReward: 70,
      difficulty: "easy"
    },
    {
      title: "Volume Training",
      description: "Complete 6 boulder problems of any difficulty",
      requirements: { type: "problems", count: 6 },
      xpReward: 140,
      difficulty: "hard"
    },
    {
      title: "Mixed Styles",
      description: "Complete 4 boulder problems with different hold types",
      requirements: { type: "problems", count: 4, mixedStyles: true },
      xpReward: 105,
      difficulty: "medium"
    }
  ];

  private readonly LAYER_QUEST_TEMPLATES = {
    1: { // Edge of Abyss
      title: "First Steps into the Abyss",
      description: "Complete 10 boulder problems of V0-V2 difficulty to prove your readiness",
      requirements: { type: "problems", count: 10, gradeRange: "V0-V2" },
      xpReward: 300,
      difficulty: "hard",
      duration: 14 // days
    },
    2: { // Forest of Temptation
      title: "Navigate the Dense Woods",
      description: "Complete 8 boulder problems of V3-V5 difficulty while maintaining technique",
      requirements: { type: "problems", count: 8, gradeRange: "V3-V5" },
      xpReward: 500,
      difficulty: "hard",
      duration: 21
    },
    3: { // Great Fault
      title: "Scale the Massive Cliff",
      description: "Complete 6 boulder problems of V6-V8 difficulty to master the vertical challenge",
      requirements: { type: "problems", count: 6, gradeRange: "V6-V8" },
      xpReward: 750,
      difficulty: "hard",
      duration: 28
    },
    4: { // Goblets of Giants
      title: "Conquer the Giant's Challenge",
      description: "Complete 5 boulder problems of V9-V11 difficulty to prove your elite status",
      requirements: { type: "problems", count: 5, gradeRange: "V9-V11" },
      xpReward: 1000,
      difficulty: "extreme",
      duration: 35
    },
    5: { // Sea of Corpses
      title: "Cross the Treacherous Waters",
      description: "Complete 4 boulder problems of V12-V14 difficulty in the danger zone",
      requirements: { type: "problems", count: 4, gradeRange: "V12-V14" },
      xpReward: 1500,
      difficulty: "extreme",
      duration: 42
    },
    6: { // Capital of the Unreturned
      title: "Enter the Forbidden City",
      description: "Complete 3 boulder problems of V15-V17 difficulty at the point of no return",
      requirements: { type: "problems", count: 3, gradeRange: "V15-V17" },
      xpReward: 2000,
      difficulty: "extreme",
      duration: 56
    },
    7: { // Final Maelstrom
      title: "Face the Ultimate Challenge",
      description: "Complete 2 boulder problems of V18+ difficulty in the deepest depths",
      requirements: { type: "problems", count: 2, gradeRange: "V18+" },
      xpReward: 3000,
      difficulty: "extreme",
      duration: 70
    }
  };

  async generateQuestForUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userSkills = await storage.getUserSkills(userId);
    const currentLayer = user.currentLayer || 1;
    const whistleLevel = user.whistleLevel || 1;

    // First, check if we need to generate a long-term layer quest
    await this.generateLayerQuestIfNeeded(userId, currentLayer);

    // Then generate a daily quest
    await this.generateDailyQuest(userId, currentLayer, userSkills);
  }

  private async generateLayerQuestIfNeeded(userId: string, currentLayer: number): Promise<void> {
    // Check if user already has an active layer quest for this layer
    const existingLayerQuests = await storage.getUserQuests(userId, "active");
    const hasActiveLayerQuest = existingLayerQuests.some(
      quest => quest.type === "layer" && quest.layer === currentLayer
    );

    if (!hasActiveLayerQuest) {
      const layerTemplate = this.LAYER_QUEST_TEMPLATES[currentLayer as keyof typeof this.LAYER_QUEST_TEMPLATES];
      if (layerTemplate) {
        const quest: InsertQuest = {
          userId,
          title: layerTemplate.title,
          description: layerTemplate.description,
          type: "layer",
          status: "active",
          xpReward: layerTemplate.xpReward,
          maxProgress: layerTemplate.requirements.count,
          progress: 0,
          targetValue: layerTemplate.requirements.count,
          currentProgress: 0,
          layer: currentLayer,
          targetGradeRange: layerTemplate.requirements.gradeRange,
          difficulty: layerTemplate.difficulty,
          expiresAt: new Date(Date.now() + layerTemplate.duration * 24 * 60 * 60 * 1000),
          generatedAt: new Date(),
        };

        await storage.createQuest(quest);
      }
    }
  }

  private async generateDailyQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    // Get existing active daily quests to avoid duplicates
    const existingQuests = await storage.getUserQuests(userId, "active");
    const existingDailyQuests = existingQuests.filter(quest => quest.type === "daily");
    const usedTitles = existingDailyQuests.map(quest => quest.title);

    // Filter available templates to avoid duplicates
    const availableTemplates = this.DAILY_QUEST_TEMPLATES.filter(
      template => !usedTitles.includes(template.title)
    );

    if (availableTemplates.length === 0) {
      // If all templates are used, fall back to AI generation
      await this.generateAIQuest(userId, currentLayer, userSkills);
      return;
    }

    // Randomly select a template
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    // Adapt the template to user's skill level
    const adaptedQuest = this.adaptQuestToUser(randomTemplate, currentLayer, userSkills);

    const quest: InsertQuest = {
      userId,
      title: adaptedQuest.title,
      description: adaptedQuest.description,
      type: "daily",
      status: "active",
      xpReward: adaptedQuest.xpReward,
      maxProgress: adaptedQuest.requirements.count,
      progress: 0,
      targetValue: adaptedQuest.requirements.count,
      currentProgress: 0,
      layer: currentLayer,
      targetStyle: adaptedQuest.requirements.style,
      targetGradeRange: adaptedQuest.requirements.gradeRange,
      difficulty: adaptedQuest.difficulty,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      generatedAt: new Date(),
    };

    await storage.createQuest(quest);
  }

  private adaptQuestToUser(template: any, currentLayer: number, userSkills: any[]): any {
    const adaptedQuest = { ...template };
    
    // Calculate user's comfort and challenge grades
    const maxGrade = Math.max(...userSkills.map(s => this.getGradeNumeric(s.maxGrade || "V0")));
    const comfortGrade = Math.max(maxGrade - 1, 0);
    const challengeGrade = Math.min(maxGrade + 1, 17);

    // Adapt grade ranges based on template requirements
    if (template.requirements.gradeRange === "easy") {
      adaptedQuest.requirements.gradeRange = `V${Math.max(comfortGrade - 1, 0)}-V${comfortGrade}`;
    } else if (template.requirements.gradeRange === "comfort") {
      adaptedQuest.requirements.gradeRange = `V${comfortGrade}-V${maxGrade}`;
    } else if (template.requirements.gradeRange === "challenge") {
      adaptedQuest.requirements.gradeRange = `V${maxGrade}-V${challengeGrade}`;
    }

    // Scale XP based on layer
    const layerMultiplier = 1 + (currentLayer - 1) * 0.2;
    adaptedQuest.xpReward = Math.round(adaptedQuest.xpReward * layerMultiplier);

    return adaptedQuest;
  }

  private getGradeNumeric(grade: string): number {
    // Extract numeric value from grade string (e.g., "V5" -> 5)
    const match = grade.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  private async generateAIQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    try {
      const whistleLevel = 1; // You might want to get this from user
      const aiQuest = await generateQuest(userSkills, currentLayer, whistleLevel);
      
      const quest: InsertQuest = {
        userId,
        title: aiQuest.title,
        description: aiQuest.description,
        type: "daily",
        status: "active",
        xpReward: aiQuest.xpReward,
        maxProgress: aiQuest.requirements.count,
        progress: 0,
        targetValue: aiQuest.requirements.count,
        currentProgress: 0,
        layer: currentLayer,
        targetGrade: aiQuest.requirements.grade,
        targetStyle: aiQuest.requirements.style,
        targetGradeRange: aiQuest.requirements.gradeRange,
        difficulty: aiQuest.difficulty,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        generatedAt: new Date(),
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("AI quest generation failed, using fallback:", error);
      await this.generateFallbackQuest(userId, currentLayer);
    }
  }

  async updateQuestProgress(userId: string, grade: string, style?: string): Promise<void> {
    const activeQuests = await storage.getUserQuests(userId, "active");
    
    for (const quest of activeQuests) {
      let progressMade = false;
      
      // Check if this boulder problem contributes to the quest
      if (quest.targetGrade && quest.targetGrade === grade) {
        progressMade = true;
      } else if (quest.targetStyle && quest.targetStyle === style) {
        progressMade = true;
      } else if (quest.targetGradeRange) {
        // Check if grade falls within the target range
        const gradeNum = this.getGradeNumeric(grade);
        const [minGrade, maxGrade] = quest.targetGradeRange.split('-').map(g => this.getGradeNumeric(g));
        if (gradeNum >= minGrade && gradeNum <= maxGrade) {
          progressMade = true;
        }
      } else if (!quest.targetGrade && !quest.targetStyle && !quest.targetGradeRange) {
        // Generic quest that counts any boulder problem
        progressMade = true;
      }
      
      if (progressMade) {
        const newProgress = Math.min(quest.progress + 1, quest.maxProgress);
        const newCurrentProgress = Math.min(quest.currentProgress + 1, quest.targetValue);
        
        await storage.updateQuest(quest.id, {
          progress: newProgress,
          currentProgress: newCurrentProgress,
          status: newProgress >= quest.maxProgress ? "completed" : "active"
        });
        
        // If quest is completed, award XP
        if (newProgress >= quest.maxProgress) {
          const user = await storage.getUser(userId);
          if (user) {
            await storage.upsertUser({
              ...user,
              totalXP: (user.totalXP || 0) + quest.xpReward,
            });
          }
        }
      }
    }
  }

  async checkSessionQuests(userId: string, sessionId: number): Promise<void> {
    const activeQuests = await storage.getUserQuests(userId, "active");
    const sessionQuests = activeQuests.filter(quest => 
      quest.type === "session" || quest.description.includes("session")
    );
    
    for (const quest of sessionQuests) {
      const newProgress = Math.min(quest.progress + 1, quest.maxProgress);
      const newCurrentProgress = Math.min(quest.currentProgress + 1, quest.targetValue);
      
      await storage.updateQuest(quest.id, {
        progress: newProgress,
        currentProgress: newCurrentProgress,
        status: newProgress >= quest.maxProgress ? "completed" : "active"
      });
      
      // If quest is completed, award XP
      if (newProgress >= quest.maxProgress) {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.upsertUser({
            ...user,
            totalXP: (user.totalXP || 0) + quest.xpReward,
          });
        }
      }
    }
  }

  private async generateFallbackQuest(userId: string, layer: number): Promise<void> {
    const fallbackQuest: InsertQuest = {
      userId,
      title: "Daily Boulder Challenge",
      description: "Complete 3 boulder problems to earn experience",
      type: "daily",
      status: "active",
      xpReward: 100,
      maxProgress: 3,
      progress: 0,
      targetValue: 3,
      currentProgress: 0,
      layer,
      difficulty: "medium",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      generatedAt: new Date(),
    };

    await storage.createQuest(fallbackQuest);
  }
}

export const questGenerator = new QuestGenerator();