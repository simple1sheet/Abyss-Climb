import {
  users,
  climbingSessions,
  boulderProblems,
  quests,
  achievements,
  skills,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, lt, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Climbing session operations
  createClimbingSession(session: InsertClimbingSession): Promise<ClimbingSession>;
  getClimbingSession(id: number): Promise<ClimbingSession | undefined>;
  getUserClimbingSessions(userId: string, limit?: number): Promise<ClimbingSession[]>;
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
  
  // Skill operations
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: string): Promise<Skill[]>;
  updateSkill(id: number, updates: Partial<Skill>): Promise<Skill>;
  upsertUserSkill(userId: string, skillType: string, grade: string, category: string): Promise<Skill>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Get user's skills to calculate whistle level
    const userSkills = await this.getUserSkills(userData.id);
    const whistleLevel = this.calculateWhistleLevel(userSkills);
    const currentLayer = this.calculateCurrentLayer(whistleLevel);
    
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

  // Climbing session operations
  async createClimbingSession(session: InsertClimbingSession): Promise<ClimbingSession> {
    const [newSession] = await db
      .insert(climbingSessions)
      .values(session)
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

  async upsertUserSkill(userId: string, skillType: string, grade: string, category: string): Promise<Skill> {
    // Check if skill exists
    const existingSkill = await db
      .select()
      .from(skills)
      .where(and(eq(skills.userId, userId), eq(skills.skillType, skillType)))
      .limit(1);

    if (existingSkill.length > 0) {
      // Update existing skill if this grade is higher
      const skill = existingSkill[0];
      const currentGradeNum = this.getGradeNumericValue(skill.maxGrade || "V0");
      const newGradeNum = this.getGradeNumericValue(grade);
      
      if (newGradeNum > currentGradeNum) {
        const [updatedSkill] = await db
          .update(skills)
          .set({ 
            maxGrade: grade,
            totalProblems: (skill.totalProblems || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(skills.id, skill.id))
          .returning();
        return updatedSkill;
      } else {
        // Just increment problem count
        const [updatedSkill] = await db
          .update(skills)
          .set({ 
            totalProblems: (skill.totalProblems || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(skills.id, skill.id))
          .returning();
        return updatedSkill;
      }
    } else {
      // Create new skill
      const [newSkill] = await db
        .insert(skills)
        .values({
          userId,
          category,
          skillType,
          maxGrade: grade,
          totalProblems: 1,
        })
        .returning();
      return newSkill;
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

    // Get total sessions
    const totalSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(climbingSessions)
      .where(eq(climbingSessions.userId, userId));

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

    const weeklyTime = recentSessions.reduce((total, session) => total + (session.duration || 0), 0);
    const weeklyXP = recentSessions.reduce((total, session) => total + (session.xpEarned || 0), 0);

    return {
      totalSessions: totalSessions[0]?.count || 0,
      totalProblems: totalProblems[0]?.count || 0,
      totalXP: user.totalXP || 0,
      bestGrade: "V4", // TODO: Calculate from actual data
      weeklyStats: {
        problems: recentProblems.length,
        xp: weeklyXP,
        time: weeklyTime,
      },
    };
  }
}

export const storage = new DatabaseStorage();
