/**
 * POLISH LAS File Parser
 *
 * A production-ready LAS file parser supporting LAS 2.0 and 3.0 formats.
 * Handles real-world LAS files with varying formats and standards.
 */
import { LASFile } from '../types';
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
    maxFileSize?: number;
    strictMode?: boolean;
}
export declare class LASParser {
    private standardizer;
    private readonly defaultMaxFileSize;
    constructor();
    /**
     * Parse a LAS file from a buffer
     */
    parse(buffer: Buffer, fileName: string, options?: ParseOptions): Promise<ParseResult>;
    /**
     * Parse LAS file sections
     */
    private parseSections;
    /**
     * Parse version section
     */
    private parseHeader;
    /**
     * Parse well information section
     */
    private parseWellInfo;
    /**
     * Parse curve information section
     */
    private parseCurves;
    /**
     * Parse data section
     */
    private parseData;
    /**
     * Extract unit from curve description
     */
    private extractUnit;
    /**
     * Extract description without unit
     */
    private extractDescription;
    /**
     * Infer curve type from mnemonic and description
     */
    private inferCurveType;
    /**
     * Determine track for curve display
     */
    private determineTrack;
    /**
     * Get curve color
     */
    private getCurveColor;
    /**
     * Determine scale for curve
     */
    private determineScale;
    /**
     * Calculate statistics for each curve
     */
    private calculateCurveStatistics;
    /**
     * Standardize mnemonics using MnemonicStandardizer
     */
    private standardizeMnemonics;
    /**
     * Validate physical ranges for curve values
     */
    private validatePhysicalRanges;
    /**
     * Calculate initial quality score for the file
     */
    private calculateInitialQualityScore;
    /**
     * Check depth consistency
     */
    private checkDepthConsistency;
    /**
     * Generate unique file ID
     */
    private generateFileId;
}
//# sourceMappingURL=lasParser.d.ts.map