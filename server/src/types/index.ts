/**
 * POLISH Type Definitions
 * 
 * Core type definitions for the POLISH application.
 */

export interface LASFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  version: string;
  header: LASHeader;
  curves: LASCurve[];
  data: LASData[];
  originalData?: LASData[];
  processedData?: LASData[];
  displayOriginalData?: boolean;
  qcResults?: QCResults;
  processingHistory?: ProcessingStep[];
  exportStatus?: 'free' | 'premium' | 'exported';
  qualityScore?: number;
}

export interface LASHeader {
  version: string;
  wrap: boolean;
  startDepth: number;
  stopDepth: number;
  step: number;
  nullValue: number;
  company: string;
  well: string;
  field: string;
  location: string;
  date: string;
  uwi: string;
  serviceCompany?: string;
  logDate?: string;
  elevation?: number;
}

export interface LASCurve {
  mnemonic: string;
  unit: string;
  description: string;
  standardMnemonic?: string;
  dataType: 'depth' | 'log' | 'computed';
  curveType: 'gamma_ray' | 'resistivity' | 'porosity' | 'caliper' | 'sp' | 'drilling' | 'custom';
  track: number;
  color: string;
  scale: 'linear' | 'logarithmic';
  minValue?: number;
  maxValue?: number;
  visible: boolean;
  statistics?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    nullCount: number;
    outliers: number;
    qualityScore: number;
  };
}

export interface LASData {
  depth: number;
  [key: string]: number | null;
}

export interface QCResults {
  totalPoints: number;
  nullPoints: number;
  spikesDetected: number;
  noiseLevel: number;
  depthConsistency: boolean;
  overallQualityScore: number;
  geologicalContext?: GeologicalContext;
  curveQuality: Record<string, CurveQuality>;
  mnemonicStandardization: {
    standardized: number;
    nonStandard: string[];
    mappings: Record<string, string>;
  };
  physicalValidation: {
    passed: number;
    failed: number;
    warnings: string[];
  };
  recommendations: QCRecommendation[];
}

export interface CurveQuality {
  completeness: number;
  noiseLevel: number;
  spikes: number;
  physicallyValid: boolean;
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
}

export interface QCRecommendation {
  type: 'critical' | 'warning' | 'info';
  curve?: string;
  message: string;
  action?: string;
}

export interface ProcessingStep {
  id: string;
  timestamp: Date;
  operation: string;
  parameters: Record<string, any>;
  curvesAffected: string[];
  description: string;
}

export interface ProcessingOptions {
  denoise: {
    enabled: boolean;
    method: 'savitzky_golay' | 'wavelet' | 'moving_average' | 'gaussian';
    windowSize: number;
    polynomialOrder?: number;
    waveletType?: string;
    strength: number;
    preserveSpikes: boolean;
  };
  despike: {
    enabled: boolean;
    method: 'hampel' | 'modified_zscore' | 'iqr' | 'manual';
    threshold: number;
    windowSize: number;
    replacementMethod: 'pchip' | 'linear' | 'median' | 'null';
    manualSpikes?: Array<{ depth: number; curve: string }>;
  };
  validation: {
    enabled: boolean;
    physicalRanges: Record<string, { min: number; max: number }>;
    crossValidation: boolean;
    flagOutliers: boolean;
  };
  mnemonics: {
    enabled: boolean;
    standard: 'api' | 'cwls' | 'custom';
    autoStandardize: boolean;
    customMappings: Record<string, string>;
    preserveOriginal: boolean;
  };
  depthAlignment: {
    enabled: boolean;
    referenceDepth: number;
    shiftTolerance: number;
    autoCorrect: boolean;
  };
}

export interface TrackConfiguration {
  id: number;
  name: string;
  width: number;
  curves: string[];
  scale: 'linear' | 'logarithmic';
  minValue?: number;
  maxValue?: number;
  gridLines: boolean;
  backgroundColor: string;
}

export interface VisualizationSettings {
  tracks: TrackConfiguration[];
  depthRange: [number, number];
  showGrid: boolean;
  showDepthLabels: boolean;
  curveThickness: number;
  backgroundColor: string;
  syncZoom: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  purchasedReports?: boolean;
  purchasedExports?: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  processingDefaults: Partial<ProcessingOptions>;
  visualizationDefaults: Partial<VisualizationSettings>;
  mnemonicStandard: 'api' | 'cwls';
  colorScheme: 'default' | 'high_contrast' | 'colorblind_friendly';
  autoSave: boolean;
  notifications: boolean;
}

export interface ExportOptions {
  format: 'las' | 'csv' | 'xlsx' | 'json' | 'ascii' | 'witsml' | 'segy';
  includeQC: boolean;
  includeProcessingHistory: boolean;
  customFormatting?: Record<string, any>;
}

export interface ConversionJob {
  id: string;
  fileId: string;
  format: ExportOptions['format'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    filesPerMonth: number;
    conversionsPerMonth: number;
    maxFileSize: number;
  };
}

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