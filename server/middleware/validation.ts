import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { APIError } from "../utils/errorHandler";

/**
 * Validation middleware factory
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new APIError(
          `Validation error: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new APIError(
          `Query validation error: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};

/**
 * Validate route parameters
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new APIError(
          `Parameter validation error: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID parameter validation
  idParam: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  }),
  
  // Pagination query validation
  paginationQuery: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
    sortBy: z.string().optional()
  }),
  
  // Date range validation
  dateRangeQuery: z.object({
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional()
  }),
  
  // Grade system validation
  gradeSystemBody: z.object({
    gradeSystem: z.enum(['V-Scale', 'Font', 'German'])
  }),
  
  // Session status validation
  sessionStatusQuery: z.object({
    status: z.enum(['active', 'paused', 'completed']).optional()
  }),
  
  // Quest status validation
  questStatusQuery: z.object({
    status: z.enum(['active', 'completed', 'discarded']).optional()
  })
};

/**
 * Rate limiting validation
 */
export const rateLimitCheck = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return next();
    }
    
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      throw new APIError("Rate limit exceeded", 429);
    }
    
    recentRequests.push(now);
    requests.set(userId, recentRequests);
    
    next();
  };
};