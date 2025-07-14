import { storage } from "../storage";
import { User, InsertAchievement } from "@shared/schema";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  type: string;
  checkCondition: (user: User, stats: any) => boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Quest Achievements
  {
    id: "quest_novice",
    title: "Quest Novice",
    description: "Complete your first quest",
    icon: "scroll",
    category: "Explorer",
    xpReward: 50,
    type: "quest",
    checkCondition: (user, stats) => stats.completedQuests >= 1,
  },
  {
    id: "quest_enthusiast",
    title: "Quest Enthusiast",
    description: "Complete 5 quests",
    icon: "tasks",
    category: "Explorer",
    xpReward: 100,
    type: "quest",
    checkCondition: (user, stats) => stats.completedQuests >= 5,
  },
  {
    id: "quest_master",
    title: "Quest Master",
    description: "Complete 25 quests",
    icon: "crown",
    category: "Explorer",
    xpReward: 250,
    type: "quest",
    checkCondition: (user, stats) => stats.completedQuests >= 25,
  },
  {
    id: "daily_dedication",
    title: "Daily Dedication",
    description: "Complete 3 quests in one day",
    icon: "calendar-check",
    category: "Explorer",
    xpReward: 75,
    type: "quest",
    checkCondition: (user, stats) => stats.questsCompletedToday >= 3,
  },

  // Session Achievements
  {
    id: "first_session",
    title: "First Descent",
    description: "Complete your first climbing session",
    icon: "mountain",
    category: "Climber",
    xpReward: 50,
    type: "session",
    checkCondition: (user, stats) => stats.totalSessions >= 1,
  },
  {
    id: "session_veteran",
    title: "Session Veteran",
    description: "Complete 10 climbing sessions",
    icon: "hiking",
    category: "Climber",
    xpReward: 150,
    type: "session",
    checkCondition: (user, stats) => stats.totalSessions >= 10,
  },
  {
    id: "endurance_hero",
    title: "Endurance Hero",
    description: "Complete a session lasting over 2 hours",
    icon: "clock",
    category: "Climber",
    xpReward: 100,
    type: "session",
    checkCondition: (user, stats) => stats.longestSession >= 120,
  },
  {
    id: "consistent_climber",
    title: "Consistent Climber",
    description: "Complete 30 climbing sessions",
    icon: "calendar-alt",
    category: "Climber",
    xpReward: 300,
    type: "session",
    checkCondition: (user, stats) => stats.totalSessions >= 30,
  },

  // Problem Achievements
  {
    id: "problem_solver",
    title: "Problem Solver",
    description: "Complete 10 boulder problems",
    icon: "puzzle-piece",
    category: "Climber",
    xpReward: 75,
    type: "problem",
    checkCondition: (user, stats) => stats.totalProblems >= 10,
  },
  {
    id: "boulder_crusher",
    title: "Boulder Crusher",
    description: "Complete 50 boulder problems",
    icon: "fist-raised",
    category: "Climber",
    xpReward: 200,
    type: "problem",
    checkCondition: (user, stats) => stats.totalProblems >= 50,
  },
  {
    id: "grade_climber",
    title: "Grade Climber",
    description: "Complete a V3 or higher problem",
    icon: "arrow-up",
    category: "Climber",
    xpReward: 125,
    type: "problem",
    checkCondition: (user, stats) => stats.highestGradeNumeric >= 3,
  },

  // Progression Achievements
  {
    id: "xp_collector",
    title: "XP Collector",
    description: "Earn 1,000 total XP",
    icon: "star",
    category: "Master",
    xpReward: 100,
    type: "progression",
    checkCondition: (user, stats) => user.totalXP >= 1000,
  },
  {
    id: "layer_explorer",
    title: "Layer Explorer",
    description: "Reach Layer 2",
    icon: "layer-group",
    category: "Master",
    xpReward: 150,
    type: "progression",
    checkCondition: (user, stats) => user.currentLayer >= 2,
  },
  {
    id: "deep_delver",
    title: "Deep Delver",
    description: "Reach Layer 4",
    icon: "chess-rook",
    category: "Master",
    xpReward: 300,
    type: "progression",
    checkCondition: (user, stats) => user.currentLayer >= 4,
  },
  {
    id: "abyss_master",
    title: "Abyss Master",
    description: "Reach Layer 7",
    icon: "gem",
    category: "Master",
    xpReward: 500,
    type: "progression",
    checkCondition: (user, stats) => user.currentLayer >= 7,
  },

  // Whistle Achievements
  {
    id: "blue_whistle",
    title: "Blue Whistle Bearer",
    description: "Upgrade to Blue Whistle",
    icon: "whistle",
    category: "Master",
    xpReward: 100,
    type: "whistle",
    checkCondition: (user, stats) => user.whistleLevel >= 2,
  },
  {
    id: "moon_whistle",
    title: "Moon Whistle Bearer",
    description: "Upgrade to Moon Whistle",
    icon: "moon",
    category: "Master",
    xpReward: 200,
    type: "whistle",
    checkCondition: (user, stats) => user.whistleLevel >= 3,
  },
  {
    id: "black_whistle",
    title: "Black Whistle Bearer",
    description: "Upgrade to Black Whistle",
    icon: "chess-king",
    category: "Master",
    xpReward: 300,
    type: "whistle",
    checkCondition: (user, stats) => user.whistleLevel >= 4,
  },
  {
    id: "white_whistle",
    title: "White Whistle Bearer",
    description: "Upgrade to White Whistle",
    icon: "crown",
    category: "Master",
    xpReward: 500,
    type: "whistle",
    checkCondition: (user, stats) => user.whistleLevel >= 5,
  },

  // Special Achievements
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete 5 problems on first attempt",
    icon: "bullseye",
    category: "Master",
    xpReward: 150,
    type: "special",
    checkCondition: (user, stats) => stats.firstAttemptSuccesses >= 5,
  },
  {
    id: "diverse_climber",
    title: "Diverse Climber",
    description: "Complete problems in all 4 skill categories",
    icon: "sitemap",
    category: "Master",
    xpReward: 200,
    type: "special",
    checkCondition: (user, stats) => stats.skillCategoriesCompleted >= 4,
  },

  // Workout Achievements
  {
    id: "workout_warrior",
    title: "Workout Warrior",
    description: "Complete your first home workout",
    icon: "dumbbell",
    category: "Climber",
    xpReward: 50,
    type: "workout",
    checkCondition: (user, stats) => stats.totalWorkouts >= 1,
  },
  {
    id: "fitness_fanatic",
    title: "Fitness Fanatic",
    description: "Complete 10 home workouts",
    icon: "heart",
    category: "Climber",
    xpReward: 150,
    type: "workout",
    checkCondition: (user, stats) => stats.totalWorkouts >= 10,
  },
  {
    id: "strength_builder",
    title: "Strength Builder",
    description: "Complete 5 strength training workouts",
    icon: "muscle",
    category: "Climber",
    xpReward: 100,
    type: "workout",
    checkCondition: (user, stats) => stats.strengthWorkouts >= 5,
  },
  {
    id: "zen_master",
    title: "Zen Master",
    description: "Complete 5 meditation sessions",
    icon: "lotus",
    category: "Special",
    xpReward: 100,
    type: "workout",
    checkCondition: (user, stats) => stats.meditationSessions >= 5,
  },
  {
    id: "flexibility_expert",
    title: "Flexibility Expert",
    description: "Complete 5 stretching sessions",
    icon: "leaf",
    category: "Special",
    xpReward: 75,
    type: "workout",
    checkCondition: (user, stats) => stats.stretchingSessions >= 5,
  },

  // Technology Achievements
  {
    id: "mobile_pioneer",
    title: "Mobile Pioneer",
    description: "Generate your first APK build",
    icon: "smartphone",
    category: "Special",
    xpReward: 200,
    type: "technology",
    checkCondition: (user, stats) => stats.apkBuilds >= 1,
  },
  {
    id: "developer_tools_user",
    title: "Developer Tools User",
    description: "Use the developer reset tool",
    icon: "wrench",
    category: "Special",
    xpReward: 100,
    type: "technology",
    checkCondition: (user, stats) => stats.developerResets >= 1,
  },
  {
    id: "grade_converter",
    title: "Grade Converter",
    description: "Change your preferred grade system",
    icon: "exchange-alt",
    category: "Special",
    xpReward: 50,
    type: "technology",
    checkCondition: (user, stats) => stats.gradeSystemChanges >= 1,
  },

  // Advanced Achievements
  {
    id: "layer_challenger",
    title: "Layer Challenger",
    description: "Reach Layer 3 of the Abyss",
    icon: "compass",
    category: "Master",
    xpReward: 300,
    type: "progression",
    checkCondition: (user, stats) => stats.currentLayer >= 3,
  },
  {
    id: "abyss_challenger",
    title: "Abyss Challenger",
    description: "Reach Layer 5 of the Abyss",
    icon: "sword",
    category: "Master",
    xpReward: 500,
    type: "progression",
    checkCondition: (user, stats) => stats.currentLayer >= 5,
  },
  {
    id: "final_maelstrom",
    title: "Final Maelstrom",
    description: "Reach the Final Maelstrom (Layer 7)",
    icon: "crown",
    category: "Master",
    xpReward: 1000,
    type: "progression",
    checkCondition: (user, stats) => stats.currentLayer >= 7,
  },
  {
    id: "xp_hoarder",
    title: "XP Hoarder",
    description: "Earn 1000 total XP",
    icon: "star",
    category: "Master",
    xpReward: 200,
    type: "progression",
    checkCondition: (user, stats) => user.totalXP >= 1000,
  },
  {
    id: "xp_master",
    title: "XP Master",
    description: "Earn 10000 total XP",
    icon: "trophy",
    category: "Master",
    xpReward: 500,
    type: "progression",
    checkCondition: (user, stats) => user.totalXP >= 10000,
  },
  {
    id: "session_streaker",
    title: "Session Streaker",
    description: "Complete sessions on 7 consecutive days",
    icon: "fire",
    category: "Climber",
    xpReward: 250,
    type: "special",
    checkCondition: (user, stats) => stats.consecutiveSessionDays >= 7,
  },
  {
    id: "multi_modal_trainer",
    title: "Multi-Modal Trainer",
    description: "Complete both climbing and workout sessions",
    icon: "layers",
    category: "Special",
    xpReward: 150,
    type: "special",
    checkCondition: (user, stats) => stats.totalSessions >= 1 && stats.totalWorkouts >= 1,
  },
];

