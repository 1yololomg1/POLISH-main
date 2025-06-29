import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { isPaymentEnabled } from '../config';

const router = Router();

/**
 * POST /api/conversion/convert
 * Convert file format
 */
router.post('/convert', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check if payments are enabled - if not, allow conversion
    if (!isPaymentEnabled()) {
      console.log('Payment system disabled - allowing format conversion');
      return res.json({
        success: true,
        message: 'Format conversion completed (payment system disabled)',
        downloadUrl: '/api/conversion/download/mock-converted-file'
      });
    }
    
    // Check if user has purchased exports
    if (!user.purchasedExports) {
      return res.status(403).json({
        success: false,
        error: 'Format conversion requires premium purchase. Please purchase export access.'
      });
    }
    
    res.json({
      success: true,
      message: 'Format conversion endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Conversion failed'
    });
  }
});

export { router as conversionRoutes }; 