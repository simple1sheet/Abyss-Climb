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
    completedQuests: number;
    questsCompletedToday: number;
    longestSession: number;
    highestGradeNumeric: number;
    firstAttemptSuccesses: number;
    skillCategoriesCompleted: number;
    totalWorkouts: number;
    strengthWorkouts: number;
    meditationSessions: number;
    stretchingSessions: number;
    apkBuilds: number;
    developerResets: number;
    gradeSystemChanges: number;
    currentLayer: number;
    consecutiveSessionDays: number;
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
    if (sessionDates.length > 0) {
      consecutiveSessionDays = 1;
      for (let i = sessionDates.length - 1; i > 0; i--) {
        const currentDate = new Date(sessionDates[i]);
        const previousDate = new Date(sessionDates[i - 1]);
        const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          consecutiveSessionDays++;
        } else {
          break;
        }
      }
    }

    return {
      totalSessions: totalSessions,
      totalProblems: totalProblems[0]?.count || 0,
      totalXP: user.totalXP || 0,
      bestGrade,
      completedQuests: completedQuests[0]?.count || 0,
      questsCompletedToday: questsCompletedToday[0]?.count || 0,
      longestSession: longestSession[0]?.duration || 0,
      highestGradeNumeric,
      firstAttemptSuccesses: firstAttemptSuccesses[0]?.count || 0,
      skillCategoriesCompleted: skillCategoriesCompleted.length,
      totalWorkouts,
      strengthWorkouts,
      meditationSessions,
      stretchingSessions,
      apkBuilds: 0, // TODO: Add tracking for APK builds
      developerResets: 0, // TODO: Add tracking for developer resets
      gradeSystemChanges: 0, // TODO: Add tracking for grade system changes
      currentLayer,
      consecutiveSessionDays,
      weeklyStats: {
        problems: recentProblems.length,
        xp: weeklyXP,
        time: weeklyTime,
      },
    };
  }

  async getLayerProgressInfo(userId: string): Promise<{
    currentLayer: number;
    currentXP: number;
    currentLayerXP: number;
    nextLayerXP: number;
    progressToNextLayer: number;
    layerProgress: number;
  }> {
    const user = await this.getUser(userId);
    const currentXP = user?.totalXP || 0;
    
    // Use user's actual current layer (not XP-based calculation)
    // Layer advancement must be done explicitly through layer quest completion
    const currentLayer = user?.currentLayer || 1;
    
    const currentLayerXP = this.getCurrentLayerXP(currentLayer);
    const nextLayerXP = this.getNextLayerXP(currentLayer);
    
    // Calculate progress within current layer
    const progressToNextLayer = Math.max(0, currentXP - currentLayerXP);
    const layerXPRange = nextLayerXP - currentLayerXP;
    const layerProgress = currentLayer === 7 ? 100 : Math.min(100, (progressToNextLayer / layerXPRange) * 100);

    return {
      currentLayer,
      currentXP,
      currentLayerXP,
      nextLayerXP,
      progressToNextLayer,
      layerProgress,
    };
  }

  // Whistle progress operations
  async getWhistleProgressStats(userId: string): Promise<{
    averageGradePast7Days: string;
    questsCompletedToday: number;
    maxDailyQuests: number;
    topSkillCategory: string;
    sessionsThisWeek: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get average grade from past 7 days
    const recentSessions = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, sevenDaysAgo)
        )
      );

    const sessionIds = recentSessions.map(session => session.id);
    let averageGrade = "V0";
    
    if (sessionIds.length > 0) {
      // Get all problems from recent sessions
      const recentProblems = [];
      for (const sessionId of sessionIds) {
        const problems = await db
          .select()
          .from(boulderProblems)
          .where(
            and(
              eq(boulderProblems.sessionId, sessionId),
              eq(boulderProblems.completed, true)
            )
          );
        recentProblems.push(...problems);
      }

      if (recentProblems.length > 0) {
        const gradeNums = recentProblems.map(p => this.getGradeNumericValue(p.grade));
        const avgGradeNum = gradeNums.reduce((a, b) => a + b, 0) / gradeNums.length;
        averageGrade = `V${Math.round(avgGradeNum)}`;
      } else {
        averageGrade = "N/A";
      }
    }

    // Get quests completed today
    const questsToday = await db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          gte(quests.createdAt, startOfToday),
          eq(quests.status, 'completed')
        )
      );

    // Get sessions this week
    const sessionsThisWeek = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, startOfWeek)
        )
      );

    // Get top skill category
    const userSkills = await this.getUserSkills(userId);
    const categoryCounts = {
      'Grip & Handwork': 0,
      'Body & Power': 0,
      'Balance & Flow': 0,
      'Mind & Strategy': 0,
      'Skill Challenges': 0
    };

    userSkills.forEach(skill => {
      const skillType = skill.skillType.toLowerCase();
      if (['jugs', 'crimps', 'endurance', 'pinches', 'slopers', 'pockets', 'underclings', 'gaston'].includes(skillType)) {
        categoryCounts['Grip & Handwork']++;
      } else if (['strength', 'dynos', 'mantles', 'campus', 'lockoffs', 'core', 'roofs'].includes(skillType)) {
        categoryCounts['Body & Power']++;
      } else if (['movement', 'balance', 'flexibility', 'stemming', 'flagging', 'heel_hooks', 'toe_hooks'].includes(skillType)) {
        categoryCounts['Balance & Flow']++;
      } else if (['slabs', 'technical', 'reading', 'sequencing', 'risk_management', 'mental_game'].includes(skillType)) {
        categoryCounts['Mind & Strategy']++;
      } else {
        categoryCounts['Skill Challenges']++;
      }
    });

    const topSkillCategory = userSkills.length > 0 
      ? Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      : 'N/A';

    return {
      averageGradePast7Days: averageGrade,
      questsCompletedToday: questsToday.length,
      maxDailyQuests: 3, // Standard max daily quests
      topSkillCategory,
      sessionsThisWeek: sessionsThisWeek.length
    };
  }

  // Enhanced progress operations
  async getEnhancedProgressStats(userId: string): Promise<{
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
    enhancedStats: {
      totalSessions: number;
      totalProblems: number;
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
  }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user skills to calculate whistle level
    const userSkills = await this.getUserSkills(userId);
    const whistleLevel = this.calculateWhistleLevel(userSkills);
    
    // Whistle XP thresholds (exponential scaling)
    const whistleXPThresholds = {
      0: 0,     // Bell Whistle
      1: 0,     // Red Whistle (starts at 0 until first climb)
      2: 500,   // Blue Whistle
      3: 1500,  // Moon Whistle
      4: 3500,  // Black Whistle
      5: 7500,  // White Whistle
    };

    const whistleNames = {
      0: 'Bell Whistle',
      1: 'Red Whistle',
      2: 'Blue Whistle', 
      3: 'Moon Whistle',
      4: 'Black Whistle',
      5: 'White Whistle'
    };

    const currentXP = user.totalXP || 0;
    const nextLevelXP = whistleXPThresholds[Math.min(whistleLevel + 1, 5) as keyof typeof whistleXPThresholds] || 7500;
    const currentLevelXP = whistleXPThresholds[whistleLevel as keyof typeof whistleXPThresholds] || 0;
    const whistleProgress = Math.min(((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);

    // Get weekly XP breakdown
    const recentSessions = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, sevenDaysAgo)
        )
      );

    let weeklyXP = 0;
    let weeklyProblems = 0;
    let weeklyTime = 0;
    const allGrades: string[] = [];

    for (const session of recentSessions) {
      const problems = await this.getBoulderProblemsForSession(session.id);
      weeklyXP += session.totalXP || 0;
      weeklyProblems += problems.length;
      
      // Calculate session time (assuming 2 hours default if not specified)
      const sessionTime = session.endTime && session.createdAt 
        ? (new Date(session.endTime).getTime() - new Date(session.createdAt).getTime()) / (1000 * 60 * 60)
        : 2;
      weeklyTime += sessionTime;

      problems.forEach(p => {
        if (p.completed) {
          allGrades.push(p.grade);
        }
      });
    }

    // Calculate average grade
    let averageGrade = "N/A";
    if (allGrades.length > 0) {
      const gradeNums = allGrades.map(g => this.getGradeNumericValue(g));
      const avgGradeNum = gradeNums.reduce((a, b) => a + b, 0) / gradeNums.length;
      averageGrade = `V${Math.round(avgGradeNum)}`;
    }

    // Get enhanced statistics
    const allSessions = await db
      .select()
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId));

    const allWorkouts = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId));

    const allProblems = [];
    for (const session of allSessions) {
      const problems = await this.getBoulderProblemsForSession(session.id);
      allProblems.push(...problems);
    }

    const completedProblems = allProblems.filter(p => p.completed);
    const bestGrade = completedProblems.length > 0 
      ? completedProblems.reduce((max, p) => {
          const maxNum = this.getGradeNumericValue(max);
          const pNum = this.getGradeNumericValue(p.grade);
          return pNum > maxNum ? p.grade : max;
        }, "V0")
      : "N/A";

    // Calculate session consistency (sessions per week over past 30 days)
    const sessionsLast30Days = await db
      .select()
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          gte(climbingSessions.createdAt, thirtyDaysAgo)
        )
      );

    const sessionConsistency = (sessionsLast30Days.length / 30) * 7; // sessions per week

    // Get personal milestones
    const firstV5Send = await db
      .select({ date: boulderProblems.createdAt })
      .from(boulderProblems)
      .innerJoin(climbingSessions, eq(boulderProblems.sessionId, climbingSessions.id))
      .where(
        and(
          eq(climbingSessions.userId, userId),
          eq(boulderProblems.completed, true),
          sql`${boulderProblems.grade} >= 'V5'`
        )
      )
      .orderBy(boulderProblems.createdAt)
      .limit(1);

    const firstOutdoorSession = await db
      .select({ date: climbingSessions.createdAt })
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, userId),
          eq(climbingSessions.sessionType, 'outdoor')
        )
      )
      .orderBy(climbingSessions.createdAt)
      .limit(1);

    // Find best session (highest XP)
    const bestSession = allSessions.reduce((best, session) => {
      const sessionXP = session.totalXP || 0;
      const bestXP = best.totalXP || 0;
      return sessionXP > bestXP ? session : best;
    }, allSessions[0] || { totalXP: 0, createdAt: new Date(), id: 0 });

    const bestSessionProblems = bestSession.id 
      ? await this.getBoulderProblemsForSession(bestSession.id)
      : [];

    // Calculate longest streak (consecutive days with sessions)
    const allSessionDates = allSessions
      .map(s => new Date(s.createdAt).toDateString())
      .sort();
    
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate = null;

    for (const dateStr of allSessionDates) {
      const date = new Date(dateStr);
      if (previousDate) {
        const daysDiff = Math.floor((date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      previousDate = date;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      whistleLevel,
      whistleName: whistleNames[whistleLevel as keyof typeof whistleNames] || 'Red Whistle',
      currentXP,
      nextLevelXP,
      whistleProgress,
      xpBreakdown: {
        weeklyXP,
        problemsSolved: weeklyProblems,
        averageGrade
      },
      enhancedStats: {
        totalSessions: allSessions.length,
        totalProblems: allProblems.length,
        totalWorkouts: allWorkouts.length,
        weeklyTime,
        bestGrade,
        averageGrade7d: averageGrade,
        sessionConsistency: Math.round(sessionConsistency * 10) / 10,
        weeklyStats: {
          problems: weeklyProblems,
          xp: weeklyXP,
          time: weeklyTime
        }
      },
      milestones: {
        firstV5Send: firstV5Send[0]?.date,
        firstOutdoorSession: firstOutdoorSession[0]?.date,
        longestStreak,
        bestSession: {
          date: bestSession.createdAt,
          xp: bestSession.totalXP || 0,
          problems: bestSessionProblems.length
        }
      }
    };
  }

  // Layer quest operations
  async createLayerQuest(layerQuest: InsertLayerQuest): Promise<LayerQuest> {
    const [quest] = await db.insert(layerQuests).values(layerQuest).returning();
    return quest;
  }

  async getLayerQuestByLayer(userId: string, layer: number): Promise<LayerQuest | undefined> {
    const [quest] = await db.select().from(layerQuests)
      .where(and(eq(layerQuests.userId, userId), eq(layerQuests.layer, layer)));
    return quest;
  }

  async updateLayerQuest(id: number, updates: Partial<LayerQuest>): Promise<LayerQuest> {
    const [quest] = await db.update(layerQuests).set(updates).where(eq(layerQuests.id, id)).returning();
    return quest;
  }

  // Developer operations
  async resetUserData(userId: string): Promise<void> {
    // Delete all user data in the correct order (due to foreign key constraints)
    
    // Get all session IDs for this user first
    const userSessions = await db.select({ id: climbingSessions.id })
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId));
    
    const sessionIds = userSessions.map(session => session.id);
    
    // Delete boulder problems first (they reference climbing sessions)
    if (sessionIds.length > 0) {
      await db.delete(boulderProblems)
        .where(inArray(boulderProblems.sessionId, sessionIds));
    }
    
    // Delete climbing sessions
    await db.delete(climbingSessions)
      .where(eq(climbingSessions.userId, userId));
    
    // Delete quests
    await db.delete(quests)
      .where(eq(quests.userId, userId));
    
    // Delete achievements
    await db.delete(achievements)
      .where(eq(achievements.userId, userId));
    
    // Delete skills
    await db.delete(skills)
      .where(eq(skills.userId, userId));
    
    // Delete workout sessions
    await db.delete(workoutSessions)
      .where(eq(workoutSessions.userId, userId));
    
    // Delete layer quests
    await db.delete(layerQuests)
      .where(eq(layerQuests.userId, userId));
    
    // Delete relics
    await db.delete(relics)
      .where(eq(relics.userId, userId));
    
    // Reset user stats but keep the user account
    await db.update(users)
      .set({
        currentLayer: 1,
        whistleLevel: 0, // Start at Bell whistle
        totalXP: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    console.log(`All data reset for user ${userId}`);
  }

  // Nanachi Memory operations
  async createNanachiMemory(memory: InsertNanachiMemory): Promise<NanachiMemory> {
    const [result] = await db.insert(nanachiMemories).values(memory).returning();
    return result;
  }

  async getUserNanachiMemories(userId: string): Promise<NanachiMemory[]> {
    return await db.select().from(nanachiMemories)
      .where(eq(nanachiMemories.userId, userId))
      .orderBy(desc(nanachiMemories.createdAt));
  }

  async getNanachiMemoriesByType(userId: string, type: string): Promise<NanachiMemory[]> {
    return await db.select().from(nanachiMemories)
      .where(and(
        eq(nanachiMemories.userId, userId),
        eq(nanachiMemories.memoryType, type)
      ))
      .orderBy(desc(nanachiMemories.createdAt));
  }

  async updateNanachiMemory(id: number, updates: Partial<NanachiMemory>): Promise<NanachiMemory> {
    const [result] = await db.update(nanachiMemories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nanachiMemories.id, id))
      .returning();
    return result;
  }

  async cleanupExpiredNanachiMemories(): Promise<void> {
    await db.delete(nanachiMemories)
      .where(and(
        isNotNull(nanachiMemories.expiresAt),
        lt(nanachiMemories.expiresAt, new Date())
      ));
  }

  async getImportantNanachiMemories(userId: string, limit: number): Promise<NanachiMemory[]> {
    return await db.select().from(nanachiMemories)
      .where(eq(nanachiMemories.userId, userId))
      .orderBy(desc(nanachiMemories.importance), desc(nanachiMemories.createdAt))
      .limit(limit);
  }

  // Nutrition operations
  async createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry> {
    const [result] = await db.insert(nutritionEntries).values(entry).returning();
    return result;
  }

  async getUserNutritionEntries(userId: string, date?: Date): Promise<NutritionEntry[]> {
    let query = db.select().from(nutritionEntries)
      .where(eq(nutritionEntries.userId, userId));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(and(
        eq(nutritionEntries.userId, userId),
        gte(nutritionEntries.consumedAt, startOfDay),
        lte(nutritionEntries.consumedAt, endOfDay)
      ));
    }
    
    return await query.orderBy(desc(nutritionEntries.consumedAt));
  }

  async getNutritionEntriesByMealType(userId: string, mealType: string, date?: Date): Promise<NutritionEntry[]> {
    let query = db.select().from(nutritionEntries)
      .where(and(
        eq(nutritionEntries.userId, userId),
        eq(nutritionEntries.mealType, mealType)
      ));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(and(
        eq(nutritionEntries.userId, userId),
        eq(nutritionEntries.mealType, mealType),
        gte(nutritionEntries.consumedAt, startOfDay),
        lte(nutritionEntries.consumedAt, endOfDay)
      ));
    }
    
    return await query.orderBy(desc(nutritionEntries.consumedAt));
  }

  async updateNutritionEntry(id: number, updates: Partial<NutritionEntry>): Promise<NutritionEntry> {
    const [result] = await db.update(nutritionEntries)
      .set(updates)
      .where(eq(nutritionEntries.id, id))
      .returning();
    return result;
  }

  async deleteNutritionEntry(id: number): Promise<void> {
    await db.delete(nutritionEntries)
      .where(eq(nutritionEntries.id, id));
  }

  async createNutritionGoal(goal: InsertNutritionGoal): Promise<NutritionGoal> {
    const [result] = await db.insert(nutritionGoals).values(goal).returning();
    return result;
  }

  async getUserNutritionGoal(userId: string): Promise<NutritionGoal | undefined> {
    const [goal] = await db.select().from(nutritionGoals)
      .where(eq(nutritionGoals.userId, userId))
      .orderBy(desc(nutritionGoals.createdAt))
      .limit(1);
    return goal;
  }

  async updateNutritionGoal(id: number, updates: Partial<NutritionGoal>): Promise<NutritionGoal> {
    const [result] = await db.update(nutritionGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nutritionGoals.id, id))
      .returning();
    return result;
  }

  async createNutritionRecommendation(recommendation: InsertNutritionRecommendation): Promise<NutritionRecommendation> {
    const [result] = await db.insert(nutritionRecommendations).values(recommendation).returning();
    return result;
  }

  async getUserNutritionRecommendations(userId: string): Promise<NutritionRecommendation[]> {
    return await db.select().from(nutritionRecommendations)
      .where(and(
        eq(nutritionRecommendations.userId, userId),
        eq(nutritionRecommendations.isActive, true)
      ))
      .orderBy(desc(nutritionRecommendations.priority), desc(nutritionRecommendations.createdAt));
  }

  async updateNutritionRecommendation(id: number, updates: Partial<NutritionRecommendation>): Promise<NutritionRecommendation> {
    const [result] = await db.update(nutritionRecommendations)
      .set(updates)
      .where(eq(nutritionRecommendations.id, id))
      .returning();
    return result;
  }

  async deleteNutritionRecommendation(id: number): Promise<void> {
    await db.delete(nutritionRecommendations)
      .where(eq(nutritionRecommendations.id, id));
  }

  async getNutritionSummary(userId: string, date?: Date): Promise<{
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
  }> {
    const entries = await this.getUserNutritionEntries(userId, date);
    
    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      mealBreakdown: {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        snack: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      }
    };

    for (const entry of entries) {
      const calories = entry.calories || 0;
      const protein = parseFloat(entry.protein) || 0;
      const carbs = parseFloat(entry.carbs) || 0;
      const fat = parseFloat(entry.fat) || 0;
      const fiber = parseFloat(entry.fiber) || 0;
      
      summary.totalCalories += calories;
      summary.totalProtein += protein;
      summary.totalCarbs += carbs;
      summary.totalFat += fat;
      summary.totalFiber += fiber;
      
      const mealType = entry.mealType as keyof typeof summary.mealBreakdown;
      if (summary.mealBreakdown[mealType]) {
        summary.mealBreakdown[mealType].calories += calories;
        summary.mealBreakdown[mealType].protein += protein;
        summary.mealBreakdown[mealType].carbs += carbs;
        summary.mealBreakdown[mealType].fat += fat;
      }
    }

    return summary;
  }

  // Relic operations
  async createRelic(relic: InsertRelic): Promise<Relic> {
    const [result] = await db.insert(relics).values(relic).returning();
    return result;
  }

  async getUserRelics(userId: string): Promise<Relic[]> {
    return await db.select().from(relics)
      .where(eq(relics.userId, userId))
      .orderBy(desc(relics.foundAt));
  }

  async getUserRelicsByRarity(userId: string, rarity: string): Promise<Relic[]> {
    return await db.select().from(relics)
      .where(and(
        eq(relics.userId, userId),
        eq(relics.rarity, rarity)
      ))
      .orderBy(desc(relics.foundAt));
  }

  async getRelic(id: number): Promise<Relic | undefined> {
    const [relic] = await db.select().from(relics)
      .where(eq(relics.id, id));
    return relic;
  }
}

export const storage = new DatabaseStorage();
