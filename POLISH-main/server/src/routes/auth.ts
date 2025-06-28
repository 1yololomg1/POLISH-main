import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // In a real implementation, you would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save to database
    // 4. Generate tokens

    // Mock user creation for now
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = {
      id: userId,
      name,
      email,
      subscription: 'free',
      credits: 10
    };

    // Generate tokens - simplified for now
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      },
      config.jwt.secret
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        subscription: user.subscription
      },
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // In a real implementation, you would:
    // 1. Find user by email
    // 2. Verify password
    // 3. Generate tokens

    // Mock user authentication for now
    const user = {
      id: 'user_123',
      name: 'Test User',
      email,
      subscription: 'premium',
      credits: 100
    };

    // Generate tokens - simplified for now
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      },
      config.jwt.secret
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        subscription: user.subscription
      },
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: 'user@example.com', // Would get from database
        name: 'User', // Would get from database
        subscription: 'premium' // Would get from database
      },
      config.jwt.secret
    );

    res.json({
      success: true,
      token: accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // In a real implementation, you would get user from database
    const user = {
      id: 'user_123',
      name: 'Test User',
      email: 'user@example.com',
      subscription: 'premium',
      credits: 100
    };

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export { router as authRoutes }; 