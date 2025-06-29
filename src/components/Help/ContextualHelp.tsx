import React, { useState } from 'react';
import { HelpCircle, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ContextualHelpProps {
  topic: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  topic, 
  position = 'top', 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getHelpContent = (topic: string) => {
    switch (topic) {
      case 'quality-score':
        return {
          title: 'Quality Score',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Overall data quality assessment from 0-100 based on:
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Data completeness (non-null values)</li>
                <li>• Noise level assessment</li>
                <li>• Spike detection results</li>
                <li>• Physical range validation</li>
              </ul>
            </div>
          )
        };
      
      case 'savitzky-golay':
        return {
          title: 'Savitzky-Golay Filter',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Advanced smoothing that preserves signal features while reducing noise.
              </p>
              <div className="text-xs text-slate-400">
                <p><strong>Window Size:</strong> Larger values = more smoothing</p>
                <p><strong>Polynomial Order:</strong> Higher values preserve features better</p>
                <p><strong>Strength:</strong> Blending factor with original data</p>
              </div>
            </div>
          )
        };
      
      case 'hampel-filter':
        return {
          title: 'Hampel Spike Detection',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Robust outlier detection using Median Absolute Deviation.
              </p>
              <div className="text-xs text-slate-400">
                <p><strong>Threshold:</strong> Lower values = more sensitive</p>
                <p><strong>Window Size:</strong> Analysis window for local statistics</p>
                <p><strong>Replacement:</strong> PCHIP interpolation preserves shape</p>
              </div>
            </div>
          )
        };
      
      case 'physical-validation':
        return {
          title: 'Physical Validation',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Validates measurements against known petrophysical ranges.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>• GR: 0-300 API units</p>
                <p>• NPHI: -0.15 to 1.0 v/v</p>
                <p>• RHOB: 1.0-3.5 g/cm³</p>
                <p>• RT: 0.1-10,000 ohm-m</p>
              </div>
            </div>
          )
        };
      
      case 'mnemonic-standardization':
        return {
          title: 'Mnemonic Standardization',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Converts curve names to industry standards for compatibility.
              </p>
              <div className="text-xs text-slate-400">
                <p><strong>API Standard:</strong> American Petroleum Institute</p>
                <p><strong>CWLS Standard:</strong> Canadian Well Logging Society</p>
                <p><strong>Auto-mapping:</strong> Common variations detected</p>
              </div>
            </div>
          )
        };
      
      case 'export-pricing':
        return {
          title: 'Export Pricing',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Premium exports include processing certificates and QC reports.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>• LAS Export + Report: $600</p>
                <p>• Volume pricing: $525 (50+), $450 (100+)</p>
                <p>• PDF Report Only: $150</p>
                <p>• Mnemonic Standardization: $150</p>
                <p>• One-time payment, no subscription</p>
                <p>• 30-day money-back guarantee</p>
              </div>
            </div>
          )
        };
      
      case 'conversion-credits':
        return {
          title: 'Format Conversion Pricing',
          content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Convert LAS files to other industry-standard formats.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>• CSV/JSON/ASCII: $20 each</p>
                <p>• Excel: $30 each</p>
                <p>• WITSML: $50 each</p>
                <p>• SEG-Y: $80 each</p>
                <p>• Professional quality output</p>
              </div>
            </div>
          )
        };
      
      default:
        return {
          title: 'Help',
          content: (
            <p className="text-sm text-slate-300">
              Click the help icon in the header for comprehensive documentation.
            </p>
          )
        };
    }
  };

  const helpContent = getHelpContent(topic);
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 w-80 ${positionClasses[position]}`}>
          <div className="bg-slate-900 border border-slate-600 rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{helpContent.title}</h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            {helpContent.content}
          </div>
        </div>
      )}
    </div>
  );
};

export const QualityIndicator: React.FC<{ score: number; showHelp?: boolean }> = ({ 
  score, 
  showHelp = true 
}) => {
  const getQualityInfo = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'emerald', icon: CheckCircle, status: 'Excellent' };
    if (score >= 75) return { grade: 'B', color: 'blue', icon: CheckCircle, status: 'Good' };
    if (score >= 60) return { grade: 'C', color: 'yellow', icon: AlertTriangle, status: 'Acceptable' };
    if (score >= 50) return { grade: 'D', color: 'orange', icon: AlertTriangle, status: 'Poor' };
    return { grade: 'F', color: 'red', icon: AlertTriangle, status: 'Unacceptable' };
  };

  const quality = getQualityInfo(score);
  const Icon = quality.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded bg-${quality.color}-600/20 border border-${quality.color}-600/30`}>
        <Icon className={`h-4 w-4 text-${quality.color}-400`} />
        <span className={`text-sm font-medium text-${quality.color}-400`}>
          Grade {quality.grade}
        </span>
      </div>
      <span className="text-sm text-slate-400">{quality.status}</span>
      {showHelp && <ContextualHelp topic="quality-score">Help</ContextualHelp>}
    </div>
  );
};

export const ProcessingHelp: React.FC<{ algorithm: string }> = ({ algorithm }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-300 capitalize">
        {algorithm.replace('_', ' ')}
      </span>
      <ContextualHelp topic={algorithm.replace('_', '-')}>Help</ContextualHelp>
    </div>
  );
};