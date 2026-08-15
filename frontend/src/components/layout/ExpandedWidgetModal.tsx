import React, { useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { NewsWidget } from '../widgets/NewsWidget';
import { AIAssistantWidget } from '../widgets/AIAssistantWidget';
import { FinanceWidget } from '../widgets/FinanceWidget';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { SystemMonitorWidget } from '../widgets/SystemMonitorWidget';
import { KanbanWidget } from '../widgets/KanbanWidget';
import { PomodoroWidget } from '../widgets/PomodoroWidget';
import { NotesWidget } from '../widgets/NotesWidget';
import { RadioWidget } from '../widgets/RadioWidget';
import { QuickToolsWidget } from '../widgets/QuickToolsWidget';
import { GithubTrendsWidget } from '../widgets/GithubTrendsWidget';
import { HabitTrackerWidget } from '../widgets/HabitTrackerWidget';
import { SpeedDialWidget } from '../widgets/SpeedDialWidget';
import { QuoteWidget } from '../widgets/QuoteWidget';
import { ClockCalendarWidget } from '../widgets/ClockCalendarWidget';
import { WorldClockWidget } from '../widgets/WorldClockWidget';
import { HackerNewsTechWidget } from '../widgets/HackerNewsTechWidget';
import { CryptoHeatmapWidget } from '../widgets/CryptoHeatmapWidget';
import { UptimeMonitorWidget } from '../widgets/UptimeMonitorWidget';
import { ExpenseTrackerWidget } from '../widgets/ExpenseTrackerWidget';
import { SnippetVaultWidget } from '../widgets/SnippetVaultWidget';
import { BreatheRelaxWidget } from '../widgets/BreatheRelaxWidget';
import { DailyJournalWidget } from '../widgets/DailyJournalWidget';
import { ClipboardHistoryWidget } from '../widgets/ClipboardHistoryWidget';
import { NetworkSpeedWidget } from '../widgets/NetworkSpeedWidget';
import { WebSummarizerWidget } from '../widgets/WebSummarizerWidget';

export const ExpandedWidgetModal: React.FC = () => {
  const { expandedWidgetId, setExpandedWidgetId, widgets } = useDashboard();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedWidgetId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setExpandedWidgetId]);

  if (!expandedWidgetId) return null;

  const currentWidget = widgets.find(w => w.id === expandedWidgetId);
  if (!currentWidget) return null;

  const renderFullWidget = () => {
    switch (currentWidget.type) {
      case 'news':
        return <NewsWidget />;
      case 'ai':
        return <AIAssistantWidget />;
      case 'finance':
        return <FinanceWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'system':
        return <SystemMonitorWidget />;
      case 'kanban':
        return <KanbanWidget />;
      case 'pomodoro':
        return <PomodoroWidget />;
      case 'notes':
        return <NotesWidget />;
      case 'radio':
        return <RadioWidget />;
      case 'quick-tools':
        return <QuickToolsWidget />;
      case 'github':
        return <GithubTrendsWidget />;
      case 'habit':
        return <HabitTrackerWidget />;
      case 'speeddial':
        return <SpeedDialWidget />;
      case 'quote':
        return <QuoteWidget />;
      case 'clock':
        return <ClockCalendarWidget />;
      // New 10 Widgets
      case 'worldclock':
        return <WorldClockWidget />;
      case 'hackernews':
        return <HackerNewsTechWidget />;
      case 'cryptoheatmap':
        return <CryptoHeatmapWidget />;
      case 'uptime':
        return <UptimeMonitorWidget />;
      case 'expenses':
        return <ExpenseTrackerWidget />;
      case 'snippets':
        return <SnippetVaultWidget />;
      case 'breathe':
        return <BreatheRelaxWidget />;
      case 'journal':
        return <DailyJournalWidget />;
      case 'clipboard':
        return <ClipboardHistoryWidget />;
      case 'network':
        return <NetworkSpeedWidget />;
      case 'websummarizer':
        return <WebSummarizerWidget />;
      default:
        return <div>Widget detayı yükleniyor...</div>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={() => setExpandedWidgetId(null)}
    >
      <div 
        className="w-full max-w-5xl max-h-[92vh] glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03] select-none shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                {currentWidget.title}
              </h2>
              <span className="text-[11px] text-gray-400">
                Detaylı & Etkileşimli Görünüm • <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">ESC</kbd> ile Kapat
              </span>
            </div>
          </div>

          <button
            onClick={() => setExpandedWidgetId(null)}
            className="p-2 rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 transition"
            title="Kapat (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {renderFullWidget()}
        </div>
      </div>
    </div>
  );
};
