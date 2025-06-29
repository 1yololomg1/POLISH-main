/**
 * ALVARO Standard Implementation
 * Automated LAS Validation And Reliability Operations Standard v1.0
 * 
 * This module implements the ALVARO quality assessment framework for LAS files.
 */

export interface ALVAROMetrics {
  completenessIndex: number;
  noiseLevelAssessment: number;
  physicalConsistencyScore: number;
  depthIntegrityIndex: number;
  crossCurveCorrelationFactor: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidenceLevel: 'High' | 'Medium' | 'Low';
  uncertaintyBounds: number;
}

export interface ALVAROCertificate {
  certificateId: string;
  issueDate: string;
  lasFile: string;
  processor: string;
  certificationLevel: string;
  originalGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  processedGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  qualityImprovement: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  uncertaintyBounds: number;
  alvaroMetrics: ALVAROMetrics;
  processingAuditTrail: ProcessingStep[];
  complianceReferences: string[];
  digitalSignature: string;
}

export interface ProcessingStep {
  stepId: string;
  timestamp: string;
  operation: string;
  parameters: Record<string, any>;
  qualityMetrics: {
    before: ALVAROMetrics;
    after: ALVAROMetrics;
  };
  algorithmVersion: string;
  validationStatus: 'Passed' | 'Failed' | 'Warning';
}

export class ALVAROStandard {
  private static readonly VERSION = '1.0';
  private static readonly CERTIFICATION_LEVEL = 'ALQC-UQ v1.0';

  /**
   * Calculate Completeness Index (CI)
   * CI = (Valid Data Points / Total Expected Data Points) × 100
   */
  static calculateCompletenessIndex(data: any[], curves: any[]): number {
    if (!data || data.length === 0 || !curves || curves.length === 0) {
      return 0;
    }

    const totalExpectedPoints = data.length * curves.length;
    let validDataPoints = 0;

    for (const dataPoint of data) {
      for (const curve of curves) {
        const value = dataPoint[curve.mnemonic];
        if (value !== null && value !== undefined && !isNaN(value)) {
          validDataPoints++;
        }
      }
    }

    return (validDataPoints / totalExpectedPoints) * 100;
  }

  /**
   * Calculate Noise Level Assessment (NLA)
   * NLA = 20 × log₁₀(Signal_RMS / Noise_RMS)
   */
  static calculateNoiseLevelAssessment(data: any[], curves: any[]): number {
    if (!data || data.length === 0 || !curves || curves.length === 0) {
      return 0;
    }

    let totalNLA = 0;
    let validCurves = 0;

    for (const curve of curves) {
      const values = data
        .map(d => d[curve.mnemonic])
        .filter(v => v !== null && v !== undefined && !isNaN(v));

      if (values.length > 10) {
        // Calculate signal RMS (overall trend)
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const signalRMS = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        );

        // Calculate noise RMS (local variations)
        const differences = [];
        for (let i = 1; i < values.length; i++) {
          differences.push(Math.abs(values[i] - values[i - 1]));
        }
        const noiseRMS = Math.sqrt(
          differences.reduce((sum, d) => sum + Math.pow(d, 2), 0) / differences.length
        );

        if (noiseRMS > 0) {
          const nla = 20 * Math.log10(signalRMS / noiseRMS);
          totalNLA += nla;
          validCurves++;
        }
      }
    }

