import * as React from 'react';
import { Award, TrendingUp, Shield, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../store';
import { ALVAROMetrics, ALVAROCertificate } from '../../utils/alvaroStandard';

export const ALVARODashboard: React.FC = () => {
  const { activeFile } = useAppStore();

  if (!activeFile || !activeFile.alvaroMetrics) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">ALVARO Quality Assessment</h3>
        </div>
        <p className="text-slate-400 text-sm">
          Process your file with ALVARO-certified algorithms to view comprehensive quality metrics.
        </p>
      </div>
    );
  }

  const { alvaroMetrics, originalALVAROMetrics, alvaroCertificate } = activeFile;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-900/20 border-green-700';
      case 'B': return 'text-blue-400 bg-blue-900/20 border-blue-700';
      case 'C': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'D': return 'text-orange-400 bg-orange-900/20 border-orange-700';
      case 'F': return 'text-red-400 bg-red-900/20 border-red-700';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-700';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getMetricStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { status: 'good', icon: CheckCircle, color: 'text-green-400' };
    if (value >= thresholds.warning) return { status: 'warning', icon: AlertTriangle, color: 'text-yellow-400' };
    return { status: 'poor', icon: AlertTriangle, color: 'text-red-400' };
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">ALVARO Quality Assessment</h3>
            <p className="text-sm text-slate-400">Automated LAS Validation And Reliability Operations</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border ${getGradeColor(alvaroMetrics.overallGrade)}`}>
          <span className="text-sm font-semibold">Grade {alvaroMetrics.overallGrade}</span>
        </div>
      </div>

      {/* Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Completeness</span>
            {getMetricStatus(alvaroMetrics.completenessIndex, { good: 95, warning: 85 }).icon && 
              React.createElement(getMetricStatus(alvaroMetrics.completenessIndex, { good: 95, warning: 85 }).icon, {
                className: `h-4 w-4 ${getMetricStatus(alvaroMetrics.completenessIndex, { good: 95, warning: 85 }).color}`
              })
            }
          </div>
          <div className="text-2xl font-bold text-white">{alvaroMetrics.completenessIndex.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Valid data points</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Noise Level</span>
            {getMetricStatus(alvaroMetrics.noiseLevelAssessment, { good: 20, warning: 15 }).icon && 
              React.createElement(getMetricStatus(alvaroMetrics.noiseLevelAssessment, { good: 20, warning: 15 }).icon, {
                className: `h-4 w-4 ${getMetricStatus(alvaroMetrics.noiseLevelAssessment, { good: 20, warning: 15 }).color}`
              })
            }
          </div>
          <div className="text-2xl font-bold text-white">{alvaroMetrics.noiseLevelAssessment.toFixed(1)} dB</div>
          <div className="text-xs text-slate-500">Signal-to-noise ratio</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Physical Consistency</span>
            {getMetricStatus(alvaroMetrics.physicalConsistencyScore, { good: 95, warning: 85 }).icon && 
              React.createElement(getMetricStatus(alvaroMetrics.physicalConsistencyScore, { good: 95, warning: 85 }).icon, {
                className: `h-4 w-4 ${getMetricStatus(alvaroMetrics.physicalConsistencyScore, { good: 95, warning: 85 }).color}`
              })
            }
          </div>
          <div className="text-2xl font-bold text-white">{alvaroMetrics.physicalConsistencyScore.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Within industry ranges</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Depth Integrity</span>
            {getMetricStatus(alvaroMetrics.depthIntegrityIndex, { good: 95, warning: 85 }).icon && 
              React.createElement(getMetricStatus(alvaroMetrics.depthIntegrityIndex, { good: 95, warning: 85 }).icon, {
                className: `h-4 w-4 ${getMetricStatus(alvaroMetrics.depthIntegrityIndex, { good: 95, warning: 85 }).color}`
              })
            }
          </div>
          <div className="text-2xl font-bold text-white">{alvaroMetrics.depthIntegrityIndex.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Consistent intervals</div>
        </div>
      </div>

      {/* Before/After Comparison */}
      {originalALVAROMetrics && (
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h4 className="text-md font-semibold text-white">Quality Improvement</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Original Grade</span>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(originalALVAROMetrics.overallGrade)}`}>
                  {originalALVAROMetrics.overallGrade}
                </div>
              </div>
              <div className="text-sm text-slate-300">
                Completeness: {originalALVAROMetrics.completenessIndex.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Processed Grade</span>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(alvaroMetrics.overallGrade)}`}>
                  {alvaroMetrics.overallGrade}
                </div>
              </div>
              <div className="text-sm text-slate-300">
                Completeness: {alvaroMetrics.completenessIndex.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confidence and Uncertainty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <h4 className="text-md font-semibold text-white">Confidence Level</h4>
          </div>
          <div className={`text-lg font-semibold ${getConfidenceColor(alvaroMetrics.confidenceLevel)}`}>
            {alvaroMetrics.confidenceLevel} Confidence
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Based on processing uncertainty and data quality
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="h-5 w-5 text-purple-400" />
            <h4 className="text-md font-semibold text-white">Uncertainty Bounds</h4>
          </div>
          <div className="text-lg font-semibold text-white">
            ±{alvaroMetrics.uncertaintyBounds.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Cumulative processing uncertainty
          </div>
        </div>
      </div>

      {/* ALVARO Certificate Info */}
      {alvaroCertificate && (
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-green-400" />
            <h4 className="text-md font-semibold text-white">ALVARO Certificate</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Certificate ID:</span>
              <div className="text-white font-mono text-xs mt-1">{alvaroCertificate.certificateId}</div>
            </div>
            <div>
              <span className="text-slate-400">Issue Date:</span>
              <div className="text-white mt-1">{new Date(alvaroCertificate.issueDate).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-slate-400">Quality Improvement:</span>
              <div className="text-green-400 font-semibold mt-1">
                {alvaroCertificate.qualityImprovement > 0 ? '+' : ''}{alvaroCertificate.qualityImprovement.toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-slate-400">Digital Signature:</span>
              <div className="text-white font-mono text-xs mt-1">{alvaroCertificate.digitalSignature.substring(0, 16)}...</div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance References */}
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">Industry Standards Compliance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-200">
          <div>• API RP 33: Log ASCII Standard</div>
          <div>• SPWLA: Formation Evaluation Guidelines</div>
          <div>• ISO 29001: Petroleum QMS</div>
          <div>• ALVARO v1.0: Quality Assessment Methodology</div>
        </div>
      </div>
    </div>
  );
}; 