import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    subscription: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // For development, allow requests without token
    if (config.env === 'development') {
      req.user = {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
        subscription: 'premium'
      };
      return next();
    }
    
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      subscription: decoded.subscription
    };
    next();
  } catch (error) {
    // For development, allow invalid tokens
    if (config.env === 'development') {
      req.user = {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
        subscription: 'premium'
      };
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const requireSubscription = (requiredLevel: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const subscriptionLevels = ['free', 'basic', 'premium', 'enterprise'];
    const userLevel = subscriptionLevels.indexOf(user.subscription);
    const requiredLevelIndex = subscriptionLevels.indexOf(requiredLevel);

    if (userLevel < requiredLevelIndex) {
      return res.status(403).json({
        success: false,
        error: `${requiredLevel} subscription required`
      });
    }

    next();
  };
}; 