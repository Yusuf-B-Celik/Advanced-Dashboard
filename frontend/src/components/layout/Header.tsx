import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Settings, 
  Lock, 
  Unlock, 
  Search, 
  Bot, 
  Maximize, 
  Minimize, 
  Flame, 
  TrendingUp, 
  Newspaper, 
  Cpu, 
  Layers, 
  LayoutGrid,
  Maximize2,
  Smartphone,
  Headphones,
  SlidersHorizontal,
  ChevronDown,
  X,
  Radio,
  Check
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface HeaderProps {
  onOpenWidgetGallery: () => void;
  onOpenSettings: () => void;
  onOpenAIAssistant: () => void;
  onOpenMobileTunnel: () => void;
  onOpenExecutiveBriefing: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWidgetGallery,
  onOpenSettings,
  onOpenAIAssistant,
  onOpenMobileTunnel,
  onOpenExecutiveBriefing,
}) => {
  const { 
    activeWorkspace, 
    setActiveWorkspace, 
    searchQuery, 
    setSearchQuery, 
    isLayoutLocked, 
    setIsLayoutLocked,
    viewMode,
    toggleViewMode,
    applyPreset,
    finance,
    news
  } = useDashboard();

  const [controlMenuOpen, setControlMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setControlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const workspaces = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'genel', label: 'Genel', icon: Sparkles },
    { id: 'haberler', label: 'Haber & Finans', icon: Newspaper },
    { id: 'sistem', label: 'Sistem', icon: Cpu },
    { id: 'odaklanma', label: 'Odak', icon: Flame },
  ];

  const presets = [
    { id: 'all', label: 'Tam Koleksiyon (Tümü)', icon: '🎛️', color: 'text-cyan-300' },
    { id: 'dev', label: 'Yazılımcı & DevOps', icon: '💻', color: 'text-indigo-300' },
    { id: 'finance', label: 'Borsa & Finans Trader', icon: '📈', color: 'text-emerald-300' },
    { id: 'focus', label: 'Odaklanma & Üretkenlik', icon: '🧘', color: 'text-amber-300' },
    { id: 'news', label: 'Gündem & Araştırma', icon: '📰', color: 'text-rose-300' },
  ];

  // Quick ticker items
  const usd = finance.find(f => f.code === 'USDTRY');
  const eur = finance.find(f => f.code === 'EURTRY');
  const gold = finance.find(f => f.code === 'GA');
  const btc = finance.find(f => f.code === 'BTC');
  const latestNews = news[0];

  return (
    <header className="sticky top-0 z-40 flex flex-col glass-panel border-b border-white/10 backdrop-blur-xl">
      {/* Top Micro Ticker Bar */}
      <div className="px-4 py-1 bg-black/50 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 overflow-x-auto gap-4">
        <div className="flex items-center gap-4 shrink-0 font-medium">
          {usd && (
            <span className="flex items-center gap-1">
              <span className="text-gray-400">USD:</span>
              <strong className="text-white">{usd.sell}₺</strong>
              <span className={usd.changeRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                %{usd.changeRate}
              </span>
            </span>
          )}
          {eur && (
            <span className="flex items-center gap-1">
              <span className="text-gray-400">EUR:</span>
              <strong className="text-white">{eur.sell}₺</strong>
              <span className={eur.changeRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                %{eur.changeRate}
              </span>
            </span>
          )}
          {gold && (
            <span className="flex items-center gap-1 hidden sm:flex">
              <span className="text-amber-400 font-semibold">Gr Altın:</span>
              <strong className="text-white">{gold.sell}₺</strong>
              <span className="text-emerald-400">%{gold.changeRate}</span>
            </span>
          )}
          {btc && (
            <span className="flex items-center gap-1 hidden md:flex">
              <span className="text-orange-400 font-semibold">BTC:</span>
              <strong className="text-white">${btc.sell?.toLocaleString()}</strong>
              <span className={btc.changeRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                %{btc.changeRate}
              </span>
            </span>
          )}
        </div>

        {latestNews && (
          <div className="flex items-center gap-2 truncate text-gray-300">
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase tracking-wider shrink-0 border border-rose-500/30">
              Son Dakika
            </span>
            <span className="truncate text-[11px] text-gray-200">
              {latestNews.title}
            </span>
          </div>
        )}
      </div>

      {/* Main Simplified Header */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[13px] flex items-center justify-center text-cyan-400 font-black text-base">
              Ω
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                NEXUS <span className="gradient-text-cyan">DASHBOARD</span>
              </h1>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase hidden sm:inline">
                MiniMax-M3
              </span>
            </div>
            <span className="text-[10px] text-gray-400 hidden xl:block">
              Yapay Zeka Destekli Kişisel Komut Merkezi
            </span>
          </div>
        </div>

        {/* Center: Clean Workspace Pills & View Mode Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
            {workspaces.map(ws => {
              const Icon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ws.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick View Mode Toggle Icon */}
          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-xl border transition ${
              viewMode === 'compact'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
            }`}
            title={viewMode === 'compact' ? 'Kuşbakışı (Kompakt Mod)' : 'Genişletilmiş Mod'}
          >
            {viewMode === 'compact' ? <LayoutGrid className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Unified Clean Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Expanding Search Bar */}
          <div className="relative w-32 sm:w-44 md:w-52 transition-all">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Widget ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Primary Action: + Widget Ekle */}
          <button
            onClick={onOpenWidgetGallery}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition shrink-0"
            title="Yeni Widget Ekle"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ekle</span>
          </button>

          {/* Quick Hub: Günün Brifingi */}
          <button
            onClick={onOpenExecutiveBriefing}
            className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition flex items-center gap-1.5"
            title="Günün Sesli Yönetici Brifingi"
          >
            <Headphones className="w-4 h-4 text-pink-400" />
            <span className="hidden xl:inline text-xs font-semibold">Brifing</span>
          </button>

          {/* Quick Hub: Mobil Yayın */}
          <button
            onClick={onOpenMobileTunnel}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition flex items-center gap-1.5"
            title="Mobilden Kullan (Ngrok Yayını)"
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="hidden xl:inline text-xs font-semibold">Mobil</span>
          </button>

          {/* Unified Controls & Presets Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setControlMenuOpen(!controlMenuOpen)}
              className={`p-2 rounded-xl border transition flex items-center gap-1 ${
                controlMenuOpen 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              }`}
              title="Rol Modları & Kontrol Menüsü"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {controlMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-2xl p-2 border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-2">
                {/* Section: Presets */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 block mb-1">
                    🎯 Akıllı Rol Şablonları
                  </span>
                  <div className="space-y-0.5">
                    {presets.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          applyPreset(p.id as any);
                          setControlMenuOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium hover:bg-white/10 text-white flex items-center gap-2 transition"
                      >
                        <span className="text-sm">{p.icon}</span>
                        <span className="flex-1">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 block">
                    ⚙️ Görünüm & Araçlar
                  </span>

                  {/* Layout Lock Toggle */}
                  <button
                    onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs text-gray-200 hover:bg-white/10 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      {isLayoutLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                      <span>Yerleşim Kilidi</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLayoutLocked ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-gray-400'}`}>
                      {isLayoutLocked ? 'Kilitli' : 'Serbest'}
                    </span>
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs text-gray-200 hover:bg-white/10 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize className="w-3.5 h-3.5 text-gray-400" />}
                      <span>Tam Ekran Modu</span>
                    </div>
                  </button>

                  {/* View Mode */}
                  <button
                    onClick={toggleViewMode}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs text-gray-200 hover:bg-white/10 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                      <span>Görünüm Modu</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold">
                      {viewMode === 'compact' ? 'Kompakt' : 'Geniş'}
                    </span>
                  </button>
                </div>

                {/* Settings Item */}
                <div className="border-t border-white/10 pt-1.5">
                  <button
                    onClick={() => {
                      setControlMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-white flex items-center gap-2 transition"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Ayarlar & Temalar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Icon Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition"
            title="Ayarlar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Workspaces Strip */}
      <div className="flex lg:hidden items-center justify-between px-4 py-1.5 border-t border-white/5 overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          {workspaces.map(ws => {
            const Icon = ws.icon;
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{ws.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={toggleViewMode}
          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0"
        >
          {viewMode === 'compact' ? 'Kompakt' : 'Geniş'}
        </button>
      </div>
    </header>
  );
};
