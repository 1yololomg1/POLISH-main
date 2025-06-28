/**
 * POLISH LAS File Parser
 * 
 * A production-ready LAS file parser supporting LAS 2.0 and 3.0 formats.
 * Handles real-world LAS files with varying formats and standards.
 */

import { LASFile, LASHeader, LASCurve, LASData } from '../types';
import { MnemonicStandardizer } from './MnemonicStandardizer';

export interface ParseResult {
  success: boolean;
  data?: LASFile;
  error?: string;
  warnings: string[];
  parseTime: number;
}

export interface ParseOptions {
  autoStandardizeMnemonics?: boolean;
  mnemonicStandard?: 'api' | 'cwls' | 'custom';
  preserveOriginalMnemonics?: boolean;
  validatePhysicalRanges?: boolean;
  maxFileSize?: number; // in bytes
  strictMode?: boolean;
}

export class LASParser {
  private standardizer: MnemonicStandardizer;
  private readonly defaultMaxFileSize = 100 * 1024 * 1024; // 100MB

  constructor() {
    this.standardizer = new MnemonicStandardizer();
  }

  /**
   * Parse a LAS file from a buffer
   */
  async parse(
    buffer: Buffer,
    fileName: string,
    options: ParseOptions = {}
  ): Promise<ParseResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Validate file size
      if (buffer.length > (options.maxFileSize || this.defaultMaxFileSize)) {
        return {
          success: false,
          error: `File size (${buffer.length} bytes) exceeds maximum allowed size`,
          warnings,
          parseTime: Date.now() - startTime
        };
      }

      // Convert buffer to string
      const content = buffer.toString('utf8');
      if (!content.trim()) {
        return {
          success: false,
          error: 'File is empty or contains no valid content',
          warnings,
          parseTime: Date.now() - startTime
        };
      }

      // Split into sections
      const sections = this.parseSections(content);
      
      // Parse header
      const header = this.parseHeader(sections.version, warnings);
      
      // Parse well information
      const wellInfo = this.parseWellInfo(sections.well, warnings);
      
      // Parse curve information
      const curves = this.parseCurves(sections.curve, warnings);
      
      // Parse data
      const data = this.parseData(sections.data, curves, header, warnings);
      
      // Standardize mnemonics if requested
      if (options.autoStandardizeMnemonics) {
        const standardizationResult = await this.standardizeMnemonics(
          curves,
          options.mnemonicStandard || 'api',
          options.preserveOriginalMnemonics || false
        );
        if (standardizationResult.success) {
          curves.splice(0, curves.length, ...standardizationResult.standardizedCurves);
          warnings.push(...standardizationResult.warnings);
        }
      }

      // Validate physical ranges if requested
      if (options.validatePhysicalRanges) {
        this.validatePhysicalRanges(data, curves, warnings);
      }

      const lasFile: LASFile = {
        id: this.generateFileId(fileName),
        name: fileName,
        size: buffer.length,
        uploadedAt: new Date(),
        processed: false,
        version: header.version,
        header: { ...header, ...wellInfo },
        curves,
        data,
        originalData: data, // Keep original for comparison
        qualityScore: this.calculateInitialQualityScore(data, curves)
      };

      return {
        success: true,
        data: lasFile,
        warnings,
        parseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        warnings,
        parseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Parse LAS file sections
   */
  private parseSections(content: string): {
    version: string[];
    well: string[];
    curve: string[];
    data: string[];
  } {
    const lines = content.split('\n');
    const sections = {
      version: [] as string[],
      well: [] as string[],
      curve: [] as string[],
      data: [] as string[]
    };

    let currentSection = '';
    let inDataSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments (except section headers)
      if (!trimmedLine || (trimmedLine.startsWith('#') && !trimmedLine.startsWith('~'))) {
        continue;
      }

      // Check for section headers
      if (trimmedLine.startsWith('~')) {
        const sectionName = trimmedLine.substring(1).toLowerCase();
        if (sectionName.startsWith('v')) {
          currentSection = 'version';
          sections.version.push(trimmedLine);
        } else if (sectionName.startsWith('w')) {
          currentSection = 'well';
          sections.well.push(trimmedLine);
        } else if (sectionName.startsWith('c')) {
          currentSection = 'curve';
          sections.curve.push(trimmedLine);
        } else if (sectionName.startsWith('a') || sectionName.startsWith('o')) {
          currentSection = 'data';
          inDataSection = true;
          sections.data.push(trimmedLine);
        }
        continue;
      }

      // Add line to appropriate section
      if (currentSection === 'version') {
        sections.version.push(trimmedLine);
      } else if (currentSection === 'well') {
        sections.well.push(trimmedLine);
      } else if (currentSection === 'curve') {
        sections.curve.push(trimmedLine);
      } else if (currentSection === 'data' && inDataSection) {
        sections.data.push(trimmedLine);
      }
    }

    return sections;
  }

