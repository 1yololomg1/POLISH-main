import * as React from 'react';
import { useAppStore } from '../../store';

interface VisualizationSettingsModalProps {
  onClose: () => void;
}

export const VisualizationSettingsModal: React.FC<VisualizationSettingsModalProps> = ({ onClose }) => {
  const { visualizationSettings, updateVisualizationSettings } = useAppStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Visualization Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close visualization settings"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Depth Range */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Depth Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Depth (m)</label>
                <input
                  type="number"
                  value={visualizationSettings.depthRange[0]}
                  onChange={(e) => updateVisualizationSettings({
                    depthRange: [parseFloat(e.target.value), visualizationSettings.depthRange[1]]
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Depth (m)</label>
                <input
                  type="number"
                  value={visualizationSettings.depthRange[1]}
                  onChange={(e) => updateVisualizationSettings({
                    depthRange: [visualizationSettings.depthRange[0], parseFloat(e.target.value)]
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Display Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={visualizationSettings.showGrid}
                  onChange={(e) => updateVisualizationSettings({ showGrid: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show Grid Lines</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={visualizationSettings.showDepthLabels}
                  onChange={(e) => updateVisualizationSettings({ showDepthLabels: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show Depth Labels</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={visualizationSettings.syncZoom}
                  onChange={(e) => updateVisualizationSettings({ syncZoom: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Sync Zoom Across Tracks</span>
              </label>
            </div>
          </div>

          {/* Curve Appearance */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Curve Appearance</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Curve Thickness</label>
              <input
                type="range"
                min="1"
                max="5"
                value={visualizationSettings.curveThickness}
                onChange={(e) => updateVisualizationSettings({ curveThickness: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Thin</span>
                <span>Thick</span>
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Background Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {['#0f172a', '#1e293b', '#334155', '#475569'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateVisualizationSettings({ backgroundColor: color })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    visualizationSettings.backgroundColor === color
                      ? 'border-blue-500 scale-110'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Track Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Track Configuration</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {visualizationSettings.tracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-white">{track.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({track.width}px)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={track.scale}
                      onChange={(e) => {
                        const updatedTracks = visualizationSettings.tracks.map(t =>
                          t.id === track.id ? { ...t, scale: e.target.value as 'linear' | 'logarithmic' } : t
                        );
                        updateVisualizationSettings({ tracks: updatedTracks });
                      }}
                      className="px-2 py-1 text-xs bg-slate-600 border border-slate-500 rounded text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="logarithmic">Log</option>
                    </select>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={track.gridLines}
                        onChange={(e) => {
                          const updatedTracks = visualizationSettings.tracks.map(t =>
                            t.id === track.id ? { ...t, gridLines: e.target.checked } : t
                          );
                          updateVisualizationSettings({ tracks: updatedTracks });
                        }}
                        className="w-3 h-3 text-blue-600 bg-slate-600 border-slate-500 rounded"
                      />
                      <span className="text-xs text-slate-300 ml-1">Grid</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 