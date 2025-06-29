import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Simple in-memory rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.maxRequests;

  // Get or create client record
  let clientRecord = requestCounts.get(clientId);
  
  if (!clientRecord || now > clientRecord.resetTime) {
    clientRecord = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  // Check if limit exceeded
  if (clientRecord.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000)
    });
  }

  // Increment count
  clientRecord.count++;
  requestCounts.set(clientId, clientRecord);

  // Add headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - clientRecord.count);
  res.setHeader('X-RateLimit-Reset', new Date(clientRecord.resetTime).toISOString());

  next();
}; 