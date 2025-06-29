import * as React from 'react';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = React.useState({
    autoProcess: true,
    defaultWindowSize: 11,
    defaultThreshold: 3,
    showQualityMetrics: true,
    enableGeologicalAnalysis: true,
    maxFileSize: 100,
    theme: 'dark'
  });

  const handleSave = () => {
    localStorage.setItem('polish_settings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    setSettings({
      autoProcess: true,
      defaultWindowSize: 11,
      defaultThreshold: 3,
      showQualityMetrics: true,
      enableGeologicalAnalysis: true,
      maxFileSize: 100,
      theme: 'dark'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Processing Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Processing Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoProcess}
                  onChange={(e) => setSettings({...settings, autoProcess: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Auto-process files on upload</span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Default Savitzky-Golay Window Size
                </label>
                <input
                  type="number"
                  value={settings.defaultWindowSize}
                  onChange={(e) => setSettings({...settings, defaultWindowSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="3"
                  max="21"
                  step="2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Default Hampel Threshold
                </label>
                <input
                  type="number"
                  value={settings.defaultThreshold}
                  onChange={(e) => setSettings({...settings, defaultThreshold: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Display Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showQualityMetrics}
                  onChange={(e) => setSettings({...settings, showQualityMetrics: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show quality metrics</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableGeologicalAnalysis}
                  onChange={(e) => setSettings({...settings, enableGeologicalAnalysis: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Enable geological analysis</span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="500"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Advanced Settings
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Always visible */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 