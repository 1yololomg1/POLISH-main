import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { isPaymentEnabled } from '../config';

const router = Router();

/**
 * POST /api/export/las
 * Export processed LAS file
 */
router.post('/las', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check if payments are enabled - if not, allow export
    if (!isPaymentEnabled()) {
      console.log('Payment system disabled - allowing LAS export');
      return res.json({
        success: true,
        message: 'LAS export completed (payment system disabled)',
        downloadUrl: '/api/export/download/mock-las-file.las'
      });
    }
    
    // Check if user has purchased exports
    if (!user.purchasedExports) {
      return res.status(403).json({
        success: false,
        error: 'LAS export requires premium purchase. Please purchase export access.'
      });
    }
    
    res.json({
      success: true,
      message: 'LAS export endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Export failed'
    });
  }
});

export { router as exportRoutes }; 