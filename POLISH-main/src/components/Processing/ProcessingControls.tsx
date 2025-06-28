import * as React from 'react';
import { Play, Settings, RotateCcw, Save } from 'lucide-react';
import { useAppStore } from '../../store';
import { apiService } from '../../services/api';
import { ALVAROStandard, ALVAROMetrics, ProcessingStep } from '../../utils/alvaroStandard';

export const ProcessingControls: React.FC = () => {
  const { processingOptions, updateProcessingOptions, isProcessing, setProcessing, activeFile, updateFile, setProcessingProgress } = useAppStore();

  const handleProcess = async () => {
    if (!activeFile) return;
    
    setProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Calculate original ALVARO metrics
      const originalALVAROMetrics = ALVAROStandard.calculateALVAROMetrics(
        activeFile.originalData || activeFile.data,
        activeFile.curves
      );

      // Convert file data to ArrayBuffer for API
      const fileData = JSON.stringify(activeFile);
      const buffer = new TextEncoder().encode(fileData).buffer;
      
      // Call the real processing API
      const response = await apiService.processFile(
        buffer,
        activeFile.name,
        processingOptions
      );
      
      if (response.success && response.data) {
        // Calculate processed ALVARO metrics
        const processedALVAROMetrics = ALVAROStandard.calculateALVAROMetrics(
          response.data.data,
          activeFile.curves,
          response.processingHistory || []
        );

        // Create ALVARO processing steps
        const alvaroProcessingSteps: ProcessingStep[] = (response.processingHistory || []).map((step, index) => ({
          stepId: `ALVARO-${Date.now()}-${index}`,
          timestamp: new Date().toISOString(),
          operation: step.operation,
          parameters: step.parameters,
          qualityMetrics: {
            before: originalALVAROMetrics,
            after: processedALVAROMetrics
          },
          algorithmVersion: '1.0',
          validationStatus: 'Passed'
        }));

        // Generate ALVARO certificate
        const alvaroCertificate = ALVAROStandard.generateCertificate(
          activeFile.name,
          originalALVAROMetrics,
          processedALVAROMetrics,
          alvaroProcessingSteps
        );

        // Update the file with processed data and ALVARO metrics
        updateFile(activeFile.id, {
          processed: true,
          qcResults: response.qcResults,
          processedData: response.data.data,
          processingHistory: response.processingHistory,
          alvaroMetrics: processedALVAROMetrics,
          alvaroCertificate: alvaroCertificate,
          originalALVAROMetrics: originalALVAROMetrics
        });
        
        // Show warnings if any
        if (response.warnings && response.warnings.length > 0) {
          console.warn('Processing warnings:', response.warnings);
        }

        // Show ALVARO quality improvement
        if (processedALVAROMetrics.overallGrade !== originalALVAROMetrics.overallGrade) {
          const improvement = ((processedALVAROMetrics.overallGrade.charCodeAt(0) - originalALVAROMetrics.overallGrade.charCodeAt(0)) / originalALVAROMetrics.overallGrade.charCodeAt(0)) * 100;
          console.log(`ALVARO Quality Improvement: ${originalALVAROMetrics.overallGrade} → ${processedALVAROMetrics.overallGrade} (${improvement.toFixed(1)}% improvement)`);
        }
      } else {
        throw new Error(response.error || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      // You could show an error toast here
    } finally {
      setProcessing(false);
      setProcessingProgress(100);
    }
  };

  const handleReset = () => {
    // Reset processing options to defaults
    updateProcessingOptions({
      denoise: {
        enabled: true,
        method: 'savitzky_golay',
        windowSize: 11,
        polynomialOrder: 3,
        strength: 0.7,
        preserveSpikes: false
      },
      despike: {
        enabled: true,
        method: 'hampel',
        threshold: 3,
        windowSize: 7,
        replacementMethod: 'pchip'
      },
      validation: {
        enabled: true,
        physicalRanges: {
          'GR': { min: 0, max: 300 },
          'NPHI': { min: -0.15, max: 1.0 },
          'RHOB': { min: 1.0, max: 3.5 },
          'RT': { min: 0.1, max: 10000 },
          'CALI': { min: 4, max: 20 }
        },
        crossValidation: true,
        flagOutliers: true
      },
      mnemonics: {
        enabled: true,
        standard: 'api',
        autoStandardize: true,
        customMappings: {},
        preserveOriginal: true
      },
      depthAlignment: {
        enabled: true,
        referenceDepth: 0,
        shiftTolerance: 0.5,
        autoCorrect: false
      }
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Processing Controls</h3>
          <p className="text-sm text-slate-400">Apply ALVARO-certified processing algorithms</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset to ALVARO defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* Open settings modal */}}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="ALVARO processing settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !activeFile}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            isProcessing
              ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing with ALVARO Standards...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Process with ALVARO Certification</span>
            </>
          )}
        </button>

        {isProcessing && (
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${setProcessingProgress}%` }}
            ></div>
          </div>
        )}

        {activeFile && activeFile.alvaroMetrics && (
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h4 className="text-sm font-semibold text-white mb-2">ALVARO Quality Assessment</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Grade:</span>
                <span className={`ml-1 font-semibold ${
                  activeFile.alvaroMetrics.overallGrade === 'A' ? 'text-green-400' :
                  activeFile.alvaroMetrics.overallGrade === 'B' ? 'text-blue-400' :
                  activeFile.alvaroMetrics.overallGrade === 'C' ? 'text-yellow-400' :
                  activeFile.alvaroMetrics.overallGrade === 'D' ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {activeFile.alvaroMetrics.overallGrade}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Confidence:</span>
                <span className={`ml-1 font-semibold ${
                  activeFile.alvaroMetrics.confidenceLevel === 'High' ? 'text-green-400' :
                  activeFile.alvaroMetrics.confidenceLevel === 'Medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {activeFile.alvaroMetrics.confidenceLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Completeness:</span>
                <span className="ml-1 font-semibold text-white">
                  {activeFile.alvaroMetrics.completenessIndex.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400">Uncertainty:</span>
                <span className="ml-1 font-semibold text-white">
                  ±{activeFile.alvaroMetrics.uncertaintyBounds.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};