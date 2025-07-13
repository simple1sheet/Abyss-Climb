import { Request, Response } from "express";
import { storage } from "../storage";
import { questGenerator } from "../services/questGenerator";
import { achievementService } from "../services/achievementService";
import { APIError, sendResponse } from "../utils/errorHandler";

/**
 * Controller for quest management
 */
export class QuestController {
  /**
   * Generate a new quest for the user
   */
  static async generateQuest(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      await questGenerator.generateQuestForUser(userId);
      sendResponse.success(res, null, "Quest generated successfully");
    } catch (error) {
      console.error("Error generating quest:", error);
      throw new APIError("Failed to generate quest", 500);
    }
  }

  /**
   * Get user's quests with optional status filter
   */
  static async getUserQuests(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const status = req.query.status as string;
      
      const quests = await storage.getUserQuests(userId, status);
      sendResponse.success(res, quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      throw new APIError("Failed to fetch quests", 500);
    }
  }

  /**
   * Get daily quest count and limits
   */
  static async getDailyCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const quests = await storage.getUserQuests(userId, "active");
      
      const dailyQuests = quests.filter(q => 
        q.questType === "daily" && 
        new Date(q.createdAt).toDateString() === new Date().toDateString()
      );
      
      const data = {
        dailyCount: dailyQuests.length,
        maxDaily: 3,
        limitReached: dailyQuests.length >= 3
      };
      
      sendResponse.success(res, data);
    } catch (error) {
      console.error("Error fetching daily count:", error);
      throw new APIError("Failed to fetch daily count", 500);
    }
  }

  /**
   * Get quest completion count for today
   */
  static async getCompletionCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const completedToday = await storage.getUserCompletedQuestsToday(userId);
      
      const data = {
        completedToday: completedToday.length,
        maxCompletions: 3,
        completionLimitReached: completedToday.length >= 3
      };
      
      sendResponse.success(res, data);
    } catch (error) {
      console.error("Error fetching completion count:", error);
      throw new APIError("Failed to fetch completion count", 500);
    }
  }

  /**
   * Complete a quest
   */
  static async completeQuest(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const questId = parseInt(req.params.id);
      
      if (isNaN(questId)) {
        throw new APIError("Invalid quest ID", 400);
      }
      
      // Check daily completion limit
      const completedToday = await storage.getUserCompletedQuestsToday(userId);
      if (completedToday.length >= 3) {
        return sendResponse.error(res, "Daily completion limit reached. You can only complete 3 quests per day!", 400, {
          completionLimitReached: true,
          questCount: completedToday.length
        });
      }
      
      // Verify quest ownership
      const quest = await storage.getUserQuests(userId);
      const userQuest = quest.find(q => q.id === questId);
      if (!userQuest) {
        throw new APIError("Quest not found or access denied", 404);
      }
      
      // Complete the quest
      const completedQuest = await storage.updateQuest(questId, {
        status: "completed",
        completedAt: new Date(),
      });
      
      // Award XP to user
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalXP = (user.totalXP || 0) + completedQuest.xpReward;
        await storage.upsertUser({
          ...user,
          totalXP: newTotalXP,
        });
        
        // Check for layer advancement
        const progressInfo = await storage.getLayerProgressInfo(userId);
        if (progressInfo.currentLayer > (user.currentLayer || 1)) {
          console.log(`User ${userId} advanced to layer ${progressInfo.currentLayer}!`);
        }
        
        // Check for achievements
        await achievementService.checkAndUnlockAchievements(userId);
      }
      
      sendResponse.success(res, completedQuest, "Quest completed successfully");
    } catch (error) {
      console.error("Error completing quest:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to complete quest", 500);
    }
  }

  /**
   * Discard a quest
   */
  static async discardQuest(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const questId = parseInt(req.params.id);
      
      if (isNaN(questId)) {
        throw new APIError("Invalid quest ID", 400);
      }
      
      // Verify quest ownership
      const quest = await storage.getUserQuests(userId);
      const userQuest = quest.find(q => q.id === questId);
      if (!userQuest) {
        throw new APIError("Quest not found or access denied", 404);
      }
      
      const discardedQuest = await storage.updateQuest(questId, {
        status: "discarded",
        discardedAt: new Date(),
      });
      
      sendResponse.success(res, discardedQuest, "Quest discarded successfully");
    } catch (error) {
      console.error("Error discarding quest:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to discard quest", 500);
    }
  }
}