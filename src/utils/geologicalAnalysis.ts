/**
 * POLISH Geological Analysis Engine
 * 
 * This module provides lithology classification and formation-specific
 * processing parameters for enhanced petrophysical data analysis.
 */

export interface LithologyResult {
  type: 'shale' | 'sandstone' | 'limestone' | 'dolomite' | 'unknown';
  confidence: number;
  indicators: string[];
  neutronDensitySeparation?: number;
  gammaRayCharacter?: string;
  photoelectricFactor?: number;
  porosity?: number;
  mineralogy?: string[];
}

export interface GeologicalContext {
  dominantLithology: LithologyResult;
  alternativeLithologies: LithologyResult[];
  formationQuality: 'excellent' | 'good' | 'fair' | 'poor';
  geologicalConsistency: number;
  crossCurveValidation: CrossCurveValidation;
  recommendations: string[];
}

export interface CrossCurveValidation {
  neutronDensityConsistency: number;
  gammaRayLithologyMatch: number;
  porosityDensityRelationship: number;
  photoelectricFactorMatch: number;
  overallConsistency: number;
  flags: ValidationFlag[];
}

export interface ValidationFlag {
  type: 'warning' | 'error' | 'info';
  curve: string;
  message: string;
  depth?: number;
}

// Formation-specific processing parameters
export const FORMATION_PARAMS = {
  shale: {
    hampelThreshold: 2.0,    // More sensitive for clay-rich formations
    sgWindow: 15,            // Larger smoothing window for heterogeneous shales
    sgPolynomial: 3,
    physicalRanges: {
      'GR': { min: 80, max: 300 },      // High gamma ray
      'NPHI': { min: 0.15, max: 0.45 }, // Higher apparent porosity
      'RHOB': { min: 2.0, max: 2.8 },   // Lower bulk density
      'PEF': { min: 2.8, max: 3.5 },    // Clay mineral range
      'RT': { min: 0.5, max: 50 }       // Generally low resistivity
    },
    qualityExpectations: {
      noiseLevel: 0.25,      // Higher noise tolerance
      spikeThreshold: 0.15,  // More spikes expected
      completeness: 0.90     // Good completeness expected
    },
    characteristics: [
      'High gamma ray response',
      'Low resistivity',
      'High neutron porosity',
      'Low bulk density',
      'Photoelectric factor 2.8-3.5'
    ]
  },
  sandstone: {
    hampelThreshold: 2.8,    // Moderate sensitivity
    sgWindow: 9,             // Preserve detail in clean sands
    sgPolynomial: 3,
    physicalRanges: {
      'GR': { min: 10, max: 100 },      // Low to moderate gamma ray
      'NPHI': { min: 0.05, max: 0.35 }, // Variable porosity
      'RHOB': { min: 2.0, max: 2.8 },   // Quartz density influence
      'PEF': { min: 1.8, max: 2.2 },    // Quartz photoelectric factor
      'RT': { min: 1, max: 1000 }       // Wide resistivity range
    },
    qualityExpectations: {
      noiseLevel: 0.15,      // Lower noise expected
      spikeThreshold: 0.10,  // Fewer spikes
      completeness: 0.95     // High completeness expected
    },
    characteristics: [
      'Low to moderate gamma ray',
      'Variable resistivity',
      'Quartz-dominated mineralogy',
      'Photoelectric factor ~1.8',
      'Good log quality expected'
    ]
  },
  limestone: {
    hampelThreshold: 3.2,    // Less sensitive - preserve fractures
    sgWindow: 7,             // Sharp features for fractures
    sgPolynomial: 2,
    physicalRanges: {
      'GR': { min: 5, max: 80 },        // Generally low gamma ray
      'NPHI': { min: 0.0, max: 0.30 },  // Low to moderate porosity
      'RHOB': { min: 2.3, max: 2.8 },   // Calcite density
      'PEF': { min: 4.5, max: 5.5 },    // Calcite photoelectric factor
      'RT': { min: 5, max: 5000 }       // Variable resistivity
    },
    qualityExpectations: {
      noiseLevel: 0.12,      // Low noise expected
      spikeThreshold: 0.20,  // Fractures may cause spikes
      completeness: 0.92     // Good completeness
    },
    characteristics: [
      'Low gamma ray response',
      'High photoelectric factor (~5.0)',
      'Calcite-dominated mineralogy',
      'Potential fracture-related spikes',
      'Variable porosity development'
    ]
  },
  dolomite: {
    hampelThreshold: 3.0,    // Moderate sensitivity
    sgWindow: 9,             // Balanced approach
    sgPolynomial: 3,
    physicalRanges: {
      'GR': { min: 5, max: 60 },        // Low gamma ray
      'NPHI': { min: 0.0, max: 0.25 },  // Lower apparent porosity
      'RHOB': { min: 2.6, max: 2.9 },   // Dolomite density
      'PEF': { min: 2.8, max: 3.2 },    // Dolomite photoelectric factor
      'RT': { min: 10, max: 8000 }      // Generally high resistivity
    },
    qualityExpectations: {
      noiseLevel: 0.10,      // Very low noise expected
      spikeThreshold: 0.08,  // Few spikes expected
      completeness: 0.95     // High completeness expected
    },
    characteristics: [
      'Very low gamma ray',
      'High bulk density',
      'Photoelectric factor ~3.0',
      'Often high resistivity',
      'Dolomite-dominated mineralogy'
    ]
  },
  unknown: {
    hampelThreshold: 2.5,    // Default moderate settings
    sgWindow: 11,
    sgPolynomial: 3,
    physicalRanges: {
      'GR': { min: 0, max: 300 },
      'NPHI': { min: -0.15, max: 1.0 },
      'RHOB': { min: 1.0, max: 3.5 },
      'PEF': { min: 1.0, max: 10.0 },
      'RT': { min: 0.1, max: 10000 }
    },
    qualityExpectations: {
      noiseLevel: 0.20,
      spikeThreshold: 0.15,
      completeness: 0.90
    },
    characteristics: [
      'Mixed or unknown lithology',
      'Standard processing parameters',
      'Broad quality expectations'
    ]
  }
};

