import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { questGenerator } from "./services/questGenerator";
import { gradeConverter } from "./services/gradeConverter";
import { xpCalculator } from "./services/xpCalculator";
import { analyzeClimbingProgress, generateWorkout, analyzeQuestCompletion } from "./services/openai";
import { achievementService } from "./services/achievementService";
import { layerQuestService } from "./services/layerQuestService";
import { insertClimbingSessionSchema, insertBoulderProblemSchema, Quest } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { log } from "./vite";

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

  // Update user grade system
  app.patch('/api/user/grade-system', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gradeSystem } = req.body;
      
      if (!gradeSystem || !['V-Scale', 'Font', 'German'].includes(gradeSystem)) {
        return res.status(400).json({ message: "Invalid grade system" });
      }
      
      const updatedUser = await storage.updateUserGradeSystem(userId, gradeSystem);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user grade system:", error);
      res.status(500).json({ message: "Failed to update grade system" });
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

  app.get('/api/whistle-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressStats = await storage.getWhistleProgressStats(userId);
      res.json(progressStats);
    } catch (error) {
      console.error("Error fetching whistle progress:", error);
      res.status(500).json({ message: "Failed to fetch whistle progress" });
    }
  });

  app.get('/api/enhanced-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enhancedStats = await storage.getEnhancedProgressStats(userId);
      res.json(enhancedStats);
    } catch (error) {
      console.error("Error fetching enhanced progress:", error);
      res.status(500).json({ message: "Failed to fetch enhanced progress" });
    }
  });

  app.patch('/api/user/grade-system', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gradeSystem } = req.body;
      
      // Validate grade system
      const validSystems = ["V-Scale", "Font", "German"];
      if (!validSystems.includes(gradeSystem)) {
        return res.status(400).json({ message: "Invalid grade system" });
      }
      
      const updatedUser = await storage.updateUserGradeSystem(userId, gradeSystem);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user grade system:", error);
      res.status(500).json({ message: "Failed to update grade system" });
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

  // Get active session (must come before /:id route)
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

  app.get('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Check if sessionId is valid
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      const session = await storage.getClimbingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Make sure the session belongs to the authenticated user
      if (session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
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
      
      // Set status to completed when session ends
      if (updates.endTime) {
        updates.status = "completed";
      }
      
      const session = await storage.updateClimbingSession(sessionId, updates);
      
      // Check for achievements when session is completed
      if (updates.status === "completed") {
        const userId = req.user.claims.sub;
        await achievementService.checkAndUnlockAchievements(userId);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Complete session endpoint - ensures all XP is properly applied
  app.post('/api/sessions/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Get session and its problems
      const session = await storage.getClimbingSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found or access denied" });
      }
      
      const problems = await storage.getBoulderProblemsForSession(sessionId);
      
      // Calculate total session XP
      const totalSessionXP = problems.reduce((sum, problem) => {
        return sum + (problem.completed ? (problem.xpEarned || 0) : 0);
      }, 0);
      
      // Update session with final XP and mark as completed
      const updatedSession = await storage.updateClimbingSession(sessionId, {
        status: "completed",
        endTime: new Date(),
        xpEarned: totalSessionXP
      });
      
      console.log(`Session ${sessionId} completed with ${totalSessionXP} total XP`);
      
      res.json(updatedSession);
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  // Boulder problems
  app.post('/api/problems', isAuthenticated, async (req: any, res) => {
    try {
      const problemData = insertBoulderProblemSchema.parse(req.body);
      
      // Calculate XP for this problem
      const xpEarned = xpCalculator.calculateProblemXP(
        problemData.grade,
        problemData.gradeSystem || 'V-Scale',
        problemData.completed,
        problemData.attempts,
        problemData.style
      );
      
      // Add XP to the problem data
      const problemWithXP = {
        ...problemData,
        xpEarned
      };
      
      const problem = await storage.createBoulderProblem(problemWithXP);
      
      const userId = req.user.claims.sub;
      
      // Update skill progression if the problem has styles and was completed
      if (problem.style && problem.completed) {
        const styles = problem.style.split(', ').map(s => s.trim());
        
        // Update skill for each style
        for (const style of styles) {
          const categoryInfo = gradeConverter.getSkillCategoryForStyle(style);
          console.log(`Updating skill for style: ${style}, skillType: ${categoryInfo.skillType}, category: ${categoryInfo.mainCategory}, subCategory: ${categoryInfo.subCategory}`);
          await storage.upsertUserSkill(userId, categoryInfo.skillType, problem.grade, categoryInfo.mainCategory, categoryInfo.subCategory);
        }
      }
      
      // Update session XP if problem was completed
      if (problem.completed && problem.xpEarned > 0) {
        console.log(`Problem completed with ${problem.xpEarned} XP for user ${userId}`);
        
        // Get current session XP
        const session = await storage.getClimbingSession(problem.sessionId);
        if (session) {
          const newSessionXP = (session.xpEarned || 0) + problem.xpEarned;
          await storage.updateClimbingSession(problem.sessionId, {
            xpEarned: newSessionXP
          });
          
          // Update user's total XP
          const user = await storage.getUser(userId);
          if (user) {
            const oldTotalXP = user.totalXP || 0;
            const newTotalXP = oldTotalXP + problem.xpEarned;
            console.log(`Updating user XP from ${oldTotalXP} to ${newTotalXP}`);
            
            await storage.upsertUser({
              ...user,
              totalXP: newTotalXP,
            });
            
            console.log(`User XP updated successfully for user ${userId}`);
            
            // Check for achievements after updating XP
            await achievementService.checkAndUnlockAchievements(userId);
          } else {
            console.error(`User ${userId} not found when trying to update XP`);
          }
        } else {
          console.error(`Session ${problem.sessionId} not found when trying to update XP`);
        }
      } else {
        console.log(`Problem not completed or no XP earned: completed=${problem.completed}, xpEarned=${problem.xpEarned}`);
      }
      
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
      
      // AI-powered skill progression analysis
      const userSkills = await storage.getUserSkills(userId);
      const skillAnalysis = await analyzeQuestCompletion(
        quest.title,
        quest.description,
        userSkills,
        quest.type || 'general'
      );
      
      // Apply skill improvements from AI analysis
      for (const improvement of skillAnalysis.skillImprovements) {
        console.log(`AI quest analysis updating skill: ${improvement.skillType} in ${improvement.mainCategory}/${improvement.subCategory}`);
        
        // Update skill with small XP gain for quest completion
        await storage.upsertUserSkill(
          userId, 
          improvement.skillType, 
          'V0', // Base grade for quest-based improvements
          improvement.mainCategory.toLowerCase(),
          improvement.subCategory.toLowerCase()
        );
      }
      
      // Award XP to user
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalXP = (user.totalXP || 0) + quest.xpReward;
        const updatedUser = await storage.upsertUser({
          ...user,
          totalXP: newTotalXP,
        });
        
        // Check for achievements after quest completion
        await achievementService.checkAndUnlockAchievements(userId);
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

  app.post('/api/skills/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.initializeUserSkillTree(userId);
      res.json({ message: "Skill tree initialized successfully" });
    } catch (error) {
      console.error("Error initializing skill tree:", error);
      res.status(500).json({ message: "Failed to initialize skill tree" });
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

  // Achievement routes
  app.get("/api/achievements/available", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { achievementService } = await import("./services/achievementService");
      const achievements = await achievementService.getAvailableAchievements(userId);
      res.json(achievements);
    } catch (error) {
      log(`Error getting available achievements: ${error}`, "error");
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  app.post("/api/achievements/check", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { achievementService } = await import("./services/achievementService");
      await achievementService.checkAndUnlockAchievements(userId);
      res.json({ message: "Achievements checked successfully" });
    } catch (error) {
      log(`Error checking achievements: ${error}`, "error");
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename with user ID and timestamp
      const userId = req.user?.claims?.sub;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage: storage_multer,
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'));
      }
      // Accept common image formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'));
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  // Serve uploaded profile images
  app.use('/uploads/profile-pictures', express.static(path.join(process.cwd(), 'uploads', 'profile-pictures')));

  // Profile picture upload endpoint
  app.post("/api/user/profile-image", isAuthenticated, upload.single('profileImage'), async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log('Upload request received for user:', userId);
      console.log('Request file:', req.file);
      console.log('Request body:', req.body);

      if (!req.file) {
        console.error('No file found in request');
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get current user to check if they have an existing profile image
      const currentUser = await storage.getUser(userId);
      
      // Delete old profile image if it exists and is not a default/external image
      if (currentUser?.profileImageUrl && currentUser.profileImageUrl.includes('/uploads/profile-pictures/')) {
        const oldImagePath = path.join(process.cwd(), currentUser.profileImageUrl.replace('/uploads/profile-pictures/', 'uploads/profile-pictures/'));
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (deleteError) {
            console.warn('Failed to delete old profile image:', deleteError);
          }
        }
      }

      // Create URL for the uploaded image
      const profileImageUrl = `/uploads/profile-pictures/${req.file.filename}`;
      
      // Update user with new profile image URL
      const updatedUser = await storage.upsertUser({
        id: userId,
        profileImageUrl,
      });

      res.json({ 
        message: "Profile picture updated successfully",
        profileImageUrl,
        user: updatedUser,
      });
    } catch (error) {
      // Clean up uploaded file if database update fails
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn('Failed to clean up uploaded file:', cleanupError);
        }
      }
      
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Failed to update profile picture" });
    }
  });

  // Remove profile picture endpoint
  app.delete("/api/user/profile-image", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = await storage.getUser(userId);
      
      // Delete the profile image file if it exists locally
      if (currentUser?.profileImageUrl && currentUser.profileImageUrl.includes('/uploads/profile-pictures/')) {
        const imagePath = path.join(process.cwd(), currentUser.profileImageUrl.replace('/uploads/profile-pictures/', 'uploads/profile-pictures/'));
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (deleteError) {
            console.warn('Failed to delete profile image file:', deleteError);
          }
        }
      }

      // Update user to remove profile image URL
      const updatedUser = await storage.upsertUser({
        id: userId,
        profileImageUrl: null,
      });

      res.json({ 
        message: "Profile picture removed successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error removing profile picture:", error);
      res.status(500).json({ message: "Failed to remove profile picture" });
    }
  });

  // Workout routes
  app.post('/api/workouts/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user stats for AI workout generation
      const user = await storage.getUser(userId);
      const skills = await storage.getUserSkills(userId);
      const recentSessions = await storage.getUserClimbingSessions(userId, 7);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate weakest skills
      const weakestSkills = skills
        .filter(s => s.totalProblems < 10)
        .sort((a, b) => a.totalProblems - b.totalProblems)
        .slice(0, 3)
        .map(s => s.skillType);

      // Get highest grade from skills
      const highestGrade = skills.length > 0 
        ? skills.reduce((max, skill) => {
            const maxGrade = gradeConverter.getGradeNumericValue(max, 'V-Scale');
            const skillGrade = gradeConverter.getGradeNumericValue(skill.maxGrade, 'V-Scale');
            return skillGrade > maxGrade ? skill.maxGrade : max;
          }, 'V0')
        : 'V0';

      // Calculate whistle level based on highest grade
      const whistleLevel = gradeConverter.getWhistleLevel(highestGrade, 'V-Scale');
      
      // Calculate current layer based on total XP
      const layerProgress = await storage.getLayerProgressInfo(userId);
      
      const userStats = {
        userId,
        whistleLevel,
        currentLayer: layerProgress.currentLayer,
        highestGrade,
        recentSessions,
        skills,
        weakestSkills,
        recentActivity: recentSessions.length,
      };

      console.log("Generating workout with user stats:", userStats);
      const workoutData = await generateWorkout(userStats);
      console.log("Generated workout data:", workoutData);
      console.log("WorkoutData type:", typeof workoutData);
      console.log("WorkoutData keys:", Object.keys(workoutData || {}));
      
      // Ensure we always return a valid workout object
      if (!workoutData || typeof workoutData !== 'object' || !workoutData.workoutType) {
        console.error("Invalid workout data received, using fallback");
        const fallbackWorkout = {
          workoutType: 'combo',
          title: 'Basic Climbing Workout',
          description: 'A general workout routine for climbers.',
          duration: 20,
          intensity: 'medium',
          intensityRating: 5,
          targetAreas: ['general'],
          exercises: [
            {
              name: 'Warm-up Stretches',
              description: 'Light stretching to prepare for activity',
              duration: '5 minutes',
              targetArea: 'general'
            },
            {
              name: 'Basic Strength Training',
              description: 'Core and upper body exercises',
              duration: '15 minutes',
              targetArea: 'strength'
            }
          ],
          xpReward: 50,
          generationReason: 'Fallback workout due to generation error.'
        };
        console.log("Sending fallback workout:", fallbackWorkout);
        return res.json(fallbackWorkout);
      }
      
      console.log("Sending workout data to client:", JSON.stringify(workoutData, null, 2));
      res.json(workoutData);
    } catch (error) {
      console.error("Error generating workout:", error);
      
      // Return fallback workout instead of error
      const fallbackWorkout = {
        workoutType: 'combo',
        title: 'Basic Climbing Workout',
        description: 'A general workout routine for climbers.',
        duration: 20,
        intensity: 'medium',
        intensityRating: 5,
        targetAreas: ['general'],
        exercises: [
          {
            name: 'Warm-up Stretches',
            description: 'Light stretching to prepare for activity',
            duration: '5 minutes',
            targetArea: 'general'
          },
          {
            name: 'Basic Strength Training',
            description: 'Core and upper body exercises',
            duration: '15 minutes',
            targetArea: 'strength'
          }
        ],
        xpReward: 50,
        generationReason: 'Fallback workout due to server error.'
      };
      res.json(fallbackWorkout);
    }
  });

  app.post('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workoutData = req.body;
      
      const workout = await storage.createWorkoutSession({
        userId,
        ...workoutData,
      });
      
      res.json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.get('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const workouts = await storage.getUserWorkoutSessions(userId, limit);
      
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const workout = await storage.getWorkoutSession(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Check if workout belongs to user
      if (workout.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post('/api/workouts/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const workout = await storage.getWorkoutSession(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      if (workout.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Complete the workout and award XP
      const completedWorkout = await storage.updateWorkoutSession(workoutId, {
        completed: true,
        completedAt: new Date(),
      });
      
      // Award XP to user
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalXP = (user.totalXP || 0) + workout.xpEarned;
        await storage.upsertUser({
          ...user,
          totalXP: newTotalXP,
        });
        
        // Check for achievements after workout completion
        await achievementService.checkAndUnlockAchievements(userId);
      }
      
      res.json({
        workout: completedWorkout,
        xpEarned: workout.xpEarned,
      });
    } catch (error) {
      console.error("Error completing workout:", error);
      res.status(500).json({ message: "Failed to complete workout" });
    }
  });

  // Layer quest routes
  app.get('/api/layer-quest/:layer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const layer = parseInt(req.params.layer);
      
      let layerQuest = await storage.getLayerQuestByLayer(userId, layer);
      
      if (!layerQuest) {
        layerQuest = await layerQuestService.initializeLayerQuest(userId, layer);
      }
      
      res.json(layerQuest);
    } catch (error) {
      console.error("Error fetching layer quest:", error);
      res.status(500).json({ message: "Failed to fetch layer quest" });
    }
  });

  app.post('/api/layer-quest/:layer/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const layer = parseInt(req.params.layer);
      
      const layerQuest = await layerQuestService.completeLayerQuest(userId, layer);
      
      if (!layerQuest) {
        return res.status(404).json({ message: "Layer quest not found" });
      }
      
      res.json(layerQuest);
    } catch (error) {
      console.error("Error completing layer quest:", error);
      res.status(500).json({ message: "Failed to complete layer quest" });
    }
  });

  app.post('/api/layer-quest/:layer/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const layer = parseInt(req.params.layer);
      
      const layerQuest = await layerQuestService.updateLayerQuestProgress(userId, layer);
      
      res.json(layerQuest);
    } catch (error) {
      console.error("Error updating layer quest progress:", error);
      res.status(500).json({ message: "Failed to update layer quest progress" });
    }
  });

  app.get('/api/layer-progress/:layer/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const layer = parseInt(req.params.layer);
      
      const progressCheck = await layerQuestService.canProgressToNextLayer(userId, layer);
      
      res.json(progressCheck);
    } catch (error) {
      console.error("Error checking layer progress:", error);
      res.status(500).json({ message: "Failed to check layer progress" });
    }
  });

  app.post('/api/layer-progress/advance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const result = await layerQuestService.progressToNextLayer(userId);
      
      res.json(result);
    } catch (error) {
      console.error("Error advancing layer:", error);
      res.status(500).json({ message: "Failed to advance layer" });
    }
  });

  // Developer-only endpoint to reset user data
  app.post('/api/dev/reset-data', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "This endpoint is only available in development mode" });
      }

      const userId = req.user.claims.sub;
      console.log(`Developer reset requested for user: ${userId}`);
      
      // Delete all user data except the user account itself
      await storage.resetUserData(userId);
      
      console.log(`Developer reset completed for user: ${userId}`);
      res.json({ 
        message: "All user data has been reset successfully",
        userId: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error resetting user data:", error);
      res.status(500).json({ message: "Failed to reset user data" });
    }
  });

  // Location API routes
  app.post("/api/locations/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const { locationService } = await import("./services/locationService");
      const location = await locationService.geocodeAddress(address);
      
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.json({ location });
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  app.post("/api/locations/find", async (req, res) => {
    try {
      const { location, radius, type } = req.body;
      
      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({ error: "Valid location coordinates are required" });
      }

      const { locationService } = await import("./services/locationService");
      const locations = await locationService.findNearbyClimbingLocations(
        location,
        radius || 10,
        type || 'all'
      );
      
      res.json({ locations });
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ error: "Failed to find climbing locations" });
    }
  });

  // Nanachi AI Chat endpoint  
  const nanachiUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  app.post("/api/nanachi/chat", isAuthenticated, nanachiUpload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      const imageFile = req.file;
      
      if (!message && !imageFile) {
        return res.status(400).json({ error: "Message or image is required" });
      }

      // Get user data for personalization
      const [user, userStats, userSkills] = await Promise.all([
        storage.getUser(userId),
        storage.getEnhancedProgressStats(userId),
        storage.getUserSkills(userId)
      ]);

      const { nanachiService } = await import("./services/nanachiService");
      const response = await nanachiService.processMessage(
        message || "Analyze this boulder problem image",
        user,
        userStats,
        userSkills,
        imageFile
      );
      
      res.json({ response });
    } catch (error) {
      console.error("Nanachi chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
