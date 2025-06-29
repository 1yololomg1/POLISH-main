import React from 'react';
import { Mountain, Layers, Target, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { GeologicalContext as GeologicalContextType, LithologyResult } from '../../utils/geologicalAnalysis';

interface GeologicalContextProps {
  geologicalContext: GeologicalContextType | null;
  isVisible: boolean;
}

export const GeologicalContext: React.FC<GeologicalContextProps> = ({ 
  geologicalContext, 
  isVisible 
}) => {
  if (!isVisible || !geologicalContext) {
    return null;
  }

  const { dominantLithology, formationQuality, geologicalConsistency, crossCurveValidation } = geologicalContext;

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

  const getLithologyIcon = (type: string) => {
    switch (type) {
      case 'shale': return '🏔️';
      case 'sandstone': return '🏖️';
      case 'limestone': return '🏛️';
      case 'dolomite': return '💎';
      default: return '❓';
    }
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      excellent: 'text-emerald-400',
      good: 'text-blue-400',
      fair: 'text-yellow-400',
      poor: 'text-red-400'
    };
    return colors[quality as keyof typeof colors] || colors.poor;
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Dominant Lithology */}
      <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white">Geological Context</h4>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Formation Quality:</span>
            <span className={`text-xs font-bold capitalize ${getQualityColor(formationQuality)}`}>
              {formationQuality}
            </span>
          </div>
        </div>

        {/* Lithology Card */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getLithologyColor(dominantLithology.type)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {getLithologyIcon(dominantLithology.type)}
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white capitalize">
                  {dominantLithology.type}
                </h5>
                <p className="text-xs text-slate-400">Dominant Lithology</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {dominantLithology.confidence}%
              </div>
              <div className="text-xs text-slate-400">Confidence</div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="w-full bg-slate-600 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                dominantLithology.confidence >= 80 ? 'bg-emerald-500' :
                dominantLithology.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${dominantLithology.confidence}%` }}
            />
          </div>

          {/* Key Indicators */}
          <div className="space-y-2">
            <h6 className="text-xs font-medium text-slate-300">Key Geological Indicators:</h6>
            <div className="space-y-1">
              {dominantLithology.indicators.slice(0, 3).map((indicator, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-xs text-slate-300">{indicator}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Petrophysical Properties */}
          {(dominantLithology.neutronDensitySeparation !== undefined || 
            dominantLithology.photoelectricFactor !== undefined) && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <h6 className="text-xs font-medium text-slate-300 mb-2">Petrophysical Properties:</h6>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {dominantLithology.neutronDensitySeparation !== undefined && (
                  <div>
                    <span className="text-slate-400">N-D Separation:</span>
                    <span className="text-white font-medium ml-1">
                      {dominantLithology.neutronDensitySeparation.toFixed(3)}
                    </span>
                  </div>
                )}
                {dominantLithology.photoelectricFactor !== undefined && (
                  <div>
                    <span className="text-slate-400">PEF:</span>
                    <span className="text-white font-medium ml-1">
                      {dominantLithology.photoelectricFactor.toFixed(1)}
                    </span>
                  </div>
                )}
                {dominantLithology.gammaRayCharacter && (
                  <div>
                    <span className="text-slate-400">GR Character:</span>
                    <span className="text-white font-medium ml-1">
                      {dominantLithology.gammaRayCharacter}
                    </span>
                  </div>
                )}
                {dominantLithology.porosity !== undefined && (
                  <div>
                    <span className="text-slate-400">Avg Porosity:</span>
                    <span className="text-white font-medium ml-1">
                      {(dominantLithology.porosity * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mineralogy */}
          {dominantLithology.mineralogy && dominantLithology.mineralogy.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <h6 className="text-xs font-medium text-slate-300 mb-2">Mineralogy:</h6>
              <div className="flex flex-wrap gap-1">
                {dominantLithology.mineralogy.map((mineral, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded border border-blue-600/30"
                  >
                    {mineral}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cross-Curve Validation */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-4 w-4 text-purple-400" />
          <h5 className="text-sm font-semibold text-white">Cross-Curve Validation</h5>
          <span className={`text-xs font-bold ${getConsistencyColor(geologicalConsistency)}`}>
            {geologicalConsistency.toFixed(1)}% Consistent
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Neutron-Density</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-white">
                {crossCurveValidation.neutronDensityConsistency.toFixed(0)}%
              </div>
              <div className="flex-1 bg-slate-600 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    crossCurveValidation.neutronDensityConsistency >= 80 ? 'bg-emerald-500' :
                    crossCurveValidation.neutronDensityConsistency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${crossCurveValidation.neutronDensityConsistency}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">GR-Lithology</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-white">
                {crossCurveValidation.gammaRayLithologyMatch.toFixed(0)}%
              </div>
              <div className="flex-1 bg-slate-600 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    crossCurveValidation.gammaRayLithologyMatch >= 80 ? 'bg-emerald-500' :
                    crossCurveValidation.gammaRayLithologyMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${crossCurveValidation.gammaRayLithologyMatch}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Porosity-Density</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-white">
                {crossCurveValidation.porosityDensityRelationship.toFixed(0)}%
              </div>
              <div className="flex-1 bg-slate-600 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    crossCurveValidation.porosityDensityRelationship >= 80 ? 'bg-emerald-500' :
                    crossCurveValidation.porosityDensityRelationship >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${crossCurveValidation.porosityDensityRelationship}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">PEF Match</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-white">
                {crossCurveValidation.photoelectricFactorMatch.toFixed(0)}%
              </div>
              <div className="flex-1 bg-slate-600 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    crossCurveValidation.photoelectricFactorMatch >= 80 ? 'bg-emerald-500' :
                    crossCurveValidation.photoelectricFactorMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${crossCurveValidation.photoelectricFactorMatch}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Validation Flags */}
        {crossCurveValidation.flags.length > 0 && (
          <div className="space-y-2">
            <h6 className="text-xs font-medium text-slate-300">Validation Flags:</h6>
            {crossCurveValidation.flags.slice(0, 3).map((flag, index) => (
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
                  <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
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

      {/* Geological Recommendations */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="h-4 w-4 text-green-400" />
          <h5 className="text-sm font-semibold text-white">Formation-Specific Recommendations</h5>
        </div>
        
        <div className="space-y-2">
          {geologicalContext.recommendations.slice(0, 4).map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-green-900/20 border border-green-700/50 rounded">
              <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};