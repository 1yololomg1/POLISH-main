/**
 * POLISH LAS Parser - Enterprise-Level Test Suite
 * 
 * Tests complex, real-world LAS files with production challenges:
 * - Multi-format support (LAS 2.0, 3.0)
 * - Complex curve types and mnemonics
 * - Data quality issues and edge cases
 * - Large datasets and performance
 * - Industry-standard compliance
 */

import { LASParser, ParseOptions } from './lasParser';
import { MnemonicStandardizer } from './MnemonicStandardizer';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('LAS Parser - Enterprise Test Suite', () => {
  let parser: LASParser;
  let standardizer: MnemonicStandardizer;

  beforeEach(() => {
    parser = new LASParser();
    standardizer = new MnemonicStandardizer();
  });

  describe('Complex LAS 2.0 File with Multiple Challenges', () => {
    const complexLAS2Content = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard -VERSION 2.0
WRAP.                         NO:   One line per depth step
~Well Information Block
#MNEM.UNIT                   Data Type    Information
#----.----                   -----------   -------------
STRT.M                       1670.0000:   START DEPTH
STOP.M                       2450.0000:   STOP DEPTH
STEP.M                       0.1524:      STEP
NULL.                        -999.25:     NULL VALUE
COMP.                        Schlumberger: COMPANY
WELL.                        North Sea Well-42:   WELL
FLD .                        Ekofisk Field:       FIELD
LOC .                        North Sea Block 2/4: LOCATION
SRVC.                        Schlumberger:        SERVICE COMPANY
DATE.                        2024-01-15:          LOG DATE
UWI .                        12345678901234567890: UNIQUE WELL ID
API .                        42-123-45678:        API NUMBER
~Curve Information Block
#MNEM.UNIT                   Data Type    Information
#----.----                   -----------   -------------
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray (API units)
NPHI.V/V                     :   Neutron Porosity (v/v)
RHOB.G/CC                    :   Bulk Density (g/cc)
RT  .OHMM                    :   True Resistivity (ohm-m)
RXO .OHMM                    :   Flushed Zone Resistivity (ohm-m)
MSFL.OHMM                    :   Micro Spherically Focused Log (ohm-m)
CALI.IN                      :   Caliper (inches)
SP  .MV                      :   Spontaneous Potential (mV)
PEF .B/E                     :   Photoelectric Factor (barns/electron)
DT  .US/FT                   :   Sonic Delta-T (microseconds/ft)
DTS .US/FT                   :   Shear Delta-T (microseconds/ft)
~Parameter Information Block
#MNEM.UNIT                   Value        Description
#----.----                   -----        -----------
BHT .DEGC                    85.5:        Bottom Hole Temperature
BHP .KPA                    15000.0:      Bottom Hole Pressure
MUD .G/CC                    1.25:        Mud Weight
~Other Information Block
#This is a complex well with multiple challenges:
#1. Mixed data quality across intervals
#2. Tool sticking artifacts in caliper
#3. Gas effect on neutron-density separation
#4. Invasion effects on resistivity
#5. Complex lithology (shale, sandstone, limestone)
~ASCII Log Data Section
#Depth    GR    NPHI   RHOB   RT    RXO   MSFL  CALI  SP   PEF   DT   DTS
1670.000  45.2  0.15   2.35   12.5  8.2   6.8   8.5   -25  2.1   85   120
1670.152  47.8  0.12   2.42   15.2  9.1   7.2   8.4   -28  2.3   87   125
1670.305  52.1  0.08   2.58   18.7  10.5  8.1   8.3   -32  2.8   90   130
1670.457  58.9  0.05   2.65   22.3  12.1  9.3   8.2   -35  3.1   92   135
1670.610  65.2  0.02   2.72   25.8  13.8  10.2  8.1   -38  3.4   95   140
1670.762  72.1  -0.01  2.78   28.9  15.2  11.1  8.0   -42  3.7   97   145
1670.914  78.5  -0.05  2.85   31.5  16.8  12.0  7.9   -45  4.0   100  150
1671.067  85.2  -0.08  2.92   34.2  18.1  12.9  7.8   -48  4.3   102  155
1671.219  92.8  -0.12  2.98   36.8  19.5  13.8  7.7   -52  4.6   105  160
1671.371  98.5  -0.15  3.05   39.1  20.9  14.7  7.6   -55  4.9   107  165
#Tool sticking artifact
1671.524  95.2  -0.18  3.12   41.5  22.3  15.6  12.5  -58  5.2   110  170
1671.676  91.8  -0.21  3.18   43.9  23.7  16.5  8.2   -61  5.5   112  175
1671.829  88.5  -0.24  3.25   46.2  25.1  17.4  8.1   -64  5.8   115  180
1671.981  85.1  -0.27  3.32   48.6  26.5  18.3  8.0   -67  6.1   117  185
1672.134  82.8  -0.30  3.38   50.9  27.9  19.2  7.9   -70  6.4   120  190
#Gas effect interval
1672.286  78.5  -0.35  2.85   55.2  30.1  20.1  7.8   -75  6.7   125  195
1672.438  75.2  -0.40  2.72   58.6  32.5  21.0  7.7   -80  7.0   130  200
1672.591  72.8  -0.45  2.58   61.9  34.9  21.9  7.6   -85  7.3   135  205
1672.743  70.5  -0.50  2.45   65.2  37.3  22.8  7.5   -90  7.6   140  210
1672.896  68.1  -0.55  2.32   68.6  39.7  23.7  7.4   -95  7.9   145  215
#Return to normal conditions
1673.048  65.8  -0.30  2.85   55.2  30.1  20.1  7.3   -70  6.7   125  195
1673.201  63.5  -0.25  2.98   48.6  26.5  18.3  7.2   -65  6.1   117  185
1673.353  61.2  -0.20  3.12   42.9  23.7  16.5  7.1   -60  5.5   112  175
1673.505  58.8  -0.15  3.25   38.2  21.3  14.7  7.0   -55  4.9   107  165
1673.658  56.5  -0.10  3.38   34.5  19.5  13.8  6.9   -50  4.3   102  155
#Complex lithology transition
1673.810  54.2  -0.05  3.52   31.8  18.1  12.9  6.8   -45  3.7   97   145
1673.963  51.8  0.00   2.85   28.9  16.8  12.0  6.7   -40  3.1   92   135
1674.115  49.5  0.05   2.72   26.2  15.2  11.1  6.6   -35  2.8   87   125
1674.268  47.2  0.10   2.58   23.5  13.8  10.2  6.5   -30  2.3   85   120
1674.420  44.8  0.15   2.45   21.8  12.1  9.3   6.4   -25  2.1   82   115
#Data quality issues
1674.572  42.5  0.20   2.32   18.5  10.5  8.1   6.3   -20  1.8   80   110
1674.725  40.2  0.25   2.18   15.2  8.2   6.8   6.2   -15  1.5   78   105
1674.877  37.8  0.30   2.05   12.8  6.8   5.5   6.1   -10  1.2   75   100
1675.030  35.5  0.35   1.92   10.5  5.2   4.2   6.0   -5   0.9   72   95
1675.182  33.2  0.40   1.78   8.2   3.8   2.9   5.9   0    0.6   70   90
#Missing data and null values
1675.335  -999.25 -999.25 -999.25 -999.25 -999.25 -999.25 -999.25 -999.25 -999.25 -999.25 -999.25
1675.487  30.8  0.45   1.65   5.8   2.2   1.6   5.8   5    0.3   68   85
1675.640  28.5  0.50   1.52   3.5   0.8   0.3   5.7   10   0.0   65   80
1675.792  26.2  0.55   1.38   1.2   -0.6  -1.0  5.6   15   -0.3  62   75
1675.945  23.8  0.60   1.25   -1.1  -2.0  -2.3  5.5   20   -0.6  60   70
#End of data section`;

    it('should parse complex LAS 2.0 file with multiple challenges', async () => {
      const buffer = Buffer.from(complexLAS2Content, 'utf8');
      const options: ParseOptions = {
        autoStandardizeMnemonics: true,
        mnemonicStandard: 'api',
        validatePhysicalRanges: true,
        strictMode: false
      };

      const result = await parser.parse(buffer, 'complex_well_42.las', options);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.parseTime).toBeLessThan(1000); // Should parse quickly

      const lasFile = result.data!;
      
      // Verify header information
      expect(lasFile.header.version).toBe('2.0');
      expect(lasFile.header.well).toBe('North Sea Well-42');
      expect(lasFile.header.field).toBe('Ekofisk Field');
      expect(lasFile.header.startDepth).toBe(1670.0);
      expect(lasFile.header.stopDepth).toBe(2450.0);
      expect(lasFile.header.step).toBe(0.1524);

      // Verify curve information
      expect(lasFile.curves.length).toBe(11); // Excluding depth
      expect(lasFile.curves.find(c => c.mnemonic === 'GR')).toBeDefined();
      expect(lasFile.curves.find(c => c.mnemonic === 'NPHI')).toBeDefined();
      expect(lasFile.curves.find(c => c.mnemonic === 'RHOB')).toBeDefined();
      expect(lasFile.curves.find(c => c.mnemonic === 'RT')).toBeDefined();

      // Verify data quality
      expect(lasFile.data.length).toBeGreaterThan(30);
      expect(lasFile.qualityScore).toBeGreaterThan(70);

      // Verify curve statistics
      const grCurve = lasFile.curves.find(c => c.mnemonic === 'GR')!;
      expect(grCurve.statistics).toBeDefined();
      expect(grCurve.statistics!.min).toBeGreaterThan(20);
      expect(grCurve.statistics!.max).toBeLessThan(100);
      expect(grCurve.statistics!.nullCount).toBeGreaterThan(0);

      // Verify warnings for data quality issues
      expect(result.warnings.some(w => w.includes('tool sticking'))).toBe(true);
      expect(result.warnings.some(w => w.includes('gas effect'))).toBe(true);
      expect(result.warnings.some(w => w.includes('missing data'))).toBe(true);
    });

    it('should handle mnemonic standardization correctly', async () => {
      const buffer = Buffer.from(complexLAS2Content, 'utf8');
      const options: ParseOptions = {
        autoStandardizeMnemonics: true,
        mnemonicStandard: 'api',
        preserveOriginalMnemonics: true
      };

      const result = await parser.parse(buffer, 'complex_well_42.las', options);
      expect(result.success).toBe(true);

      const lasFile = result.data!;
      
      // Check that original mnemonics are preserved
      expect(lasFile.curves.find(c => c.mnemonic === 'GR')).toBeDefined();
      expect(lasFile.curves.find(c => c.mnemonic === 'NPHI')).toBeDefined();
      
      // Check that standard mnemonics are added
      const grCurve = lasFile.curves.find(c => c.mnemonic === 'GR')!;
      expect(grCurve.standardMnemonic).toBeDefined();
    });
  });

  describe('LAS 3.0 File with Unicode and Extended Features', () => {
    const las3Content = `~Version Information
VERS.                        3.0:   CWLS log ASCII Standard -VERSION 3.0
WRAP.                         NO:   One line per depth step
DLM .                         COMMA: Delimiter
~Well Information Block
#MNEM.UNIT                   Data Type    Information
#----.----                   -----------   -------------
STRT.M                       1000.0000:   START DEPTH
STOP.M                       2000.0000:   STOP DEPTH
STEP.M                       0.1000:      STEP
NULL.                        -999.25:     NULL VALUE
COMP.                        ExxonMobil:  COMPANY
WELL.                        Deepwater Gulf Well-789:   WELL
FLD .                        Thunder Horse Field:       FIELD
LOC .                        Gulf of Mexico MC 778:     LOCATION
SRVC.                        Halliburton:               SERVICE COMPANY
DATE.                        2024-03-20:                LOG DATE
UWI .                        12345678901234567890:      UNIQUE WELL ID
API .                        42-789-12345:              API NUMBER
~Curve Information Block
#MNEM.UNIT                   Data Type    Information
#----.----                   -----------   -------------
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray (API units)
NPHI.V/V                     :   Neutron Porosity (v/v)
RHOB.G/CC                    :   Bulk Density (g/cc)
RT  .OHMM                    :   True Resistivity (ohm-m)
RXO .OHMM                    :   Flushed Zone Resistivity (ohm-m)
MSFL.OHMM                    :   Micro Spherically Focused Log (ohm-m)
CALI.IN                      :   Caliper (inches)
SP  .MV                      :   Spontaneous Potential (mV)
PEF .B/E                     :   Photoelectric Factor (barns/electron)
DT  .US/FT                   :   Sonic Delta-T (microseconds/ft)
DTS .US/FT                   :   Shear Delta-T (microseconds/ft)
~Parameter Information Block
#MNEM.UNIT                   Value        Description
#----.----                   -----        -----------
BHT .DEGC                    120.5:       Bottom Hole Temperature
BHP .KPA                    25000.0:      Bottom Hole Pressure
MUD .G/CC                    1.45:        Mud Weight
~Other Information Block
#Deepwater well with complex geology
#High temperature and pressure conditions
#Salt and shale sequences
#Complex fluid systems
~ASCII Log Data Section
#Depth,GR,NPHI,RHOB,RT,RXO,MSFL,CALI,SP,PEF,DT,DTS
1000.000,45.2,0.15,2.35,12.5,8.2,6.8,8.5,-25,2.1,85,120
1000.100,47.8,0.12,2.42,15.2,9.1,7.2,8.4,-28,2.3,87,125
1000.200,52.1,0.08,2.58,18.7,10.5,8.1,8.3,-32,2.8,90,130
1000.300,58.9,0.05,2.65,22.3,12.1,9.3,8.2,-35,3.1,92,135
1000.400,65.2,0.02,2.72,25.8,13.8,10.2,8.1,-38,3.4,95,140
1000.500,72.1,-0.01,2.78,28.9,15.2,11.1,8.0,-42,3.7,97,145
1000.600,78.5,-0.05,2.85,31.5,16.8,12.0,7.9,-45,4.0,100,150
1000.700,85.2,-0.08,2.92,34.2,18.1,12.9,7.8,-48,4.3,102,155
1000.800,92.8,-0.12,2.98,36.8,19.5,13.8,7.7,-52,4.6,105,160
1000.900,98.5,-0.15,3.05,39.1,20.9,14.7,7.6,-55,4.9,107,165
1001.000,95.2,-0.18,3.12,41.5,22.3,15.6,7.5,-58,5.2,110,170
1001.100,91.8,-0.21,3.18,43.9,23.7,16.5,7.4,-61,5.5,112,175
1001.200,88.5,-0.24,3.25,46.2,25.1,17.4,7.3,-64,5.8,115,180
1001.300,85.1,-0.27,3.32,48.6,26.5,18.3,7.2,-67,6.1,117,185
1001.400,82.8,-0.30,3.38,50.9,27.9,19.2,7.1,-70,6.4,120,190
1001.500,78.5,-0.35,2.85,55.2,30.1,20.1,7.0,-75,6.7,125,195
1001.600,75.2,-0.40,2.72,58.6,32.5,21.0,6.9,-80,7.0,130,200
1001.700,72.8,-0.45,2.58,61.9,34.9,21.9,6.8,-85,7.3,135,205
1001.800,70.5,-0.50,2.45,65.2,37.3,22.8,6.7,-90,7.6,140,210
1001.900,68.1,-0.55,2.32,68.6,39.7,23.7,6.6,-95,7.9,145,215
1002.000,65.8,-0.30,2.85,55.2,30.1,20.1,6.5,-70,6.7,125,195`;

    it('should parse LAS 3.0 file with comma delimiter', async () => {
      const buffer = Buffer.from(las3Content, 'utf8');
      const options: ParseOptions = {
        autoStandardizeMnemonics: true,
        mnemonicStandard: 'api',
        validatePhysicalRanges: true
      };

      const result = await parser.parse(buffer, 'deepwater_well_789.las', options);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const lasFile = result.data!;
      
      // Verify LAS 3.0 specific features
      expect(lasFile.header.version).toBe('3.0');
      expect(lasFile.header.well).toBe('Deepwater Gulf Well-789');
      expect(lasFile.header.field).toBe('Thunder Horse Field');
      
      // Verify data parsing with comma delimiter
      expect(lasFile.data.length).toBeGreaterThan(20);
      expect(lasFile.curves.length).toBe(11);
      
      // Verify high-temperature, high-pressure conditions
      expect(lasFile.header.serviceCompany).toBe('Halliburton');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty file gracefully', async () => {
      const buffer = Buffer.from('', 'utf8');
      const result = await parser.parse(buffer, 'empty.las');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should handle file with only comments', async () => {
      const buffer = Buffer.from('# This is a comment\n# Another comment\n', 'utf8');
      const result = await parser.parse(buffer, 'comments_only.las');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('no valid content');
    });

    it('should handle malformed section headers', async () => {
      const malformedContent = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard
~Well Information Block
STRT.M                       1000.0000:   START DEPTH
STOP.M                       2000.0000:   STOP DEPTH
~Curve Information Block
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray
~ASCII Log Data Section
1000.000  45.2
1000.100  47.8
1000.200  52.1`;

      const buffer = Buffer.from(malformedContent, 'utf8');
      const result = await parser.parse(buffer, 'malformed.las');
      
      expect(result.success).toBe(true); // Should still parse with warnings
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle large file size limits', async () => {
      // Create a large LAS file content
      let largeContent = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard
~Well Information Block
STRT.M                       1000.0000:   START DEPTH
STOP.M                       2000.0000:   STOP DEPTH
STEP.M                       0.1000:      STEP
~Curve Information Block
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray
~ASCII Log Data Section`;

      // Add many data points to exceed size limit
      for (let i = 0; i < 100000; i++) {
        largeContent += `\n${(1000 + i * 0.1).toFixed(3)}  ${45 + Math.random() * 20}`;
      }

      const buffer = Buffer.from(largeContent, 'utf8');
      const options: ParseOptions = {
        maxFileSize: 1024 * 1024 // 1MB limit
      };

      const result = await parser.parse(buffer, 'large_file.las', options);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should handle mixed data quality and null values', async () => {
      const mixedQualityContent = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard
~Well Information Block
STRT.M                       1000.0000:   START DEPTH
STOP.M                       1010.0000:   STOP DEPTH
STEP.M                       0.1000:      STEP
NULL.                        -999.25:     NULL VALUE
~Curve Information Block
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray
NPHI.V/V                     :   Neutron Porosity
RHOB.G/CC                    :   Bulk Density
~ASCII Log Data Section
1000.000  45.2  0.15  2.35
1000.100  47.8  0.12  2.42
1000.200  -999.25  -999.25  -999.25
1000.300  52.1  0.08  2.58
1000.400  58.9  0.05  2.65
1000.500  65.2  -999.25  2.72
1000.600  72.1  -0.01  -999.25
1000.700  78.5  -0.05  2.85
1000.800  85.2  -0.08  2.92
1000.900  92.8  -0.12  2.98
1010.000  98.5  -0.15  3.05`;

      const buffer = Buffer.from(mixedQualityContent, 'utf8');
      const result = await parser.parse(buffer, 'mixed_quality.las');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const lasFile = result.data!;
      
      // Verify null value handling
      const grCurve = lasFile.curves.find(c => c.mnemonic === 'GR')!;
      expect(grCurve.statistics!.nullCount).toBeGreaterThan(0);
      
      // Verify data quality assessment
      expect(lasFile.qualityScore).toBeLessThan(100);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large datasets efficiently', async () => {
      // Create a large but manageable dataset
      let largeDataset = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard
~Well Information Block
STRT.M                       1000.0000:   START DEPTH
STOP.M                       2000.0000:   STOP DEPTH
STEP.M                       0.1000:      STEP
~Curve Information Block
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray
NPHI.V/V                     :   Neutron Porosity
RHOB.G/CC                    :   Bulk Density
~ASCII Log Data Section`;

      // Add 10,000 data points
      for (let i = 0; i < 10000; i++) {
        const depth = 1000 + i * 0.1;
        const gr = 45 + Math.random() * 20;
        const nphi = 0.1 + Math.random() * 0.3;
        const rhob = 2.0 + Math.random() * 1.0;
        largeDataset += `\n${depth.toFixed(3)}  ${gr.toFixed(1)}  ${nphi.toFixed(3)}  ${rhob.toFixed(2)}`;
      }

      const buffer = Buffer.from(largeDataset, 'utf8');
      const startTime = Date.now();
      
      const result = await parser.parse(buffer, 'large_dataset.las');
      const parseTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(parseTime).toBeLessThan(5000); // Should parse in under 5 seconds
      expect(result.data!.data.length).toBe(10000);
    });
  });

  describe('Industry Standards Compliance', () => {
    it('should validate physical ranges correctly', async () => {
      const testContent = `~Version Information
VERS.                        2.0:   CWLS log ASCII Standard
~Well Information Block
STRT.M                       1000.0000:   START DEPTH
STOP.M                       1010.0000:   STOP DEPTH
STEP.M                       0.1000:      STEP
NULL.                        -999.25:     NULL VALUE
~Curve Information Block
DEPTH.M                       :   Depth
GR  .GAPI                    :   Gamma Ray
NPHI.V/V                     :   Neutron Porosity
RHOB.G/CC                    :   Bulk Density
RT  .OHMM                    :   True Resistivity
~ASCII Log Data Section
1000.000  45.2  0.15  2.35  12.5
1000.100  47.8  0.12  2.42  15.2
1000.200  350.0  0.08  2.58  18.7  # Out of range GR
1000.300  58.9  1.5  2.65  22.3   # Out of range NPHI
1000.400  65.2  0.02  4.0  25.8   # Out of range RHOB
1000.500  72.1  -0.01  2.78  50000.0  # Out of range RT
1000.600  78.5  -0.05  2.85  31.5
1000.700  85.2  -0.08  2.92  34.2
1000.800  92.8  -0.12  2.98  36.8
1000.900  98.5  -0.15  3.05  39.1
1010.000  95.2  -0.18  3.12  41.5`;

      const buffer = Buffer.from(testContent, 'utf8');
      const options: ParseOptions = {
        validatePhysicalRanges: true
      };

      const result = await parser.parse(buffer, 'physical_ranges_test.las', options);
      
      expect(result.success).toBe(true);
      expect(result.warnings.some(w => w.includes('GR'))).toBe(true);
      expect(result.warnings.some(w => w.includes('NPHI'))).toBe(true);
      expect(result.warnings.some(w => w.includes('RHOB'))).toBe(true);
      expect(result.warnings.some(w => w.includes('RT'))).toBe(true);
    });
  });
}); 