/**
 * Infer lithology from petrophysical curves using standard relationships
 */
export function inferLithology(data: any[], curves: any[]): LithologyResult {
  if (!data || data.length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      indicators: ['Insufficient data for analysis']
    };
  }

  // Extract curve data
  const grData = extractCurveData(data, 'GR');
  const nphiData = extractCurveData(data, 'NPHI');
  const rhobData = extractCurveData(data, 'RHOB');
  const pefData = extractCurveData(data, 'PEF');
  const rtData = extractCurveData(data, 'RT');

  // Calculate statistical measures
  const grMean = calculateMean(grData);
  const nphiMean = calculateMean(nphiData);
  const rhobMean = calculateMean(rhobData);
  const pefMean = calculateMean(pefData);
  const rtMean = calculateMean(rtData);

  const indicators: string[] = [];
  let confidence = 0;
  let lithologyScores = {
    shale: 0,
    sandstone: 0,
    limestone: 0,
    dolomite: 0
  };

  // Gamma Ray Analysis
  if (grData.length > 0) {
    if (grMean > 80) {
      lithologyScores.shale += 30;
      indicators.push(`High gamma ray (${grMean.toFixed(1)} API) suggests clay content`);
    } else if (grMean < 40) {
      lithologyScores.limestone += 20;
      lithologyScores.dolomite += 20;
      lithologyScores.sandstone += 15;
      indicators.push(`Low gamma ray (${grMean.toFixed(1)} API) suggests clean formation`);
    } else {
      lithologyScores.sandstone += 25;
      indicators.push(`Moderate gamma ray (${grMean.toFixed(1)} API) suggests sandy formation`);
    }
  }

  // Photoelectric Factor Analysis
  if (pefData.length > 0) {
    if (pefMean >= 4.5 && pefMean <= 5.5) {
      lithologyScores.limestone += 35;
      indicators.push(`PEF ~${pefMean.toFixed(1)} indicates calcite mineralogy`);
    } else if (pefMean >= 2.8 && pefMean <= 3.2) {
      lithologyScores.dolomite += 30;
      indicators.push(`PEF ~${pefMean.toFixed(1)} indicates dolomite mineralogy`);
    } else if (pefMean >= 1.8 && pefMean <= 2.2) {
      lithologyScores.sandstone += 30;
      indicators.push(`PEF ~${pefMean.toFixed(1)} indicates quartz mineralogy`);
    } else if (pefMean >= 2.8 && pefMean <= 3.5) {
      lithologyScores.shale += 25;
      indicators.push(`PEF ~${pefMean.toFixed(1)} suggests clay minerals`);
    }
  }

  // Neutron-Density Analysis
  if (nphiData.length > 0 && rhobData.length > 0) {
    const neutronDensitySeparation = calculateNeutronDensitySeparation(nphiData, rhobData);
    
    if (neutronDensitySeparation > 0.15) {
      lithologyScores.shale += 25;
      indicators.push(`Large neutron-density separation (${neutronDensitySeparation.toFixed(3)}) indicates clay`);
    } else if (neutronDensitySeparation < 0.05) {
      lithologyScores.limestone += 20;
      lithologyScores.dolomite += 15;
      indicators.push(`Small neutron-density separation indicates clean carbonate`);
    }

    // Bulk density analysis
    if (rhobMean > 2.7) {
      lithologyScores.dolomite += 20;
      lithologyScores.limestone += 15;
      indicators.push(`High bulk density (${rhobMean.toFixed(2)} g/cm³) suggests carbonate`);
    } else if (rhobMean < 2.4) {
      lithologyScores.shale += 20;
      indicators.push(`Low bulk density (${rhobMean.toFixed(2)} g/cm³) suggests clay content`);
    }
  }

  // Resistivity Analysis
  if (rtData.length > 0) {
    if (rtMean < 10) {
      lithologyScores.shale += 15;
      indicators.push(`Low resistivity suggests conductive clay minerals`);
    } else if (rtMean > 100) {
      lithologyScores.limestone += 10;
      lithologyScores.dolomite += 15;
      lithologyScores.sandstone += 10;
      indicators.push(`High resistivity suggests clean, tight formation`);
    }
  }

  // Determine dominant lithology
  const maxScore = Math.max(...Object.values(lithologyScores));
  const dominantLithology = Object.entries(lithologyScores).find(([_, score]) => score === maxScore)?.[0] as any;
  
  // Calculate confidence based on score separation
  const sortedScores = Object.values(lithologyScores).sort((a, b) => b - a);
  const scoreSeparation = sortedScores[0] - sortedScores[1];
  confidence = Math.min(100, (maxScore / 100) * 100 + scoreSeparation);

  // Add confidence-based indicators
  if (confidence > 80) {
    indicators.push('High confidence lithology identification');
  } else if (confidence > 60) {
    indicators.push('Moderate confidence lithology identification');
  } else {
    indicators.push('Low confidence - mixed or transitional lithology');
  }

  return {
    type: dominantLithology || 'unknown',
    confidence: Math.round(confidence),
    indicators,
    neutronDensitySeparation: nphiData.length > 0 && rhobData.length > 0 ? 
      calculateNeutronDensitySeparation(nphiData, rhobData) : undefined,
    gammaRayCharacter: grData.length > 0 ? 
      (grMean > 80 ? 'High' : grMean < 40 ? 'Low' : 'Moderate') : undefined,
    photoelectricFactor: pefData.length > 0 ? pefMean : undefined,
    porosity: nphiData.length > 0 ? nphiMean : undefined,
    mineralogy: determineMineralogy(pefMean, grMean)
  };
}

