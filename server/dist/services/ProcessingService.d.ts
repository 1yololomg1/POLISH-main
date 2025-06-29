/**
 * POLISH Processing Service
 *
 * This service orchestrates the processing pipeline for LAS files.
 */
import { LASFile, ProcessingStep, QCResults } from '../types';
export interface ProcessingOptions {
    denoise: {
        enabled: boolean;
        method: 'savitzky_golay' | 'wavelet' | 'moving_average' | 'gaussian';
        windowSize: number;
        polynomialOrder?: number;
        strength: number;
        preserveSpikes: boolean;
    };
    despike: {
        enabled: boolean;
        method: 'hampel' | 'modified_zscore' | 'iqr' | 'manual';
        threshold: number;
        windowSize: number;
        replacementMethod: 'pchip' | 'linear' | 'median' | 'null';
    };
    validation: {
        enabled: boolean;
        physicalRanges: Record<string, {
            min: number;
            max: number;
        }>;
        crossValidation: boolean;
        flagOutliers: boolean;
    };
    mnemonics: {
        enabled: boolean;
        standard: 'api' | 'cwls' | 'custom';
        autoStandardize: boolean;
        preserveOriginal: boolean;
    };
    baselineCorrection: {
        enabled: boolean;
        method: 'polynomial';
        polynomialOrder: number;
    };
}
export interface ProcessingResult {
    success: boolean;
    processedData: LASFile | null;
    qcResults: QCResults | null;
    processingHistory: ProcessingStep[];
    errors?: string[];
    warnings?: string[];
    executionTime: number;
    memoryUsage: number;
}
export declare class ProcessingService {
    private algorithms;
    private standardizer;
    private parser;
    constructor();
    processFile(fileBuffer: Buffer, fileName: string, options: ProcessingOptions, userId: string): Promise<ProcessingResult>;
    /**
     * Perform comprehensive quality assessment
     */
    private performQualityAssessment;
    /**
     * Get quality grade from score
     */
    private getQualityGrade;
    /**
     * Generate processing recommendations
     */
    private generateRecommendations;
    private getMemoryUsage;
    private generateStepId;
    private generateProcessingCertificate;
    private generateSignature;
}
//# sourceMappingURL=ProcessingService.d.ts.map