  /**
   * Parse version section
   */
  private parseHeader(versionLines: string[], warnings: string[]): LASHeader {
    const header: Partial<LASHeader> = {
      version: '2.0',
      wrap: false,
      startDepth: 0,
      stopDepth: 0,
      step: 0,
      nullValue: -999.25,
      company: '',
      well: '',
      field: '',
      location: '',
      date: new Date().toISOString(),
      uwi: ''
    };

    for (const line of versionLines) {
      if (line.startsWith('~V')) continue;
      
      const parts = line.split(':').map(p => p.trim());
      if (parts.length < 2) continue;

      const key = parts[0].toLowerCase();
      const value = parts.slice(1).join(':').trim();

      switch (key) {
        case 'vers':
          header.version = value;
          break;
        case 'wrap':
          header.wrap = value.toLowerCase() === 'yes';
          break;
        case 'null':
          header.nullValue = parseFloat(value) || -999.25;
          break;
        case 'step':
          header.step = parseFloat(value) || 0;
          break;
        case 'strt':
          header.startDepth = parseFloat(value) || 0;
          break;
        case 'stop':
          header.stopDepth = parseFloat(value) || 0;
          break;
      }
    }

    return header as LASHeader;
  }

  /**
   * Parse well information section
   */
  private parseWellInfo(wellLines: string[], warnings: string[]): Partial<LASHeader> {
    const wellInfo: Partial<LASHeader> = {};

    for (const line of wellLines) {
      if (line.startsWith('~W')) continue;
      
      const parts = line.split(':').map(p => p.trim());
      if (parts.length < 2) continue;

      const key = parts[0].toLowerCase();
      const value = parts.slice(1).join(':').trim();

      switch (key) {
        case 'comp':
          wellInfo.company = value;
          break;
        case 'well':
          wellInfo.well = value;
          break;
        case 'fld':
          wellInfo.field = value;
          break;
        case 'loc':
          wellInfo.location = value;
          break;
        case 'date':
          wellInfo.date = value;
          break;
        case 'uwi':
          wellInfo.uwi = value;
          break;
        case 'srv':
          wellInfo.serviceCompany = value;
          break;
        case 'log':
          wellInfo.logDate = value;
          break;
        case 'elev':
          wellInfo.elevation = parseFloat(value);
          break;
      }
    }

    return wellInfo;
  }

  /**
   * Parse curve information section
   */
  private parseCurves(curveLines: string[], warnings: string[]): LASCurve[] {
    const curves: LASCurve[] = [];
    let curveIndex = 0;

    for (const line of curveLines) {
      if (line.startsWith('~C')) continue;
      
      const parts = line.split(':').map(p => p.trim());
      if (parts.length < 2) continue;

      const mnemonic = parts[0];
      const description = parts.slice(1).join(':').trim();
      
      // Skip depth curve as it's handled separately
      if (mnemonic.toLowerCase() === 'dept' || mnemonic.toLowerCase() === 'depth') {
        continue;
      }

      const curve: LASCurve = {
        mnemonic,
        unit: this.extractUnit(description),
        description: this.extractDescription(description),
        dataType: 'log',
        curveType: this.inferCurveType(mnemonic, description),
        track: this.determineTrack(mnemonic, curveIndex),
        color: this.getCurveColor(curveIndex),
        scale: this.determineScale(mnemonic),
        visible: true,
        statistics: {
          min: 0,
          max: 0,
          mean: 0,
          std: 0,
          nullCount: 0,
          outliers: 0,
          qualityScore: 0
        }
      };

      curves.push(curve);
      curveIndex++;
    }

    return curves;
  }

