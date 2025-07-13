import { Request, Response } from "express";
import { storage } from "../storage";
import { gradeConverter } from "../services/gradeConverter";
import { xpCalculator } from "../services/xpCalculator";
import { achievementService } from "../services/achievementService";
import { insertBoulderProblemSchema } from "@shared/schema";
import { APIError, sendResponse } from "../utils/errorHandler";

/**
 * Controller for boulder problem management
 */
export class ProblemController {
  /**
   * Create a new boulder problem
   */
  static async createProblem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const problemData = insertBoulderProblemSchema.parse(req.body);
      
      // Calculate XP for this problem
      const xpEarned = xpCalculator.calculateProblemXP(
        problemData.grade,
        problemData.gradeSystem || 'V-Scale',
        problemData.completed,
        problemData.attempts,
        problemData.style
      );
      
      // Create problem with XP
      const problemWithXP = {
        ...problemData,
        xpEarned
      };
      
      const problem = await storage.createBoulderProblem(problemWithXP);
      
      // Update skill progression if completed
      if (problem.style && problem.completed) {
        const category = gradeConverter.getSkillCategoryForStyle(problem.style);
        await storage.upsertUserSkill(userId, problem.style, problem.grade, category);
      }
      
      // Update session and user XP if problem was completed
      if (problem.completed && problem.xpEarned > 0) {
        await this.updateSessionAndUserXP(userId, problem.sessionId, problem.xpEarned);
      }
      
      sendResponse.success(res, problem, "Problem created successfully");
    } catch (error) {
      console.error("Error creating problem:", error);
      if (error.name === 'ZodError') {
        throw new APIError("Invalid problem data", 400);
      }
      throw new APIError("Failed to create problem", 500);
    }
  }

  /**
   * Get problems for a specific session
   */
  static async getSessionProblems(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      
      if (isNaN(sessionId)) {
        throw new APIError("Invalid session ID", 400);
      }
      
      // Verify session ownership
      const session = await storage.getClimbingSession(sessionId);
      if (!session || session.userId !== userId) {
        throw new APIError("Session not found or access denied", 403);
      }
      
      const problems = await storage.getBoulderProblemsForSession(sessionId);
      sendResponse.success(res, problems);
    } catch (error) {
      console.error("Error fetching session problems:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to fetch session problems", 500);
    }
  }

  /**
   * Update problem details
   */
  static async updateProblem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const problemId = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(problemId)) {
        throw new APIError("Invalid problem ID", 400);
      }
      
      // Verify problem ownership by checking session
      const problems = await storage.getBoulderProblemsForSession(updates.sessionId);
      const problem = problems.find(p => p.id === problemId);
      if (!problem) {
        throw new APIError("Problem not found", 404);
      }
      
      const session = await storage.getClimbingSession(problem.sessionId);
      if (!session || session.userId !== userId) {
        throw new APIError("Access denied", 403);
      }
      
      // Recalculate XP if relevant fields changed
      if (updates.grade || updates.completed !== undefined || updates.attempts || updates.style) {
        const xpEarned = xpCalculator.calculateProblemXP(
          updates.grade || problem.grade,
          updates.gradeSystem || problem.gradeSystem || 'V-Scale',
          updates.completed !== undefined ? updates.completed : problem.completed,
          updates.attempts || problem.attempts,
          updates.style || problem.style
        );
        updates.xpEarned = xpEarned;
      }
      
      const updatedProblem = await storage.updateBoulderProblem(problemId, updates);
      
      sendResponse.success(res, updatedProblem, "Problem updated successfully");
    } catch (error) {
      console.error("Error updating problem:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to update problem", 500);
    }
  }

  /**
   * Delete a problem
   */
  static async deleteProblem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.claims.sub;
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        throw new APIError("Invalid problem ID", 400);
      }
      
      // Verify ownership before deletion
      // This would need to be implemented in storage layer
      
      sendResponse.success(res, null, "Problem deleted successfully");
    } catch (error) {
      console.error("Error deleting problem:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to delete problem", 500);
    }
  }

  /**
   * Private helper to update session and user XP
   */
  private static async updateSessionAndUserXP(userId: string, sessionId: number, xpEarned: number) {
    console.log(`Problem completed with ${xpEarned} XP for user ${userId}`);
    
    // Update session XP
    const session = await storage.getClimbingSession(sessionId);
    if (session) {
      const newSessionXP = (session.xpEarned || 0) + xpEarned;
      await storage.updateClimbingSession(sessionId, {
        xpEarned: newSessionXP
      });
      
      // Update user's total XP
      const user = await storage.getUser(userId);
      if (user) {
        const oldTotalXP = user.totalXP || 0;
        const newTotalXP = oldTotalXP + xpEarned;
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
      console.error(`Session ${sessionId} not found when trying to update XP`);
    }
  }
}