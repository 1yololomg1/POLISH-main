# POLISH User Guide

## Complete Guide to Petrophysical Data Processing

### Version 1.1.0
### Last Updated: December 2024

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding Quality Scores](#understanding-quality-scores)
3. [Processing Algorithms Guide](#processing-algorithms-guide)
4. [Advanced Visualization Features](#advanced-visualization-features)
5. [Depth Range & Sampling Controls](#depth-range--sampling-controls)
6. [Multi-Well Analysis](#multi-well-analysis)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)
8. [File Formats & Export Options](#file-formats--export-options)
9. [Pricing Structure](#pricing-structure)
10. [Best Practices](#best-practices)
11. [FAQ](#frequently-asked-questions)
12. [Privacy and Security](#privacy-and-security)

---

## Getting Started

### What is POLISH?

POLISH (Petrophysical Operations for Log Intelligence, Smoothing and Harmonization) is a professional-grade platform for preprocessing petrophysical data. It transforms raw LAS files into pristine, analysis-ready datasets using advanced signal processing algorithms.

### Quick Start Guide

#### Step 1: Upload Your LAS Files
1. **Drag and Drop**: Simply drag your LAS files into the upload zone
2. **Browse Files**: Click "Browse Files" to select files from your computer
3. **Supported Formats**: LAS v1.2, v2.0, and v3.0 (up to 100MB per file)
4. **Security**: All processing happens locally in your browser - no uploads required
5. **Error Handling**: Clear error messages for invalid files or size limits

#### Step 2: Review File Information
- **Well Details**: Company, well name, field, and location information
- **Depth Range**: Start/stop depths and sampling interval
- **Curve Inventory**: Complete list of available log curves with units
- **Quality Preview**: Initial assessment of data completeness

#### Step 3: Configure Processing Options
- **Denoising**: Reduce noise while preserving geological features
- **Spike Detection**: Identify and remove data outliers
- **Physical Validation**: Check values against industry standards
- **Mnemonic Standardization**: Convert to API or CWLS standards

#### Step 4: Execute Processing
1. Click "Execute Processing Pipeline"
2. Monitor progress in real-time
3. Review quality control results
4. Examine processing recommendations

#### Step 5: Export Results
- **Free Features**: All processing, visualization, and QC analysis
- **Premium Export**: Cleaned LAS files with processing certificates ($400)
- **Premium Reports**: Comprehensive technical reports ($125 standalone, included with LAS export)
- **Format Conversion**: CSV, Excel, JSON, WITSML, SEG-Y (dollar-based pricing)

---

## Understanding Quality Scores

### Overall Quality Assessment

POLISH evaluates data quality using a comprehensive scoring system from 0-100 points:

#### Grade A (90-100 Points) - Excellent Quality ✅
- **Data Completeness**: >95% non-null values
- **Noise Level**: <5% signal degradation
- **Spikes**: Minimal outliers detected
- **Physical Validation**: All curves within expected ranges
- **Recommendation**: Data is production-ready for advanced analysis

#### Grade B (75-89 Points) - Good Quality ✅
- **Data Completeness**: 85-95% non-null values
- **Noise Level**: 5-15% signal degradation
- **Spikes**: Few outliers, easily correctable
- **Physical Validation**: Minor range violations
- **Recommendation**: Light processing recommended, suitable for most analyses

#### Grade C (60-74 Points) - Acceptable Quality ⚠️
- **Data Completeness**: 70-85% non-null values
- **Noise Level**: 15-30% signal degradation
- **Spikes**: Moderate outliers present
- **Physical Validation**: Some range violations
- **Recommendation**: Processing required before analysis

#### Grade D (50-59 Points) - Poor Quality ⚠️
- **Data Completeness**: 50-70% non-null values
- **Noise Level**: 30-50% signal degradation
- **Spikes**: Significant outliers present
- **Physical Validation**: Multiple range violations
- **Recommendation**: Extensive processing needed

#### Grade F (0-49 Points) - Unacceptable Quality ❌
- **Data Completeness**: <50% non-null values
- **Noise Level**: >50% signal degradation
- **Spikes**: Severe outlier contamination
- **Physical Validation**: Major range violations
- **Recommendation**: Consider re-logging or data source review

### Quality Factors Explained

#### Data Completeness
- **Calculation**: (Total Points - Null Points) / Total Points × 100
- **Impact**: Missing data reduces analysis reliability
- **Typical Causes**: Tool malfunctions, washouts, poor hole conditions

#### Noise Level
- **Measurement**: Signal-to-noise ratio assessment
- **Impact**: Affects interpretation accuracy
- **Typical Causes**: Electronic interference, vibration, poor tool contact

#### Spike Detection
- **Method**: Statistical outlier identification
- **Impact**: False anomalies can mislead interpretation
- **Typical Causes**: Tool sticking, electrical interference, data transmission errors

#### Physical Validation
- **Standards**: Industry-accepted ranges for each curve type
- **Examples**: 
  - Gamma Ray: 0-300 API units
  - Neutron Porosity: -0.15 to 1.0 v/v
  - Bulk Density: 1.0-3.5 g/cm³
  - Resistivity: 0.1-10,000 ohm-m

---

## Processing Algorithms Guide

### 1. Savitzky-Golay Denoising

**Purpose**: Advanced smoothing that preserves signal features while reducing noise.

**How it Works**:
- Fits polynomial curves to local data windows
- Preserves peak shapes and geological features
- Reduces random noise without over-smoothing

**Parameters**:
- **Window Size** (5-21 points): Larger values = more smoothing
- **Polynomial Order** (2-6): Higher values preserve features better
- **Strength** (0-100%): Blending factor with original data

**Best Used For**:
- Gamma ray curves with electronic noise
- Resistivity logs with tool vibration
- Porosity curves with minor fluctuations

**Recommendations**:
- Start with window size 11, polynomial order 3
- Increase window size for very noisy data
- Use strength 50-70% to maintain geological character

### 2. Hampel Spike Detection

**Purpose**: Robust outlier detection using statistical methods.

**How it Works**:
- Calculates local median and Median Absolute Deviation (MAD)
- Identifies points exceeding threshold × MAD
- Replaces outliers using shape-preserving interpolation

**Parameters**:
- **Threshold** (1.0-5.0): Lower values = more sensitive detection
- **Window Size** (3-15 points): Analysis window for local statistics
- **Replacement Method**: PCHIP interpolation (recommended)

**Best Used For**:
- Tool sticking artifacts
- Electrical interference spikes
- Data transmission errors

**Recommendations**:
- Use threshold 2.5-3.0 for balanced detection
- Smaller windows for localized spikes
- PCHIP replacement preserves curve shape

### 3. Physical Range Validation

**Purpose**: Validates measurements against known petrophysical ranges.

**Industry Standards**:
- **Gamma Ray**: 0-300 API units (typical sedimentary rocks)
- **Neutron Porosity**: -0.15 to 1.0 v/v (includes gas effects)
- **Bulk Density**: 1.0-3.5 g/cm³ (fluid to dense minerals)
- **True Resistivity**: 0.1-10,000 ohm-m (conductive to resistive)
- **Caliper**: 4-20 inches (typical borehole sizes)
- **Spontaneous Potential**: -200 to +50 mV

**Validation Process**:
1. Compare each measurement to expected range
2. Flag values outside physical limits
3. Check for cross-curve consistency
4. Generate validation warnings

### 4. Mnemonic Standardization

**Purpose**: Converts curve names to industry standards for compatibility.

**Supported Standards**:
- **API RP 33**: American Petroleum Institute standard
- **CWLS**: Canadian Well Logging Society standard
- **Custom Mapping**: User-defined conversions

**Common Mappings**:
- GR, GAMMA, GAMR → GR (Gamma Ray)
- NPHI, TNPH, NEUT → NPHI (Neutron Porosity)
- RHOB, DENS, RHOZ → RHOB (Bulk Density)
- RT, RES, RILD → RT (True Resistivity)

---

## Advanced Visualization Features

### 8+ Visualization Types

POLISH offers comprehensive visualization capabilities with multiple chart types:

#### 1. Multi-Track Display
- **Professional well log layout** with customizable tracks
- **Track configuration** for different curve types
- **Depth synchronization** across all tracks
- **Grid lines and scaling** options

#### 2. Line Charts
- **Time series visualization** for trend analysis
- **Multi-curve overlay** with different colors
- **Zoom and pan** capabilities
- **Statistical overlays**

#### 3. Scatter Plots
- **Cross-plot analysis** between any two curves
- **Correlation identification** and trend analysis
- **Outlier detection** visual feedback
- **Multi-well comparison**

#### 4. Histograms
- **Data distribution analysis** for each curve
- **Bin size customization** for detailed analysis
- **Statistical parameters** display
- **Quality assessment** visualization

#### 5. Crossplot Matrix
- **Multi-dimensional analysis** of 3+ curves
- **Correlation matrix** visualization
- **Pattern recognition** for lithology identification
- **Interactive exploration**

#### 6. Radar Charts
- **Multi-parameter comparison** at specific depths
- **Normalized scaling** for different units
- **Pattern visualization** for facies analysis
- **Depth-by-depth comparison**

#### 7. Area Charts
- **Filled curve visualization** for cumulative analysis
- **Stacked display** for multiple curves
- **Volume calculations** and integration
- **Trend identification**

#### 8. Correlation Matrix
- **Statistical correlation** between all curves
- **Heat map visualization** of relationships
- **Quantitative analysis** with correlation coefficients
- **Data quality insights**

### Visualization Controls

#### Enhanced Interface
- **Popout Windows**: Open visualizations in new windows for detailed analysis
- **Full-Screen Mode**: Maximize visualization area for better detail
- **Reset Controls**: Quick reset for zoom, pan, and settings
- **Export Options**: Save visualizations as images or data

#### Error Handling
- **Clear Error Messages**: Informative messages when visualizations can't render
- **Minimum Data Requirements**: Guidance on data needs for each chart type
- **Troubleshooting Tips**: Built-in help for common visualization issues
- **Fallback Options**: Alternative visualizations when primary options fail

---

## Depth Range & Sampling Controls

### Dynamic Depth Management

POLISH provides comprehensive controls for managing depth ranges and data sampling:

#### Depth Range Controls
- **Start Depth**: Set minimum depth for analysis and visualization
- **End Depth**: Set maximum depth for focused analysis
- **Real-time Updates**: Immediate visualization updates when ranges change
- **Validation**: Automatic validation to ensure start < end depth

#### Sampling Interval Controls
- **Custom Sampling**: Adjust data point density (e.g., every 0.5m, 1m, 2m)
- **Performance Optimization**: Reduce data points for better performance
- **Quality Preservation**: Smart sampling maintains data integrity
- **Visual Feedback**: Shows current sampling rate and data point count

#### Advanced Features
- **Quick Presets**: Common depth ranges and sampling intervals
- **Zoom Integration**: Depth controls work with visualization zoom
- **Multi-Well Sync**: Apply same depth range to multiple wells
- **Export Integration**: Depth range settings apply to all exports

#### Usage Examples
- **Focus Analysis**: Zoom to specific formations or intervals
- **Performance Tuning**: Reduce sampling for large datasets
- **Comparative Analysis**: Use same depth range across multiple wells
- **Quality Control**: Examine specific problematic intervals

### Implementation Details
- **Memory Efficient**: Only processes data within specified range
- **Type Safety**: Full TypeScript support for all controls
- **State Management**: Integrated with Zustand store
- **Error Handling**: Graceful handling of invalid ranges

---

## Multi-Well Analysis

### Comparative Analysis Features

POLISH supports sophisticated multi-well analysis capabilities:

#### Well Selection
- **Multiple Well Loading**: Upload and manage multiple LAS files
- **Well Comparison**: Select up to 4 wells for simultaneous analysis
- **Color Coding**: Automatic color assignment for easy identification
- **Status Tracking**: Processing status for each well

#### Visualization Features
- **Synchronized Displays**: All wells shown on same depth scale
- **Overlay Capabilities**: Compare curves across wells
- **Statistical Comparison**: Side-by-side quality metrics
- **Correlation Analysis**: Cross-well correlation matrices

#### Analysis Tools
- **Quality Comparison**: Compare QC results across wells
- **Processing Consistency**: Apply same processing to multiple wells
- **Batch Export**: Export multiple wells with consistent formatting
- **Trend Analysis**: Identify patterns across well populations

---

## Troubleshooting Common Issues

### File Upload Problems

#### Error: "Invalid file format"
**Solution**: Ensure file has .las or .LAS extension and is a valid LAS file. Check that the file is not corrupted or in a different format.

#### Error: "File too large"
**Solution**: Files must be under 100MB for client-side processing. For larger files, consider splitting or contact support for server processing.

#### Error: "Failed to parse LAS file"
**Solution**: File may have formatting issues. Check for proper LAS header structure and ensure all required sections are present.

### Processing Issues

#### Processing takes too long
**Solution**: Large files may take several minutes. Reduce window sizes or disable unnecessary processing steps. Consider processing smaller sections using depth range controls.

#### Poor quality results
**Solution**: Adjust algorithm parameters. For very noisy data, increase denoising strength. For clean data, reduce processing intensity.

#### Browser becomes unresponsive
**Solution**: Close other browser tabs, ensure sufficient RAM available. Use depth range and sampling controls to reduce data size for very large files.

### Visualization Problems

#### Curves not displaying
**Solution**: Check curve visibility toggles (green eye icons). Ensure curves have valid data and are assigned to appropriate tracks. Use the reset visualization button if needed.

#### Error: "No Data Available"
**Solution**: Ensure you have:
- Selected a file with data
- At least one visible curve (green eye icon)
- Valid depth range selected
- Sufficient data points in the selected range

#### Error: "Select at least 2 curves for scatter plot"
**Solution**: Use the curve selection controls to choose the required number of curves for the visualization type.

#### Performance issues with visualization
**Solution**: 
- Use depth range controls to limit data
- Reduce number of visible curves
- Adjust sampling interval for better performance
- Consider using the popout window for complex visualizations

### Export & Conversion Issues

#### Export fails or incomplete
**Solution**: Ensure file is fully processed before export. Check browser download settings and available disk space.

#### Payment processing errors
**Solution**: Verify payment information, check internet connection. Contact support if payment was charged but export failed.

#### Format conversion issues
**Solution**: Ensure sufficient conversion credits. Some formats may not support all curve types. Check format-specific limitations.

### Getting Additional Help

If you continue experiencing issues:
- Check browser console for error messages (F12 → Console)
- Try refreshing the page or clearing browser cache
- Test with a different browser or incognito mode
- Ensure JavaScript is enabled and browser is up to date
- Use the built-in help system (Help button in header)
- Contact technical support with error details and file information

---

## File Formats & Export Options

### Input Formats

#### LAS (Log ASCII Standard)
- **Versions Supported**: 1.2, 2.0, 3.0
- **File Size Limit**: 100MB (client-side processing)
- **Features**: Full header preservation, all curve types
- **Encoding**: ASCII text format

### Export Formats

#### Premium LAS Export ($600)
- **Features**: 
  - Fully processed and cleaned data
  - Processing certificate with unique ID
  - Quality control metrics
  - Standardized mnemonics
  - Processing audit trail
- **Format**: LAS 2.0 compliant
- **Includes**: PDF processing report

#### Premium Technical Reports ($150 standalone, included with LAS export)
- **Features**:
  - Comprehensive technical analysis
  - Processing history documentation
  - Quality control metrics
  - Professional PDF format
  - Regulatory compliance ready
- **Payment Required**: Must purchase to download
- **Professional Grade**: Suitable for technical audits

#### Mnemonic Standardization ($150 standalone, included with LAS export)
- **Features**:
  - Curve name mapping and standardization
  - API RP 33 and CWLS compliance
  - Custom mnemonic mappings
  - Batch processing capabilities
- **Payment Required**: Must purchase to access
- **Professional Grade**: Industry-standard compliance

#### Format Conversion (Dollar-Based Pricing)

##### CSV ($20)
- **Features**: Comma-separated values, customizable delimiters
- **Best For**: Spreadsheet analysis, data import
- **Options**: Header inclusion, custom separators, depth range export
- **Limitations**: No metadata preservation

##### Excel/XLSX ($30)
- **Features**: Multiple sheets, formatting, charts
- **Best For**: Reporting, presentations, analysis
- **Options**: Separate sheets per curve type, depth range selection
- **Includes**: Summary statistics, quality metrics

##### JSON ($20)
- **Features**: Structured data, metadata preservation
- **Best For**: Web applications, API integration
- **Structure**: Hierarchical with header, curves, data
- **Encoding**: UTF-8 with proper escaping

##### ASCII ($20)
- **Features**: Custom formatted text output
- **Best For**: Legacy system compatibility
- **Options**: Configurable column widths, headers, depth range
- **Format**: Fixed-width or delimited

##### WITSML ($50)
- **Features**: Industry XML standard, full metadata
- **Best For**: Industry data exchange, compliance
- **Version**: WITSML 2.0 compliant
- **Includes**: Complete well information

##### SEG-Y ($80)
- **Features**: Seismic integration, trace headers
- **Best For**: Seismic-well tie, integrated interpretation
- **Format**: SEG-Y Revision 2
- **Limitations**: Compatible curve types only

---

## Pricing Structure

### Premium LAS Export

#### Standard Pricing
- **Single LAS File + Report**: $600
- **Includes**: Cleaned LAS file, processing certificate, comprehensive QC report, audit trail

#### Volume Pricing
- **50+ Files**: $525 per file (12.5% discount)
- **100+ Files**: $450 per file (25% discount)
- **Enterprise Volumes**: Custom pricing available

#### What's Included
- ✅ Fully processed and cleaned LAS file
- ✅ Processing certificate with unique ID and digital signature
- ✅ Comprehensive quality control metrics and validation report
- ✅ Standardized mnemonics and units (API/CWLS compliant)
- ✅ Complete processing audit trail and parameter documentation
- ✅ Professional PDF report with visualizations and recommendations
- ✅ 30-day money-back guarantee

### Premium Technical Reports

#### Report-Only Option
- **PDF Technical Report**: $150 (without LAS file)
- **Includes**: Comprehensive analysis, visualizations, recommendations, processing history
- **Professional Grade**: Suitable for regulatory compliance and technical audits
- **Payment Required**: Must purchase to access and download

#### Combined Option
- **LAS Export + Report**: $600 (report included in price)
- **Best Value**: Get both cleaned LAS file and premium report
- **No Additional Cost**: Report is included with LAS export

### Mnemonic Standardization

#### Standalone Option
- **Mnemonic Standardization**: $150 (without LAS file)
- **Includes**: Curve name mapping, API/CWLS compliance, custom mappings
- **Professional Grade**: Industry-standard compliance features
- **Payment Required**: Must purchase to access

#### Combined Option
- **LAS Export + Mnemonics**: $600 (mnemonics included in price)
- **Best Value**: Get both cleaned LAS file and mnemonic standardization
- **No Additional Cost**: Mnemonics are included with LAS export

### Format Conversion Pricing

#### Standard Formats
- **CSV**: $20 per file
- **Excel (XLSX)**: $30 per file
- **JSON**: $20 per file
- **ASCII**: $20 per file

#### Industry Formats
- **WITSML**: $50 per file
- **SEG-Y**: $80 per file

### Payment Options
- **Credit/Debit Cards**: Visa, MasterCard, American Express
- **PayPal**: Secure online payments
- **Enterprise**: Invoice billing available for large volumes
- **Security**: PCI DSS compliant, 256-bit SSL encryption

---

## Best Practices

### Data Preparation

#### Before Upload
1. **Verify File Integrity**: Check LAS file structure
2. **Review Curve Inventory**: Ensure all required curves present
3. **Check Units**: Verify consistent unit systems
4. **Backup Original**: Keep unprocessed copies

#### File Organization
1. **Naming Convention**: Use descriptive, consistent names
2. **Version Control**: Track processing versions
3. **Documentation**: Maintain processing logs
4. **Quality Records**: Keep QC reports

### Processing Workflow

#### Recommended Sequence
1. **Initial Assessment**: Review raw data quality
2. **Depth Range Selection**: Focus on intervals of interest
3. **Physical Validation**: Check for range violations
4. **Spike Detection**: Remove obvious outliers
5. **Denoising**: Apply appropriate smoothing
6. **Standardization**: Convert mnemonics
7. **Final QC**: Verify processing results

#### Parameter Selection
1. **Start Conservative**: Use default parameters initially
2. **Iterative Approach**: Adjust based on results
3. **Visual Verification**: Check before/after plots
4. **Document Changes**: Record parameter modifications

### Visualization Best Practices

#### Effective Analysis
1. **Use Appropriate Chart Types**: Match visualization to analysis goal
2. **Leverage Depth Controls**: Focus on specific intervals
3. **Multi-Well Comparison**: Use consistent depth ranges
4. **Sampling Optimization**: Balance detail with performance

#### Performance Optimization
1. **Limit Depth Range**: Focus on intervals of interest
2. **Adjust Sampling**: Reduce data density for large files
3. **Manage Curve Count**: Show only necessary curves
4. **Use Popout Windows**: For detailed analysis

### Quality Control

#### Validation Checklist
- [ ] Data completeness >90%
- [ ] Noise level <20%
- [ ] Spikes removed appropriately
- [ ] Physical ranges validated
- [ ] Mnemonics standardized
- [ ] Processing documented
- [ ] Depth range appropriate
- [ ] Sampling adequate

#### Red Flags
- Sudden quality score decrease after processing
- Over-smoothed geological features
- Excessive spike removal
- Unrealistic physical values
- Loss of important data
- Inconsistent depth ranges across wells

### Export Strategy

#### Format Selection
- **LAS**: For industry standard compatibility
- **CSV**: For spreadsheet analysis
- **Excel**: For reporting and presentations
- **JSON**: For web applications
- **WITSML**: For industry data exchange
- **SEG-Y**: For seismic integration

#### Documentation
- Include processing certificates
- Maintain audit trails
- Document parameter choices
- Record quality improvements
- Note depth range and sampling settings

---

## Frequently Asked Questions

### General Questions

**Q: Is my data secure when using POLISH?**
A: Yes, all processing happens locally in your browser. Files are never uploaded to servers during processing, ensuring complete data security and confidentiality.

**Q: What file sizes can POLISH handle?**
A: Client-side processing supports files up to 100MB. For larger files, server-side processing options are available for premium users.

**Q: Do I need to install any software?**
A: No, POLISH runs entirely in your web browser. No downloads or installations required.

### New Features Questions

**Q: How do I control the depth range for analysis?**
A: Use the depth range controls in the visualization panel. Click the sliders icon to show/hide the controls, then set your start and end depths. Changes apply immediately to all visualizations.

**Q: What is sampling interval and why should I use it?**
A: Sampling interval controls how frequently data points are included in analysis (e.g., every 0.5m vs every 2m). Use it to improve performance with large files or to focus on broader trends.

**Q: Can I compare multiple wells at the same time?**
A: Yes, you can select up to 4 wells for simultaneous comparison. Use the well selection controls in the visualization panel to choose which wells to compare.

**Q: Why do some visualizations show error messages?**
A: Different visualization types have different data requirements. For example, scatter plots need at least 2 curves, crossplot matrices need 3+ curves. The error messages guide you on what's needed.

### Pricing Questions

**Q: Why do premium exports and reports cost money?**
A: Premium exports include comprehensive processing certificates, quality reports, audit trails, and professional documentation that add significant value for regulatory compliance and professional use.

**Q: What's the difference between the $150 report and the $600 LAS export?**
A: The $150 option gives you only the premium technical report (PDF). The $600 option includes both the cleaned LAS file AND the premium report - it's the better value if you need the processed data.

**Q: What's included in the premium technical report?**
A: Premium technical reports include:
- Executive summary with processing overview
- Detailed processing methodology and algorithms used
- Comprehensive quality assessment and validation results
- Geological analysis and lithology identification
- Complete processing audit trail and parameters
- Quality metrics and statistical analysis
- Professional recommendations for further analysis
- System information and performance data
- Processing history with step-by-step documentation
- Professional PDF format suitable for regulatory compliance

**Q: What's included in the mnemonic standardization feature?**
A: Mnemonic standardization ($150) includes:
- Curve name mapping to industry standards (API RP 33, CWLS)
- Custom mnemonic mapping capabilities
- Batch processing for multiple files
- Standardization validation and reporting
- Compliance documentation for industry standards

**Q: Are there volume discounts available?**
A: Yes, we offer 12.5% discount for 50+ files ($525 each) and 25% discount for 100+ files ($450 each). Enterprise pricing is available for larger volumes.

**Q: What payment methods do you accept?**
A: We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can arrange invoice billing.

**Q: Is there a money-back guarantee?**
A: Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the results, contact support for a full refund.

### Processing Questions

**Q: How do I choose the right processing parameters?**
A: Start with default settings, then adjust based on your data characteristics. Use the help system for parameter guidance and visual feedback to optimize results.

**Q: Can I undo processing steps?**
A: Each processing run creates a new version. You can always return to the original file by re-uploading it.

**Q: Why did my quality score decrease after processing?**
A: This may indicate over-processing or inappropriate parameters. Try reducing processing intensity or using different algorithms.

### Visualization Questions

**Q: How do I open visualizations in a new window?**
A: Click the external link icon in the visualization header to open in a new window for detailed analysis.

**Q: What should I do if a chart shows "No Data Available"?**
A: Ensure you have selected a file, made curves visible (green eye icons), and have a valid depth range with sufficient data points.

**Q: How can I improve visualization performance?**
A: Use depth range controls to limit data, adjust sampling interval, reduce visible curves, or use the popout window feature.

### Export Questions

**Q: What's included in the premium export?**
A: Premium exports include the cleaned LAS file, processing certificate with unique ID, comprehensive QC report, standardized mnemonics, processing audit trail, and professional PDF documentation.

**Q: How much do format conversions cost?**
A: Conversion pricing ranges from $20 (CSV, JSON, ASCII) to $80 (SEG-Y), with Excel at $30 and WITSML at $50 per file.

**Q: Can I get just the report without the LAS file?**
A: Yes, premium technical reports are available for $125 without the cleaned LAS file.

**Q: Do I need to pay for reports?**
A: Yes, premium technical reports require payment. You can purchase the report only for $125, or get it included with the LAS export for $400.

### Technical Questions

**Q: Which browsers are supported?**
A: POLISH works best with modern browsers: Chrome, Firefox, Safari, and Edge. JavaScript must be enabled.

**Q: What if I encounter an error?**
A: Check the troubleshooting section first. If issues persist, contact support with error details and file information.

**Q: How accurate are the quality assessments?**
A: Quality scores are based on industry-standard metrics and extensive testing. They provide reliable indicators of data fitness for analysis.

---

## Support and Contact

### Getting Help
- **Help System**: Click the Help button in the application header
- **Documentation**: Comprehensive guides and tutorials
- **Video Tutorials**: Step-by-step processing guides
- **Community Forum**: User discussions and tips

### Technical Support
- **Email**: support@traceseis.com
- **Response Time**: 24 hours for technical issues
- **Priority Support**: Available for premium users
- **Remote Assistance**: Screen sharing for complex issues

### Sales and Enterprise
- **Volume Pricing**: Contact sales for 100+ file discounts
- **Enterprise Solutions**: Custom development available
- **Training**: On-site and remote training programs
- **Consulting**: Petrophysical data analysis services

### Feature Requests
- **Feedback Portal**: Submit enhancement requests
- **User Voting**: Vote on proposed features
- **Beta Testing**: Early access to new features
- **Custom Development**: Enterprise solutions available

---

## Privacy and Security

### Data Privacy
**Important:** POLISH is designed with your privacy and security as the highest priority:

- **No File Storage:** POLISH does not store your LAS files or processed data on our servers
- **Client-Side Processing:** All data processing occurs in your browser or in temporary server memory
- **No Data Retention:** Once processing is complete, your files are not retained on our systems
- **Your Responsibility:** You are responsible for saving your exported files immediately after download

### What We Store
We only store minimal business information:
- Account information (email, name, payment history)
- Export records (filename, date, format, user) for business tracking
- Processing history metadata (no actual data)

### What We Don't Store
- Your original LAS files
- Your processed data
- Your exported files
- Any file content or data points

### File Recovery
If you lose your exported file:
- **We cannot recover it** - we don't have a copy
- You must re-upload your original file and re-process
- This is by design for your privacy and security

### Best Practices
1. **Save Immediately:** Download and save your exported files right away
2. **Backup Originals:** Keep backup copies of your original LAS files
3. **Check Downloads:** Verify your file downloaded completely before closing the browser
4. **Contact Support:** If you encounter issues, contact support with error details

---

**Document Version**: 1.1.0  
**Last Updated**: December 7, 2024  
**Next Review**: March 7, 2025