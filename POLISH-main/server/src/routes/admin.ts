import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Admin stats endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

export { router as adminRoutes }; 