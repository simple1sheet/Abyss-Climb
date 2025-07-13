import { Request, Response } from "express";
import { storage } from "../storage";
import { achievementService } from "../services/achievementService";

/**
 * Controller for authentication-related routes
 */
export class AuthController {
  /**
   * Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }

  /**
   * Update user's preferred grade system
   */
  static async updateGradeSystem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const { gradeSystem } = req.body;
      
      // Validate grade system
      const validGradeSystems = ['V-Scale', 'Font', 'German'];
      if (!gradeSystem || !validGradeSystems.includes(gradeSystem)) {
        return res.status(400).json({ 
          message: "Invalid grade system", 
          validOptions: validGradeSystems 
        });
      }
      
      const updatedUser = await storage.updateUserGradeSystem(userId, gradeSystem);
      
      // Check for grade system change achievement
      await achievementService.checkAndUnlockAchievements(userId);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user grade system:", error);
      res.status(500).json({ message: "Failed to update grade system" });
    }
  }
}