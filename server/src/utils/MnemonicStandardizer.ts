/**
 * POLISH Mnemonic Standardizer
 * 
 * Standardizes curve mnemonics according to industry standards (API RP 33, CWLS)
 */

import { LASFile, LASCurve } from '../types';

export interface StandardizationOptions {
  standard: 'api' | 'cwls' | 'custom';
  autoStandardize: boolean;
  preserveOriginal?: boolean;
  customMappings?: Record<string, string>;
}

export interface StandardizationResult {
  success: boolean;
  standardizedCurves: LASCurve[];
  warnings: string[];
  mappings: Record<string, string>;
}

export class MnemonicStandardizer {
  private apiMappings: Record<string, string> = {
    // Gamma Ray
    'GR': 'GR',
    'GAMMA': 'GR',
    'GAMR': 'GR',
    'GR_RAW': 'GR',
    'GR_CORR': 'GR',
    
    // Neutron Porosity
    'NPHI': 'NPHI',
    'TNPH': 'NPHI',
    'NEUT': 'NPHI',
    'PHIN': 'NPHI',
    'CNL': 'NPHI',
    
    // Bulk Density
    'RHOB': 'RHOB',
    'DENS': 'RHOB',
    'RHOZ': 'RHOB',
    'DEN': 'RHOB',
    'FDC': 'RHOB',
    
    // True Resistivity
    'RT': 'RT',
    'RES': 'RT',
    'RILD': 'RT',
    'ILD': 'RT',
    'RESD': 'RT',
    
    // Flushed Zone Resistivity
    'RXO': 'RXO',
    'RMF': 'RXO',
    'RESM': 'RXO',
    'MSFL': 'RXO',
    
    // Caliper
    'CALI': 'CALI',
    'CAL': 'CALI',
    'CALIPER': 'CALI',
    
    // Spontaneous Potential
    'SP': 'SP',
    'SPONT': 'SP',
    'SPONTANEOUS': 'SP',
    
    // Photoelectric Factor
    'PEF': 'PEF',
    'PE': 'PEF',
    'PHOT': 'PEF',
    
    // Sonic Delta-T
    'DT': 'DT',
    'SONIC': 'DT',
    'AC': 'DT',
    'AT': 'DT',
    
    // Shear Delta-T
    'DTS': 'DTS',
    'SHEAR': 'DTS',
    'ACS': 'DTS',
    
    // Depth
    'DEPT': 'DEPT',
    'DEPTH': 'DEPT',
    'MD': 'DEPT',
    'TVD': 'DEPT'
  };

  private cwlsMappings: Record<string, string> = {
    // Similar to API but with some CWLS-specific mappings
    'GR': 'GR',
    'GAMMA': 'GR',
    'GAMR': 'GR',
    'NPHI': 'NPHI',
    'TNPH': 'NPHI',
    'NEUT': 'NPHI',
    'RHOB': 'RHOB',
    'DENS': 'RHOB',
    'RHOZ': 'RHOB',
    'RT': 'RT',
    'RES': 'RT',
    'RILD': 'RT',
    'RXO': 'RXO',
    'RMF': 'RXO',
    'CALI': 'CALI',
    'CAL': 'CALI',
    'SP': 'SP',
    'SPONT': 'SP',
    'PEF': 'PEF',
    'PE': 'PEF',
    'DT': 'DT',
    'SONIC': 'DT',
    'DTS': 'DTS',
    'SHEAR': 'DTS',
    'DEPT': 'DEPT',
    'DEPTH': 'DEPT'
  };

  /**
   * Standardize mnemonics for a LAS file
   */
  async standardizeMnemonics(
    lasFile: LASFile,
    options: StandardizationOptions
  ): Promise<StandardizationResult> {
    const warnings: string[] = [];
    const mappings: Record<string, string> = {};
    const standardizedCurves: LASCurve[] = [];

    try {
      const mappingTable = this.getMappingTable(options.standard, options.customMappings);

      for (const curve of lasFile.curves) {
        const originalMnemonic = curve.mnemonic;
        const standardMnemonic = this.standardizeMnemonic(originalMnemonic, mappingTable);
        
        if (standardMnemonic && standardMnemonic !== originalMnemonic) {
          mappings[originalMnemonic] = standardMnemonic;
          
          const standardizedCurve: LASCurve = {
            ...curve,
            standardMnemonic: options.preserveOriginal ? standardMnemonic : undefined,
            mnemonic: options.preserveOriginal ? originalMnemonic : standardMnemonic
          };
          
          standardizedCurves.push(standardizedCurve);
          warnings.push(`Standardized ${originalMnemonic} → ${standardMnemonic}`);
        } else {
          standardizedCurves.push(curve);
        }
      }

      return {
        success: true,
        standardizedCurves,
        warnings,
        mappings
      };

    } catch (error) {
      return {
        success: false,
        standardizedCurves: lasFile.curves,
        warnings: [`Standardization failed: ${error}`],
        mappings: {}
      };
    }
  }

  /**
   * Standardize a single mnemonic
   */
  private standardizeMnemonic(
    mnemonic: string,
    mappingTable: Record<string, string>
  ): string | null {
    const normalizedMnemonic = mnemonic.toUpperCase().trim();
    
    // Direct match
    if (mappingTable[normalizedMnemonic]) {
      return mappingTable[normalizedMnemonic];
    }
    
    // Partial match (for cases like "GR_CORR" matching "GR")
    for (const [key, value] of Object.entries(mappingTable)) {
      if (normalizedMnemonic.includes(key) || key.includes(normalizedMnemonic)) {
        return value;
      }
    }
    
    return null; // No standardization found
  }

  /**
   * Get the appropriate mapping table based on standard
   */
  private getMappingTable(
    standard: 'api' | 'cwls' | 'custom',
    customMappings?: Record<string, string>
  ): Record<string, string> {
    switch (standard) {
      case 'api':
        return this.apiMappings;
      case 'cwls':
        return this.cwlsMappings;
      case 'custom':
        return customMappings || {};
      default:
        return this.apiMappings;
    }
  }

  /**
   * Get available standards
   */
  getAvailableStandards(): string[] {
    return ['api', 'cwls', 'custom'];
  }

  /**
   * Get mapping statistics
   */
  getMappingStatistics(
    curves: LASCurve[],
    standard: 'api' | 'cwls' | 'custom'
  ): {
    total: number;
    standardized: number;
    nonStandard: string[];
    coverage: number;
  } {
    const mappingTable = this.getMappingTable(standard);
    const total = curves.length;
    let standardized = 0;
    const nonStandard: string[] = [];

    for (const curve of curves) {
      const standardMnemonic = this.standardizeMnemonic(curve.mnemonic, mappingTable);
      if (standardMnemonic) {
        standardized++;
      } else {
        nonStandard.push(curve.mnemonic);
      }
    }

    return {
      total,
      standardized,
      nonStandard,
      coverage: total > 0 ? (standardized / total) * 100 : 0
    };
  }
} 