import * as React from 'react';
import { X, RefreshCw, Upload, Download, FileText, Table, Code, Database, Zap, CreditCard } from 'lucide-react';
import { useAppStore } from '../../store';
import { isPaymentEnabled } from '../../config';

export const FormatConverter: React.FC = () => {
  const { showFormatConverter, setShowFormatConverter, user, addConversionJob, setShowPaymentModal } = useAppStore();
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [outputFormat, setOutputFormat] = React.useState<'csv' | 'xlsx' | 'json' | 'ascii' | 'witsml' | 'segy'>('csv');
  const [conversionOptions, setConversionOptions] = React.useState({
    includeHeader: true,
    separateSheets: true,
    includeQC: false,
    customDelimiter: ','
  });

  if (!showFormatConverter) return null;

  // Updated pricing structure - convert credits to dollars (1 credit = $10)
  const formatOptions = [
    { id: 'csv', name: 'CSV', icon: Table, description: 'Comma-separated values', price: 20 }, // 2 credits = $20
    { id: 'xlsx', name: 'Excel', icon: FileText, description: 'Microsoft Excel format', price: 30 }, // 3 credits = $30
    { id: 'json', name: 'JSON', icon: Code, description: 'JavaScript Object Notation', price: 20 }, // 2 credits = $20
    { id: 'ascii', name: 'ASCII', icon: FileText, description: 'Custom formatted text', price: 20 }, // 2 credits = $20
    { id: 'witsml', name: 'WITSML', icon: Database, description: 'Industry XML standard', price: 50 }, // 5 credits = $50
    { id: 'segy', name: 'SEG-Y', icon: Zap, description: 'Seismic data format', price: 80 } // 8 credits = $80
  ];

  const selectedFormatInfo = formatOptions.find(f => f.id === outputFormat);
  const totalCost = selectedFiles.length * (selectedFormatInfo?.price || 0);
  const canAfford = user && user.credits >= (totalCost / 10); // Convert back to credits for checking

  const handleFileUpload = (files: FileList) => {
    setSelectedFiles(Array.from(files).filter(f => f.name.toLowerCase().endsWith('.las')));
  };

  const handleConvert = () => {
    // Check if payments are enabled - if not, allow conversion
    if (!isPaymentEnabled()) {
      console.log('Payment system disabled - allowing format conversion');
      // Simulate conversion process
      alert('Format conversion completed (payment system disabled)');
      setShowFormatConverter(false);
      return;
    }

    if (!user) {
      setShowPaymentModal(true);
      return;
    }
    
    // Check if user has purchased exports
    if (!user.purchasedExports) {
      alert('Format conversion requires premium purchase. Please purchase export access.');
      setShowPaymentModal(true);
      return;
    }

    // Validate files before conversion
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Conversion failed: No files selected. Please select at least one LAS file to convert.');
      return;
    }

    // Check file sizes and validate LAS files
    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(`Conversion failed: File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum file size is 100MB.`);
        return;
      }

      if (!file.name.toLowerCase().endsWith('.las')) {
        alert(`Conversion failed: File "${file.name}" is not a LAS file. Please select only LAS files for conversion.`);
        return;
      }
    }
    
    // Simulate conversion process
    console.log('Converting file to:', outputFormat);
    
    // Show success message with reminder
    alert(`Format conversion completed successfully!\n\nIMPORTANT: Please save your converted file immediately to your device. POLISH does not store your files and cannot recover them if lost.`);
    
    setShowFormatConverter(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Format Converter</h3>
                <p className="text-sm text-slate-400">Convert LAS files to multiple industry-standard formats</p>
              </div>
            </div>
            <button
              onClick={() => setShowFormatConverter(false)}
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
                  All processing is done in your browser or in temporary memory. Once you download your converted file, 
                  please save it immediately to your device. We cannot recover files if they are lost.
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Upload LAS Files</h4>
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-slate-700/20 transition-all duration-200"
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-sm text-slate-300 mb-2 font-medium">Drop LAS files here or browse</p>
              <p className="text-xs text-slate-500 mb-4">Supports processed or raw LAS files</p>
              <label className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".las,.LAS"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-white">Selected Files ({selectedFiles.length})</h5>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600">
                      <span className="text-sm text-white truncate">{file.name}</span>
                      <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output Format Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Output Format</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setOutputFormat(format.id as any)}
                    className={`p-4 rounded-xl border transition-all ${
                      outputFormat === format.id
                        ? 'border-purple-500 bg-purple-900/20 text-white'
                        : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <p className="font-medium text-sm">{format.name}</p>
                        <p className="text-xs text-slate-400">{format.description}</p>
                        <p className="text-xs font-bold text-green-400 mt-1">${format.price}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Conversion Options</h4>
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={conversionOptions.includeHeader}
                  onChange={(e) => setConversionOptions(prev => ({ ...prev, includeHeader: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Include header information</span>
              </label>
              
              {outputFormat === 'xlsx' && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={conversionOptions.separateSheets}
                    onChange={(e) => setConversionOptions(prev => ({ ...prev, separateSheets: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Separate sheets per curve type</span>
                </label>
              )}
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={conversionOptions.includeQC}
                  onChange={(e) => setConversionOptions(prev => ({ ...prev, includeQC: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Include QC metrics (if available)</span>
              </label>
              
              {outputFormat === 'csv' && (
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-slate-300">Delimiter:</label>
                  <select
                    value={conversionOptions.customDelimiter}
                    onChange={(e) => setConversionOptions(prev => ({ ...prev, customDelimiter: e.target.value }))}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Conversion Cost</span>
              <span className="text-xl font-bold text-white">${totalCost}</span>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>{selectedFiles.length} files × ${selectedFormatInfo?.price} each</p>
              {user && (
                <p className={`font-medium ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                  Your balance: {user.credits} credits (${user.credits * 10} value)
                </p>
              )}
            </div>
          </div>

          {/* Credit Purchase */}
          {user && !canAfford && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Need More Credits?</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Purchase conversion credits to continue. Credits never expire and are valued at $10 each.
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                Buy Credits
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <p>Total: <span className="text-white font-bold">${totalCost}</span></p>
              <p className="text-xs">Instant conversion • Multiple formats • Professional quality</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFormatConverter(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || !user || !canAfford}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Convert Files</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};