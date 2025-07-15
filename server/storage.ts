The code is updated to improve the average grade calculation for climbing sessions within the past 7 days by filtering out invalid grades and properly calculating the average.
```
```replit_final_file
import {
  users,
  climbingSessions,
  boulderProblems,
  quests,
  achievements,
  skills,
  workoutSessions,
  layerQuests,
  nanachiMemories,
  nutritionEntries,
  nutritionGoals,
  nutritionRecommendations,
  relics,
  type User,
  type UpsertUser,
  type ClimbingSession,
  type InsertClimbingSession,
  type BoulderProblem,
  type InsertBoulderProblem,
  type Quest,
  type InsertQuest,
  type Skill,
  type InsertSkill,
  type Achievement,
  type InsertAchievement,
  type WorkoutSession,
  type InsertWorkoutSession,
  type LayerQuest,
  type InsertLayerQuest,
  type NanachiMemory,
  type InsertNanachiMemory,
  type NutritionEntry,
  type InsertNutritionEntry,
  type NutritionGoal,
  type InsertNutritionGoal,
  type NutritionRecommendation,
  type InsertNutritionRecommendation,
  type Relic,
  type InsertRelic,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, lt, sql, inArray, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserGradeSystem(userId: string, gradeSystem: string): Promise<User>;
  updateUserNotifications(userId: string, enabled: boolean): Promise<User>;

  // Climbing session operations
  createClimbingSession(session: InsertClimbingSession): Promise<ClimbingSession>;
  getClimbingSession(id: number): Promise<ClimbingSession | undefined>;
  getUserClimbingSessions(userId: string, limit?: number): Promise<ClimbingSession[]>;
  getActiveSession(userId: string): Promise<ClimbingSession | undefined>;
  updateClimbingSession(id: number, updates: Partial<ClimbingSession>): Promise<ClimbingSession>;

  // Boulder problem operations
  createBoulderProblem(problem: InsertBoulderProblem): Promise<BoulderProblem>;
  getBoulderProblemsForSession(sessionId: number): Promise<BoulderProblem[]>;

  // Quest operations
  createQuest(quest: InsertQuest): Promise<Quest>;
  getUserQuests(userId: string, status?: string): Promise<Quest[]>;
  getUserQuestsInDateRange(userId: string, startDate: Date, endDate: Date): Promise<Quest[]>;
  getUserCompletedQuestsToday(userId: string): Promise<Quest[]>;
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest>;
  getExpiredQuests(now: Date): Promise<Quest[]>;
  getAllUsers(): Promise<User[]>;
  getUserQuestsByType(userId: string, questType: string, status?: string): Promise<Quest[]>;

  // Skill operations
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: string): Promise<Skill[]>;
  updateSkill(id: number, updates: Partial<Skill>): Promise<Skill>;
  upsertUserSkill(userId: string, skillType: string, grade: string, mainCategory: string, subCategory: string): Promise<Skill>;
  initializeUserSkillTree(userId: string): Promise<void>;

  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;

  // Workout operations  
  createWorkoutSession(workout: InsertWorkoutSession): Promise<WorkoutSession>;
  getUserWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;
  getWorkoutSession(id: number): Promise<WorkoutSession | undefined>;
  updateWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;

  // Stats operations
  getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalProblems: number;
    totalXP: number;
    bestGrade: string;
    weeklyStats: {
      problems: number;
      xp: number;
      time: number;
    };
  }>;

  // Layer progression operations
  getLayerProgressInfo(userId: string): Promise<{
    currentLayer: number;
    currentXP: number;
    currentLayerXP: number;
    nextLayerXP: number;
    progressToNextLayer: number;
    layerProgress: number;
  }>;

  // Whistle progress operations
  getWhistleProgressStats(userId: string): Promise<{
    averageGradePast7Days: string;
    questsCompletedToday: number;
    maxDailyQuests: number;
    topSkillCategory: string;
    sessionsThisWeek: number;
  }>;

  // Enhanced progress operations
  getEnhancedProgressStats(userId: string): Promise<{
    // Whistle tracking
    whistleLevel: number;
    whistleName: string;
    currentXP: number;
    nextLevelXP: number;
    whistleProgress: number;
    xpBreakdown: {
      weeklyXP: number;
      problemsSolved: number;
      averageGrade: string;
    };
    // Enhanced statistics
    enhancedStats: {
      totalSessions: number;
      totalProblems: number;
      totalWorkouts: number;
      weeklyTime: number;
      bestGrade: string;
      averageGrade7d: string;
      sessionConsistency: number;
      weeklyStats: {
        problems: number;
        xp: number;
        time: number;
      };
    };
    // Personal milestones
    milestones: {
      firstV5Send?: Date;
      firstOutdoorSession?: Date;
      longestStreak: number;
      bestSession: {
        date: Date;
        xp: number;
        problems: number;
      };
    };
  }>;

  // Layer quest operations
  createLayerQuest(layerQuest: InsertLayerQuest): Promise<LayerQuest>;
  getLayerQuestByLayer(userId: string, layer: number): Promise<LayerQuest | undefined>;
  updateLayerQuest(id: number, updates: Partial<LayerQuest>): Promise<LayerQuest>;

  // Developer operations
  resetUserData(userId: string): Promise<void>;

  // Nanachi Memory operations
  createNanachiMemory(memory: InsertNanachiMemory): Promise<NanachiMemory>;
  getUserNanachiMemories(userId: string): Promise<NanachiMemory[]>;
  getNanachiMemoriesByType(userId: string, type: string): Promise<NanachiMemory[]>;
  updateNanachiMemory(id: number, updates: Partial<NanachiMemory>): Promise<NanachiMemory>;
  cleanupExpiredNanachiMemories(): Promise<void>;
  getImportantNanachiMemories(userId: string, limit: number): Promise<NanachiMemory[]>;

  // Nutrition operations
  createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry>;
  getUserNutritionEntries(userId: string, date?: Date): Promise<NutritionEntry[]>;
  getNutritionEntriesByMealType(userId: string, mealType: string, date?: Date): Promise<NutritionEntry[]>;
  updateNutritionEntry(id: number, updates: Partial<NutritionEntry>): Promise<NutritionEntry>;
  deleteNutritionEntry(id: number): Promise<void>;

  createNutritionGoal(goal: InsertNutritionGoal): Promise<NutritionGoal>;
  getUserNutritionGoal(userId: string): Promise<NutritionGoal | undefined>;
  updateNutritionGoal(id: number, updates: Partial<NutritionGoal>): Promise<NutritionGoal>;

  createNutritionRecommendation(recommendation: InsertNutritionRecommendation): Promise<NutritionRecommendation>;
  getUserNutritionRecommendations(userId: string): Promise<NutritionRecommendation[]>;
  updateNutritionRecommendation(id: number, updates: Partial<NutritionRecommendation>): Promise<NutritionRecommendation>;
  deleteNutritionRecommendation(id: number): Promise<void>;

  // Nutrition analytics
  getNutritionSummary(userId: string, date?: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    mealBreakdown: {
      breakfast: { calories: number; protein: number; carbs: number; fat: number; };
      lunch: { calories: number; protein: number; carbs: number; fat: number; };
      dinner: { calories: number; protein: number; carbs: number; fat: number; };
      snack: { calories: number; protein: number; carbs: number; fat: number; };
    };
  }>;

  // Relic operations
  createRelic(relic: InsertRelic): Promise<Relic>;
  getUserRelics(userId: string): Promise<Relic[]>;
  getUserRelicsByRarity(userId: string, rarity: string): Promise<Relic[]>;
  getRelic(id: number): Promise<Relic | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, check if user exists
    const existingUser = await this.getUser(userData.id);
    let whistleLevel = 0;
    let currentLayer = 1;

    if (existingUser) {
      // For existing users, get their skills to calculate whistle level
      const userSkills = await this.getUserSkills(userData.id);
      whistleLevel = this.calculateWhistleLevel(userSkills);

      // Calculate layer based on XP if totalXP is provided, otherwise use whistle level
      currentLayer = userData.totalXP !== undefined 
        ? this.calculateCurrentLayerFromXP(userData.totalXP || 0)
        : this.calculateCurrentLayer(whistleLevel);
    }

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        whistleLevel,
        currentLayer,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          whistleLevel,
          currentLayer,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserGradeSystem(userId: string, gradeSystem: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        preferredGradeSystem: gradeSystem,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserNotifications(userId: string, enabled: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        notificationsEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  private calculateWhistleLevel(userSkills: Skill[]): number {
    // Calculate whistle level based on highest grade achieved across all skills
    // Bell whistle: V0, Red: V1-V2, Blue: V3-V4, Moon: V5-V6, Black: V7-V8, White: V9+
    let highestGrade = 0;

    for (const skill of userSkills) {
      const gradeNum = this.getGradeNumericValue(skill.maxGrade || "V0");
      if (gradeNum > highestGrade) {
        highestGrade = gradeNum;
      }
    }

    if (highestGrade === 0) return 0; // Bell whistle
    if (highestGrade <= 2) return 1; // Red whistle
    if (highestGrade <= 4) return 2; // Blue whistle
    if (highestGrade <= 6) return 3; // Moon whistle
    if (highestGrade <= 8) return 4; // Black whistle
    return 5; // White whistle
  }

  private calculateCurrentLayer(whistleLevel: number): number {
    // Layer progression based on whistle level
    if (whistleLevel <= 1) return 1;
    if (whistleLevel <= 2) return 2;
    if (whistleLevel <= 3) return 3;
    if (whistleLevel <= 4) return 4;
    return Math.min(whistleLevel + 1, 7);
  }

  // XP thresholds for each layer (cumulative)
  private readonly LAYER_XP_THRESHOLDS = {
    1: 0,     // Edge of Abyss - Start here
    2: 800,   // Forest of Temptation - 800 XP needed (40-80 problems)
    3: 2500,  // Great Fault - 2500 XP needed (125-250 problems)
    4: 5500,  // Goblets of Giants - 5500 XP needed (275-550 problems)
    5: 10000, // Sea of Corpses - 10000 XP needed (500-1000 problems)
    6: 18000, // Capital of the Unreturned - 18000 XP needed (900-1800 problems)
    7: 35000, // Final Maelstrom - 35000 XP needed (1750-3500 problems)
  };

  private calculateCurrentLayerFromXP(totalXP: number): number {
    // Calculate current layer based on total XP
    if (totalXP >= this.LAYER_XP_THRESHOLDS[7]) return 7;
    if (totalXP >= this.LAYER_XP_THRESHOLDS[6]) return 6;
    if (totalXP >= this.LAYER_XP_THRESHOLDS[5]) return 5;
    if (totalXP >= this.LAYER_XP_THRESHOLDS[4]) return 4;
    if (totalXP >= this.LAYER_XP_THRESHOLDS[3]) return 3;
    if (totalXP >= this.LAYER_XP_THRESHOLDS[2]) return 2;
    return 1;
  }

  private getNextLayerXP(currentLayer: number): number {
    return this.LAYER_XP_THRESHOLDS[Math.min(currentLayer + 1, 7) as keyof typeof this.LAYER_XP_THRESHOLDS] || 0;
  }

  private getCurrentLayerXP(currentLayer: number): number {
    return this.LAYER_XP_THRESHOLDS[currentLayer as keyof typeof this.LAYER_XP_THRESHOLDS] || 0;
  }

  // Climbing session operations
  async createClimbingSession(session: InsertClimbingSession): Promise<ClimbingSession> {
    const [newSession] = await db
      .insert(climbingSessions)
      .values({
        ...session,
        status: "active"
      })
      .returning();
    return newSession;
  }

  async getClimbingSession(id: number): Promise<ClimbingSession | undefined> {
    const [session] = await db
      .select()
      .from(climbingSessions)
      .where(eq(climbingSessions.id, id));
    return session;
  }

  async getUserClimbingSessions(userId: string, limit = 10): Promise<ClimbingSession[]> {
    return await db
      .select()
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId))
      .orderBy(desc(climbingSessions.createdAt))
      .limit(limit);
  }

  async getActiveSession(userId: string): Promise<ClimbingSession | undefined> {
    const [session] = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          or(
            eq(climbingSessions.status, "active"),
            eq(climbingSessions.status, "paused")
          ),
          sql`${climbingSessions.endTime} IS NULL`
        )
      )
      .orderBy(desc(climbingSessions.createdAt))
      .limit(1);
    return session;
  }

  async updateClimbingSession(id: number, updates: Partial<ClimbingSession>): Promise<ClimbingSession> {
    const [updatedSession] = await db
      .update(climbingSessions)
      .set(updates)
      .where(eq(climbingSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Boulder problem operations
  async createBoulderProblem(problem: InsertBoulderProblem): Promise<BoulderProblem> {
    const [newProblem] = await db
      .insert(boulderProblems)
      .values(problem)
      .returning();
    return newProblem;
  }

  async getBoulderProblemsForSession(sessionId: number): Promise<BoulderProblem[]> {
    return await db
      .select()
      .from(boulderProblems)
      .where(eq(boulderProblems.sessionId, sessionId))
      .orderBy(desc(boulderProblems.createdAt));
  }

  // Quest operations
  async createQuest(quest: InsertQuest): Promise<Quest> {
    const [newQuest] = await db
      .insert(quests)
      .values(quest)
      .returning();
    return newQuest;
  }

  async getUserQuests(userId: string, status?: string): Promise<Quest[]> {
    const whereClause = status 
      ? and(eq(quests.userId, userId), eq(quests.status, status))
      : eq(quests.userId, userId);

    return await db
      .select()
      .from(quests)
      .where(whereClause)
      .orderBy(desc(quests.createdAt));
  }

  async getUserQuestsInDateRange(userId: string, startDate: Date, endDate: Date): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          gte(quests.createdAt, startDate),
          lt(quests.createdAt, endDate)
        )
      )
      .orderBy(desc(quests.createdAt));
  }

  async getUserCompletedQuestsToday(userId: string): Promise<Quest[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          eq(quests.status, "completed"),
          gte(quests.completedAt, today),
          lt(quests.completedAt, tomorrow)
        )
      )
      .orderBy(desc(quests.completedAt));
  }

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest> {
    const [updatedQuest] = await db
      .update(quests)
      .set(updates)
      .where(eq(quests.id, id))
      .returning();
    return updatedQuest;
  }

  async getExpiredQuests(now: Date): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(and(
        eq(quests.status, "active"),
        lt(quests.expiresAt, now)
      ));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users);
  }

  async getUserQuestsByType(userId: string, questType: string, status?: string): Promise<Quest[]> {
    const conditions = [
      eq(quests.userId, userId),
      eq(quests.questType, questType)
    ];

    if (status) {
      conditions.push(eq(quests.status, status));
    }

    return await db
      .select()
      .from(quests)
      .where(and(...conditions))
      .orderBy(desc(quests.createdAt));
  }

  // Skill operations
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId))
      .orderBy(desc(skills.totalProblems));
  }

  async updateSkill(id: number, updates: Partial<Skill>): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set(updates)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async upsertUserSkill(userId: string, skillType: string, grade: string, mainCategory: string, subCategory: string): Promise<Skill> {
    console.log(`[SKILL UPDATE] Processing skill: ${skillType}, grade: ${grade}, mainCategory: ${mainCategory}, subCategory: ${subCategory}`);

    // Check if skill exists
    const existingSkill = await db
      .select()
      .from(skills)
      .where(and(
        eq(skills.userId, userId), 
        eq(skills.skillType, skillType),
        eq(skills.mainCategory, mainCategory),
        eq(skills.subCategory, subCategory)
      ))
      .limit(1);

    if (existingSkill.length > 0) {
      // Update existing skill if this grade is higher
      const skill = existingSkill[0];
      const currentGradeNum = this.getGradeNumericValue(skill.maxGrade || "V0");
      const newGradeNum = this.getGradeNumericValue(grade);
      const xpGained = newGradeNum * 10; // 10 XP per grade level

      console.log(`[SKILL UPDATE] Existing skill found: ${skill.skillType}, current grade: ${skill.maxGrade} (${currentGradeNum}), new grade: ${grade} (${newGradeNum})`);

      if (newGradeNum > currentGradeNum) {
        const [updatedSkill] = await db
          .update(skills)
          .set({ 
            maxGrade: grade,
            totalProblems: (skill.totalProblems || 0) + 1,
            xp: (skill.xp || 0) + xpGained,
            level: Math.min(10, Math.floor(((skill.xp || 0) + xpGained) / 100) + 1),
            updatedAt: new Date()
          })
          .where(eq(skills.id, skill.id))
          .returning();
        console.log(`[SKILL UPDATE] Updated skill with new max grade: ${updatedSkill.maxGrade}, XP: ${updatedSkill.xp}, Level: ${updatedSkill.level}`);
        return updatedSkill;
      } else {
        // Just increment problem count and XP
        const [updatedSkill] = await db
          .update(skills)
          .set({ 
            totalProblems: (skill.totalProblems || 0) + 1,
            xp: (skill.xp || 0) + xpGained,
            level: Math.min(10, Math.floor(((skill.xp || 0) + xpGained) / 100) + 1),
            updatedAt: new Date()
          })
          .where(eq(skills.id, skill.id))
          .returning();
        console.log(`[SKILL UPDATE] Updated skill with same grade: problems: ${updatedSkill.totalProblems}, XP: ${updatedSkill.xp}, Level: ${updatedSkill.level}`);
        return updatedSkill;
      }
    } else {
      // Create new skill
      const newGradeNum = this.getGradeNumericValue(grade);
      const [newSkill] = await db
        .insert(skills)
        .values({
          userId,
          category: `${mainCategory}`, // Keep old category field for compatibility
          mainCategory,
          subCategory,
          skillType,
          maxGrade: grade,
          totalProblems: 1,
          xp: newGradeNum * 10,
          level: Math.min(10, Math.floor((newGradeNum * 10) / 100) + 1),
        })
        .returning();
      console.log(`[SKILL UPDATE] Created new skill: ${newSkill.skillType}, grade: ${newSkill.maxGrade}, XP: ${newSkill.xp}, Level: ${newSkill.level}`);
      return newSkill;
    }
  }

  async initializeUserSkillTree(userId: string): Promise<void> {
    // Import the skill tree structure
    const { CLIMBING_SKILL_TREE } = await import("@shared/skillTree");

    // Initialize basic skills for new users
    const basicSkills: InsertSkill[] = [];

    for (const category of CLIMBING_SKILL_TREE) {
      for (const subcategory of category.subcategories) {
        // Initialize with one basic skill per subcategory
        const basicSkillType = subcategory.skillTypes[0];
        basicSkills.push({
          userId,
          category: category.name, // Keep old category field for compatibility
          mainCategory: category.id,
          subCategory: subcategory.id,
          skillType: basicSkillType,
          maxGrade: "V0",
          totalProblems: 0,
          xp: 0,
          level: 1,
        });
      }
    }

    // Only create skills that don't already exist
    for (const skill of basicSkills) {
      const existing = await db.select().from(skills).where(
        and(
          eq(skills.userId, userId),
          eq(skills.skillType, skill.skillType),
          eq(skills.mainCategory, skill.mainCategory),
          eq(skills.subCategory, skill.subCategory)
        )
      );

      if (existing.length === 0) {
        await this.createSkill(skill);
      }
    }
  }

  private getGradeNumericValue(grade: string): number {
    const match = grade.match(/V(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Achievement operations
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async createWorkoutSession(workout: InsertWorkoutSession): Promise<WorkoutSession> {
    const [created] = await db
      .insert(workoutSessions)
      .values(workout)
      .returning();
    return created;
  }

  async getUserWorkoutSessions(userId: string, limit = 10): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.createdAt))
      .limit(limit);
  }

  async getWorkoutSession(id: number): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id));
    return session;
  }

  async updateWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const [updated] = await db
      .update(workoutSessions)
      .set(updates)
      .where(eq(workoutSessions.id, id))
      .returning();
    return updated;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalProblems: number;
    totalXP: number;
    bestGrade: string;
    weeklyStats: {
      problems: number;
      xp: number;
      time: number;
    };
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get total climbing sessions
    const totalClimbingSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId));

    // Get total workout sessions
    const totalWorkoutSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId));

    const totalSessions = totalClimbingSessions[0]?.count || 0;
    const totalWorkouts = totalWorkoutSessions[0]?.count || 0;

    // Get total problems
    const totalProblems = await db
      .select({ count: sql<number>`count(*)` })
      .from(boulderProblems)
      .innerJoin(climbingSessions, eq(boulderProblems.sessionId, climbingSessions.id))
      .where(eq(climbingSessions.userId, userId));

    // Get weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentSessions = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, weekAgo)
        )
      );

    const recentWorkouts = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.createdAt, weekAgo)
        )
      );

    const recentProblems = await db
      .select()
      .from(boulderProblems)
      .innerJoin(climbingSessions, eq(boulderProblems.sessionId, climbingSessions.id))
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, weekAgo)
        )
      );

    const weeklyTime = recentSessions.reduce((total, session) => total + (session.duration || 0), 0) +
                     recentWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
    const weeklyXP = recentSessions.reduce((total, session) => total + (session.xpEarned || 0), 0) +
                    recentWorkouts.reduce((total, workout) => total + (workout.xpEarned || 0), 0);

    // Get completed quests count
    const completedQuests = await db
      .select({ count: sql<number>`count(*)` })
      .from(quests)
      .where(and(eq(quests.userId, userId), eq(quests.status, "completed")));

    // Get quests completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const questsCompletedToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(quests)
      .where(and(
        eq(quests.userId, userId),
        eq(quests.status, "completed"),
        gte(quests.completedAt, today)
      ));

    // Get longest session duration
    const longestSession = await db
      .select({ duration: climbingSessions.duration })
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId))
      .orderBy(desc(climbingSessions.duration))
      .limit(1);

    // Get best grade (highest completed)
    const bestGradeResult = await db
      .select({ grade: boulderProblems.grade })
      .from(boulderProblems)
      .innerJoin(climbingSessions, eq(boulderProblems.sessionId, climbingSessions.id))
      .where(and(eq(climbingSessions.userId, userId), eq(boulderProblems.completed, true)))
      .orderBy(desc(boulderProblems.grade))
      .limit(1);

    const bestGrade = bestGradeResult[0]?.grade || "V0";
    const highestGradeNumeric = this.getGradeNumericValue(bestGrade);

    // Get first attempt successes
    const firstAttemptSuccesses = await db
      .select({ count: sql<number>`count(*)` })
      .from(boulderProblems)
      .innerJoin(climbingSessions, eq(boulderProblems.sessionId, climbingSessions.id))
      .where(and(
        eq(climbingSessions.userId, userId),
        eq(boulderProblems.completed, true),
        eq(boulderProblems.attempts, 1)
      ));

    // Get skill categories completed
    const skillCategoriesCompleted = await db
      .select({ mainCategory: skills.mainCategory })
      .from(skills)
      .where(and(eq(skills.userId, userId), isNotNull(skills.mainCategory)))
      .groupBy(skills.mainCategory);

    // Get workout type statistics
    const allWorkouts = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId));

    const strengthWorkouts = allWorkouts.filter(w => w.type === 'strength').length;
    const meditationSessions = allWorkouts.filter(w => w.type === 'meditation').length;
    const stretchingSessions = allWorkouts.filter(w => w.type === 'stretching').length;

    // Get current layer from XP
    const currentLayer = this.calculateCurrentLayerFromXP(user.totalXP || 0);

    // Calculate consecutive session days
    const allSessions = await db
      .select()
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId))
      .orderBy(desc(climbingSessions.createdAt));

    const sessionDates = allSessions
      .map(s => new Date(s.createdAt).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
      .sort();

    let consecutiveSessionDays = 0;