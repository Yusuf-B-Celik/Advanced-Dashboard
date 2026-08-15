import React from 'react';
import { 
  Maximize2, 
  RotateCw, 
  ChevronUp, 
  ChevronDown, 
  EyeOff, 
  MoreVertical,
  Sliders,
  Newspaper,
  Bot,
  TrendingUp,
  CloudSun,
  Cpu,
  Kanban,
  Timer,
  FileText,
  Radio,
  Wrench,
  GitBranch,
  CheckCircle,
  Bookmark,
  Quote,
  Clock,
  Sparkles,
  Columns
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { CompactGlanceCard } from '../widgets/CompactGlanceCards';

interface WidgetCardProps {
  id: string;
  type: string;
  title: string;
  iconName: string;
  colSpan: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  index: number;
  totalWidgets: number;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  id,
  type,
  title,
  iconName,
  colSpan,
  onRefresh,
  isLoading,
  children,
  index,
  totalWidgets
}) => {
  const { 
    isLayoutLocked, 
    moveWidget, 
    toggleWidgetVisibility, 
    viewMode,
    setExpandedWidgetId,
    cycleWidgetSize
  } = useDashboard();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Newspaper': return Newspaper;
      case 'Bot': return Bot;
      case 'TrendingUp': return TrendingUp;
      case 'CloudSun': return CloudSun;
      case 'Cpu': return Cpu;
      case 'Kanban': return Kanban;
      case 'Timer': return Timer;
      case 'FileText': return FileText;
      case 'Radio': return Radio;
      case 'Wrench': return Wrench;
      case 'GitBranch': return GitBranch;
      case 'CheckCircle': return CheckCircle;
      case 'Bookmark': return Bookmark;
      case 'Quote': return Quote;
      case 'Clock': return Clock;
      default: return Sparkles;
    }
  };

  const IconComponent = getIcon(iconName);

  // Responsive column span mapping with dense fitting
  const getColSpanClass = (span: number) => {
    switch (span) {
      case 1:
      case 2:
        return 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2';
      case 3:
        return 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-3';
      case 4:
        return 'col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-4';
      case 6:
        return 'col-span-12 md:col-span-6 lg:col-span-6';
      case 8:
        return 'col-span-12 lg:col-span-8';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If in compact mode and clicking the card body, open focused full modal
    if (viewMode === 'compact') {
      setExpandedWidgetId(id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative glass-panel rounded-3xl p-4 sm:p-4.5 flex flex-col border border-white/10 hover:border-cyan-500/40 shadow-xl overflow-hidden widget-card-container animate-widget-enter ${getColSpanClass(
        colSpan
      )} ${viewMode === 'compact' ? 'cursor-pointer min-h-[140px] hover:shadow-cyan-500/10' : 'min-h-[220px]'}`}
      style={{
        animationDelay: `${Math.min(index * 25, 300)}ms`
      }}
    >
      {/* Subtle Glow Overlay */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/[0.04] group-hover:bg-cyan-500/[0.08] rounded-full blur-2xl pointer-events-none transition-all duration-500" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-white/5 select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all duration-300">
            <IconComponent className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Quick ColSpan Cycle Resizer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleWidgetSize(id);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition"
            title="Widget Boyutunu Değiştir (Genişlet/Daralt)"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isLoading}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
              title="Yenile"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}

          {/* Expand to Modal Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedWidgetId(id);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition"
            title="Büyüt ve Odaklan (Tam Ekran)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Reordering Controls if unlocked */}
          {!isLayoutLocked && (
            <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidget(index, index - 1);
                }}
                disabled={index === 0}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-20"
                title="Yukarı Taşı"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidget(index, index + 1);
                }}
                disabled={index === totalWidgets - 1}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-20"
                title="Aşağı Taşı"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidgetVisibility(id);
                }}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-rose-400 transition"
                title="Gizle"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Body: Compact Glance Card in compact mode, or full children in expanded mode */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {viewMode === 'compact' ? (
          <CompactGlanceCard type={type} onExpand={() => setExpandedWidgetId(id)} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
