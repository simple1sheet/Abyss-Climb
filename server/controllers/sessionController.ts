import { Request, Response } from "express";
import { storage } from "../storage";
import { achievementService } from "../services/achievementService";
import { insertClimbingSessionSchema } from "@shared/schema";

/**
 * Controller for climbing session management
 */
export class SessionController {
  /**
   * Create a new climbing session
   */
  static async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionData = insertClimbingSessionSchema.parse({
        ...req.body,
        userId
      });
      
      const session = await storage.createClimbingSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  }

  /**
   * Get all user sessions
   */
  static async getUserSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getUserClimbingSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  }

  /**
   * Get active session
   */
  static async getActiveSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const session = await storage.getActiveSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  }

  /**
   * Get specific session by ID
   */
  static async getSessionById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionId = parseInt(req.params.id);
      
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      const session = await storage.getClimbingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user owns this session
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  }

  /**
   * Update session (pause/resume/complete)
   */
  static async updateSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      // Verify session ownership
      const existingSession = await storage.getClimbingSession(sessionId);
      if (!existingSession || existingSession.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
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
        await achievementService.checkAndUnlockAchievements(userId);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  }

  /**
   * Pause session
   */
  static async pauseSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionId = parseInt(req.params.id);
      
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      // Verify session ownership
      const existingSession = await storage.getClimbingSession(sessionId);
      if (!existingSession || existingSession.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const session = await storage.updateClimbingSession(sessionId, {
        status: "paused",
        pausedAt: new Date()
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error pausing session:", error);
      res.status(500).json({ message: "Failed to pause session" });
    }
  }

  /**
   * Resume session
   */
  static async resumeSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionId = parseInt(req.params.id);
      
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      // Verify session ownership
      const existingSession = await storage.getClimbingSession(sessionId);
      if (!existingSession || existingSession.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const session = await storage.updateClimbingSession(sessionId, {
        status: "active",
        resumedAt: new Date()
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error resuming session:", error);
      res.status(500).json({ message: "Failed to resume session" });
    }
  }
}