export class AchievementService {
  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const user = await storage.getUser(userId);
    if (!user) return [];

    const stats = await storage.getUserStats(userId);
    const userAchievements = await storage.getUserAchievements(userId);
    const unlockedAchievementIds = userAchievements.map(a => a.achievementId);
    const newlyUnlocked: Achievement[] = [];

    // Check each achievement definition
    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      // Skip if already unlocked
      if (unlockedAchievementIds.includes(definition.id)) continue;

      // Check if conditions are met
      if (definition.checkCondition(user, stats)) {
        const achievement: InsertAchievement = {
          userId,
          achievementId: definition.id,
          type: definition.type,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
          xpReward: definition.xpReward,
          isUnlocked: true,
          unlockedAt: new Date(),
        };

        const createdAchievement = await storage.createAchievement(achievement);
        newlyUnlocked.push(createdAchievement);
        
        // Award XP for unlocking achievement
        if (definition.xpReward > 0) {
          await storage.upsertUser({
            id: userId,
            totalXP: user.totalXP + definition.xpReward,
          });
        }
      }
    }

    return newlyUnlocked;
  }

  async getAvailableAchievements(userId: string): Promise<Array<AchievementDefinition & { isUnlocked: boolean; progress?: number }>> {
    const user = await storage.getUser(userId);
    if (!user) return [];

    const stats = await storage.getUserStats(userId);
    const userAchievements = await storage.getUserAchievements(userId);
    const unlockedAchievementIds = userAchievements.map(a => a.achievementId);

    return ACHIEVEMENT_DEFINITIONS.map(definition => ({
      ...definition,
      isUnlocked: unlockedAchievementIds.includes(definition.id),
      progress: this.getAchievementProgress(definition, user, stats),
    }));
  }

  private getAchievementProgress(definition: AchievementDefinition, user: User, stats: any): number {
    // Return progress percentage (0-100) for achievements
    switch (definition.id) {
      case "quest_novice":
        return Math.min(100, (stats.completedQuests / 1) * 100);
      case "quest_enthusiast":
        return Math.min(100, (stats.completedQuests / 5) * 100);
      case "quest_master":
        return Math.min(100, (stats.completedQuests / 25) * 100);
      case "daily_dedication":
        return Math.min(100, (stats.questsCompletedToday / 3) * 100);
      case "first_session":
        return Math.min(100, (stats.totalSessions / 1) * 100);
      case "session_veteran":
        return Math.min(100, (stats.totalSessions / 10) * 100);
      case "consistent_climber":
        return Math.min(100, (stats.totalSessions / 30) * 100);
      case "problem_solver":
        return Math.min(100, (stats.totalProblems / 10) * 100);
      case "boulder_crusher":
        return Math.min(100, (stats.totalProblems / 50) * 100);
      case "xp_collector":
        return Math.min(100, (user.totalXP / 1000) * 100);
      case "layer_explorer":
        return Math.min(100, (user.currentLayer / 2) * 100);
      case "deep_delver":
        return Math.min(100, (user.currentLayer / 4) * 100);
      case "abyss_master":
        return Math.min(100, (user.currentLayer / 7) * 100);
      case "blue_whistle":
        return Math.min(100, (user.whistleLevel / 2) * 100);
      case "moon_whistle":
        return Math.min(100, (user.whistleLevel / 3) * 100);
      case "black_whistle":
        return Math.min(100, (user.whistleLevel / 4) * 100);
      case "white_whistle":
        return Math.min(100, (user.whistleLevel / 5) * 100);
      case "perfectionist":
        return Math.min(100, (stats.firstAttemptSuccesses / 5) * 100);
      case "diverse_climber":
        return Math.min(100, (stats.skillCategoriesCompleted / 4) * 100);
      
      // Workout achievements
      case "workout_warrior":
        return Math.min(100, (stats.totalWorkouts / 1) * 100);
      case "fitness_fanatic":
        return Math.min(100, (stats.totalWorkouts / 10) * 100);
      case "strength_builder":
        return Math.min(100, (stats.strengthWorkouts / 5) * 100);
      case "zen_master":
        return Math.min(100, (stats.meditationSessions / 5) * 100);
      case "flexibility_expert":
        return Math.min(100, (stats.stretchingSessions / 5) * 100);
      
      // Technology achievements
      case "mobile_pioneer":
        return Math.min(100, (stats.apkBuilds / 1) * 100);
      case "developer_tools_user":
        return Math.min(100, (stats.developerResets / 1) * 100);
      case "grade_converter":
        return Math.min(100, (stats.gradeSystemChanges / 1) * 100);
      
      // Advanced achievements
      case "abyss_challenger":
        return Math.min(100, (stats.currentLayer / 5) * 100);
      case "final_maelstrom":
        return Math.min(100, (stats.currentLayer / 7) * 100);
      case "xp_master":
        return Math.min(100, (user.totalXP / 10000) * 100);
      case "session_streaker":
        return Math.min(100, (stats.consecutiveSessionDays / 7) * 100);
      case "multi_modal_trainer":
        return Math.min(100, (stats.totalSessions >= 1 && stats.totalWorkouts >= 1) ? 100 : 0);
      
      default:
        return 0;
    }
  }
}

export const achievementService = new AchievementService();