    return validCurves > 0 ? totalNLA / validCurves : 0;
  }

  /**
   * Calculate Physical Consistency Score (PCS)
   * Validates data against industry-standard ranges
   */
  static calculatePhysicalConsistencyScore(data: any[], curves: any[]): number {
    if (!data || data.length === 0 || !curves || curves.length === 0) {
      return 0;
    }

    const physicalRanges = {
      'GR': { min: 0, max: 300, tolerance: 0.05 },
      'NPHI': { min: -0.15, max: 1.0, tolerance: 0.03 },
      'RHOB': { min: 1.0, max: 3.5, tolerance: 0.02 },
      'RT': { min: 0.1, max: 10000, tolerance: 0.10 },
      'CALI': { min: 4, max: 20, tolerance: 0.01 }
    };

    let totalPoints = 0;
    let validPoints = 0;

    for (const curve of curves) {
      const range = physicalRanges[curve.mnemonic as keyof typeof physicalRanges];
      if (range) {
        for (const dataPoint of data) {
          const value = dataPoint[curve.mnemonic];
          if (value !== null && value !== undefined && !isNaN(value)) {
            totalPoints++;
            if (value >= range.min && value <= range.max) {
              validPoints++;
            }
          }
        }
      }
    }

    return totalPoints > 0 ? (validPoints / totalPoints) * 100 : 0;
  }

  /**
   * Calculate Depth Integrity Index (DII)
   * Assessment of depth interval consistency
   */
  static calculateDepthIntegrityIndex(data: any[]): number {
    if (!data || data.length < 2) {
      return 0;
    }

    const depths = data.map(d => d.depth).filter(d => d !== null && d !== undefined && !isNaN(d));
    if (depths.length < 2) {
      return 0;
    }

    let depthErrors = 0;
    const expectedStep = depths[1] - depths[0];

    for (let i = 1; i < depths.length; i++) {
      const actualStep = depths[i] - depths[i - 1];
      const stepError = Math.abs(actualStep - expectedStep);
      
      // Check for depth reversals
      if (actualStep <= 0) {
        depthErrors++;
      }
      // Check for significant step variations (>10% tolerance)
      else if (stepError > expectedStep * 0.1) {
        depthErrors++;
      }
    }

    return (1 - (depthErrors / (depths.length - 1))) * 100;
  }

  /**
   * Calculate Cross-Curve Correlation Factor (CCCF)
   * Statistical consistency between curves
   */
  static calculateCrossCurveCorrelationFactor(data: any[], curves: any[]): number {
    if (!data || data.length === 0 || !curves || curves.length < 2) {
      return 0;
    }

    const correlations = [];
    const expectedCorrelations = {
      'GR-NPHI': 0.3,  // Expected correlation between GR and NPHI
      'NPHI-RHOB': -0.7, // Expected correlation between NPHI and RHOB
      'GR-RHOB': -0.4,   // Expected correlation between GR and RHOB
    };

    for (let i = 0; i < curves.length; i++) {
      for (let j = i + 1; j < curves.length; j++) {
        const curve1 = curves[i];
        const curve2 = curves[j];
        const key = `${curve1.mnemonic}-${curve2.mnemonic}`;
        const reverseKey = `${curve2.mnemonic}-${curve1.mnemonic}`;
        
        const expectedCorr = expectedCorrelations[key as keyof typeof expectedCorrelations] || 
                           expectedCorrelations[reverseKey as keyof typeof expectedCorrelations] || 0;

        const values1 = data.map(d => d[curve1.mnemonic]).filter(v => v !== null && v !== undefined && !isNaN(v));
        const values2 = data.map(d => d[curve2.mnemonic]).filter(v => v !== null && v !== undefined && !isNaN(v));

        if (values1.length > 10 && values2.length > 10) {
          const correlation = this.calculatePearsonCorrelation(values1, values2);
          const correlationError = Math.abs(correlation - expectedCorr);
          correlations.push(correlationError);
        }
      }
    }

    return correlations.length > 0 ? correlations.reduce((sum, c) => sum + c, 0) / correlations.length : 0;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator !== 0 ? numerator / denominator : 0;
  }

  /**
   * Determine ALVARO Grade based on quality metrics
   */
  static determineGrade(metrics: ALVAROMetrics): 'A' | 'B' | 'C' | 'D' | 'F' {
    const { completenessIndex, noiseLevelAssessment, physicalConsistencyScore, depthIntegrityIndex } = metrics;

    // Grade A: 95-100% quality
    if (completenessIndex >= 98 && noiseLevelAssessment > 20 && 
        physicalConsistencyScore >= 95 && depthIntegrityIndex >= 95) {
      return 'A';
    }

    // Grade B: 85-94% quality
    if (completenessIndex >= 90 && noiseLevelAssessment > 15 && 
        physicalConsistencyScore >= 85 && depthIntegrityIndex >= 85) {
      return 'B';
    }

    // Grade C: 70-84% quality
    if (completenessIndex >= 75 && noiseLevelAssessment > 10 && 
        physicalConsistencyScore >= 70 && depthIntegrityIndex >= 70) {
      return 'C';
    }

    // Grade D: 50-69% quality
    if (completenessIndex >= 50 && noiseLevelAssessment > 5 && 
        physicalConsistencyScore >= 50 && depthIntegrityIndex >= 50) {
      return 'D';
    }

    // Grade F: 0-49% quality
    return 'F';
  }

  /**
   * Calculate confidence level based on uncertainty
   */
  static determineConfidenceLevel(uncertainty: number): 'High' | 'Medium' | 'Low' {
    if (uncertainty <= 5) return 'High';
    if (uncertainty <= 10) return 'Medium';
    return 'Low';
  }

  /**
   * Calculate uncertainty bounds for processing
   */
  static calculateUncertaintyBounds(processingSteps: ProcessingStep[]): number {
    let totalUncertainty = 0;

    for (const step of processingSteps) {
      let stepUncertainty = 0;

      switch (step.operation) {
        case 'denoising':
          if (step.parameters.method === 'savitzky_golay') {
            stepUncertainty = 3.5; // ±2-5% depending on window size
          } else if (step.parameters.method === 'wavelet') {
            stepUncertainty = 5.0; // ±3-7% depending on decomposition level
          } else {
            stepUncertainty = 2.0; // ±1-3% for moving average
          }
          break;
        case 'spike_detection':
          if (step.parameters.method === 'hampel') {
            stepUncertainty = 2.5; // ±1-4% false positive rate
          } else if (step.parameters.method === 'modified_zscore') {
            stepUncertainty = 4.0; // ±2-6% false positive rate
          } else {
            stepUncertainty = 5.5; // ±3-8% for IQR method
          }
          break;
        default:
          stepUncertainty = 2.0; // Default uncertainty
      }

      totalUncertainty += Math.pow(stepUncertainty, 2);
    }

    return Math.sqrt(totalUncertainty);
  }

  /**
   * Generate ALVARO certificate
   */
  static generateCertificate(
    lasFile: string,
    originalMetrics: ALVAROMetrics,
    processedMetrics: ALVAROMetrics,
    processingSteps: ProcessingStep[]
  ): ALVAROCertificate {
    const certificateId = `PPC-2025-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qualityImprovement = processedMetrics.overallGrade !== originalMetrics.overallGrade ? 
      this.calculateQualityImprovement(originalMetrics, processedMetrics) : 0;

    return {
      certificateId,
      issueDate: new Date().toISOString(),
      lasFile,
      processor: `POLISH v${this.VERSION}`,
      certificationLevel: this.CERTIFICATION_LEVEL,
      originalGrade: originalMetrics.overallGrade,
      processedGrade: processedMetrics.overallGrade,
      qualityImprovement,
      confidenceLevel: processedMetrics.confidenceLevel,
      uncertaintyBounds: processedMetrics.uncertaintyBounds,
      alvaroMetrics: processedMetrics,
      processingAuditTrail: processingSteps,
      complianceReferences: [
        'API RP 33: Log ASCII Standard',
        'SPWLA: Formation Evaluation Guidelines',
        'ISO 29001: Petroleum QMS',
        'ALVARO v1.0: Quality Assessment Methodology'
      ],
      digitalSignature: this.generateDigitalSignature(certificateId, processedMetrics)
    };
  }

  /**
   * Calculate quality improvement percentage
   */
  private static calculateQualityImprovement(original: ALVAROMetrics, processed: ALVAROMetrics): number {
    const gradeValues = { 'A': 95, 'B': 85, 'C': 70, 'D': 50, 'F': 25 };
    const originalValue = gradeValues[original.overallGrade];
    const processedValue = gradeValues[processed.overallGrade];
    
    return ((processedValue - originalValue) / originalValue) * 100;
  }

  /**
   * Generate digital signature for certificate
   */
  private static generateDigitalSignature(certificateId: string, metrics: ALVAROMetrics): string {
    const data = `${certificateId}:${JSON.stringify(metrics)}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Calculate comprehensive ALVARO metrics for a LAS file
   */
  static calculateALVAROMetrics(data: any[], curves: any[], processingSteps: ProcessingStep[] = []): ALVAROMetrics {
    const completenessIndex = this.calculateCompletenessIndex(data, curves);
    const noiseLevelAssessment = this.calculateNoiseLevelAssessment(data, curves);
    const physicalConsistencyScore = this.calculatePhysicalConsistencyScore(data, curves);
    const depthIntegrityIndex = this.calculateDepthIntegrityIndex(data);
    const crossCurveCorrelationFactor = this.calculateCrossCurveCorrelationFactor(data, curves);
    const uncertaintyBounds = this.calculateUncertaintyBounds(processingSteps);

    const metrics: ALVAROMetrics = {
      completenessIndex,
      noiseLevelAssessment,
      physicalConsistencyScore,
      depthIntegrityIndex,
      crossCurveCorrelationFactor,
      overallGrade: 'F', // Will be determined below
      confidenceLevel: 'Low', // Will be determined below
      uncertaintyBounds
    };

    metrics.overallGrade = this.determineGrade(metrics);
    metrics.confidenceLevel = this.determineConfidenceLevel(uncertaintyBounds);

    return metrics;
  }
} 