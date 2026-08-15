import React, { useState } from 'react';
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
  CheckSquare, 
  Radio,
  LayoutGrid,
  Maximize2,
  Smartphone,
  Headphones,
  Sliders,
  ChevronDown
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

  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const workspaces = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'genel', label: 'Genel Bakış', icon: Sparkles },
    { id: 'haberler', label: 'Haber & Finans', icon: Newspaper },
    { id: 'sistem', label: 'Sistem & Kod', icon: Cpu },
    { id: 'odaklanma', label: 'Odak & Üretkenlik', icon: Flame },
  ];

  // Quick ticker items
  const usd = finance.find(f => f.code === 'USDTRY');
  const eur = finance.find(f => f.code === 'EURTRY');
  const gold = finance.find(f => f.code === 'GA');
  const btc = finance.find(f => f.code === 'BTC');
  const latestNews = news[0];

  return (
    <header className="sticky top-0 z-40 flex flex-col glass-panel border-b border-white/10 backdrop-blur-xl">
      {/* Top Live Micro-Ticker Bar */}
      <div className="px-4 py-1.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 overflow-x-auto gap-4">
        {/* Market Ticker */}
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

        {/* Breaking News marquee */}
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

      {/* Main Navigation Header */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center text-cyan-400 font-black text-lg">
              Ω
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wide">
                NEXUS <span className="gradient-text-cyan">DASHBOARD</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                MiniMax-M3
              </span>
            </div>
            <span className="text-[10px] text-gray-400 hidden sm:block">
              Yerel Yapay Zeka & Türkçe Haber Bilgi Merkezi
            </span>
          </div>
        </div>

        {/* Center: Workspaces Selector & View Mode Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
            {workspaces.map(ws => {
              const Icon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ws.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact / Expanded View Mode Toggle */}
          <button
            onClick={toggleViewMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              viewMode === 'compact'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
            }`}
            title="Kuşbakışı (Kompakt) ve Genişletilmiş Görünüm Arasında Geçiş Yap"
          >
            {viewMode === 'compact' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kompakt (Tıkla-Aç)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Genişletilmiş Mod</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative hidden sm:block w-40 md:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Widget / Haber ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Add Widget Button */}
          <button
            onClick={onOpenWidgetGallery}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
            title="Yeni Widget Ekle"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Widget Ekle</span>
          </button>

          {/* Lock / Unlock Layout */}
          <button
            onClick={() => setIsLayoutLocked(!isLayoutLocked)}
            className={`p-2 rounded-xl border transition ${
              isLayoutLocked
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title={isLayoutLocked ? 'Yerleşim Kilitli (Düzenlemek için tıkla)' : 'Yerleşim Düzenlenebilir'}
          >
            {isLayoutLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition hidden md:block"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Executive Daily Briefing Button */}
          <button
            onClick={onOpenExecutiveBriefing}
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 border border-pink-500/30 transition flex items-center gap-1.5 shadow-md shadow-pink-500/10"
            title="Günün Sesli Yönetici Brifingi"
          >
            <Headphones className="w-4 h-4 text-pink-400" />
            <span className="hidden xl:inline text-xs font-bold">Günün Brifingi</span>
          </button>

          {/* Smart Layout Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition flex items-center gap-1 text-xs font-semibold"
              title="Akıllı Rol Şablonları (Presets)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Rol Modları</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {presetDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-2xl p-1.5 border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1"
                onClick={() => setPresetDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Akıllı Düzen Şablonları
                </div>
                <button
                  onClick={() => applyPreset('all')}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-white/10 text-white flex items-center gap-2 transition"
                >
                  <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">🎛️</span>
                  <span>Tam Koleksiyon (Tümü)</span>
                </button>
                <button
                  onClick={() => applyPreset('dev')}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-white/10 text-white flex items-center gap-2 transition"
                >
                  <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">💻</span>
                  <span>Yazılımcı & DevOps</span>
                </button>
                <button
                  onClick={() => applyPreset('finance')}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-white/10 text-white flex items-center gap-2 transition"
                >
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">📈</span>
                  <span>Borsa & Finans Trader</span>
                </button>
                <button
                  onClick={() => applyPreset('focus')}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-white/10 text-white flex items-center gap-2 transition"
                >
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">🧘</span>
                  <span>Odaklanma & Üretkenlik</span>
                </button>
                <button
                  onClick={() => applyPreset('news')}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-white/10 text-white flex items-center gap-2 transition"
                >
                  <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">📰</span>
                  <span>Gündem & Araştırma</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Ngrok Broadcast Button */}
          <button
            onClick={onOpenMobileTunnel}
            className="px-2.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition flex items-center gap-1.5"
            title="Mobilden Kullan (Ngrok Yayını)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold">Mobil Yayın</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition"
            title="Ayarlar & Temalar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Workspaces & View Switcher Strip */}
      <div className="flex lg:hidden items-center justify-between px-4 py-2 border-t border-white/5 overflow-x-auto gap-2">
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
                    ? 'bg-cyan-500 text-black'
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
