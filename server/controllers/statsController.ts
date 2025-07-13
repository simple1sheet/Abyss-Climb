import { Request, Response } from "express";
import { storage } from "../storage";

/**
 * Controller for user statistics and progress tracking
 */
export class StatsController {
  /**
   * Get user statistics
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  }

  /**
   * Get layer progress information
   */
  static async getLayerProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const progressInfo = await storage.getLayerProgressInfo(userId);
      res.json(progressInfo);
    } catch (error) {
      console.error("Error fetching layer progress:", error);
      res.status(500).json({ message: "Failed to fetch layer progress" });
    }
  }

  /**
   * Get whistle progress information
   */
  static async getWhistleProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const progressInfo = await storage.getWhistleProgressStats(userId);
      res.json(progressInfo);
    } catch (error) {
      console.error("Error fetching whistle progress:", error);
      res.status(500).json({ message: "Failed to fetch whistle progress" });
    }
  }

  /**
   * Get enhanced progress statistics
   */
  static async getEnhancedProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const progressInfo = await storage.getEnhancedProgressStats(userId);
      res.json(progressInfo);
    } catch (error) {
      console.error("Error fetching enhanced progress:", error);
      res.status(500).json({ message: "Failed to fetch enhanced progress" });
    }
  }
}