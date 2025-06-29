import * as React from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { FileInfo } from './components/Dashboard/FileInfo';
import { DataVisualization } from './components/Dashboard/DataVisualization';
import { MultiTrackVisualization } from './components/Dashboard/MultiTrackVisualization';
import { AdvancedProcessingControls } from './components/Processing/AdvancedProcessingControls';
import { ComprehensiveQCDashboard } from './components/QC/ComprehensiveQCDashboard';
import { ExportModal } from './components/Export/ExportModal';
import PaymentModal from './components/Export/PaymentModal';i
import { HelpModal } from './components/Help/HelpModal';
import { ALVARODashboard } from './components/Dashboard/ALVARODashboard';
import { QCDashboard } from './components/QC/QCDashboard';
import { ProcessingControls } from './components/Processing/ProcessingControls';
import { SettingsModal } from './components/SettingsModal';
import { ProcessingSettingsModal } from './components/Processing/ProcessingSettingsModal';
import { VisualizationSettingsModal } from './components/Dashboard/VisualizationSettingsModal';
import { useAppStore } from './store';

function App() {
  const { 
    showAuthModal, 
    showPaymentModal, 
    showExportModal, 
    showFormatConverter, 
    showHelpModal,
    showSettingsModal,
    showProcessingSettingsModal,
    showVisualizationSettingsModal
  } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* File Info Section - Top */}
          <div className="w-full">
            <FileInfo />
          </div>
          
          {/* Processing Controls Section */}
          <div className="w-full">
            <AdvancedProcessingControls />
          </div>
          
          {/* Visualization Section */}
          <div className="w-full">
            <MultiTrackVisualization />
          </div>
          
          {/* Basic Data Visualization */}
          <div className="w-full">
            <DataVisualization />
          </div>
          
          {/* ALVARO Dashboard */}
          <div className="w-full">
            <ALVARODashboard />
          </div>
          
          {/* QC Dashboard Section - Bottom */}
          <div className="w-full">
            <ComprehensiveQCDashboard />
          </div>
        </main>
      </div>

      <Footer />

      {/* Modals */}
      {showAuthModal && <AuthModal />}
      {showPaymentModal && <PaymentModal />}
      {showExportModal && <ExportModal />}
      {showFormatConverter && <FormatConverter />}
      {showHelpModal && <HelpModal />}
      {showSettingsModal && <SettingsModal onClose={() => useAppStore.getState().setShowSettingsModal(false)} />}
      {showProcessingSettingsModal && <ProcessingSettingsModal onClose={() => useAppStore.getState().setShowProcessingSettingsModal(false)} />}
      {showVisualizationSettingsModal && <VisualizationSettingsModal onClose={() => useAppStore.getState().setShowVisualizationSettingsModal(false)} />}
    </div>
  );
}

export default App;