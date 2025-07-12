import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { questGenerator } from "./services/questGenerator";
import { gradeConverter } from "./services/gradeConverter";
import { analyzeClimbingProgress, provideCoachFeedback } from "./services/openai";
import { skillManager } from "./services/skillManager";
import { insertClimbingSessionSchema, insertBoulderProblemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Initialize skills for new users
      await skillManager.initializeUserSkills(userId);
      
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

  // Climbing sessions
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      const session = await storage.updateClimbingSession(sessionId, updates);
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
      
      // Update quest progress
      await questGenerator.updateQuestProgress(userId, problem.grade, problem.style || undefined);
      
      // Update skills
      await skillManager.updateSkillFromProblem(userId, problem.grade, problem.style || undefined, problem.completed || false);
      
      // Update user progression (layer and whistle level)
      await skillManager.updateUserProgression(userId);
      
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

  app.post('/api/quests/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await questGenerator.generateQuestForUser(userId);
      res.json({ message: "Quest generated successfully" });
    } catch (error) {
      console.error("Error generating quest:", error);
      res.status(500).json({ message: "Failed to generate quest" });
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

  // Skills routes
  app.get("/api/skills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  // Coach feedback routes
  app.post("/api/coach/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const { type, data } = req.body;
      const feedback = await provideCoachFeedback(type, data);
      res.json(feedback);
    } catch (error) {
      console.error("Error providing coach feedback:", error);
      res.status(500).json({ message: "Failed to provide coach feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
