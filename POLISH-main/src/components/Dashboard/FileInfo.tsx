import * as React from 'react';
import { useState } from 'react';
import { Calendar, MapPin, Building, Database, Layers, Clock, User, Download, Lock, Settings, Sliders, RotateCcw, Mountain, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';
import { GeologicalContext } from './GeologicalContext';
import { performGeologicalAnalysis } from '../../utils/geologicalAnalysis';

export const FileInfo: React.FC = () => {
  const { activeFile, setShowExportModal, updateFile, files } = useAppStore();
  const [showDepthControls, setShowDepthControls] = useState(false);
  const [showGeologicalContext, setShowGeologicalContext] = useState(false);
  const [depthSettings, setDepthSettings] = useState({
    startDepth: '',
    endDepth: '',
    samplingInterval: '',
    totalPoints: 0
  });

  // Debug logging for well selection
  React.useEffect(() => {
    if (activeFile) {
      console.log('Active File Changed:', {
        id: activeFile.id,
        name: activeFile.name,
        well: activeFile.header.well,
        company: activeFile.header.company,
        totalFiles: files.length
      });
    }
  }, [activeFile, files.length]);

  // Perform geological analysis when file is available
  const geologicalContext = React.useMemo(() => {
    if (!activeFile || !activeFile.data || activeFile.data.length === 0) {
      return null;
    }
    return performGeologicalAnalysis(activeFile.data, activeFile.curves);
  }, [activeFile]);

  React.useEffect(() => {
    if (activeFile) {
      const minDepth = Math.min(...activeFile.data.map(d => d.depth));
      const maxDepth = Math.max(...activeFile.data.map(d => d.depth));
      const originalStep = activeFile.header.step;
      
      setDepthSettings({
        startDepth: minDepth.toString(),
        endDepth: maxDepth.toString(),
        samplingInterval: originalStep.toString(),
        totalPoints: activeFile.data.length
      });
    }
  }, [activeFile]);

  const handleDepthRangeChange = (field: 'startDepth' | 'endDepth', value: string) => {
    if (!activeFile) return;

    const newSettings = { ...depthSettings, [field]: value };
    setDepthSettings(newSettings);

    // Only apply changes if both values are valid numbers
    const startNum = parseFloat(newSettings.startDepth);
    const endNum = parseFloat(newSettings.endDepth);
    
    if (isNaN(startNum) || isNaN(endNum) || startNum >= endNum) {
      return; // Don't apply invalid ranges
    }

    // Filter data based on new range
    const originalData = activeFile.originalData || activeFile.data;
    const filteredData = originalData.filter(d => 
      d.depth >= startNum && d.depth <= endNum
    );

    // Apply sampling
    const samplingNum = parseFloat(newSettings.samplingInterval);
    if (!isNaN(samplingNum) && samplingNum > 0) {
      const step = Math.round(samplingNum / activeFile.header.step);
      const sampledData = filteredData.filter((_, index) => index % Math.max(1, step) === 0);

      // Update the file with filtered data
      updateFile(activeFile.id, {
        data: sampledData,
        header: {
          ...activeFile.header,
          startDepth: startNum,
          stopDepth: endNum,
          step: samplingNum
        }
      });

      setDepthSettings(prev => ({ ...prev, totalPoints: sampledData.length }));
    }
  };

  const handleSamplingChange = (value: string) => {
    if (!activeFile) return;

    const newSettings = { ...depthSettings, samplingInterval: value };
    setDepthSettings(newSettings);

    const samplingNum = parseFloat(value);
    const startNum = parseFloat(newSettings.startDepth);
    const endNum = parseFloat(newSettings.endDepth);

    if (isNaN(samplingNum) || samplingNum <= 0 || isNaN(startNum) || isNaN(endNum)) {
      return;
    }

    // Filter data based on current depth range
    const originalData = activeFile.originalData || activeFile.data;
    const filteredData = originalData.filter(d => 
      d.depth >= startNum && d.depth <= endNum
    );

    // Apply new sampling
    const step = Math.round(samplingNum / activeFile.header.step);
    const sampledData = filteredData.filter((_, index) => index % Math.max(1, step) === 0);

    // Update the file
    updateFile(activeFile.id, {
      data: sampledData,
      header: {
        ...activeFile.header,
        step: samplingNum
      }
    });

    setDepthSettings(prev => ({ ...prev, totalPoints: sampledData.length }));
  };

  const resetDepthSettings = () => {
    if (!activeFile) return;

    // Reset to original data
    const originalData = activeFile.originalData || activeFile.data;
    const minDepth = Math.min(...originalData.map(d => d.depth));
    const maxDepth = Math.max(...originalData.map(d => d.depth));
    const originalStep = activeFile.header.step;

    setDepthSettings({
      startDepth: minDepth.toString(),
      endDepth: maxDepth.toString(),
      samplingInterval: originalStep.toString(),
      totalPoints: originalData.length
    });

    updateFile(activeFile.id, {
      data: originalData,
      header: {
        ...activeFile.header,
        startDepth: minDepth,
        stopDepth: maxDepth,
        step: originalStep
      }
    });
  };

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700 h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-slate-700 rounded-full">
            <Database className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Well Information</h3>
            <p className="text-slate-500">Select a LAS file to view detailed well information</p>
          </div>
        </div>
      </div>
    );
  }

  const { header, curves, data } = activeFile;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Well Information</h3>
              <p className="text-sm text-slate-400">LAS File Details & Geological Context</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Geological Context Toggle */}
            <button
              onClick={() => setShowGeologicalContext(!showGeologicalContext)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                showGeologicalContext
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Toggle geological context analysis"
            >
              <Mountain className="h-4 w-4" />
              <span className="hidden sm:inline">Geology</span>
            </button>

            {/* Depth Controls Toggle */}
            <button
              onClick={() => setShowDepthControls(!showDepthControls)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                showDepthControls
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Toggle depth range and sampling controls"
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Controls</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Geological Context */}
        <GeologicalContext 
          geologicalContext={geologicalContext}
          isVisible={showGeologicalContext}
        />

        {/* Depth Range and Sampling Controls */}
        {showDepthControls && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-white flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                <span>Depth & Sampling Controls</span>
              </h4>
              <button
                onClick={resetDepthSettings}
                className="flex items-center space-x-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Start Depth */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">
                  Start Depth (m)
                </label>
                <input
                  type="text"
                  value={depthSettings.startDepth}
                  onChange={(e) => handleDepthRangeChange('startDepth', e.target.value)}
                  placeholder="Enter start depth"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              
              {/* End Depth */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">
                  End Depth (m)
                </label>
                <input
                  type="text"
                  value={depthSettings.endDepth}
                  onChange={(e) => handleDepthRangeChange('endDepth', e.target.value)}
                  placeholder="Enter end depth"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Sampling Interval */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">
                  Sampling Interval (m)
                </label>
                <input
                  type="text"
                  value={depthSettings.samplingInterval}
                  onChange={(e) => handleSamplingChange(e.target.value)}
                  placeholder="Enter sampling interval"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Current Stats */}
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{depthSettings.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Data Points</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {(parseFloat(depthSettings.endDepth) - parseFloat(depthSettings.startDepth)).toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">Range (m)</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {(depthSettings.totalPoints / Math.max(1, parseFloat(depthSettings.endDepth) - parseFloat(depthSettings.startDepth))).toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">Density (pts/m)</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{parseFloat(depthSettings.samplingInterval).toFixed(2)}</div>
                <div className="text-xs text-slate-400">Step (m)</div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300">
                <strong>Tip:</strong> Leave fields blank and type new values. Changes apply automatically when valid. 
                Use smaller sampling intervals for more detail, larger for better performance.
              </p>
            </div>
          </div>
        )}

        {/* Export Status Banner */}
        {activeFile.processed && (
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-4 border border-amber-700/30">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">Ready for Premium Export</p>
                <p className="text-xs text-slate-400">
                  File processed successfully • Quality Score: {activeFile.qcResults?.overallQualityScore.toFixed(1) || 'N/A'}
                  {geologicalContext && (
                    <> • Lithology: {geologicalContext.dominantLithology.type} ({geologicalContext.dominantLithology.confidence}%)</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Well Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Well Indicator */}
          {files.length > 1 && (
            <div className="lg:col-span-2 mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-300">Active Well</span>
                </div>
                <span className="text-xs text-slate-400">
                  {files.findIndex(f => f.id === activeFile?.id) + 1} of {files.length} wells
                </span>
              </div>
              <p className="text-sm text-white mt-1 font-semibold">{activeFile?.name}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Building className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Company</p>
                <p className="text-sm font-medium text-white break-words">
                  {header.company || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Well / Field</p>
                <p className="text-sm font-medium text-white break-words">
                  {header.well || 'Not specified'}
                </p>
                <p className="text-xs text-slate-400 break-words">
                  {header.field || 'Field not specified'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Log Date</p>
                <p className="text-sm font-medium text-white">
                  {header.logDate || header.date || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Service Company</p>
                <p className="text-sm font-medium text-white break-words">
                  {header.serviceCompany || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="border-t border-slate-700 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">Unique Well Identifier</p>
              <p className="text-sm font-mono text-white bg-slate-700/50 px-3 py-2 rounded border border-slate-600 break-all">
                {header.uwi || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">LAS Version</p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                  v{header.version || 'Unknown'}
                </span>
                <span className="text-xs text-slate-400">
                  {header.wrap ? 'Wrapped' : 'Unwrapped'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Header Validation Warning */}
        {(!header.well || !header.company || !header.uwi) && (
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-700/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Incomplete Header Information</p>
                <p className="text-xs text-slate-400 mt-1">
                  This LAS file is missing some standard header fields. 
                  {!header.well && ' • Well name not found'}
                  {!header.company && ' • Company not specified'}
                  {!header.uwi && ' • UWI/API number missing'}
                </p>
                <p className="text-xs text-yellow-300 mt-2">
                  The file will still process normally, but some information may be incomplete.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Current Depth Information */}
        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Current Data Range & Sampling</span>
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Start Depth</p>
              <p className="text-base font-bold text-white">{parseFloat(depthSettings.startDepth).toFixed(1)}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">End Depth</p>
              <p className="text-base font-bold text-white">{parseFloat(depthSettings.endDepth).toFixed(1)}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Sampling</p>
              <p className="text-base font-bold text-white">{parseFloat(depthSettings.samplingInterval).toFixed(2)}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Data Points</p>
              <p className="text-base font-bold text-white">{depthSettings.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-slate-500">measurements</p>
            </div>
          </div>
        </div>
        
        {/* Curve Inventory */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-400" />
              <span>Curve Inventory ({curves.length})</span>
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Updated: {activeFile.uploadedAt.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {curves.map((curve, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: curve.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-white">{curve.mnemonic}</span>
                      <span className="text-xs text-slate-400">({curve.unit})</span>
                      {curve.standardMnemonic && curve.standardMnemonic !== curve.mnemonic && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30">
                          → {curve.standardMnemonic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{curve.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Track {curve.track}</p>
                    <p className="text-xs text-slate-500 capitalize">{curve.scale}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    curve.curveType === 'gamma_ray' ? 'bg-green-600/20 text-green-400' :
                    curve.curveType === 'resistivity' ? 'bg-red-600/20 text-red-400' :
                    curve.curveType === 'porosity' ? 'bg-blue-600/20 text-blue-400' :
                    curve.curveType === 'caliper' ? 'bg-cyan-600/20 text-cyan-400' :
                    curve.curveType === 'sp' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-slate-600/20 text-slate-400'
                  }`}>
                    {curve.curveType.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status */}
        {activeFile.processingHistory && activeFile.processingHistory.length > 0 && (
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Processing History</span>
            </h4>
            <div className="space-y-2">
              {activeFile.processingHistory.slice(-3).map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{step.operation}</p>
                    <p className="text-xs text-slate-400">{step.timestamp.toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {step.curvesAffected.length} curves
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};