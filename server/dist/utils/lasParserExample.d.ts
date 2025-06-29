/**
 * POLISH LAS Parser - Production Usage Examples
 *
 * Demonstrates enterprise-level usage patterns for the LAS parser:
 * - Batch processing of multiple files
 * - Error handling and recovery
 * - Performance optimization
 * - Quality assessment and reporting
 * - Integration with processing pipeline
 */
import { ParseOptions } from './lasParser';
import { LASFile } from '../types';
export declare class LASParserProductionExample {
    private parser;
    private standardizer;
    private algorithms;
    constructor();
    /**
     * Example 1: Batch Processing with Quality Assessment
     *
     * Processes multiple LAS files with comprehensive quality assessment
     * and generates a detailed report for enterprise use.
     */
    batchProcessWithQualityAssessment(filePaths: string[], options?: ParseOptions): Promise<{
        successfulFiles: LASFile[];
        failedFiles: Array<{
            path: string;
            error: string;
        }>;
        qualityReport: any;
        processingTime: number;
    }>;
    /**
     * Example 2: Enterprise File Processing Pipeline
     *
     * Complete pipeline from parsing to processing with error recovery
     * and comprehensive logging for production environments.
     */
    enterpriseProcessingPipeline(filePath: string, processingOptions?: any): Promise<{
        success: boolean;
        originalFile: LASFile | null;
        processedFile: LASFile | null;
        processingHistory: any[];
        qualityMetrics: any;
        errors: string[];
        warnings: string[];
    }>;
    /**
     * Example 3: Real-time Processing with Memory Management
     *
     * Demonstrates efficient processing of large files with memory constraints
     * and real-time progress reporting.
     */
    realTimeProcessing(filePath: string, onProgress?: (progress: number, message: string) => void): Promise<LASFile>;
    /**
     * Helper method: Perform comprehensive quality assessment
     */
    private performQualityAssessment;
    /**
     * Helper method: Process data using algorithms
     */
    private processData;
    /**
     * Helper method: Generate quality report
     */
    private generateQualityReport;
    /**
     * Helper method: Generate recommendations based on quality metrics
     */
    private generateRecommendations;
}
export declare function demonstrateProductionUsage(): Promise<void>;
//# sourceMappingURL=lasParserExample.d.ts.map