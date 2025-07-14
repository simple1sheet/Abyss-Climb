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
  // Climbing Session Achievements
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
    id: "consistent_climber",
    title: "Consistent Climber",
    description: "Complete 30 climbing sessions",
    icon: "calendar-alt",
    category: "Climber",
    xpReward: 300,
    type: "session",
    checkCondition: (user, stats) => stats.totalSessions >= 30,
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
    id: "marathon_climber",
    title: "Marathon Climber",
    description: "Complete a session lasting over 4 hours",
    icon: "timer",
    category: "Climber",
    xpReward: 200,
    type: "session",
    checkCondition: (user, stats) => stats.longestSession >= 240,
  },

  // Boulder Problem Achievements
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
    id: "problem_master",
    title: "Problem Master",
    description: "Complete 100 boulder problems",
    icon: "trophy",
    category: "Climber",
    xpReward: 400,
    type: "problem",
    checkCondition: (user, stats) => stats.totalProblems >= 100,
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
  {
    id: "advanced_climber",
    title: "Advanced Climber",
    description: "Complete a V5 or higher problem",
    icon: "mountain-snow",
    category: "Climber",
    xpReward: 250,
    type: "problem",
    checkCondition: (user, stats) => stats.highestGradeNumeric >= 5,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete 5 problems on first attempt",
    icon: "bullseye",
    category: "Climber",
    xpReward: 150,
    type: "special",
    checkCondition: (user, stats) => stats.firstAttemptSuccesses >= 5,
  },
  {
    id: "diverse_climber",
    title: "Diverse Climber",
    description: "Complete problems in all 4 skill categories",
    icon: "sitemap",
    category: "Climber",
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
    category: "Trainer",
    xpReward: 50,
    type: "workout",
    checkCondition: (user, stats) => stats.totalWorkouts >= 1,
  },
  {
    id: "fitness_fanatic",
    title: "Fitness Fanatic",
    description: "Complete 10 home workouts",
    icon: "heart",
    category: "Trainer",
    xpReward: 150,
    type: "workout",
    checkCondition: (user, stats) => stats.totalWorkouts >= 10,
  },
  {
    id: "strength_builder",
    title: "Strength Builder",
    description: "Complete 5 strength training workouts",
    icon: "muscle",
    category: "Trainer",
    xpReward: 100,
    type: "workout",
    checkCondition: (user, stats) => stats.strengthWorkouts >= 5,
  },
  {
    id: "multi_modal_trainer",
    title: "Multi-Modal Trainer",
    description: "Complete both climbing and workout sessions",
    icon: "layers",
    category: "Trainer",
    xpReward: 150,
    type: "special",
    checkCondition: (user, stats) => stats.totalSessions >= 1 && stats.totalWorkouts >= 1,
  },
  {
    id: "daily_dedication",
    title: "Daily Dedication",
    description: "Complete 3 workouts in one day",
    icon: "calendar-check",
    category: "Trainer",
    xpReward: 75,
    type: "workout",
    checkCondition: (user, stats) => stats.workoutsCompletedToday >= 3,
  },

  // General App Progression Achievements
  {
    id: "xp_collector",
    title: "XP Collector",
    description: "Earn a total of 1,000 XP",
    icon: "star",
    category: "Master",
    xpReward: 100,
    type: "progression",
    checkCondition: (user, stats) => user.totalXP >= 1000,
  },
  {
    id: "xp_master",
    title: "XP Master",
    description: "Earn a total of 5,000 XP",
    icon: "crown",
    category: "Master",
    xpReward: 300,
    type: "progression",
    checkCondition: (user, stats) => user.totalXP >= 5000,
  },
  {
    id: "layer_explorer",
    title: "Layer Explorer",
    description: "Reach Layer 2",
    icon: "compass",
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

  // Whistle Achievements (App Progression)
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
    icon: "trophy",
    category: "Master",
    xpReward: 500,
    type: "whistle",
    checkCondition: (user, stats) => user.whistleLevel >= 5,
  },

  // App Usage Achievements
  {
    id: "skill_tracker",
    title: "Skill Tracker",
    description: "Log progress in the skill system",
    icon: "chart-line",
    category: "Explorer",
    xpReward: 50,
    type: "usage",
    checkCondition: (user, stats) => stats.skillsTracked >= 1,
  },
  {
    id: "profile_customizer",
    title: "Profile Customizer",
    description: "Upload a custom profile picture",
    icon: "user-circle",
    category: "Explorer",
    xpReward: 25,
    type: "usage",
    checkCondition: (user, stats) => stats.profilePictureUploaded >= 1,
  },
  {
    id: "location_mapper",
    title: "Location Mapper",
    description: "Log sessions at 3 different climbing locations",
    icon: "map-marker-alt",
    category: "Explorer",
    xpReward: 100,
    type: "usage",
    checkCondition: (user, stats) => stats.uniqueLocations >= 3,
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
      case "first_session":
        return Math.min(100, (stats.totalSessions / 1) * 100);
      case "session_veteran":
        return Math.min(100, (stats.totalSessions / 10) * 100);
      case "consistent_climber":
        return Math.min(100, (stats.totalSessions / 30) * 100);
      case "marathon_climber":
        return Math.min(100, (stats.longestSession / 240) * 100);
      case "problem_solver":
        return Math.min(100, (stats.totalProblems / 10) * 100);
      case "boulder_crusher":
        return Math.min(100, (stats.totalProblems / 50) * 100);
      case "problem_master":
        return Math.min(100, (stats.totalProblems / 100) * 100);
      case "grade_climber":
        return Math.min(100, (stats.highestGradeNumeric / 3) * 100);
      case "advanced_climber":
        return Math.min(100, (stats.highestGradeNumeric / 5) * 100);
      case "perfectionist":
        return Math.min(100, (stats.firstAttemptSuccesses / 5) * 100);
      case "diverse_climber":
        return Math.min(100, (stats.skillCategoriesCompleted / 4) * 100);
      case "workout_warrior":
        return Math.min(100, (stats.totalWorkouts / 1) * 100);
      case "fitness_fanatic":
        return Math.min(100, (stats.totalWorkouts / 10) * 100);
      case "strength_builder":
        return Math.min(100, (stats.strengthWorkouts / 5) * 100);
      case "daily_dedication":
        return Math.min(100, (stats.workoutsCompletedToday / 3) * 100);
      case "multi_modal_trainer":
        return Math.min(100, (stats.totalSessions >= 1 && stats.totalWorkouts >= 1) ? 100 : 0);
      case "xp_collector":
        return Math.min(100, (user.totalXP / 1000) * 100);
      case "xp_master":
        return Math.min(100, (user.totalXP / 5000) * 100);
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
      case "session_streaker":
        return Math.min(100, (stats.consecutiveSessionDays / 7) * 100);
      case "skill_tracker":
        return Math.min(100, (stats.skillsTracked / 1) * 100);
      case "profile_customizer":
        return Math.min(100, (stats.profilePictureUploaded / 1) * 100);
      case "location_mapper":
        return Math.min(100, (stats.uniqueLocations / 3) * 100);
      default:
        return 0;
    }
  }
}

export const achievementService = new AchievementService();