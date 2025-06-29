"use strict";
/**
 * POLISH Mnemonic Standardizer
 *
 * Standardizes curve mnemonics according to industry standards (API RP 33, CWLS)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MnemonicStandardizer = void 0;
class MnemonicStandardizer {
    constructor() {
        this.apiMappings = {
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
        this.cwlsMappings = {
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
    }
    /**
     * Standardize mnemonics for a LAS file
     */
    async standardizeMnemonics(lasFile, options) {
        const warnings = [];
        const mappings = {};
        const standardizedCurves = [];
        try {
            const mappingTable = this.getMappingTable(options.standard, options.customMappings);
            for (const curve of lasFile.curves) {
                const originalMnemonic = curve.mnemonic;
                const standardMnemonic = this.standardizeMnemonic(originalMnemonic, mappingTable);
                if (standardMnemonic && standardMnemonic !== originalMnemonic) {
                    mappings[originalMnemonic] = standardMnemonic;
                    const standardizedCurve = {
                        ...curve,
                        standardMnemonic: options.preserveOriginal ? standardMnemonic : undefined,
                        mnemonic: options.preserveOriginal ? originalMnemonic : standardMnemonic
                    };
                    standardizedCurves.push(standardizedCurve);
                    warnings.push(`Standardized ${originalMnemonic} → ${standardMnemonic}`);
                }
                else {
                    standardizedCurves.push(curve);
                }
            }
            return {
                success: true,
                standardizedCurves,
                warnings,
                mappings
            };
        }
        catch (error) {
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
    standardizeMnemonic(mnemonic, mappingTable) {
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
    getMappingTable(standard, customMappings) {
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
    getAvailableStandards() {
        return ['api', 'cwls', 'custom'];
    }
    /**
     * Get mapping statistics
     */
    getMappingStatistics(curves, standard) {
        const mappingTable = this.getMappingTable(standard);
        const total = curves.length;
        let standardized = 0;
        const nonStandard = [];
        for (const curve of curves) {
            const standardMnemonic = this.standardizeMnemonic(curve.mnemonic, mappingTable);
            if (standardMnemonic) {
                standardized++;
            }
            else {
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
exports.MnemonicStandardizer = MnemonicStandardizer;
//# sourceMappingURL=MnemonicStandardizer.js.map