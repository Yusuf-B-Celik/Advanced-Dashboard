import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { WidgetCard } from './WidgetCard';
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
import { ExpandedWidgetModal } from './ExpandedWidgetModal';
import { Plus, Layers } from 'lucide-react';

interface GridCanvasProps {
  onOpenWidgetGallery: () => void;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({ onOpenWidgetGallery }) => {
  const { 
    widgets, 
    activeWorkspace, 
    searchQuery, 
    refreshNews, 
    newsLoading, 
    refreshFinance, 
    financeLoading, 
    viewMode,
    isAIPanelOpen
  } = useDashboard();

  // Filter visible widgets for workspace and search
  const visibleWidgets = widgets.filter(w => {
    if (!w.visible) return false;
    if (activeWorkspace !== 'all' && !w.workspaces.includes(activeWorkspace)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.type.toLowerCase().includes(q);
    }
    return true;
  });

  const renderWidgetContent = (type: string) => {
    switch (type) {
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
      default:
        return <div className="text-gray-400 text-xs">Widget yükleniyor...</div>;
    }
  };

  const getRefreshHandler = (type: string) => {
    if (type === 'news') return refreshNews;
    if (type === 'finance') return refreshFinance;
    return undefined;
  };

  const getLoadingState = (type: string) => {
    if (type === 'news') return newsLoading;
    if (type === 'finance') return financeLoading;
    return false;
  };

  const calculateColSpan = (w: typeof widgets[0]) => {
    if (viewMode === 'compact') {
      switch (w.type) {
        case 'news':
        case 'ai':
        case 'finance':
        case 'hackernews':
        case 'kanban':
        case 'system':
        case 'notes':
          return 4;
        case 'weather':
        case 'clock':
        case 'worldclock':
        case 'cryptoheatmap':
        case 'uptime':
        case 'expenses':
        case 'snippets':
        case 'breathe':
        case 'journal':
        case 'clipboard':
        case 'network':
        case 'habit':
        case 'quote':
        case 'speeddial':
        case 'pomodoro':
        case 'radio':
        case 'quick-tools':
        case 'github':
          return 3;
        default:
          return w.colSpan || 3;
      }
    } else {
      switch (w.type) {
        case 'news':
        case 'kanban':
          return isAIPanelOpen ? 12 : 8;
        case 'ai':
        case 'finance':
        case 'system':
        case 'hackernews':
          return isAIPanelOpen ? 12 : 6;
        default:
          return w.colSpan || 4;
      }
    }
  };

  return (
    <main className="w-full p-3 sm:p-4 lg:p-6 transition-all duration-400 ease-out">
      {visibleWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center glass-panel rounded-3xl border border-white/10 space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bu Çalışma Alanında Widget Bulunmuyor</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Widget galerisinden yeni widget'lar ekleyebilir veya arama filtrenizi temizleyebilirsiniz.
            </p>
          </div>
          <button
            onClick={onOpenWidgetGallery}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Widget Galerisini Aç</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-3.5 sm:gap-4 lg:gap-4.5 grid-flow-dense auto-rows-min w-full">
          {visibleWidgets.map((w, index) => (
            <WidgetCard
              key={w.id}
              id={w.id}
              type={w.type}
              title={w.title}
              iconName={w.icon}
              colSpan={calculateColSpan(w)}
              onRefresh={getRefreshHandler(w.type)}
              isLoading={getLoadingState(w.type)}
              index={index}
              totalWidgets={visibleWidgets.length}
            >
              {renderWidgetContent(w.type)}
            </WidgetCard>
          ))}
        </div>
      )}

      {/* Focused Expanded Modal */}
      <ExpandedWidgetModal />
    </main>
  );
};
