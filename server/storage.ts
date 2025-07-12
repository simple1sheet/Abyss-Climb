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
  type Achievement,
  type InsertAchievement,
  type Skill,
  type InsertSkill,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

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
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest>;
  
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
  
  // Skill operations
  getUserSkills(userId: string): Promise<Skill[]>;
  upsertSkill(skill: InsertSkill): Promise<Skill>;
  updateSkillXP(userId: string, skillType: string, xp: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest> {
    const [updatedQuest] = await db
      .update(quests)
      .set(updates)
      .where(eq(quests.id, id))
      .returning();
    return updatedQuest;
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

  // Skill operations
  async getUserSkills(userId: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId))
      .orderBy(desc(skills.level));
  }

  async upsertSkill(skill: InsertSkill): Promise<Skill> {
    const [existingSkill] = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.userId, skill.userId),
          eq(skills.skillType, skill.skillType)
        )
      );

    if (existingSkill) {
      const [updatedSkill] = await db
        .update(skills)
        .set({
          ...skill,
          updatedAt: new Date(),
        })
        .where(eq(skills.id, existingSkill.id))
        .returning();
      return updatedSkill;
    } else {
      const [newSkill] = await db
        .insert(skills)
        .values(skill)
        .returning();
      return newSkill;
    }
  }

  async updateSkillXP(userId: string, skillType: string, xp: number): Promise<void> {
    const [skill] = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.userId, userId),
          eq(skills.skillType, skillType)
        )
      );

    if (skill) {
      const newXP = (skill.xp || 0) + xp;
      const newLevel = Math.floor(newXP / 100) + 1; // Level up every 100 XP
      
      await db
        .update(skills)
        .set({
          xp: newXP,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(skills.id, skill.id));
    } else {
      // Create new skill if it doesn't exist
      await this.upsertSkill({
        userId,
        skillType,
        level: 1,
        xp,
      });
    }
  }
}

export const storage = new DatabaseStorage();
