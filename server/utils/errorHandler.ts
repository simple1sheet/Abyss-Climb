import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Enhanced error handler middleware
 */
export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  let error = {
    message: err.message || "Internal Server Error",
    statusCode: 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  };

  // Handle API errors
  if (err instanceof APIError) {
    error.statusCode = err.statusCode;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    error.statusCode = 400;
    error.message = "Validation Error";
  }

  // Handle database errors
  if (err.name === "DatabaseError") {
    error.statusCode = 500;
    error.message = "Database operation failed";
  }

  // Log error for debugging
  console.error(`Error ${error.statusCode}: ${error.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standardized response helpers
 */
export const sendResponse = {
  success: (res: Response, data: any, message: string = "Success") => {
    res.json({
      success: true,
      message,
      data
    });
  },
  
  error: (res: Response, message: string, statusCode: number = 500, data?: any) => {
    res.status(statusCode).json({
      success: false,
      message,
      ...(data && { data })
    });
  },
  
  notFound: (res: Response, message: string = "Resource not found") => {
    res.status(404).json({
      success: false,
      message
    });
  },
  
  unauthorized: (res: Response, message: string = "Unauthorized") => {
    res.status(401).json({
      success: false,
      message
    });
  },
  
  forbidden: (res: Response, message: string = "Access forbidden") => {
    res.status(403).json({
      success: false,
      message
    });
  },
  
  badRequest: (res: Response, message: string = "Bad request") => {
    res.status(400).json({
      success: false,
      message
    });
  }
};