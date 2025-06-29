"use strict";
/**
 * POLISH LAS File Parser
 *
 * A production-ready LAS file parser supporting LAS 2.0 and 3.0 formats.
 * Handles real-world LAS files with varying formats and standards.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LASParser = void 0;
const MnemonicStandardizer_1 = require("./MnemonicStandardizer");
class LASParser {
    constructor() {
        this.defaultMaxFileSize = 100 * 1024 * 1024; // 100MB
        this.standardizer = new MnemonicStandardizer_1.MnemonicStandardizer();
    }
    /**
     * Parse a LAS file from a buffer
     */
    async parse(buffer, fileName, options = {}) {
        const startTime = Date.now();
        const warnings = [];
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
                const standardizationResult = await this.standardizeMnemonics(curves, options.mnemonicStandard || 'api', options.preserveOriginalMnemonics || false);
                if (standardizationResult.success) {
                    curves.splice(0, curves.length, ...standardizationResult.standardizedCurves);
                    warnings.push(...standardizationResult.warnings);
                }
            }
            // Validate physical ranges if requested
            if (options.validatePhysicalRanges) {
                this.validatePhysicalRanges(data, curves, warnings);
            }
            const lasFile = {
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
        }
        catch (error) {
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
    parseSections(content) {
        const lines = content.split('\n');
        const sections = {
            version: [],
            well: [],
            curve: [],
            data: []
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
                }
                else if (sectionName.startsWith('w')) {
                    currentSection = 'well';
                    sections.well.push(trimmedLine);
                }
                else if (sectionName.startsWith('c')) {
                    currentSection = 'curve';
                    sections.curve.push(trimmedLine);
                }
                else if (sectionName.startsWith('a') || sectionName.startsWith('o')) {
                    currentSection = 'data';
                    inDataSection = true;
                    sections.data.push(trimmedLine);
                }
                continue;
            }
            // Add line to appropriate section
            if (currentSection === 'version') {
                sections.version.push(trimmedLine);
            }
            else if (currentSection === 'well') {
                sections.well.push(trimmedLine);
            }
            else if (currentSection === 'curve') {
                sections.curve.push(trimmedLine);
            }
            else if (currentSection === 'data' && inDataSection) {
                sections.data.push(trimmedLine);
            }
        }
        return sections;
    }
    /**
     * Parse version section
     */
    parseHeader(versionLines, warnings) {
        const header = {
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
            if (line.startsWith('~V'))
                continue;
            const parts = line.split(':').map(p => p.trim());
            if (parts.length < 2)
                continue;
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
        return header;
    }
    /**
     * Parse well information section
     */
    parseWellInfo(wellLines, warnings) {
        const wellInfo = {};
        for (const line of wellLines) {
            if (line.startsWith('~W'))
                continue;
            const parts = line.split(':').map(p => p.trim());
            if (parts.length < 2)
                continue;
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
    parseCurves(curveLines, warnings) {
        const curves = [];
        let curveIndex = 0;
        for (const line of curveLines) {
            if (line.startsWith('~C'))
                continue;
            const parts = line.split(':').map(p => p.trim());
            if (parts.length < 2)
                continue;
            const mnemonic = parts[0];
            const description = parts.slice(1).join(':').trim();
            // Skip depth curve as it's handled separately
            if (mnemonic.toLowerCase() === 'dept' || mnemonic.toLowerCase() === 'depth') {
                continue;
            }
            const curve = {
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
    parseData(dataLines, curves, header, warnings) {
        const data = [];
        const nullValue = header.nullValue;
        for (const line of dataLines) {
            if (line.startsWith('~A') || line.startsWith('~O'))
                continue;
            const values = line.split(/\s+/).filter(v => v.trim());
            if (values.length === 0)
                continue;
            const dataPoint = {
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
    extractUnit(description) {
        const unitMatch = description.match(/\(([^)]+)\)/);
        return unitMatch ? unitMatch[1] : 'N/A';
    }
    /**
     * Extract description without unit
     */
    extractDescription(description) {
        return description.replace(/\s*\([^)]+\)\s*/, '').trim();
    }
    /**
     * Infer curve type from mnemonic and description
     */
    inferCurveType(mnemonic, description) {
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
    determineTrack(mnemonic, index) {
        const mnemonicLower = mnemonic.toLowerCase();
        if (mnemonicLower.includes('gr'))
            return 1;
        if (mnemonicLower.includes('rt') || mnemonicLower.includes('res'))
            return 2;
        if (mnemonicLower.includes('phi') || mnemonicLower.includes('por'))
            return 3;
        if (mnemonicLower.includes('cal'))
            return 4;
        if (mnemonicLower.includes('sp'))
            return 5;
        return Math.floor(index / 3) + 1;
    }
    /**
     * Get curve color
     */
    getCurveColor(index) {
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        return colors[index % colors.length];
    }
    /**
     * Determine scale for curve
     */
    determineScale(mnemonic) {
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
    calculateCurveStatistics(data, curves) {
        for (const curve of curves) {
            const values = data
                .map(d => d[curve.mnemonic])
                .filter(v => v !== null && v !== undefined && !isNaN(v));
            if (values.length === 0)
                continue;
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
    async standardizeMnemonics(curves, standard, preserveOriginal) {
        try {
            // Create a mock LASFile for standardization
            const mockFile = {
                id: 'temp',
                name: 'temp.las',
                size: 0,
                uploadedAt: new Date(),
                processed: false,
                version: '2.0',
                header: {},
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
        }
        catch (error) {
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
    validatePhysicalRanges(data, curves, warnings) {
        const physicalRanges = {
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
            if (!range)
                continue;
            const outOfRange = data.filter(d => {
                const value = d[curve.mnemonic];
                return value !== null && (value < range.min || value > range.max);
            });
            if (outOfRange.length > 0) {
                warnings.push(`${curve.mnemonic}: ${outOfRange.length} values outside physical range (${range.min}-${range.max})`);
            }
        }
    }
    /**
     * Calculate initial quality score for the file
     */
    calculateInitialQualityScore(data, curves) {
        if (data.length === 0 || curves.length === 0)
            return 0;
        const completenessScores = curves.map(curve => {
            const validValues = data.filter(d => d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined).length;
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
    checkDepthConsistency(data) {
        if (data.length < 2)
            return true;
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
    generateFileId(fileName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `las_${timestamp}_${random}`;
    }
}
exports.LASParser = LASParser;
//# sourceMappingURL=lasParser.js.map