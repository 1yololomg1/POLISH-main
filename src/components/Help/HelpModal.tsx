import * as React from 'react';
import { X, HelpCircle, Search, Book, AlertTriangle, CheckCircle, XCircle, Zap, FileText, Settings, Target, Copyright } from 'lucide-react';
import { useAppStore } from '../../store';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  searchTerms: string[];
}

export const HelpModal: React.FC = () => {
  const { showHelpModal, setShowHelpModal } = useAppStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('getting-started');

  if (!showHelpModal) return null;

  const currentYear = new Date().getFullYear();

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      searchTerms: ['start', 'begin', 'upload', 'file', 'las'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Welcome to POLISH</h4>
            <p className="text-slate-300 mb-4">
              POLISH is a professional petrophysical data preprocessing platform. Follow these steps to get started:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h5 className="font-medium text-white mb-1">Upload LAS Files</h5>
                  <p className="text-sm text-slate-300">
                    Drag and drop your LAS files into the upload zone or click "Browse Files". 
                    Supports LAS v1.2, v2.0, and v3.0 formats up to 100MB.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h5 className="font-medium text-white mb-1">Configure Processing</h5>
                  <p className="text-sm text-slate-300">
                    Adjust denoising, spike detection, and validation settings in the Processing Controls panel.
                    Default settings work well for most files.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h5 className="font-medium text-white mb-1">Process & Review</h5>
                  <p className="text-sm text-slate-300">
                    Click "Execute Processing Pipeline" and review the quality control results.
                    All processing happens locally in your browser for security.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div>
                  <h5 className="font-medium text-white mb-1">Export Results</h5>
                  <p className="text-sm text-slate-300">
                    Export cleaned LAS files or convert to other formats. Premium exports include 
                    processing certificates and comprehensive QC reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quality-scores',
      title: 'Quality Score Guide',
      icon: Target,
      searchTerms: ['quality', 'score', 'grade', 'red', 'yellow', 'green', 'qc', 'assessment'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Understanding Quality Scores</h4>
            <p className="text-slate-300 mb-4">
              POLISH evaluates data quality using multiple metrics and assigns an overall score from 0-100.
            </p>
          </div>
          
          {/* Grade Explanations */}
          <div className="space-y-4">
            <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded">Grade A</span>
                  <span className="text-white font-medium">90-100 Points</span>
                </div>
              </div>
              <h5 className="font-medium text-white mb-2">Excellent Quality</h5>
              <p className="text-sm text-slate-300 mb-2">
                Your data is production-ready with minimal noise and excellent completeness.
              </p>
              <div className="text-xs text-emerald-300">
                <strong>What this means:</strong> Data completeness greater than 95%, noise level less than 5%, minimal spikes, 
                all curves within physical ranges.
              </div>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-blue-400" />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded">Grade B</span>
                  <span className="text-white font-medium">75-89 Points</span>
                </div>
              </div>
              <h5 className="font-medium text-white mb-2">Good Quality</h5>
              <p className="text-sm text-slate-300 mb-2">
                High-quality data with minor issues that do not significantly impact analysis.
              </p>
              <div className="text-xs text-blue-300">
                <strong>Recommended actions:</strong> Consider light denoising, review any flagged spikes.
              </div>
            </div>
            
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-600 text-white font-bold rounded">Grade C</span>
                  <span className="text-white font-medium">60-74 Points</span>
                </div>
              </div>
              <h5 className="font-medium text-white mb-2">Acceptable Quality</h5>
              <p className="text-sm text-slate-300 mb-2">
                Usable data but requires processing to improve quality for reliable analysis.
              </p>
              <div className="text-xs text-yellow-300">
                <strong>Recommended actions:</strong> Apply denoising and spike removal, validate physical ranges.
              </div>
            </div>
            
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-orange-600 text-white font-bold rounded">Grade D</span>
                  <span className="text-white font-medium">50-59 Points</span>
                </div>
              </div>
              <h5 className="font-medium text-white mb-2">Poor Quality</h5>
              <p className="text-sm text-slate-300 mb-2">
                Significant data quality issues that require extensive processing.
              </p>
              <div className="text-xs text-orange-300">
                <strong>Recommended actions:</strong> Enable all processing options, review curve-by-curve quality.
              </div>
            </div>
            
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-red-600 text-white font-bold rounded">Grade F</span>
                  <span className="text-white font-medium">0-49 Points</span>
                </div>
              </div>
              <h5 className="font-medium text-white mb-2">Unacceptable Quality</h5>
              <p className="text-sm text-slate-300 mb-2">
                Data quality is too poor for reliable analysis. Consider re-logging or data source review.
              </p>
              <div className="text-xs text-red-300">
                <strong>Recommended actions:</strong> Contact data provider, check for file corruption, 
                review logging parameters.
              </div>
            </div>
          </div>
          
          {/* Quality Factors */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h5 className="font-medium text-white mb-3">Quality Assessment Factors</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-slate-300">Data Completeness:</strong>
                <p className="text-slate-400">Percentage of non-null values</p>
              </div>
              <div>
                <strong className="text-slate-300">Noise Level:</strong>
                <p className="text-slate-400">Signal-to-noise ratio assessment</p>
              </div>
              <div>
                <strong className="text-slate-300">Spike Detection:</strong>
                <p className="text-slate-400">Number of outliers and anomalies</p>
              </div>
              <div>
                <strong className="text-slate-300">Physical Validation:</strong>
                <p className="text-slate-400">Values within expected ranges</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'processing-algorithms',
      title: 'Processing Algorithms',
      icon: Zap,
      searchTerms: ['algorithm', 'processing', 'denoise', 'spike', 'savitzky', 'golay', 'hampel', 'filter'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Processing Algorithms Explained</h4>
            <p className="text-slate-300 mb-4">
              POLISH uses industry-standard algorithms for petrophysical data enhancement.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Savitzky-Golay Denoising</span>
              </h5>
              <p className="text-sm text-slate-300 mb-2">
                Advanced smoothing filter that preserves signal features while reducing noise.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Best for:</strong> Gamma ray, resistivity, and porosity curves</p>
                <p><strong>Window Size:</strong> 5-21 points (larger = more smoothing)</p>
                <p><strong>Polynomial Order:</strong> 2-6 (higher = better feature preservation)</p>
                <p><strong>Strength:</strong> 0-100% (blending with original data)</p>
              </div>
            </div>
            
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Hampel Spike Detection</span>
              </h5>
              <p className="text-sm text-slate-300 mb-2">
                Robust outlier detection using Median Absolute Deviation (MAD).
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Best for:</strong> Removing tool malfunctions and data spikes</p>
                <p><strong>Threshold:</strong> 2.0-5.0 (lower = more sensitive)</p>
                <p><strong>Window Size:</strong> 3-15 points (analysis window)</p>
                <p><strong>Replacement:</strong> PCHIP interpolation (shape-preserving)</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Physical Validation</span>
              </h5>
              <p className="text-sm text-slate-300 mb-2">
                Validates measurements against known petrophysical ranges.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>GR Range:</strong> 0-300 API units</p>
                <p><strong>NPHI Range:</strong> -0.15 to 1.0 v/v</p>
                <p><strong>RHOB Range:</strong> 1.0-3.5 g/cm³</p>
                <p><strong>RT Range:</strong> 0.1-10,000 ohm-m</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Mnemonic Standardization</span>
              </h5>
              <p className="text-sm text-slate-300 mb-2">
                Converts curve names to industry standards (API RP 33, CWLS).
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>API Standard:</strong> American Petroleum Institute</p>
                <p><strong>CWLS Standard:</strong> Canadian Well Logging Society</p>
                <p><strong>Auto-mapping:</strong> Common variations automatically detected</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h5 className="font-medium text-white mb-2">Processing Recommendations</h5>
            <div className="text-sm text-slate-300 space-y-2">
              <p><strong>For noisy data:</strong> Enable Savitzky-Golay with moderate strength (50-70%)</p>
              <p><strong>For spiky data:</strong> Use Hampel filter with threshold 2.5-3.0</p>
              <p><strong>For mixed issues:</strong> Apply denoising first, then spike detection</p>
              <p><strong>For clean data:</strong> Use validation only to verify quality</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      searchTerms: ['error', 'problem', 'issue', 'troubleshoot', 'fix', 'help', 'support'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Common Issues & Solutions</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span>File Upload Errors</span>
              </h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-300 font-medium">Error: "Invalid file format"</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Ensure file has .las or .LAS extension and is a valid LAS file.
                    Check that the file is not corrupted or in a different format.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Error: "File too large"</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Files must be under 100MB for client-side processing. 
                    For larger files, consider splitting or contact support for server processing.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Error: "Failed to parse LAS file"</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> File may have formatting issues. Check for proper LAS header 
                    structure and ensure all required sections are present.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span>Processing Issues</span>
              </h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-300 font-medium">Processing takes too long</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Large files may take several minutes. Reduce window sizes 
                    or disable unnecessary processing steps. Consider processing smaller sections.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Poor quality results</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Adjust algorithm parameters. For very noisy data, 
                    increase denoising strength. For clean data, reduce processing intensity.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Browser becomes unresponsive</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Close other browser tabs, ensure sufficient RAM available. 
                    For very large files, use server-side processing option.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <span>Visualization Problems</span>
              </h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-300 font-medium">Curves not displaying</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Check curve visibility toggles. Ensure curves have valid data 
                    and are assigned to appropriate tracks. Refresh the visualization.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Incorrect scaling</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Verify track scale settings (linear vs logarithmic). 
                    Check min/max values for each curve. Reset track configurations if needed.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Performance issues with visualization</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Reduce number of visible curves, limit depth range, 
                    or decrease curve thickness. Consider data decimation for very dense datasets.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-800/20 rounded border border-blue-700/30">
                  <h6 className="text-white font-semibold mb-2">Graphs Not Visualizing?</h6>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    <li>Upload and select a LAS file from the sidebar.</li>
                    <li>Ensure curves are visible (green eye icons).</li>
                    <li>For scatter plots: select at least 2 curves.</li>
                    <li>For crossplots: select at least 3 curves.</li>
                    <li>Use the "Reset" button if charts don't appear.</li>
                    <li>Adjust depth range and sampling in the File Info panel.</li>
                    <li>If data for selected curves contains only null or undefined values, graphs will not render.</li>
                    <li>Some visualization types require both original and processed data (e.g., before/after overlay).</li>
                    <li>Large files or complex charts may take a while to render—please wait a few moments.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span>Export & Conversion Issues</span>
              </h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-300 font-medium">Export fails or incomplete</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Ensure file is fully processed before export. 
                    Check browser download settings and available disk space.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Payment processing errors</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Verify payment information, check internet connection. 
                    Contact support if payment was charged but export failed.
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Format conversion issues</p>
                  <p className="text-slate-400">
                    <strong>Solution:</strong> Ensure sufficient conversion credits. Some formats 
                    may not support all curve types. Check format-specific limitations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h5 className="font-medium text-white mb-2">Getting Additional Help</h5>
            <div className="text-sm text-slate-300 space-y-2">
              <p>If you continue experiencing issues:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Check browser console for error messages (F12 → Console)</li>
                <li>Try refreshing the page or clearing browser cache</li>
                <li>Test with a different browser or incognito mode</li>
                <li>Ensure JavaScript is enabled and browser is up to date</li>
                <li>Contact technical support with error details and file information</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'file-formats',
      title: 'File Formats & Standards',
      icon: FileText,
      searchTerms: ['format', 'las', 'csv', 'excel', 'json', 'witsml', 'segy', 'standard'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Supported File Formats</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
              <h5 className="font-medium text-white mb-2">LAS (Log ASCII Standard)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Supported Versions:</strong> 1.2, 2.0, 3.0</p>
                <p><strong>Input:</strong> Upload and processing</p>
                <p><strong>Output:</strong> Premium export with processing certificate</p>
                <p><strong>Features:</strong> Full header preservation, curve metadata, quality metrics</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h5 className="font-medium text-white mb-2">CSV (Comma-Separated Values)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Cost:</strong> $20 per file</p>
                <p><strong>Features:</strong> Customizable delimiters, header options</p>
                <p><strong>Best for:</strong> Spreadsheet analysis, data import to other tools</p>
                <p><strong>Limitations:</strong> No metadata preservation</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h5 className="font-medium text-white mb-2">Excel (XLSX)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Cost:</strong> $30 per file</p>
                <p><strong>Features:</strong> Multiple sheets, curve grouping, formatting</p>
                <p><strong>Best for:</strong> Reporting, data analysis, presentations</p>
                <p><strong>Options:</strong> Separate sheets per curve type</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <h5 className="font-medium text-white mb-2">JSON (JavaScript Object Notation)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Cost:</strong> $20 per file</p>
                <p><strong>Features:</strong> Structured data, metadata preservation</p>
                <p><strong>Best for:</strong> Web applications, API integration</p>
                <p><strong>Structure:</strong> Hierarchical with header, curves, and data sections</p>
              </div>
            </div>
            
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <h5 className="font-medium text-white mb-2">WITSML (Wellsite Information Transfer Standard)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Cost:</strong> $50 per file</p>
                <p><strong>Features:</strong> Industry XML standard, full metadata</p>
                <p><strong>Best for:</strong> Industry data exchange, compliance</p>
                <p><strong>Version:</strong> WITSML 2.0 compliant</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30">
              <h5 className="font-medium text-white mb-2">SEG-Y (Seismic Data Format)</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Cost:</strong> $80 per file</p>
                <p><strong>Features:</strong> Seismic integration, trace headers</p>
                <p><strong>Best for:</strong> Seismic-well tie, integrated interpretation</p>
                <p><strong>Limitations:</strong> Limited to compatible curve types</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h5 className="font-medium text-white mb-3">Industry Standards Compliance</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-slate-300">API RP 33:</strong>
                <p className="text-slate-400">Standard Log Data Format</p>
              </div>
              <div>
                <strong className="text-slate-300">CWLS:</strong>
                <p className="text-slate-400">Canadian Well Logging Society</p>
              </div>
              <div>
                <strong className="text-slate-300">WITSML 2.0:</strong>
                <p className="text-slate-400">Industry data exchange</p>
              </div>
              <div>
                <strong className="text-slate-300">SEG-Y Rev 2:</strong>
                <p className="text-slate-400">Seismic data standard</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'copyright-legal',
      title: 'Copyright & Legal',
      icon: Copyright,
      searchTerms: ['copyright', 'legal', 'license', 'trademark', 'patent', 'terms'],
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Copyright & Legal Information</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Copyright className="h-5 w-5 text-blue-400" />
                <span>Copyright Notice</span>
              </h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  © {currentYear} POLISH Technologies, Inc. All rights reserved.
                </p>
                <p>
                  This software and its documentation are protected by copyright law and international treaties. 
                  Unauthorized reproduction or distribution of this software, or any portion of it, may result in 
                  severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h5 className="font-medium text-white mb-2">Trademark Information</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  <strong>POLISH™</strong> is a trademark of POLISH Technologies, Inc.
                </p>
                <p>
                  <strong>Petrophysical Operations for Log Intelligence, Smoothing and Harmonization™</strong> 
                  is a trademark of POLISH Technologies, Inc.
                </p>
                <p>
                  All other trademarks mentioned in this software are the property of their respective owners.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
              <h5 className="font-medium text-white mb-2">Patent Information</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  This software may be covered by one or more patents or patent applications. 
                  See our patent portfolio for details.
                </p>
                <p>
                  Patents pending for advanced signal processing algorithms and quality assessment methods.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <h5 className="font-medium text-white mb-2">Open Source Components</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  This application uses open source software components. The following licenses apply:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>React - MIT License</li>
                  <li>TypeScript - Apache License 2.0</li>
                  <li>Tailwind CSS - MIT License</li>
                  <li>Recharts - MIT License</li>
                  <li>Lucide React - ISC License</li>
                  <li>Zustand - MIT License</li>
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  Full license texts and acknowledgments are available in our open source documentation.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
              <h5 className="font-medium text-white mb-2">Industry Standards Compliance</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  POLISH is compliant with the following industry standards:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>API RP 33:</strong> Standard Log Data Format</li>
                  <li><strong>CWLS:</strong> Canadian Well Logging Society Standards</li>
                  <li><strong>WITSML 2.0:</strong> Wellsite Information Transfer Standard</li>
                  <li><strong>LAS Format:</strong> Versions 1.2, 2.0, and 3.0</li>
                  <li><strong>SEG-Y:</strong> Revision 2 for seismic data</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30">
              <h5 className="font-medium text-white mb-2">Data Security & Privacy</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  <strong>Client-Side Processing:</strong> All data processing occurs locally in your browser. 
                  No files are uploaded to our servers during processing operations.
                </p>
                <p>
                  <strong>Data Retention:</strong> We do not store or retain any of your LAS files or processed data.
                </p>
                <p>
                  <strong>Privacy Compliance:</strong> GDPR compliant for EU users, CCPA compliant for California users.
                </p>
                <p>
                  <strong>Security Standards:</strong> SOC 2 Type II compliant, ISO 27001 planned.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h5 className="font-medium text-white mb-2">Terms of Use</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  By using this software, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p>
                  <strong>Permitted Use:</strong> Licensed for commercial and non-commercial petrophysical data processing.
                </p>
                <p>
                  <strong>Restrictions:</strong> Reverse engineering, redistribution, or modification of the software is prohibited.
                </p>
                <p>
                  <strong>Warranty:</strong> Software is provided "as is" without warranty of any kind.
                </p>
                <p>
                  <strong>Liability:</strong> Limited to the amount paid for the service.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h5 className="font-medium text-white mb-2">Contact Information</h5>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  <strong>Legal Department:</strong> legal@polish-petro.com
                </p>
                <p>
                  <strong>Copyright Inquiries:</strong> copyright@polish-petro.com
                </p>
                <p>
                  <strong>Patent Licensing:</strong> patents@polish-petro.com
                </p>
                <p>
                  <strong>General Counsel:</strong> POLISH Technologies, Inc., Houston, TX, USA
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.searchTerms.some(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeContent = helpSections.find(section => section.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-700 bg-slate-900/50">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Help Center</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Navigation */}
          <div className="p-4">
            <div className="space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeContent ? (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <activeContent.icon className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">{activeContent.title}</h2>
                </div>
                {activeContent.content}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No results found</h3>
                <p className="text-slate-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};