/**
 * Perform comprehensive geological analysis
 */
export function performGeologicalAnalysis(data: any[], curves: any[]): GeologicalContext {
  const dominantLithology = inferLithology(data, curves);
  
  // Generate alternative lithologies
  const alternativeLithologies: LithologyResult[] = [];
  
  // Cross-curve validation
  const crossCurveValidation = performCrossCurveValidation(data, curves, dominantLithology);
  
  // Formation quality assessment
  const formationQuality = assessFormationQuality(dominantLithology, crossCurveValidation);
  
  // Geological consistency
  const geologicalConsistency = calculateGeologicalConsistency(crossCurveValidation);
  
  // Generate recommendations
  const recommendations = generateGeologicalRecommendations(
    dominantLithology, 
    crossCurveValidation, 
    formationQuality
  );

  return {
    dominantLithology,
    alternativeLithologies,
    formationQuality,
    geologicalConsistency,
    crossCurveValidation,
    recommendations
  };
}

/**
 * Perform cross-curve validation for geological consistency
 */
export function performCrossCurveValidation(
  data: any[], 
  curves: any[], 
  lithology: LithologyResult
): CrossCurveValidation {
  const flags: ValidationFlag[] = [];
  
  // Extract curve data
  const grData = extractCurveData(data, 'GR');
  const nphiData = extractCurveData(data, 'NPHI');
  const rhobData = extractCurveData(data, 'RHOB');
  const pefData = extractCurveData(data, 'PEF');
  const rtData = extractCurveData(data, 'RT');

  // Neutron-Density consistency
  let neutronDensityConsistency = 100;
  if (nphiData.length > 0 && rhobData.length > 0) {
    const separation = calculateNeutronDensitySeparation(nphiData, rhobData);
    const expectedSeparation = getExpectedNeutronDensitySeparation(lithology.type);
    const deviation = Math.abs(separation - expectedSeparation);
    neutronDensityConsistency = Math.max(0, 100 - (deviation * 500));
    
    if (deviation > 0.1) {
      flags.push({
        type: 'warning',
        curve: 'NPHI-RHOB',
        message: `Neutron-density separation (${separation.toFixed(3)}) inconsistent with ${lithology.type}`
      });
    }
  }

  // Gamma Ray - Lithology consistency
  let gammaRayLithologyMatch = 100;
  if (grData.length > 0) {
    const grMean = calculateMean(grData);
    const expectedRange = FORMATION_PARAMS[lithology.type].physicalRanges['GR'];
    if (grMean < expectedRange.min || grMean > expectedRange.max) {
      gammaRayLithologyMatch = Math.max(0, 100 - Math.abs(grMean - (expectedRange.min + expectedRange.max) / 2));
      flags.push({
        type: 'warning',
        curve: 'GR',
        message: `Gamma ray (${grMean.toFixed(1)} API) outside expected range for ${lithology.type}`
      });
    }
  }

  // Porosity-Density relationship
  let porosityDensityRelationship = 100;
  if (nphiData.length > 0 && rhobData.length > 0) {
    const correlation = calculateCorrelation(nphiData, rhobData);
    const expectedCorrelation = getExpectedPorosityDensityCorrelation(lithology.type);
    const correlationDeviation = Math.abs(correlation - expectedCorrelation);
    porosityDensityRelationship = Math.max(0, 100 - (correlationDeviation * 100));
    
    if (correlationDeviation > 0.3) {
      flags.push({
        type: 'info',
        curve: 'NPHI-RHOB',
        message: `Porosity-density correlation (${correlation.toFixed(2)}) differs from expected for ${lithology.type}`
      });
    }
  }

  // Photoelectric Factor consistency
  let photoelectricFactorMatch = 100;
  if (pefData.length > 0) {
    const pefMean = calculateMean(pefData);
    const expectedRange = FORMATION_PARAMS[lithology.type].physicalRanges['PEF'];
    if (pefMean < expectedRange.min || pefMean > expectedRange.max) {
      photoelectricFactorMatch = Math.max(0, 100 - Math.abs(pefMean - (expectedRange.min + expectedRange.max) / 2) * 20);
      flags.push({
        type: 'warning',
        curve: 'PEF',
        message: `Photoelectric factor (${pefMean.toFixed(1)}) inconsistent with ${lithology.type} mineralogy`
      });
    }
  }

  const overallConsistency = (
    neutronDensityConsistency + 
    gammaRayLithologyMatch + 
    porosityDensityRelationship + 
    photoelectricFactorMatch
  ) / 4;

  return {
    neutronDensityConsistency,
    gammaRayLithologyMatch,
    porosityDensityRelationship,
    photoelectricFactorMatch,
    overallConsistency,
    flags
  };
}

