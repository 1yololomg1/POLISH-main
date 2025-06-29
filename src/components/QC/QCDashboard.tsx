import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Database, Target } from 'lucide-react';
import { useAppStore } from '../../store';

export const QCDashboard: React.FC = () => {
  const { activeFile } = useAppStore();

  if (!activeFile || !activeFile.qcResults) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Target className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No QC Results</h3>
        <p className="text-slate-500">Process a file to view quality control results</p>
      </div>
    );
  }

  const { qcResults } = activeFile;
  const dataCompleteness = ((qcResults.totalPoints - qcResults.nullPoints) / qcResults.totalPoints) * 100;
  const qualityScore = Math.max(0, 100 - (qcResults.spikesDetected * 5) - (qcResults.noiseLevel * 100) - ((100 - dataCompleteness) * 2));

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Quality Control Dashboard</h3>
      
      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Overall Quality Score</h4>
            <p className="text-2xl font-bold text-white">{qualityScore.toFixed(1)}/100</p>
          </div>
          <div className={`p-3 rounded-full ${
            qualityScore >= 80 ? 'bg-green-600' : qualityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {qualityScore >= 80 ? (
              <CheckCircle className="h-6 w-6 text-white" />
            ) : qualityScore >= 60 ? (
              <AlertTriangle className="h-6 w-6 text-white" />
            ) : (
              <XCircle className="h-6 w-6 text-white" />
            )}
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              qualityScore >= 80 ? 'bg-green-500' : qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Data Points</span>
          </div>
          <p className="text-2xl font-bold text-white">{qcResults.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total measurements</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">Completeness</span>
          </div>
          <p className="text-2xl font-bold text-white">{dataCompleteness.toFixed(1)}%</p>
          <p className="text-xs text-slate-400">{qcResults.nullPoints} null values</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Spikes</span>
          </div>
          <p className="text-2xl font-bold text-white">{qcResults.spikesDetected}</p>
          <p className="text-xs text-slate-400">Detected anomalies</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-4 w-4 bg-purple-400 rounded"></div>
            <span className="text-sm font-medium text-white">Noise Level</span>
          </div>
          <p className="text-2xl font-bold text-white">{(qcResults.noiseLevel * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-400">Signal quality</p>
        </div>
      </div>

      {/* Mnemonic Standardization */}
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Mnemonic Standardization</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Standardized Curves</span>
          <span className="text-sm font-medium text-white">
            {qcResults.mnemonicStandardization.standardized} / {activeFile.curves.length}
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 mb-3">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ 
              width: `${(qcResults.mnemonicStandardization.standardized / activeFile.curves.length) * 100}%` 
            }}
          />
        </div>
        {qcResults.mnemonicStandardization.nonStandard.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-1">Non-standard mnemonics:</p>
            <div className="flex flex-wrap gap-1">
              {qcResults.mnemonicStandardization.nonStandard.map((mnemonic, index) => (
                <span key={index} className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">
                  {mnemonic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Recommendations</h4>
        <div className="space-y-2">
          {qcResults.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};