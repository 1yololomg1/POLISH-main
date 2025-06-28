import { create } from 'zustand';
import { LASFile, ProcessingOptions, VisualizationSettings, TrackConfiguration, ExportOptions, ConversionJob, AnonymousSession } from '../types';
import SessionManager from '../utils/sessionManager';

interface AppState {
  files: LASFile[];
  activeFile: LASFile | null;
  processingOptions: ProcessingOptions;
  visualizationSettings: VisualizationSettings;
  isProcessing: boolean;
  processingProgress: number;
  selectedCurves: string[];
  session: AnonymousSession | null;
  showPaymentModal: boolean;
  showExportModal: boolean;
  showFormatConverter: boolean;
  showHelpModal: boolean;
  showSettingsModal: boolean;
  showProcessingSettingsModal: boolean;
  showVisualizationSettingsModal: boolean;
  conversionJobs: ConversionJob[];
  exportPreview: any;
  
  // Actions
  addFile: (file: LASFile) => void;
  removeFile: (id: string) => void;
  setActiveFile: (file: LASFile | null) => void;
  updateProcessingOptions: (options: Partial<ProcessingOptions>) => void;
  updateVisualizationSettings: (settings: Partial<VisualizationSettings>) => void;
  setProcessing: (status: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  updateFile: (id: string, updates: Partial<LASFile>) => void;
  toggleCurveVisibility: (mnemonic: string) => void;
  updateTrackConfiguration: (trackId: number, config: Partial<TrackConfiguration>) => void;
  setSelectedCurves: (curves: string[]) => void;
  setSession: (session: AnonymousSession | null) => void;
  setShowPaymentModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowFormatConverter: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowProcessingSettingsModal: (show: boolean) => void;
  setShowVisualizationSettingsModal: (show: boolean) => void;
  addConversionJob: (job: ConversionJob) => void;
  updateConversionJob: (id: string, updates: Partial<ConversionJob>) => void;
  setExportPreview: (preview: any) => void;
  initializeSession: () => void;
}

const defaultTracks: TrackConfiguration[] = [
  {
    id: 1,
    name: 'Natural Radioactivity',
    width: 120,
    curves: ['GR', 'SP', 'CGR'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 2,
    name: 'Resistivity',
    width: 140,
    curves: ['RT', 'RXO', 'MSFL', 'LLS', 'LLD'],
    scale: 'logarithmic',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 3,
    name: 'Porosity',
    width: 140,
    curves: ['NPHI', 'RHOB', 'PEF', 'DT'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 4,
    name: 'Caliper & Drilling',
    width: 120,
    curves: ['CALI', 'BS', 'ROP', 'WOB'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 5,
    name: 'Custom',
    width: 120,
    curves: [],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  files: [],
  activeFile: null,
  isProcessing: false,
  processingProgress: 0,
  selectedCurves: [],
  session: null,
  showPaymentModal: false,
  showExportModal: false,
  showFormatConverter: false,
  showHelpModal: false,
  showSettingsModal: false,
  showProcessingSettingsModal: false,
  showVisualizationSettingsModal: false,
  conversionJobs: [],
  exportPreview: null,
  
  visualizationSettings: {
    tracks: defaultTracks,
    depthRange: [0, 3000],
    showGrid: true,
    showDepthLabels: true,
    curveThickness: 2,
    backgroundColor: '#0f172a',
    syncZoom: true
  },
  
  processingOptions: {
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
  },

  addFile: (file) => {
    // Store original data for before/after comparison
    const fileWithOriginal = {
      ...file,
      originalData: [...file.data], // Store original data
      displayOriginalData: false // Flag to control which data to display
    };
    
    // Store file in session management
    const sessionManager = SessionManager.getInstance();
    sessionManager.storeFile(file.id, fileWithOriginal);
    sessionManager.addFile(file.id);
    
    set((state) => ({ 
      files: [...state.files, fileWithOriginal],
      activeFile: state.activeFile || fileWithOriginal
    }));
  },
  
  removeFile: (id) => {
    // Remove file from session management
    const sessionManager = SessionManager.getInstance();
    sessionManager.removeFile(id);
    
    set((state) => ({
      files: state.files.filter(f => f.id !== id),
      activeFile: state.activeFile?.id === id ? null : state.activeFile
    }));
  },
  
  setActiveFile: (file) => set({ activeFile: file }),
  
  updateProcessingOptions: (options) => set((state) => ({
    processingOptions: { ...state.processingOptions, ...options }
  })),
  
  updateVisualizationSettings: (settings) => set((state) => ({
    visualizationSettings: { ...state.visualizationSettings, ...settings }
  })),
  
  setProcessing: (status) => set({ isProcessing: status }),
  
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  
  updateFile: (id, updates) => set((state) => {
    const updatedFiles = state.files.map(f => {
      if (f.id === id) {
        const updatedFile = { ...f, ...updates };
        
        // If processing is complete, store the processed data separately
        if (updates.processed && updates.qcResults) {
          updatedFile.processedData = updatedFile.data;
          // Keep original data intact
          if (!updatedFile.originalData) {
            updatedFile.originalData = [...f.data];
          }
        }
        
        return updatedFile;
      }
      return f;
    });
    
    const updatedActiveFile = state.activeFile?.id === id 
      ? updatedFiles.find(f => f.id === id) || state.activeFile
      : state.activeFile;
    
    return {
      files: updatedFiles,
      activeFile: updatedActiveFile
    };
  }),
  
  toggleCurveVisibility: (mnemonic) => set((state) => {
    if (!state.activeFile) return state;
    
    const updatedCurves = state.activeFile.curves.map(curve =>
      curve.mnemonic === mnemonic ? { ...curve, visible: !curve.visible } : curve
    );
    
    const updatedFile = { ...state.activeFile, curves: updatedCurves };
    
    return {
      files: state.files.map(f => f.id === updatedFile.id ? updatedFile : f),
      activeFile: updatedFile
    };
  }),
  
  updateTrackConfiguration: (trackId, config) => set((state) => ({
    visualizationSettings: {
      ...state.visualizationSettings,
      tracks: state.visualizationSettings.tracks.map(track =>
        track.id === trackId ? { ...track, ...config } : track
      )
    }
  })),
  
  setSelectedCurves: (curves) => set({ selectedCurves: curves }),
  
  setSession: (session) => set({ session }),
  
  setShowPaymentModal: (show) => set({ showPaymentModal: show }),
  
  setShowExportModal: (show) => set({ showExportModal: show }),
  
  setShowFormatConverter: (show) => set({ showFormatConverter: show }),
  
  setShowHelpModal: (show) => set({ showHelpModal: show }),
  
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  
  setShowProcessingSettingsModal: (show) => set({ showProcessingSettingsModal: show }),
  
  setShowVisualizationSettingsModal: (show) => set({ showVisualizationSettingsModal: show }),
  
  addConversionJob: (job) => set((state) => ({
    conversionJobs: [...state.conversionJobs, job]
  })),
  
  updateConversionJob: (id, updates) => set((state) => ({
    conversionJobs: state.conversionJobs.map(job =>
      job.id === id ? { ...job, ...updates } : job
    )
  })),
  
  setExportPreview: (preview) => set({ exportPreview: preview }),
  
  initializeSession: () => {
    const sessionManager = SessionManager.getInstance();
    set({ session: sessionManager.getSessionData() });
  }
}));