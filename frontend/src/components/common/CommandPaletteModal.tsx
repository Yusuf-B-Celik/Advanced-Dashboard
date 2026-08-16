import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Bot, 
  Zap, 
  Plus, 
  CheckSquare, 
  FileText, 
  Wallet, 
  Globe, 
  Compass, 
  Network, 
  Workflow, 
  TrendingUp, 
  Timer, 
  Sliders, 
  ArrowRight, 
  X, 
  Calculator, 
  Copy, 
  Check, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWidgetGallery: () => void;
  onOpenExecutiveBriefing: () => void;
  onOpenMobileTunnel: () => void;
  onOpenSettings: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenWidgetGallery,
  onOpenExecutiveBriefing,
  onOpenMobileTunnel,
  onOpenSettings
}) => {
  const { 
    widgets, 
    toggleWidgetVisibility, 
    addTask, 
    addNote, 
    applyPreset, 
    setActiveWorkspace,
    settings,
    finance
  } = useDashboard();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setAiAnswer(null);
      setActionFeedback(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Quick Math / Currency evaluator
  const mathResult = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // Currency conversion e.g. "100 usd in try", "50 eur in try"
    const currMatch = q.match(/^(\d+(?:\.\d+)?)\s*(usd|eur|btc|gram)\s*(?:in|to|\->)?\s*(try|tl)?$/i);
    if (currMatch) {
      const amount = parseFloat(currMatch[1]);
      const curr = currMatch[2].toUpperCase();
      let rate = 0;
      let label = '';
      if (curr === 'USD') {
        rate = finance.find(f => f.code === 'USDTRY')?.sell || 36.85;
        label = 'Dolar -> TL';
      } else if (curr === 'EUR') {
        rate = finance.find(f => f.code === 'EURTRY')?.sell || 38.45;
        label = 'Euro -> TL';
      } else if (curr === 'BTC') {
        rate = (finance.find(f => f.code === 'BTC')?.sell || 96000) * 36.85;
        label = 'Bitcoin -> TL';
      } else if (curr === 'GRAM') {
        rate = finance.find(f => f.code === 'GA')?.sell || 3470;
        label = 'Gram Altın -> TL';
      }
      if (rate > 0) {
        return {
          type: 'currency',
          text: `${amount} ${curr} = ${(amount * rate).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL (${label})`
        };
      }
    }

    // Basic arithmetic e.g. "250 * 1.20", "(4500 - 300) / 2"
    if (/^[0-9+\-*/().\s^%]+$/.test(q) && /[+\-*/^%]/.test(q)) {
      try {
        // Safe evaluation
        const sanitized = q.replace(/[^0-9+\-*/().]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          return {
            type: 'math',
            text: `${sanitized} = ${res.toLocaleString('tr-TR')}`
          };
        }
      } catch {
        return null;
      }
    }

    return null;
  }, [query, finance]);

  // Built-in Action Items
  const builtInActions = [
    {
      id: 'briefing',
      title: '🎙️ Günlük Sesli Yönetici Brifingi Dinle',
      category: 'Yapay Zeka',
      icon: Sparkles,
      action: () => { onOpenExecutiveBriefing(); onClose(); }
    },
    {
      id: 'mobile-tunnel',
      title: '📱 Mobil Canlı Yayın (Ngrok QR Kod)',
      category: 'Sistem',
      icon: Globe,
      action: () => { onOpenMobileTunnel(); onClose(); }
    },
    {
      id: 'gallery',
      title: '➕ Yeni Widget Ekle & Galeriyi Aç',
      category: 'Pano',
      icon: Plus,
      action: () => { onOpenWidgetGallery(); onClose(); }
    },
    {
      id: 'settings',
      title: '⚙️ Sistem Ayarları & Telegram Yapılandırması',
      category: 'Ayarlar',
      icon: Sliders,
      action: () => { onOpenSettings(); onClose(); }
    },
    {
      id: 'preset-dev',
      title: '💻 Yazılımcı & DevOps Rol Şablonuna Geç',
      category: 'Rol Şablonu',
      icon: Zap,
      action: () => { applyPreset('dev'); onClose(); }
    },
    {
      id: 'preset-finance',
      title: '📈 Borsa & Finans Trader Şablonuna Geç',
      category: 'Rol Şablonu',
      icon: TrendingUp,
      action: () => { applyPreset('finance'); onClose(); }
    },
    {
      id: 'preset-focus',
      title: '🧘 Odaklanma & Üretkenlik Şablonuna Geç',
      category: 'Rol Şablonu',
      icon: Timer,
      action: () => { applyPreset('focus'); onClose(); }
    },
    {
      id: 'preset-news',
      title: '📰 Gündem & Araştırma Şablonuna Geç',
      category: 'Rol Şablonu',
      icon: Globe,
      action: () => { applyPreset('news'); onClose(); }
    }
  ];

  // Filtered widget actions
  const widgetActions = widgets.map(w => ({
    id: `widget-${w.id}`,
    title: `${w.visible ? '👁️ Gösteriliyor' : '🚫 Gizli'}: ${w.title}`,
    category: 'Widget Yönetimi',
    icon: Layers,
    action: () => {
      toggleWidgetVisibility(w.id);
      setActionFeedback(`"${w.title}" görünürlüğü değiştirildi.`);
      setTimeout(() => setActionFeedback(null), 1500);
    }
  }));

  // Combine and filter options
  const filteredOptions = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return builtInActions;

    const all = [...builtInActions, ...widgetActions];
    return all.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );
  }, [query, widgets]);

  // Execute NLP Commands
  const handleExecuteCommand = async () => {
    const q = query.trim();
    if (!q) return;

    const lower = q.toLowerCase();

    // 1. Task Creation Command: "görev: ...", "görev ekle ...", "todo: ..."
    if (lower.startsWith('görev:') || lower.startsWith('görev ekle') || lower.startsWith('todo:')) {
      const taskTitle = q.replace(/^(görev:|görev ekle|todo:)\s*/i, '').trim();
      if (taskTitle) {
        addTask({
          title: taskTitle,
          status: 'todo',
          priority: 'medium',
          tags: ['Hızlı Ekleme']
        });
        setActionFeedback(`✅ Görev panoya eklendi: "${taskTitle}"`);
        setTimeout(() => onClose(), 1200);
        return;
      }
    }

    // 2. Note Creation Command: "not: ...", "not al ...", "not ekle ..."
    if (lower.startsWith('not:') || lower.startsWith('not al') || lower.startsWith('not ekle')) {
      const noteContent = q.replace(/^(not:|not al|not ekle)\s*/i, '').trim();
      if (noteContent) {
        addNote({
          title: noteContent.slice(0, 30) + (noteContent.length > 30 ? '...' : ''),
          content: noteContent,
          category: 'Genel',
          tags: ['Komut Paleti']
        });
        setActionFeedback(`📝 Not defterine kaydedildi.`);
        setTimeout(() => onClose(), 1200);
        return;
      }
    }

    // 3. Math / Currency
    if (mathResult) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(mathResult.text);
        setActionFeedback(`📋 Sonuç kopyalandı: ${mathResult.text}`);
        setTimeout(() => onClose(), 1200);
      }
      return;
    }

    // 4. Default Selected Action
    if (filteredOptions.length > 0 && selectedIndex < filteredOptions.length) {
      filteredOptions[selectedIndex].action();
      return;
    }

    // 5. Ask MiniMax AI Directly
    handleAskAI();
  };

  const handleAskAI = async () => {
    if (!query.trim()) return;
    try {
      setAiLoading(true);
      setAiAnswer(null);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query.trim() }],
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnswer(data.reply || 'Cevap üretilemedi.');
      } else {
        setAiAnswer('Hata: ' + (data.error || 'Yapay zeka yanıt veremedi.'));
      }
    } catch (err: any) {
      setAiAnswer('Bağlantı hatası: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handleAskAI();
      } else {
        handleExecuteCommand();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div 
        className="w-full max-w-2xl glass-panel rounded-3xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl animate-in zoom-in-95"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-cyan-950/30 via-black/40 to-purple-950/30">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Bir komut yazın, hesap yapın veya soru sorun (Örn: 'görev: ...', '100 usd in try')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              setAiAnswer(null);
            }}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setAiAnswer(null); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono hidden sm:inline">
            ESC Kapat
          </span>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Live Math / Currency Result Preview */}
        {mathResult && (
          <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Calculator className="w-4 h-4" />
              <span>{mathResult.text}</span>
            </div>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(mathResult.text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-bold flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Kopyala</span>
            </button>
          </div>
        )}

        {/* AI Answer Drawer */}
        {aiLoading && (
          <div className="p-6 text-center space-y-2">
            <Bot className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <span className="text-xs text-gray-300 font-semibold block">MiniMax-M3 yanıt üretiyor...</span>
          </div>
        )}

        {aiAnswer && !aiLoading && (
          <div className="p-5 max-h-60 overflow-y-auto border-b border-white/10 bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                <span>MiniMax Yapay Zeka Yanıtı</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiAnswer);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Kopyala</span>
              </button>
            </div>
            <div className="text-xs text-gray-200 leading-relaxed">
              <MarkdownViewer content={aiAnswer} />
            </div>
          </div>
        )}

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <span className="text-xs text-gray-400 block">Eşleşen komut bulunamadı.</span>
              <button
                onClick={handleAskAI}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>MiniMax Yapay Zekaya Sor (Shift + Enter)</span>
              </button>
            </div>
          ) : (
            filteredOptions.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-gray-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 uppercase">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 bg-black/60 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">↑↓</kbd> Gezin</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Enter</kbd> Çalıştır</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Shift+Enter</kbd> Yapay Zekaya Sor</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold">
            💡 "görev: ...", "not: ...", "100 usd in try"
          </span>
        </div>
      </div>
    </div>
  );
};
