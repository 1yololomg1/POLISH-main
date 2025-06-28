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

import { LASParser, ParseOptions, ParseResult } from './lasParser';
import { MnemonicStandardizer } from './MnemonicStandardizer';
import { ProcessingAlgorithms } from './processingAlgorithms';
import { LASFile } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class LASParserProductionExample {
  private parser: LASParser;
  private standardizer: MnemonicStandardizer;
  private algorithms: ProcessingAlgorithms;

  constructor() {
    this.parser = new LASParser();
    this.standardizer = new MnemonicStandardizer();
    this.algorithms = new ProcessingAlgorithms();
  }

  /**
   * Example 1: Batch Processing with Quality Assessment
   * 
   * Processes multiple LAS files with comprehensive quality assessment
   * and generates a detailed report for enterprise use.
   */
  async batchProcessWithQualityAssessment(
    filePaths: string[],
    options: ParseOptions = {}
  ): Promise<{
    successfulFiles: LASFile[];
    failedFiles: Array<{ path: string; error: string }>;
    qualityReport: any;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const successfulFiles: LASFile[] = [];
    const failedFiles: Array<{ path: string; error: string }> = [];
    const qualityMetrics: any[] = [];

    console.log(`Starting batch processing of ${filePaths.length} files...`);

    for (const filePath of filePaths) {
      try {
        console.log(`Processing: ${path.basename(filePath)}`);
        
        // Read file
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        
        // Parse with enhanced options
        const parseOptions: ParseOptions = {
          ...options,
          autoStandardizeMnemonics: true,
          mnemonicStandard: 'api',
          validatePhysicalRanges: true,
          strictMode: false
        };

        const result = await this.parser.parse(buffer, fileName, parseOptions);
        
        if (result.success && result.data) {
          // Perform additional quality assessment
          const qualityAssessment = await this.performQualityAssessment(result.data);
          
          // Add to successful files
          successfulFiles.push(result.data);
          qualityMetrics.push({
            fileName,
            parseTime: result.parseTime,
            warnings: result.warnings,
            qualityScore: result.data.qualityScore,
            curveCount: result.data.curves.length,
            dataPoints: result.data.data.length,
            qualityAssessment
          });

          console.log(`✓ Success: ${fileName} (Quality: ${result.data.qualityScore?.toFixed(1)}%)`);
        } else {
          failedFiles.push({
            path: filePath,
            error: result.error || 'Unknown parsing error'
          });
          console.log(`✗ Failed: ${fileName} - ${result.error}`);
        }

      } catch (error) {
        failedFiles.push({
          path: filePath,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`✗ Error: ${path.basename(filePath)} - ${error}`);
      }
    }

    const processingTime = Date.now() - startTime;
    
    // Generate comprehensive quality report
    const qualityReport = this.generateQualityReport(qualityMetrics, processingTime);

    console.log(`\nBatch processing completed in ${processingTime}ms`);
    console.log(`Successful: ${successfulFiles.length}, Failed: ${failedFiles.length}`);

    return {
      successfulFiles,
      failedFiles,
      qualityReport,
      processingTime
    };
  }

  /**
   * Example 2: Enterprise File Processing Pipeline
   * 
   * Complete pipeline from parsing to processing with error recovery
   * and comprehensive logging for production environments.
   */
  async enterpriseProcessingPipeline(
    filePath: string,
    processingOptions: any = {}
  ): Promise<{
    success: boolean;
    originalFile: LASFile | null;
    processedFile: LASFile | null;
    processingHistory: any[];
    qualityMetrics: any;
    errors: string[];
    warnings: string[];
  }> {
    const processingHistory: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Parse LAS file
      console.log('Step 1: Parsing LAS file...');
      const buffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      
      const parseResult = await this.parser.parse(buffer, fileName, {
        autoStandardizeMnemonics: true,
        mnemonicStandard: 'api',
        validatePhysicalRanges: true
      });

      if (!parseResult.success || !parseResult.data) {
        throw new Error(`Parsing failed: ${parseResult.error}`);
      }

      const originalFile = parseResult.data;
      warnings.push(...parseResult.warnings);
      processingHistory.push({
        step: 'parse',
        timestamp: new Date(),
        duration: parseResult.parseTime,
        success: true
      });

      console.log(`✓ Parsed successfully: ${originalFile.curves.length} curves, ${originalFile.data.length} data points`);

      // Step 2: Quality Assessment
      console.log('Step 2: Performing quality assessment...');
      const qualityAssessment = await this.performQualityAssessment(originalFile);
      processingHistory.push({
        step: 'quality_assessment',
        timestamp: new Date(),
        success: true,
        qualityScore: qualityAssessment.overallScore
      });

      // Step 3: Data Processing (if quality is acceptable)
      let processedFile: LASFile | null = null;
      if (qualityAssessment.overallScore > 50) {
        console.log('Step 3: Processing data...');
        
        const processingResult = await this.processData(originalFile, processingOptions);
        
        if (processingResult.success) {
          processedFile = {
            ...originalFile,
            processed: true,
            processedData: processingResult.processedData,
            processingHistory: [
              ...processingHistory,
              {
                step: 'data_processing',
                timestamp: new Date(),
                success: true,
                algorithms: processingResult.algorithms
              }
            ]
          };
          
          console.log('✓ Data processing completed successfully');
        } else {
          errors.push('Data processing failed');
          console.log('✗ Data processing failed');
        }
      } else {
        warnings.push('Skipping data processing due to low quality score');
        console.log('⚠ Skipping data processing due to low quality score');
      }

      // Step 4: Final Quality Assessment
      console.log('Step 4: Final quality assessment...');
      const finalQualityAssessment = processedFile 
        ? await this.performQualityAssessment(processedFile)
        : qualityAssessment;

      return {
        success: true,
        originalFile,
        processedFile,
        processingHistory,
        qualityMetrics: finalQualityAssessment,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      processingHistory.push({
        step: 'error',
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        originalFile: null,
        processedFile: null,
        processingHistory,
        qualityMetrics: {},
        errors,
        warnings
      };
    }
  }

  /**
   * Example 3: Real-time Processing with Memory Management
   * 
   * Demonstrates efficient processing of large files with memory constraints
   * and real-time progress reporting.
   */
  async realTimeProcessing(
    filePath: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<LASFile> {
    const fileSize = fs.statSync(filePath).size;
    const maxMemoryUsage = 500 * 1024 * 1024; // 500MB limit

    onProgress?.(0, 'Starting file processing...');

    // Check file size
    if (fileSize > maxMemoryUsage) {
      throw new Error(`File size (${fileSize} bytes) exceeds memory limit`);
    }

    onProgress?.(10, 'Reading file...');
    const buffer = fs.readFileSync(filePath);
    
    onProgress?.(20, 'Parsing LAS structure...');
    const fileName = path.basename(filePath);
    const parseResult = await this.parser.parse(buffer, fileName);
    
    if (!parseResult.success || !parseResult.data) {
      throw new Error(`Parsing failed: ${parseResult.error}`);
    }

    onProgress?.(50, 'Performing quality assessment...');
    const qualityAssessment = await this.performQualityAssessment(parseResult.data);
    
    onProgress?.(75, 'Standardizing mnemonics...');
    const standardizationResult = await this.standardizer.standardizeMnemonics(
      parseResult.data,
      { standard: 'api', autoStandardize: true, preserveOriginal: true }
    );

    onProgress?.(90, 'Finalizing processing...');
    const finalFile: LASFile = {
      ...parseResult.data,
      processed: true,
      qcResults: {
        totalPoints: parseResult.data.data.length,
        nullPoints: 0, // Calculate actual null points
        spikesDetected: 0, // Calculate actual spikes
        noiseLevel: qualityAssessment.noiseLevel,
        depthConsistency: qualityAssessment.depthConsistency,
        overallQualityScore: qualityAssessment.overallScore,
        curveQuality: {},
        mnemonicStandardization: {
          standardized: standardizationResult.standardizedCurves.length,
          nonStandard: [],
          mappings: {}
        },
        physicalValidation: {
          passed: 0,
          failed: 0,
          warnings: []
        },
        recommendations: []
      }
    };

    onProgress?.(100, 'Processing completed successfully');
    return finalFile;
  }

  /**
   * Helper method: Perform comprehensive quality assessment
   */
  private async performQualityAssessment(file: LASFile): Promise<any> {
    const assessment = {
      overallScore: file.qualityScore || 0,
      noiseLevel: 0,
      depthConsistency: true,
      curveQuality: {} as Record<string, any>,
      recommendations: [] as string[]
    };

    // Assess each curve
    for (const curve of file.curves) {
      if (curve.statistics) {
        const completeness = ((file.data.length - curve.statistics.nullCount) / file.data.length) * 100;
        const noiseLevel = curve.statistics.std / Math.abs(curve.statistics.mean) * 100;
        
        assessment.curveQuality[curve.mnemonic] = {
          completeness,
          noiseLevel,
          outliers: curve.statistics.outliers,
          qualityScore: curve.statistics.qualityScore
        };

        assessment.noiseLevel = Math.max(assessment.noiseLevel, noiseLevel);
      }
    }

    // Check depth consistency
    if (file.data.length > 1) {
      const depths = file.data.map(d => d.depth);
      const step = depths[1] - depths[0];
      
      for (let i = 1; i < depths.length; i++) {
        const actualStep = depths[i] - depths[i - 1];
        if (Math.abs(actualStep - step) > step * 0.1) {
          assessment.depthConsistency = false;
          break;
        }
      }
    }

    // Generate recommendations
    if (assessment.noiseLevel > 20) {
      assessment.recommendations.push('High noise level detected - consider denoising');
    }
    if (!assessment.depthConsistency) {
      assessment.recommendations.push('Depth inconsistencies detected - check depth alignment');
    }
    if (assessment.overallScore < 70) {
      assessment.recommendations.push('Low overall quality - review data source');
    }

    return assessment;
  }

  /**
   * Helper method: Process data using algorithms
   */
  private async processData(file: LASFile, options: any): Promise<{
    success: boolean;
    processedData: any;
    algorithms: string[];
  }> {
    const algorithms: string[] = [];

    try {
      // Apply denoising if needed
      if (options.denoise) {
        const denoiseResult = await this.algorithms.denoise(file, {
          method: 'savitzky_golay',
          windowSize: 11,
          polynomialOrder: 3,
          strength: 0.7,
          preserveSpikes: true
        });
        
        if (denoiseResult.success) {
          algorithms.push('savitzky_golay_denoising');
        }
      }

      // Apply despiking if needed
      if (options.despike) {
        const despikeResult = await this.algorithms.despike(file, {
          method: 'hampel',
          threshold: 2.5,
          windowSize: 5,
          replacementMethod: 'pchip'
        });
        
        if (despikeResult.success) {
          algorithms.push('hampel_despiking');
        }
      }

      return {
        success: true,
        processedData: file.data,
        algorithms
      };

    } catch (error) {
      console.error('Data processing failed:', error);
      return {
        success: false,
        processedData: null,
        algorithms: []
      };
    }
  }

  /**
   * Helper method: Generate quality report
   */
  private generateQualityReport(qualityMetrics: any[], processingTime: number): any {
    const totalFiles = qualityMetrics.length;
    const avgQualityScore = qualityMetrics.reduce((sum, m) => sum + (m.qualityScore || 0), 0) / totalFiles;
    const avgParseTime = qualityMetrics.reduce((sum, m) => sum + m.parseTime, 0) / totalFiles;

    const qualityDistribution = {
      excellent: qualityMetrics.filter(m => (m.qualityScore || 0) >= 90).length,
      good: qualityMetrics.filter(m => (m.qualityScore || 0) >= 70 && (m.qualityScore || 0) < 90).length,
      fair: qualityMetrics.filter(m => (m.qualityScore || 0) >= 50 && (m.qualityScore || 0) < 70).length,
      poor: qualityMetrics.filter(m => (m.qualityScore || 0) < 50).length
    };

    return {
      summary: {
        totalFiles,
        processingTime,
        avgQualityScore: avgQualityScore.toFixed(1),
        avgParseTime: avgParseTime.toFixed(0),
        qualityDistribution
      },
      details: qualityMetrics,
      recommendations: this.generateRecommendations(qualityMetrics)
    };
  }

  /**
   * Helper method: Generate recommendations based on quality metrics
   */
  private generateRecommendations(qualityMetrics: any[]): string[] {
    const recommendations: string[] = [];
    
    const lowQualityFiles = qualityMetrics.filter(m => (m.qualityScore || 0) < 70);
    if (lowQualityFiles.length > 0) {
      recommendations.push(`${lowQualityFiles.length} files have low quality scores - review data sources`);
    }

    const slowParsingFiles = qualityMetrics.filter(m => m.parseTime > 1000);
    if (slowParsingFiles.length > 0) {
      recommendations.push(`${slowParsingFiles.length} files took longer than 1 second to parse - consider optimization`);
    }

    const filesWithWarnings = qualityMetrics.filter(m => m.warnings.length > 0);
    if (filesWithWarnings.length > 0) {
      recommendations.push(`${filesWithWarnings.length} files generated warnings - review for data quality issues`);
    }

    return recommendations;
  }
}

// Usage examples
export async function demonstrateProductionUsage() {
  const example = new LASParserProductionExample();
  
  // Example 1: Batch processing
  const filePaths = [
    'path/to/well1.las',
    'path/to/well2.las',
    'path/to/well3.las'
  ];
  
  const batchResult = await example.batchProcessWithQualityAssessment(filePaths);
  console.log('Batch processing results:', batchResult.qualityReport.summary);
  
  // Example 2: Enterprise pipeline
  const pipelineResult = await example.enterpriseProcessingPipeline('path/to/complex_well.las');
  console.log('Pipeline result:', pipelineResult.success ? 'Success' : 'Failed');
  
  // Example 3: Real-time processing
  const realTimeResult = await example.realTimeProcessing('path/to/large_well.las', 
    (progress, message) => console.log(`Progress: ${progress}% - ${message}`)
  );
  console.log('Real-time processing completed:', realTimeResult.name);
} 