  /**
   * Parse data section
   */
  private parseData(
    dataLines: string[],
    curves: LASCurve[],
    header: LASHeader,
    warnings: string[]
  ): LASData[] {
    const data: LASData[] = [];
    const nullValue = header.nullValue;

    for (const line of dataLines) {
      if (line.startsWith('~A') || line.startsWith('~O')) continue;
      
      const values = line.split(/\s+/).filter(v => v.trim());
      if (values.length === 0) continue;

      const dataPoint: LASData = {
        depth: parseFloat(values[0]) || 0
      };

      // Parse curve values
      for (let i = 1; i < Math.min(values.length, curves.length + 1); i++) {
        const value = parseFloat(values[i]);
        const curve = curves[i - 1];
        
        if (curve) {
          dataPoint[curve.mnemonic] = isNaN(value) || value === nullValue ? null : value;
        }
      }

      data.push(dataPoint);
    }

    // Calculate statistics for each curve
    this.calculateCurveStatistics(data, curves);

    return data;
  }

  /**
   * Extract unit from curve description
   */
  private extractUnit(description: string): string {
    const unitMatch = description.match(/\(([^)]+)\)/);
    return unitMatch ? unitMatch[1] : 'N/A';
  }

  /**
   * Extract description without unit
   */
  private extractDescription(description: string): string {
    return description.replace(/\s*\([^)]+\)\s*/, '').trim();
  }

  /**
   * Infer curve type from mnemonic and description
   */
  private inferCurveType(mnemonic: string, description: string): LASCurve['curveType'] {
    const mnemonicLower = mnemonic.toLowerCase();
    const descLower = description.toLowerCase();

    if (mnemonicLower.includes('gr') || descLower.includes('gamma')) {
      return 'gamma_ray';
    }
    if (mnemonicLower.includes('rt') || mnemonicLower.includes('res') || descLower.includes('resistivity')) {
      return 'resistivity';
    }
    if (mnemonicLower.includes('phi') || mnemonicLower.includes('por') || descLower.includes('porosity')) {
      return 'porosity';
    }
    if (mnemonicLower.includes('cal') || descLower.includes('caliper')) {
      return 'caliper';
    }
    if (mnemonicLower.includes('sp') || descLower.includes('spontaneous')) {
      return 'sp';
    }
    if (mnemonicLower.includes('pe') || descLower.includes('photoelectric')) {
      return 'custom';
    }
    
    return 'custom';
  }

  /**
   * Determine track for curve display
   */
  private determineTrack(mnemonic: string, index: number): number {
    const mnemonicLower = mnemonic.toLowerCase();
    
    if (mnemonicLower.includes('gr')) return 1;
    if (mnemonicLower.includes('rt') || mnemonicLower.includes('res')) return 2;
    if (mnemonicLower.includes('phi') || mnemonicLower.includes('por')) return 3;
    if (mnemonicLower.includes('cal')) return 4;
    if (mnemonicLower.includes('sp')) return 5;
    
    return Math.floor(index / 3) + 1;
  }

  /**
   * Get curve color
   */
  private getCurveColor(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  /**
   * Determine scale for curve
   */
  private determineScale(mnemonic: string): 'linear' | 'logarithmic' {
    const mnemonicLower = mnemonic.toLowerCase();
    
    // Resistivity curves typically use logarithmic scale
    if (mnemonicLower.includes('rt') || mnemonicLower.includes('res')) {
      return 'logarithmic';
    }
    
    return 'linear';
  }

  /**
   * Calculate statistics for each curve
   */
  private calculateCurveStatistics(data: LASData[], curves: LASCurve[]): void {
    for (const curve of curves) {
      const values = data
        .map(d => d[curve.mnemonic])
        .filter(v => v !== null && v !== undefined && !isNaN(v)) as number[];

      if (values.length === 0) continue;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      const nullCount = data.length - values.length;

      // Simple outlier detection (values beyond 3 standard deviations)
      const outliers = values.filter(val => Math.abs(val - mean) > 3 * std).length;

      // Calculate quality score (0-100)
      const completeness = (values.length / data.length) * 100;
      const noiseLevel = Math.min(100, (std / mean) * 100);
      const qualityScore = Math.max(0, 100 - (100 - completeness) - noiseLevel);

      curve.statistics = {
        min,
        max,
        mean,
        std,
        nullCount,
        outliers,
        qualityScore
      };
    }
  }

  /**
   * Standardize mnemonics using MnemonicStandardizer
   */
  private async standardizeMnemonics(
    curves: LASCurve[],
    standard: 'api' | 'cwls' | 'custom',
    preserveOriginal: boolean
  ): Promise<{
    success: boolean;
    standardizedCurves: LASCurve[];
    warnings: string[];
  }> {
    try {
      // Create a mock LASFile for standardization
      const mockFile = {
        id: 'temp',
        name: 'temp.las',
        size: 0,
        uploadedAt: new Date(),
        processed: false,
        version: '2.0',
        header: {} as LASHeader,
        curves,
        data: []
      };

      const result = await this.standardizer.standardizeMnemonics(mockFile, {
        standard,
        autoStandardize: true,
        preserveOriginal
      });

      return {
        success: result.success,
        standardizedCurves: result.standardizedCurves,
        warnings: result.warnings
      };
    } catch (error) {
      return {
        success: false,
        standardizedCurves: curves,
        warnings: [`Mnemonic standardization failed: ${error}`]
      };
    }
  }

  /**
   * Validate physical ranges for curve values
   */
  private validatePhysicalRanges(data: LASData[], curves: LASCurve[], warnings: string[]): void {
    const physicalRanges: Record<string, { min: number; max: number }> = {
      'GR': { min: 0, max: 300 },
      'NPHI': { min: -0.15, max: 1.0 },
      'RHOB': { min: 1.0, max: 3.5 },
      'RT': { min: 0.1, max: 10000 },
      'CALI': { min: 4, max: 20 },
      'SP': { min: -200, max: 50 },
      'PEF': { min: 1.0, max: 10.0 }
    };

    for (const curve of curves) {
      const range = physicalRanges[curve.mnemonic];
      if (!range) continue;

      const outOfRange = data.filter(d => {
        const value = d[curve.mnemonic];
        return value !== null && (value < range.min || value > range.max);
      });

      if (outOfRange.length > 0) {
        warnings.push(
          `${curve.mnemonic}: ${outOfRange.length} values outside physical range (${range.min}-${range.max})`
        );
      }
    }
  }

  /**
   * Calculate initial quality score for the file
   */
  private calculateInitialQualityScore(data: LASData[], curves: LASCurve[]): number {
    if (data.length === 0 || curves.length === 0) return 0;

    const completenessScores = curves.map(curve => {
      const validValues = data.filter(d => 
        d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined
      ).length;
      return (validValues / data.length) * 100;
    });

    const avgCompleteness = completenessScores.reduce((sum, score) => sum + score, 0) / curves.length;
    
    // Additional factors
    const depthConsistency = this.checkDepthConsistency(data) ? 100 : 50;
    const curveCount = Math.min(curves.length / 5, 100); // Bonus for more curves

    return Math.min(100, (avgCompleteness + depthConsistency + curveCount) / 3);
  }

  /**
   * Check depth consistency
   */
  private checkDepthConsistency(data: LASData[]): boolean {
    if (data.length < 2) return true;

    const depths = data.map(d => d.depth);
    const step = depths[1] - depths[0];
    
    for (let i = 1; i < depths.length; i++) {
      const actualStep = depths[i] - depths[i - 1];
      if (Math.abs(actualStep - step) > step * 0.1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(fileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `las_${timestamp}_${random}`;
  }
} 