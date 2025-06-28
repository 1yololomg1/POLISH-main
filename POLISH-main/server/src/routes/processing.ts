import { Router, Request, Response } from 'express';
import { ProcessingService, ProcessingOptions } from '../services/ProcessingService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const processingService = new ProcessingService();

/**
 * POST /api/processing/process
 * Process a LAS file with specified options
 */
router.post('/process', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { fileBuffer, fileName, options } = req.body;
    const userId = (req as any).user?.id || 'anonymous';

    // Validate input
    if (!fileBuffer || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'File buffer and filename are required'
      });
    }

    // Convert base64 buffer to Buffer if needed
    let buffer: Buffer;
    if (typeof fileBuffer === 'string') {
      buffer = Buffer.from(fileBuffer, 'base64');
    } else if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid file buffer format'
      });
    }

    // Default processing options
    const defaultOptions: ProcessingOptions = {
      denoise: {
        enabled: false,
        method: 'savitzky_golay',
        windowSize: 11,
        polynomialOrder: 3,
        strength: 0.5,
        preserveSpikes: true
      },
      despike: {
        enabled: false,
        method: 'hampel',
        threshold: 2.5,
        windowSize: 5,
        replacementMethod: 'pchip'
      },
      validation: {
        enabled: true,
        physicalRanges: {
          'GR': { min: 0, max: 300 },
          'NPHI': { min: -0.15, max: 1.0 },
          'RHOB': { min: 1.0, max: 3.5 },
          'RT': { min: 0.1, max: 10000 },
          'CALI': { min: 4, max: 20 },
          'SP': { min: -200, max: 50 },
          'PEF': { min: 1.0, max: 10.0 }
        },
        crossValidation: true,
        flagOutliers: true
      },
      mnemonics: {
        enabled: true,
        standard: 'api',
        autoStandardize: true,
        preserveOriginal: true
      },
      baselineCorrection: {
        enabled: false,
        method: 'polynomial',
        polynomialOrder: 2
      }
    };

    // Merge with provided options
    const processingOptions = { ...defaultOptions, ...options };

    // Process the file
    const result = await processingService.processFile(
      buffer,
      fileName,
      processingOptions,
      userId
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.processedData,
        qcResults: result.qcResults,
        processingHistory: result.processingHistory,
        warnings: result.warnings,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.errors?.join(', ') || 'Processing failed',
        warnings: result.warnings
      });
    }

  } catch (error) {
    console.error('Processing route error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/processing/status/:jobId
 * Get processing job status
 */
router.get('/status/:jobId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    // For now, return a simple status
    // In a real implementation, this would check a job queue
    res.json({
      success: true,
      jobId,
      status: 'completed',
      progress: 100
    });

  } catch (error) {
    console.error('Status route error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/processing/validate
 * Validate processing options without processing
 */
router.post('/validate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { options } = req.body;

    // Validate processing options structure
    const validationErrors: string[] = [];

    if (options.denoise?.enabled) {
      if (options.denoise.windowSize < 3 || options.denoise.windowSize > 21) {
        validationErrors.push('Denoise window size must be between 3 and 21');
      }
      if (options.denoise.windowSize % 2 === 0) {
        validationErrors.push('Denoise window size must be odd');
      }
      if (options.denoise.strength < 0 || options.denoise.strength > 1) {
        validationErrors.push('Denoise strength must be between 0 and 1');
      }
    }

    if (options.despike?.enabled) {
      if (options.despike.threshold <= 0) {
        validationErrors.push('Despike threshold must be positive');
      }
      if (options.despike.windowSize < 3 || options.despike.windowSize > 15) {
        validationErrors.push('Despike window size must be between 3 and 15');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    res.json({
      success: true,
      message: 'Processing options are valid'
    });

  } catch (error) {
    console.error('Validation route error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export { router as processingRoutes }; 