import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Plus, 
  Layers,
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
  Flame,
  Bookmark,
  Quote,
  Clock,
  Globe,
  Activity,
  Wallet,
  Code2,
  Wind,
  BookOpen,
  Clipboard,
  Wifi,
  Sparkles
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface WidgetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetGalleryModal: React.FC<WidgetGalleryModalProps> = ({ isOpen, onClose }) => {
  const { widgets, toggleWidgetVisibility } = useDashboard();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

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
      case 'Flame': return Flame;
      case 'Bookmark': return Bookmark;
      case 'Quote': return Quote;
      case 'Clock': return Clock;
      case 'Globe': return Globe;
      case 'Activity': return Activity;
      case 'Wallet': return Wallet;
      case 'Code2': return Code2;
      case 'Wind': return Wind;
      case 'BookOpen': return BookOpen;
      case 'Clipboard': return Clipboard;
      case 'Wifi': return Wifi;
      default: return Sparkles;
    }
  };

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'news', label: 'Haber' },
    { id: 'ai', label: 'Yapay Zeka' },
    { id: 'finance', label: 'Finans & Kripto' },
    { id: 'developer', label: 'Geliştirici & Kod' },
    { id: 'system', label: 'Sistem & Ağ' },
    { id: 'productivity', label: 'Üretkenlik & Odak' },
    { id: 'utilities', label: 'Araçlar & Yaşam' },
    { id: 'media', label: 'Medya & Müzik' },
  ];

  const filteredWidgets = widgets.filter(w => {
    if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/15 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Widget Vitrini & Galerisi</h2>
              <span className="text-xs text-gray-400">25+ Tam Fonksiyonel Yerel Widget Koleksiyonu</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/5 space-y-3 bg-white/[0.01]">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Widget ara (örn. Kripto, Uptime, Docker, Haberler, Hava Durumu)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredWidgets.map(w => {
            const Icon = getIcon(w.icon);
            return (
              <div
                key={w.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  w.visible
                    ? 'bg-white/[0.04] border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-white/[0.01] border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5 uppercase">
                    {w.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{w.title}</h4>
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Genişlik: {w.colSpan} Sütun • {w.workspaces.join(', ')}
                  </span>
                </div>

                <button
                  onClick={() => toggleWidgetVisibility(w.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    w.visible
                      ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {w.visible ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Panodan Gizle</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Panoya Ekle</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <span className="text-xs text-gray-400">
            Toplam <strong>{widgets.filter(w => w.visible).length}</strong> aktif widget
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
          >
            Tamamla
          </button>
        </div>
      </div>
    </div>
  );
};
