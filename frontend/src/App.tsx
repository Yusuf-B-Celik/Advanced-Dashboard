import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './contexts/DashboardContext';
import { Header } from './components/layout/Header';
import { GridCanvas } from './components/layout/GridCanvas';
import { WidgetGalleryModal } from './components/layout/WidgetGalleryModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { MobileTunnelModal } from './components/common/MobileTunnelModal';
import { Bot, Sparkles, X } from 'lucide-react';
import { AIAssistantWidget } from './components/widgets/AIAssistantWidget';

const DashboardMain: React.FC = () => {
  const { settings, isAIPanelOpen, setIsAIPanelOpen, toggleAIPanel } = useDashboard();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTunnelOpen, setMobileTunnelOpen] = useState(false);

  const getWallpaperClass = () => {
    switch (settings.wallpaper) {
      case 'gradient-cyber':
        return 'bg-mesh-cyber';
      case 'gradient-aurora':
        return 'bg-mesh-aurora';
      case 'oled-black':
        return 'bg-black';
      default:
        return 'bg-mesh-dark';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getWallpaperClass()} w-full overflow-x-hidden`}>
      {/* Top Navigation Header */}
      <Header
        onOpenWidgetGallery={() => setGalleryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAIAssistant={toggleAIPanel}
        onOpenMobileTunnel={() => setMobileTunnelOpen(true)}
      />

      {/* Main Workspace Layout with Smooth Push Grid */}
      <div className="flex-1 flex w-full relative">
        {/* Main Grid Canvas: Shrinks smoothly when AI panel is open */}
        <div
          className={`flex-1 min-w-0 w-full transition-all duration-400 ease-out ${
            isAIPanelOpen ? 'xl:mr-[440px]' : ''
          }`}
        >
          <GridCanvas onOpenWidgetGallery={() => setGalleryOpen(true)} />
        </div>

        {/* AI Copilot Side Panel (Slide-in Dock) */}
        {isAIPanelOpen && (
          <aside className="fixed top-14 right-0 bottom-0 z-40 w-full sm:w-[440px] glass-panel border-l border-white/15 p-4 sm:p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-2xl">
            {/* AI Panel Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>MiniMax-M3 Copilot</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Canlı AI
                    </span>
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    Panel açıkken widget'lar otomatik olarak yerleşir.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                title="Paneli Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Assistant Body */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AIAssistantWidget />
            </div>
          </aside>
        )}
      </div>

      {/* Floating MiniMax AI Quick Launcher Button */}
      <button
        onClick={toggleAIPanel}
        className={`fixed bottom-6 right-6 z-30 p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 text-black font-extrabold shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group ${
          isAIPanelOpen ? 'opacity-30 hover:opacity-100 scale-90' : 'opacity-100 scale-100'
        }`}
        title={isAIPanelOpen ? 'AI Panelini Kapat' : 'MiniMax-M3 Canlı Copilot Panelini Aç'}
      >
        <Bot className="w-5 h-5 text-black" />
        <span className="text-xs font-black text-black hidden sm:inline">
          {isAIPanelOpen ? 'Copilot Açık' : 'MiniMax-M3 AI'}
        </span>
      </button>

      {/* Modals */}
      <WidgetGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <MobileTunnelModal
        isOpen={mobileTunnelOpen}
        onClose={() => setMobileTunnelOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardMain />
    </DashboardProvider>
  );
}
