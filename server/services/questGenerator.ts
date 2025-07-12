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

  private readonly CONCRETE_QUESTS = {
    daily: [
      {
        title: "Daily Crimper",
        description: "Complete 3 boulder problems focusing on crimp holds",
        requirements: { type: "problems", style: "crimps", count: 3 },
        xpReward: 75,
        difficulty: "easy"
      },
      {
        title: "Dynamic Movement",
        description: "Complete 2 boulder problems with dynamic movements",
        requirements: { type: "problems", style: "dynos", count: 2 },
        xpReward: 100,
        difficulty: "medium"
      },
      {
        title: "Strength Training",
        description: "Complete 3 boulder problems focusing on strength",
        requirements: { type: "problems", style: "strength", count: 3 },
        xpReward: 90,
        difficulty: "medium"
      },
      {
        title: "Balance Practice",
        description: "Complete 3 boulder problems focusing on balance",
        requirements: { type: "problems", style: "balance", count: 3 },
        xpReward: 80,
        difficulty: "easy"
      },
      {
        title: "Flexibility Work",
        description: "Complete 2 boulder problems requiring flexibility",
        requirements: { type: "problems", style: "flexibility", count: 2 },
        xpReward: 70,
        difficulty: "easy"
      },
      {
        title: "Flow Movement",
        description: "Complete 4 boulder problems focusing on smooth movement",
        requirements: { type: "problems", style: "movement", count: 4 },
        xpReward: 85,
        difficulty: "medium"
      }
    ],
    layer: [
      {
        title: "Grade Progression",
        description: "Complete 1 boulder problem at your layer's grade",
        requirements: { type: "grade_specific", count: 1 },
        xpReward: 200,
        difficulty: "hard"
      },
      {
        title: "Session Consistency",
        description: "Complete 3 climbing sessions this week",
        requirements: { type: "sessions", count: 3 },
        xpReward: 150,
        difficulty: "medium"
      },
      {
        title: "Outdoor Adventure",
        description: "Complete 1 outdoor climbing session",
        requirements: { type: "outdoor_sessions", count: 1 },
        xpReward: 250,
        difficulty: "hard"
      },
      {
        title: "Problem Crusher",
        description: "Complete 8 boulder problems in a single session",
        requirements: { type: "problems_in_session", count: 8 },
        xpReward: 180,
        difficulty: "medium"
      }
    ]
  };

  async generateQuestForUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const userSkills = await storage.getUserSkills(userId);
    const layer = user.currentLayer || 1;
    const whistleLevel = user.whistleLevel || 0;
    
    // Get user's recent grades from last 10 boulder problems
    const recentSessions = await storage.getUserClimbingSessions(userId, 5);
    const recentGrades: string[] = [];
    for (const session of recentSessions) {
      const problems = await storage.getBoulderProblemsForSession(session.id);
      recentGrades.push(...problems.map(p => p.grade));
    }
    
    try {
      // Use AI to generate practical quest
      const aiQuest = await generateQuest(layer, whistleLevel, userSkills, recentGrades);
      
      const quest: InsertQuest = {
        userId,
        title: aiQuest.title,
        description: aiQuest.description,
        layer,
        difficulty: aiQuest.difficulty,
        difficultyRating: aiQuest.difficultyRating,
        xpReward: aiQuest.xpReward,
        requirements: aiQuest.requirements,
        maxProgress: aiQuest.requirements.count,
        questType: "daily",
        generatedByAi: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("Error generating AI quest:", error);
      await this.generateFallbackQuest(userId, layer);
    }
  }

  private generateDailySkillQuest(userSkills: any[]): any {
    // Sort by lowest max grade achieved to target weakest skills
    const weakestSkill = userSkills.sort((a, b) => {
      const aGrade = parseInt(a.maxGrade?.replace('V', '') || '0');
      const bGrade = parseInt(b.maxGrade?.replace('V', '') || '0');
      return aGrade - bGrade;
    })[0];
    
    const dailyQuests = this.CONCRETE_QUESTS.daily.filter(q => 
      q.requirements.style === weakestSkill.skillType
    );
    
    if (dailyQuests.length > 0) {
      return dailyQuests[Math.floor(Math.random() * dailyQuests.length)];
    }
    
    // Default fallback
    return this.CONCRETE_QUESTS.daily[0];
  }

  private generateLayerQuest(layer: number, layerConfig: any): any {
    const layerQuests = this.CONCRETE_QUESTS.layer;
    const randomQuest = layerQuests[Math.floor(Math.random() * layerQuests.length)];
    
    // Customize quest based on layer
    if (randomQuest.requirements.type === "grade_specific") {
      const layerGrade = layerConfig.grades[Math.floor(Math.random() * layerConfig.grades.length)];
      randomQuest.requirements.grade = layerGrade;
      randomQuest.description = `Complete 1 boulder problem at grade ${layerGrade}`;
    }
    
    return randomQuest;
  }

  private async generateFallbackQuest(userId: string, layer: number): Promise<void> {
    const fallbackQuest: InsertQuest = {
      userId,
      title: "Complete 3 Boulder Problems",
      description: "Complete 3 boulder problems of any grade to earn experience",
      layer,
      difficulty: "easy",
      difficultyRating: 2,
      xpReward: 75,
      requirements: { type: "problems", count: 3 },
      maxProgress: 3,
      questType: "daily",
      generatedByAi: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(fallbackQuest);
  }

  async updateQuestProgress(userId: string, grade: string, style?: string): Promise<void> {
    // Skill progression is now handled in the routes.ts file when problems are created
    
    // Update quest progress
    const activeQuests = await storage.getUserQuests(userId, "active");
    
    for (const quest of activeQuests) {
      const requirements = quest.requirements as any;
      let shouldUpdate = false;
      
      switch (requirements.type) {
        case "problems":
          if (!requirements.style || requirements.style === style) {
            shouldUpdate = true;
          }
          break;
        case "grade_specific":
          if (requirements.grade && grade === requirements.grade) {
            shouldUpdate = true;
          }
          break;
        case "grade_progression":
          // Check if this grade is higher than user's average
          const userSessions = await storage.getUserClimbingSessions(userId, 10);
          const allGrades = [];
          for (const session of userSessions) {
            const problems = await storage.getBoulderProblemsForSession(session.id);
            allGrades.push(...problems.map(p => parseInt(p.grade.replace('V', ''))));
          }
          const avgGrade = allGrades.length > 0 ? allGrades.reduce((a, b) => a + b) / allGrades.length : 0;
          const currentGrade = parseInt(grade.replace('V', ''));
          if (currentGrade > avgGrade) {
            shouldUpdate = true;
          }
          break;
      }
      
      if (shouldUpdate) {
        const newProgress = (quest.progress || 0) + 1;
        const updates: any = { progress: newProgress };
        
        if (newProgress >= quest.maxProgress) {
          updates.status = "completed";
          updates.completedAt = new Date();
          
          // Award XP to user
          const user = await storage.getUser(userId);
          if (user) {
            await storage.upsertUser({
              ...user,
              totalXP: (user.totalXP || 0) + quest.xpReward,
            });
          }
        }
        
        await storage.updateQuest(quest.id, updates);
      }
    }
  }

  // XP calculation is no longer used in the new skill system
  // Skills are now based on max grade achieved per skill type

  async checkSessionQuests(userId: string, sessionId: number): Promise<void> {
    const problems = await storage.getBoulderProblemsForSession(sessionId);
    const session = await storage.getClimbingSession(sessionId);
    
    if (!session) return;
    
    const activeQuests = await storage.getUserQuests(userId, "active");
    
    for (const quest of activeQuests) {
      const requirements = quest.requirements as any;
      let shouldUpdate = false;
      
      switch (requirements.type) {
        case "sessions":
          shouldUpdate = true;
          break;
        case "outdoor_sessions":
          if (session.sessionType === "outdoor") {
            shouldUpdate = true;
          }
          break;
        case "problems_in_session":
          if (problems.length >= requirements.count) {
            shouldUpdate = true;
          }
          break;
      }
      
      if (shouldUpdate) {
        const newProgress = (quest.progress || 0) + 1;
        const updates: any = { progress: newProgress };
        
        if (newProgress >= quest.maxProgress) {
          updates.status = "completed";
          updates.completedAt = new Date();
          
          // Award XP to user
          const user = await storage.getUser(userId);
          if (user) {
            await storage.upsertUser({
              ...user,
              totalXP: (user.totalXP || 0) + quest.xpReward,
            });
          }
        }
        
        await storage.updateQuest(quest.id, updates);
      }
    }
  }
}

export const questGenerator = new QuestGenerator();