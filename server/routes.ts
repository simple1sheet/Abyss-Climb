import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { questGenerator } from "./services/questGenerator";
import { gradeConverter } from "./services/gradeConverter";
import { analyzeClimbingProgress } from "./services/openai";
import { insertClimbingSessionSchema, insertBoulderProblemSchema, Quest } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User stats
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/layer-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressInfo = await storage.getLayerProgressInfo(userId);
      res.json(progressInfo);
    } catch (error) {
      console.error("Error fetching layer progress:", error);
      res.status(500).json({ message: "Failed to fetch layer progress" });
    }
  });

  // Climbing sessions
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already has an active session
      const activeSession = await storage.getActiveSession(userId);
      if (activeSession) {
        return res.status(400).json({ 
          message: "You already have an active session",
          activeSession 
        });
      }
      
      const sessionData = insertClimbingSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await storage.createClimbingSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getUserClimbingSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      
      // Convert string dates to Date objects
      if (updates.endTime && typeof updates.endTime === 'string') {
        updates.endTime = new Date(updates.endTime);
      }
      if (updates.startTime && typeof updates.startTime === 'string') {
        updates.startTime = new Date(updates.startTime);
      }
      
      const session = await storage.updateClimbingSession(sessionId, updates);
      
      // Check session-based quests when session is completed
      if (updates.endTime) {
        const userId = req.user.claims.sub;
        // Set status to completed when session ends
        updates.status = "completed";
        await questGenerator.checkSessionQuests(userId, sessionId);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Boulder problems
  app.post('/api/problems', isAuthenticated, async (req: any, res) => {
    try {
      const problemData = insertBoulderProblemSchema.parse(req.body);
      const problem = await storage.createBoulderProblem(problemData);
      
      const userId = req.user.claims.sub;
      
      // Update skill progression if the problem has a style and was completed
      if (problem.style && problem.completed) {
        const category = gradeConverter.getSkillCategoryForStyle(problem.style);
        await storage.upsertUserSkill(userId, problem.style, problem.grade, category);
      }
      
      // Update quest progress
      await questGenerator.updateQuestProgress(userId, problem.grade, problem.style || undefined);
      
      res.json(problem);
    } catch (error) {
      console.error("Error creating problem:", error);
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  app.get('/api/sessions/:id/problems', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const problems = await storage.getBoulderProblemsForSession(sessionId);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  // Get active session
  app.get('/api/sessions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeSession = await storage.getActiveSession(userId);
      res.json(activeSession || null);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Pause session
  app.post('/api/sessions/:id/pause', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const now = new Date();
      
      // Get current session to calculate pause time
      const currentSession = await storage.getClimbingSession(sessionId);
      if (!currentSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const session = await storage.updateClimbingSession(sessionId, {
        status: "paused",
        pausedAt: now
      });
      res.json(session);
    } catch (error) {
      console.error("Error pausing session:", error);
      res.status(500).json({ message: "Failed to pause session" });
    }
  });

  // Resume session
  app.post('/api/sessions/:id/resume', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const now = new Date();
      
      // Get current session to calculate total paused time
      const currentSession = await storage.getClimbingSession(sessionId);
      if (!currentSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      let totalPausedTime = currentSession.totalPausedTime || 0;
      
      // If session was paused, add the pause duration to total paused time
      if (currentSession.pausedAt) {
        const pauseDuration = Math.floor((now.getTime() - currentSession.pausedAt.getTime()) / (1000 * 60));
        totalPausedTime += pauseDuration;
      }
      
      const session = await storage.updateClimbingSession(sessionId, {
        status: "active",
        resumedAt: now,
        totalPausedTime,
        pausedAt: null
      });
      res.json(session);
    } catch (error) {
      console.error("Error resuming session:", error);
      res.status(500).json({ message: "Failed to resume session" });
    }
  });

  // Quests
  app.get('/api/quests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string | undefined;
      const quests = await storage.getUserQuests(userId, status);
      res.json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      res.status(500).json({ message: "Failed to fetch quests" });
    }
  });

  app.get('/api/quests/daily-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dailyQuests = await storage.getUserQuestsInDateRange(userId, today, tomorrow);
      const activeDailyQuests = dailyQuests.filter((q: Quest) => q.status === 'active');
      
      res.json({
        dailyCount: activeDailyQuests.length,
        maxDaily: 3,
        limitReached: activeDailyQuests.length >= 3
      });
    } catch (error) {
      console.error("Error fetching daily quest count:", error);
      res.status(500).json({ message: "Failed to fetch daily quest count" });
    }
  });

  app.get('/api/quests/completion-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const completedToday = await storage.getUserCompletedQuestsToday(userId);
      
      res.json({
        completedToday: completedToday.length,
        maxCompletions: 3,
        completionLimitReached: completedToday.length >= 3
      });
    } catch (error) {
      console.error("Error fetching completion count:", error);
      res.status(500).json({ message: "Failed to fetch completion count" });
    }
  });

  app.post('/api/quests/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check daily quest limit (3 per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dailyQuests = await storage.getUserQuestsInDateRange(userId, today, tomorrow);
      const activeDailyQuests = dailyQuests.filter((q: Quest) => q.status === 'active');
      
      if (activeDailyQuests.length >= 3) {
        return res.status(400).json({ 
          message: "Daily quest limit reached. Come back tomorrow!",
          limitReached: true,
          questCount: activeDailyQuests.length
        });
      }
      
      await questGenerator.generateQuestForUser(userId);
      res.json({ message: "Quest generated successfully" });
    } catch (error) {
      console.error("Error generating quest:", error);
      res.status(500).json({ message: "Failed to generate quest" });
    }
  });

  app.post('/api/quests/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const questId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check daily completion limit (3 per day)
      const completedToday = await storage.getUserCompletedQuestsToday(userId);
      if (completedToday.length >= 3) {
        return res.status(400).json({ 
          message: "Daily completion limit reached. You can only complete 3 quests per day!",
          completionLimitReached: true,
          questCount: completedToday.length
        });
      }
      
      const quest = await storage.updateQuest(questId, {
        status: "completed",
        completedAt: new Date(),
      });
      
      // Award XP to user and check for layer advancement
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalXP = (user.totalXP || 0) + quest.xpReward;
        const updatedUser = await storage.upsertUser({
          ...user,
          totalXP: newTotalXP,
        });
        
        // Check if user advanced to next layer
        const progressInfo = await storage.getLayerProgressInfo(userId);
        if (progressInfo.currentLayer > (user.currentLayer || 1)) {
          console.log(`User ${userId} advanced to layer ${progressInfo.currentLayer}!`);
          // You could add achievement tracking here
        }
      }
      
      res.json(quest);
    } catch (error) {
      console.error("Error completing quest:", error);
      res.status(500).json({ message: "Failed to complete quest" });
    }
  });

  app.post('/api/quests/:id/discard', isAuthenticated, async (req: any, res) => {
    try {
      const questId = parseInt(req.params.id);
      const quest = await storage.updateQuest(questId, {
        status: "discarded",
      });
      res.json(quest);
    } catch (error) {
      console.error("Error discarding quest:", error);
      res.status(500).json({ message: "Failed to discard quest" });
    }
  });

  // Skills
  app.get('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  // Grade conversion
  app.post('/api/grades/convert', isAuthenticated, async (req: any, res) => {
    try {
      const { grade, fromSystem, toSystem } = req.body;
      const convertedGrade = gradeConverter.convertGrade(grade, fromSystem, toSystem);
      res.json({ convertedGrade });
    } catch (error) {
      console.error("Error converting grade:", error);
      res.status(500).json({ message: "Failed to convert grade" });
    }
  });

  // Progress analysis
  app.get('/api/analysis/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserClimbingSessions(userId, 20);
      
      const allProblems = [];
      for (const session of sessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        allProblems.push(...problems);
      }
      
      const analysis = await analyzeClimbingProgress(sessions, allProblems);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing progress:", error);
      res.status(500).json({ message: "Failed to analyze progress" });
    }
  });

  // Achievements
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Manual XP award endpoint (for testing)
  app.post('/api/award-xp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { xp } = req.body;
      
      if (!xp || typeof xp !== 'number') {
        return res.status(400).json({ message: "XP amount must be a number" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newTotalXP = (user.totalXP || 0) + xp;
      const updatedUser = await storage.upsertUser({
        ...user,
        totalXP: newTotalXP,
      });
      
      const progressInfo = await storage.getLayerProgressInfo(userId);
      
      res.json({
        message: `Awarded ${xp} XP`,
        newTotalXP,
        currentLayer: progressInfo.currentLayer,
        layerProgress: progressInfo.layerProgress,
      });
    } catch (error) {
      console.error("Error awarding XP:", error);
      res.status(500).json({ message: "Failed to award XP" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
