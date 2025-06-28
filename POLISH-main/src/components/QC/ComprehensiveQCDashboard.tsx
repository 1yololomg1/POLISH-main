import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Database, 
  Target,
  Award,
  BarChart3,
  Activity,
  Zap,
  Mountain,
  Layers
} from 'lucide-react';
import { useAppStore } from '../../store';
import { QualityIndicator, ContextualHelp } from '../Help/ContextualHelp';

export const ComprehensiveQCDashboard: React.FC = () => {
  const { activeFile } = useAppStore();

  if (!activeFile || !activeFile.qcResults) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-slate-700 rounded-full">
            <Target className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Quality Control Center</h3>
            <p className="text-slate-500">Process a file to view comprehensive QC analysis with geological context</p>
          </div>
        </div>
      </div>
    );
  }

  const { qcResults } = activeFile;
  const geologicalContext = qcResults.geologicalContext;
  const dataCompleteness = ((qcResults.totalPoints - qcResults.nullPoints) / qcResults.totalPoints) * 100;
  
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-600';
      case 'B': return 'bg-blue-600';
      case 'C': return 'bg-yellow-600';
      case 'D': return 'bg-orange-600';
      default: return 'bg-red-600';
    }
  };

  const getLithologyColor = (type: string) => {
    const colors = {
      shale: 'bg-gray-600',
      sandstone: 'bg-yellow-600',
      limestone: 'bg-blue-600',
      dolomite: 'bg-purple-600',
      unknown: 'bg-slate-600'
    };
    return colors[type as keyof typeof colors] || colors.unknown;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Formation-Aware Quality Control</h3>
              <p className="text-sm text-slate-400">Comprehensive data quality analysis with geological context</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Analytics</span>
            <ContextualHelp topic="quality-score">
              <span>Help</span>
            </ContextualHelp>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Quality Score with Geological Context */}
        <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-lg font-semibold text-white">Overall Quality Assessment</h4>
                <ContextualHelp topic="quality-score">
                  <span>Help</span>
                </ContextualHelp>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-white">
                  {qcResults.overallQualityScore.toFixed(1)}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-white font-bold ${getGradeColor(getQualityGrade(qcResults.overallQualityScore))}`}>
                  Grade {getQualityGrade(qcResults.overallQualityScore)}
                </div>
                {geologicalContext && (
                  <div className={`px-3 py-1 rounded-full text-white font-bold ${getLithologyColor(geologicalContext.dominantLithology.type)}`}>
                    {geologicalContext.dominantLithology.type.charAt(0).toUpperCase() + geologicalContext.dominantLithology.type.slice(1)}
                  </div>
                )}
              </div>
            </div>
            <div className={`p-4 rounded-full ${
              qcResults.overallQualityScore >= 80 ? 'bg-emerald-600' : 
              qcResults.overallQualityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {qcResults.overallQualityScore >= 80 ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : qcResults.overallQualityScore >= 60 ? (
                <AlertTriangle className="h-8 w-8 text-white" />
              ) : (
                <XCircle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                qcResults.overallQualityScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
                qcResults.overallQualityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${qcResults.overallQualityScore}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">
              {qcResults.overallQualityScore >= 90 ? 'Excellent data quality - ready for advanced analysis' :
               qcResults.overallQualityScore >= 75 ? 'Good data quality - minor improvements recommended' :
               qcResults.overallQualityScore >= 60 ? 'Acceptable data quality - some processing required' :
               'Poor data quality - significant processing needed'}
            </p>
            {geologicalContext && (
              <div className="text-xs text-purple-300">
                Formation Quality: {geologicalContext.formationQuality}
              </div>
            )}
          </div>
        </div>

        {/* Geological Context Summary */}
        {geologicalContext && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center space-x-2 mb-3">
              <Mountain className="h-5 w-5 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Geological Context</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{geologicalContext.dominantLithology.confidence}%</div>
                <div className="text-xs text-slate-400">Lithology Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{geologicalContext.geologicalConsistency.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">Cross-Curve Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white capitalize">{geologicalContext.formationQuality}</div>
                <div className="text-xs text-slate-400">Formation Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{geologicalContext.crossCurveValidation.flags.length}</div>
                <div className="text-xs text-slate-400">Validation Flags</div>
              </div>
            </div>

            {geologicalContext.dominantLithology.indicators.length > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-700/30">
                <h5 className="text-xs font-medium text-purple-300 mb-2">Key Geological Indicators:</h5>
                <div className="text-xs text-slate-300">
                  {geologicalContext.dominantLithology.indicators.slice(0, 2).join(' • ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <Database className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Data Points</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{qcResults.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Total measurements</p>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-white">Completeness</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{dataCompleteness.toFixed(1)}%</p>
            <p className="text-xs text-slate-400">{qcResults.nullPoints} null values</p>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-white">Anomalies</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{qcResults.spikesDetected}</p>
            <p className="text-xs text-slate-400">Spikes detected</p>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-white">Noise Level</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{(qcResults.noiseLevel * 100).toFixed(1)}%</p>
            <p className="text-xs text-slate-400">Signal quality</p>
          </div>
        </div>

        {/* Cross-Curve Validation */}
        {geologicalContext && (
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Geological Cross-Curve Validation</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Neutron-Density</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-white">
                    {geologicalContext.crossCurveValidation.neutronDensityConsistency.toFixed(0)}%
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        geologicalContext.crossCurveValidation.neutronDensityConsistency >= 80 ? 'bg-emerald-500' :
                        geologicalContext.crossCurveValidation.neutronDensityConsistency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${geologicalContext.crossCurveValidation.neutronDensityConsistency}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">GR-Lithology</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-white">
                    {geologicalContext.crossCurveValidation.gammaRayLithologyMatch.toFixed(0)}%
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        geologicalContext.crossCurveValidation.gammaRayLithologyMatch >= 80 ? 'bg-emerald-500' :
                        geologicalContext.crossCurveValidation.gammaRayLithologyMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${geologicalContext.crossCurveValidation.gammaRayLithologyMatch}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Porosity-Density</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-white">
                    {geologicalContext.crossCurveValidation.porosityDensityRelationship.toFixed(0)}%
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        geologicalContext.crossCurveValidation.porosityDensityRelationship >= 80 ? 'bg-emerald-500' :
                        geologicalContext.crossCurveValidation.porosityDensityRelationship >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${geologicalContext.crossCurveValidation.porosityDensityRelationship}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">PEF Match</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-white">
                    {geologicalContext.crossCurveValidation.photoelectricFactorMatch.toFixed(0)}%
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        geologicalContext.crossCurveValidation.photoelectricFactorMatch >= 80 ? 'bg-emerald-500' :
                        geologicalContext.crossCurveValidation.photoelectricFactorMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${geologicalContext.crossCurveValidation.photoelectricFactorMatch}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {geologicalContext.crossCurveValidation.flags.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-300">Geological Validation Flags:</h5>
                {geologicalContext.crossCurveValidation.flags.slice(0, 3).map((flag, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-2 p-2 rounded border ${
                      flag.type === 'error' ? 'bg-red-900/20 border-red-700/50' :
                      flag.type === 'warning' ? 'bg-yellow-900/20 border-yellow-700/50' :
                      'bg-blue-900/20 border-blue-700/50'
                    }`}
                  >
                    {flag.type === 'error' ? (
                      <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                    ) : flag.type === 'warning' ? (
                      <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-1 py-0.5 bg-slate-600 text-slate-200 text-xs rounded font-mono">
                          {flag.curve}
                        </span>
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          flag.type === 'error' ? 'text-red-400' :
                          flag.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {flag.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{flag.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Curve Quality Analysis */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span>Curve-by-Curve Quality Analysis</span>
          </h4>
          
          <div className="grid gap-3">
            {Object.entries(qcResults.curveQuality).map(([mnemonic, quality]) => (
              <div key={mnemonic} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-white">{mnemonic}</span>
                    <QualityIndicator score={quality.completeness} showHelp={false} />
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>Completeness: {quality.completeness.toFixed(1)}%</span>
                    <span>Spikes: {quality.spikes}</span>
                    <span>Noise: {(quality.noiseLevel * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      quality.qualityGrade === 'A' ? 'bg-emerald-500' :
                      quality.qualityGrade === 'B' ? 'bg-blue-500' :
                      quality.qualityGrade === 'C' ? 'bg-yellow-500' :
                      quality.qualityGrade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${quality.completeness}%` }}
                  />
                </div>
                
                {quality.issues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {quality.issues.map((issue, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded border border-yellow-600/30">
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Physical Validation */}
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="text-sm font-semibold text-white">Formation-Aware Physical Validation</h4>
            <ContextualHelp topic="physical-validation">
              <span>Help</span>
            </ContextualHelp>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{qcResults.physicalValidation.passed}</div>
              <div className="text-xs text-slate-400">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{qcResults.physicalValidation.failed}</div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{qcResults.physicalValidation.warnings.length}</div>
              <div className="text-xs text-slate-400">Warnings</div>
            </div>
          </div>
          
          {qcResults.physicalValidation.warnings.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-slate-300">Validation Warnings:</h5>
              {qcResults.physicalValidation.warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-600/10 border border-yellow-600/30 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300">{warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mnemonic Standardization */}
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="text-sm font-semibold text-white">Mnemonic Standardization</h4>
            <ContextualHelp topic="mnemonic-standardization">
              <span>Help</span>
            </ContextualHelp>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-300">Standardized Curves</span>
            <span className="text-sm font-medium text-white">
              {qcResults.mnemonicStandardization.standardized} / {activeFile.curves.length}
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              style={{ 
                width: `${(qcResults.mnemonicStandardization.standardized / activeFile.curves.length) * 100}%` 
              }}
            />
          </div>
          
          {qcResults.mnemonicStandardization.nonStandard.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-slate-300 mb-2">Non-standard mnemonics:</h5>
              <div className="flex flex-wrap gap-2">
                {qcResults.mnemonicStandardization.nonStandard.map((mnemonic, index) => (
                  <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-yellow-600/20 border border-yellow-600/30 rounded-full">
                    <span className="text-xs text-yellow-300 font-medium">{mnemonic}</span>
                    {qcResults.mnemonicStandardization.mappings[mnemonic] && (
                      <span className="text-xs text-slate-400">
                        → {qcResults.mnemonicStandardization.mappings[mnemonic]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Recommendations with Geological Context */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Formation-Aware QC Recommendations</h4>
          {qcResults.recommendations.map((rec, index) => (
            <div 
              key={index} 
              className={`flex items-start space-x-3 p-4 rounded-lg border ${
                rec.type === 'critical' ? 'bg-red-900/20 border-red-700/50' :
                rec.type === 'warning' ? 'bg-yellow-900/20 border-yellow-700/50' :
                'bg-blue-900/20 border-blue-700/50'
              }`}
            >
              <div className={`p-1 rounded-full ${
                rec.type === 'critical' ? 'bg-red-600' :
                rec.type === 'warning' ? 'bg-yellow-600' :
                'bg-blue-600'
              }`}>
                {rec.type === 'critical' ? (
                  <XCircle className="h-4 w-4 text-white" />
                ) : rec.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-white" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {rec.curve && (
                    <span className="px-2 py-0.5 bg-slate-600 text-slate-200 text-xs rounded font-mono">
                      {rec.curve}
                    </span>
                  )}
                  <span className={`text-xs font-medium uppercase tracking-wide ${
                    rec.type === 'critical' ? 'text-red-400' :
                    rec.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {rec.type}
                  </span>
                  {geologicalContext && (
                    <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded border border-purple-600/30">
                      Geological
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-1">{rec.message}</p>
                {rec.action && (
                  <p className="text-xs text-slate-400 italic">Recommended action: {rec.action}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};