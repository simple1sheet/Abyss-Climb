import { storage } from "../storage";
import { type InsertSkill } from "@shared/schema";

export class SkillManager {
  private readonly DEFAULT_SKILLS = [
    "movement",
    "crimps", 
    "dynos",
    "overhangs",
    "slabs",
    "technical",
    "endurance",
    "strength",
    "flexibility",
    "balance"
  ];

  private readonly WHISTLE_LEVELS = {
    1: { name: "Red Whistle", minSkillLevel: 1, color: "#dc2626" },
    2: { name: "Blue Whistle", minSkillLevel: 3, color: "#2563eb" },
    3: { name: "Moon Whistle", minSkillLevel: 5, color: "#eab308" },
    4: { name: "Black Whistle", minSkillLevel: 7, color: "#1f2937" },
    5: { name: "White Whistle", minSkillLevel: 10, color: "#f8fafc" },
  };

  private readonly LAYER_PROGRESSION = {
    1: { name: "Edge of the Abyss", minXP: 0, maxXP: 500 },
    2: { name: "Forest of Temptation", minXP: 500, maxXP: 1500 },
    3: { name: "Great Fault", minXP: 1500, maxXP: 3000 },
    4: { name: "Goblets of Giants", minXP: 3000, maxXP: 5000 },
    5: { name: "Sea of Corpses", minXP: 5000, maxXP: 8000 },
    6: { name: "Capital of the Unreturned", minXP: 8000, maxXP: 12000 },
    7: { name: "Final Maelstrom", minXP: 12000, maxXP: Infinity },
  };

  async initializeUserSkills(userId: string): Promise<void> {
    const existingSkills = await storage.getUserSkills(userId);
    
    if (existingSkills.length === 0) {
      for (const skillType of this.DEFAULT_SKILLS) {
        await storage.upsertSkill({
          userId,
          skillType,
          level: 1,
          xp: 0,
        });
      }
    }
  }

  async updateSkillFromProblem(
    userId: string, 
    grade: string, 
    style?: string, 
    completed = false
  ): Promise<void> {
    const baseXP = this.getXPFromGrade(grade);
    const completionMultiplier = completed ? 1.5 : 1;
    
    // Update movement skill for all problems
    await storage.updateSkillXP(userId, "movement", Math.floor(baseXP * completionMultiplier));
    
    // Update specific style skill if provided
    if (style && this.DEFAULT_SKILLS.includes(style)) {
      await storage.updateSkillXP(userId, style, Math.floor(baseXP * completionMultiplier * 1.2));
    }
    
    // Update strength/endurance based on grade difficulty
    const numericGrade = this.getNumericGrade(grade);
    if (numericGrade >= 5) {
      await storage.updateSkillXP(userId, "strength", Math.floor(baseXP * 0.8));
    }
    if (numericGrade >= 8) {
      await storage.updateSkillXP(userId, "endurance", Math.floor(baseXP * 0.6));
    }
  }

  async calculateWhistleLevel(userId: string): Promise<number> {
    const skills = await storage.getUserSkills(userId);
    const averageSkillLevel = skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length;
    
    // Determine whistle level based on average skill level
    for (let level = 5; level >= 1; level--) {
      if (averageSkillLevel >= this.WHISTLE_LEVELS[level as keyof typeof this.WHISTLE_LEVELS].minSkillLevel) {
        return level;
      }
    }
    return 1;
  }

  async calculateLayerFromXP(totalXP: number): Promise<number> {
    for (let layer = 7; layer >= 1; layer--) {
      if (totalXP >= this.LAYER_PROGRESSION[layer as keyof typeof this.LAYER_PROGRESSION].minXP) {
        return layer;
      }
    }
    return 1;
  }

  private getXPFromGrade(grade: string): number {
    const numericGrade = this.getNumericGrade(grade);
    return Math.max(10, numericGrade * 15);
  }

  private getNumericGrade(grade: string): number {
    const match = grade.match(/V(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  }

  async updateUserProgression(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const newWhistleLevel = await this.calculateWhistleLevel(userId);
    const newLayer = await this.calculateLayerFromXP(user.totalXP || 0);

    if (newWhistleLevel !== user.whistleLevel || newLayer !== user.currentLayer) {
      await storage.upsertUser({
        ...user,
        whistleLevel: newWhistleLevel,
        currentLayer: newLayer,
        updatedAt: new Date(),
      });
    }
  }
}

export const skillManager = new SkillManager();