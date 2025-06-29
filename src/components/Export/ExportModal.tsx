import * as React from 'react';
import { X, Download, Lock, Star, FileText, CreditCard, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useAppStore } from '../../store';
import { ExportOptions } from '../../types';
import PaymentModal from './PaymentModal';

export const ExportModal: React.FC = () => {
  const { showExportModal, setShowExportModal, activeFile, session } = useAppStore();
  const [selectedFormat, setSelectedFormat] = React.useState<'las' | 'csv' | 'xlsx' | 'json' | 'ascii' | 'witsml' | 'segy'>('las');
  const [includeQC, setIncludeQC] = React.useState(true);
  const [includeHistory, setIncludeHistory] = React.useState(true);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  if (!showExportModal || !activeFile) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityGrade = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const handleExport = () => {
    // Validate file before export
    if (!activeFile || !activeFile.data || activeFile.data.length === 0) {
      alert('Export failed: No data available for export. Please ensure your file has been processed successfully.');
      return;
    }

    // Check for required LAS header information
    if (selectedFormat === 'las') {
      if (!activeFile.header || !activeFile.header.well || !activeFile.header.company) {
        alert('Export failed: The LAS file is missing required header information (well name or company). Please check your file and try again. If the problem persists, contact support.');
        return;
      }

      if (!activeFile.curves || activeFile.curves.length === 0) {
        alert('Export failed: No curve data found in the file. Please ensure your LAS file contains valid curve information.');
        return;
      }

      // Check for data consistency
      const hasValidData = activeFile.data.some(point => 
        point.depth !== null && point.depth !== undefined && 
        Object.keys(point).some(key => key !== 'depth' && point[key] !== null && point[key] !== undefined)
      );

      if (!hasValidData) {
        alert('Export failed: The file contains no valid data points. Please check your file and ensure it contains depth and curve data.');
        return;
      }
    }
    
    // Show payment modal for export
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (downloadUrl: string) => {
    // Trigger immediate download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${activeFile?.name.replace('.las', '')}_processed.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowPaymentModal(false);
    setShowExportModal(false);
    
    // Show success message
    alert(`Export completed successfully!\n\nIMPORTANT: Please save your file immediately to your device. POLISH does not store your files and cannot recover them if lost.`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const exportOptions: ExportOptions = {
    format: selectedFormat,
    includeQC,
    includeProcessingHistory: includeHistory,
    customFormatting: {}
  };

  // New pricing structure
  const getExportPrice = () => {
    if (selectedFormat === 'las') {
      return 600; // $600 for LAS file with report
    } else {
      return 150; // $150 for PDF report only
    }
  };

  const exportPrice = getExportPrice();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Premium Export with Processing Certificate</h3>
                <p className="text-sm text-slate-400">Professional-grade export with comprehensive documentation</p>
              </div>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-600 rounded-full flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-300 mb-1">Privacy & Security Notice</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  <strong>Important:</strong> For your privacy and security, POLISH does not store your files on our servers. 
                  All processing is done in your browser or in temporary memory. Once you download your export, 
                  please save it immediately to your device. We cannot recover files if they are lost.
                </p>
              </div>
            </div>
          </div>

          {/* ALVARO Certificate Preview */}
          {activeFile.alvaroCertificate && (
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-green-600 rounded-full flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-1">ALVARO Certificate Included</h4>
                  <p className="text-xs text-green-200 leading-relaxed">
                    <strong>Certificate ID:</strong> {activeFile.alvaroCertificate.certificateId}<br/>
                    <strong>Quality Grade:</strong> {activeFile.alvaroCertificate.processedGrade} 
                    {activeFile.alvaroCertificate.originalGrade !== activeFile.alvaroCertificate.processedGrade && 
                      ` (Improved from ${activeFile.alvaroCertificate.originalGrade})`}<br/>
                    <strong>Confidence Level:</strong> {activeFile.alvaroCertificate.confidenceLevel}<br/>
                    <strong>Uncertainty:</strong> ±{activeFile.alvaroCertificate.uncertaintyBounds.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Preview */}
          <div className="relative bg-slate-700/30 rounded-xl p-6 border border-slate-600">
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl font-bold text-slate-600/20 transform -rotate-12 select-none">
                POLISH
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{activeFile.name}</h4>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">Premium Export Required</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">File Size</p>
                  <p className="text-sm font-semibold text-white">{formatFileSize(activeFile.size)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Quality Score</p>
                  <p className="text-sm font-semibold text-white">
                    {activeFile.qcResults?.overallQualityScore.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Grade</p>
                  <p className="text-sm font-semibold text-white">
                    {getQualityGrade(activeFile.qcResults?.overallQualityScore)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Curves</p>
                  <p className="text-sm font-semibold text-white">{activeFile.curves.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Processed with POLISH algorithms</span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Export Format</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFormat('las')}
                className={`p-4 rounded-xl border transition-all ${
                  selectedFormat === 'las'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Cleaned LAS File + Report</p>
                    <p className="text-xs text-slate-400">Industry standard format with documentation</p>
                    <p className="text-sm font-bold text-green-400 mt-1">$600</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`p-4 rounded-xl border transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">CSV Export + Report</p>
                    <p className="text-xs text-slate-400">Spreadsheet format with documentation</p>
                    <p className="text-sm font-bold text-green-400 mt-1">$600</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mnemonic Standardization Service */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Mnemonic Standardization Service</h4>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Instantly standardize your LAS file curve names to industry standards (API RP 33, CWLS) for maximum compatibility and compliance. This service applies only to the original file—no other processing is performed.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 mb-2">
              <li>• Curve name mapping to API/CWLS standards</li>
              <li>• Custom mapping support</li>
              <li>• Batch processing for multiple files</li>
              <li>• Standardization validation and reporting</li>
              <li>• No data retention—results are delivered instantly</li>
            </ul>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg font-bold text-green-400">$150</span>
              <span className="text-xs text-slate-400">per file</span>
            </div>
            <div className="mt-3">
              <button
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => alert('Mnemonic Standardization as a standalone service will be available soon. For now, it is included with all premium exports.')}
              >
                Get Mnemonic Standardization Only
              </button>
            </div>
          </div>

          {/* Volume Pricing Information */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-700/30">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Volume Pricing Available</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-white font-bold">$600</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">1-49 files</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold">$525</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">50+ files</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold">$450</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">100+ files</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              <strong>All bulk pricing includes both cleaned LAS file AND comprehensive report</strong>
            </p>
            <p className="text-xs text-slate-400 text-center">
              Contact sales for enterprise pricing on large volumes
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Premium Export Includes</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Fully processed and cleaned LAS file</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Processing certificate with unique ID and digital signature</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Comprehensive quality control metrics and validation report</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Standardized mnemonics and units (API/CWLS compliant)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Complete processing audit trail and parameter documentation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Professional PDF report with visualizations and recommendations</span>
              </li>
            </ul>
          </div>

          {/* Value Proposition */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h4 className="text-sm font-semibold text-white mb-2">Why Choose POLISH Premium Export?</h4>
            <p className="text-sm text-slate-300 mb-3">
              Our premium export ensures your data meets the highest industry standards for downstream analysis, 
              with full documentation and traceability for regulatory compliance.
            </p>
            <div className="text-xs text-slate-400">
              ✓ Process Free → Pay to Export • ✓ No Subscription Required • ✓ Instant Download
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <p>Total: <span className="text-white font-bold text-lg">${exportPrice}</span></p>
              <p className="text-xs">One-time payment • Instant download</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="h-4 w-4" />
                <span>Purchase Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};