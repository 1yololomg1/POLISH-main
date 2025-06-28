import * as React from 'react';

interface ProcessingSettingsModalProps {
  onClose: () => void;
}

export const ProcessingSettingsModal: React.FC<ProcessingSettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Processing Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close processing settings"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-300">Processing-specific settings will appear here.</p>
        </div>
      </div>
    </div>
  );
}; 