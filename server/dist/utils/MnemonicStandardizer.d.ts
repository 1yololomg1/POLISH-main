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
export declare class MnemonicStandardizer {
    private apiMappings;
    private cwlsMappings;
    /**
     * Standardize mnemonics for a LAS file
     */
    standardizeMnemonics(lasFile: LASFile, options: StandardizationOptions): Promise<StandardizationResult>;
    /**
     * Standardize a single mnemonic
     */
    private standardizeMnemonic;
    /**
     * Get the appropriate mapping table based on standard
     */
    private getMappingTable;
    /**
     * Get available standards
     */
    getAvailableStandards(): string[];
    /**
     * Get mapping statistics
     */
    getMappingStatistics(curves: LASCurve[], standard: 'api' | 'cwls' | 'custom'): {
        total: number;
        standardized: number;
        nonStandard: string[];
        coverage: number;
    };
}
//# sourceMappingURL=MnemonicStandardizer.d.ts.map