// Helper functions
function extractCurveData(data: any[], curveName: string): number[] {
  return data
    .map(d => d[curveName])
    .filter(v => v !== null && v !== undefined && !isNaN(v));
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateNeutronDensitySeparation(neutron: number[], density: number[]): number {
  if (neutron.length === 0 || density.length === 0) return 0;
  
  const minLength = Math.min(neutron.length, density.length);
  let totalSeparation = 0;
  
  for (let i = 0; i < minLength; i++) {
    // Neutron-density separation calculation
    const porosity = neutron[i];
    const bulkDensity = density[i];
    const matrixDensity = 2.65; // Assume quartz matrix
    const fluidDensity = 1.0;   // Assume water
    
    const densityPorosity = (matrixDensity - bulkDensity) / (matrixDensity - fluidDensity);
    const separation = Math.abs(porosity - densityPorosity);
    totalSeparation += separation;
  }
  
  return totalSeparation / minLength;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0) return 0;
  
  const n = Math.min(x.length, y.length);
  const meanX = calculateMean(x.slice(0, n));
  const meanY = calculateMean(y.slice(0, n));
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getExpectedNeutronDensitySeparation(lithology: string): number {
  const separations = {
    shale: 0.15,
    sandstone: 0.05,
    limestone: 0.02,
    dolomite: 0.03,
    unknown: 0.08
  };
  return separations[lithology as keyof typeof separations] || 0.08;
}

function getExpectedPorosityDensityCorrelation(lithology: string): number {
  const correlations = {
    shale: -0.6,      // Moderate negative correlation
    sandstone: -0.8,  // Strong negative correlation
    limestone: -0.7,  // Good negative correlation
    dolomite: -0.75,  // Good negative correlation
    unknown: -0.6
  };
  return correlations[lithology as keyof typeof correlations] || -0.6;
}

function determineMineralogy(pef: number, gr: number): string[] {
  const minerals: string[] = [];
  
  if (pef >= 4.5 && pef <= 5.5) {
    minerals.push('Calcite');
  }
  if (pef >= 2.8 && pef <= 3.2) {
    minerals.push('Dolomite');
  }
  if (pef >= 1.8 && pef <= 2.2) {
    minerals.push('Quartz');
  }
  if (gr > 80) {
    minerals.push('Clay minerals');
  }
  if (pef > 5.5) {
    minerals.push('Heavy minerals');
  }
  
  return minerals.length > 0 ? minerals : ['Mixed mineralogy'];
}

function assessFormationQuality(
  lithology: LithologyResult, 
  validation: CrossCurveValidation
): 'excellent' | 'good' | 'fair' | 'poor' {
  const score = (lithology.confidence + validation.overallConsistency) / 2;
  
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'poor';
}

function calculateGeologicalConsistency(validation: CrossCurveValidation): number {
  return validation.overallConsistency;
}

function generateGeologicalRecommendations(
  lithology: LithologyResult,
  validation: CrossCurveValidation,
  quality: string
): string[] {
  const recommendations: string[] = [];
  
  // Lithology-specific recommendations
  const params = FORMATION_PARAMS[lithology.type];
  recommendations.push(`Use ${lithology.type}-specific processing parameters`);
  recommendations.push(`Apply Hampel threshold of ${params.hampelThreshold} for optimal spike detection`);
  recommendations.push(`Use Savitzky-Golay window size of ${params.sgWindow} for formation-appropriate smoothing`);
  
  // Quality-based recommendations
  if (quality === 'poor') {
    recommendations.push('Consider additional quality control measures');
    recommendations.push('Review logging conditions and tool performance');
  }
  
  // Validation-based recommendations
  if (validation.overallConsistency < 70) {
    recommendations.push('Investigate cross-curve inconsistencies');
    recommendations.push('Verify tool calibration and environmental corrections');
  }
  
  // Confidence-based recommendations
  if (lithology.confidence < 60) {
    recommendations.push('Mixed lithology detected - consider interval-specific analysis');
    recommendations.push('Additional geological information may improve interpretation');
  }
  
  return recommendations;
}

/**
 * Get formation-specific processing parameters
 */
export function getFormationProcessingParams(lithology: string) {
  return FORMATION_PARAMS[lithology as keyof typeof FORMATION_PARAMS] || FORMATION_PARAMS.unknown;
}

/**
 * Apply geological context to quality scoring
 */
export function applyGeologicalQualityScoring(
  baseScore: number,
  geologicalContext: GeologicalContext
): number {
  let adjustedScore = baseScore;
  
  // Adjust based on formation quality expectations
  const expectedQuality = FORMATION_PARAMS[geologicalContext.dominantLithology.type].qualityExpectations;
  
  // Bonus for meeting formation-specific expectations
  if (geologicalContext.geologicalConsistency > 80) {
    adjustedScore += 5;
  }
  
  // Penalty for geological inconsistencies
  if (geologicalContext.geologicalConsistency < 50) {
    adjustedScore -= 10;
  }
  
  // Confidence adjustment
  const confidenceBonus = (geologicalContext.dominantLithology.confidence - 50) / 10;
  adjustedScore += confidenceBonus;
  
  return Math.max(0, Math.min(100, adjustedScore));
}