import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Newspaper, 
  Bot, 
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
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface CompactGlanceProps {
  type: string;
  onExpand?: () => void;
}

export const CompactGlanceCard: React.FC<CompactGlanceProps> = ({ type, onExpand }) => {
  const { news, finance, systemStats, tasks, notes, habits } = useDashboard();

  switch (type) {
    case 'news': {
      const topNews = news[0];
      return (
        <div className="flex flex-col justify-between h-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20">
              {topNews?.category || 'Gündem'}
            </span>
            <span className="text-gray-400 text-[10px]">{news.length} Canlı Haber</span>
          </div>
          <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
            {topNews?.title || 'Haberler yükleniyor...'}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>{topNews?.source || 'Türkçe Basın'}</span>
            <span className="text-cyan-400 font-medium flex items-center">Haberleri Aç <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>
      );
    }

    case 'ai': {
      return (
        <div className="flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
              MiniMax-M3
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Çevrimiçi
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-300 truncate">
            💡 MiniMax'e sor: <em>"Gündemin 3 kritik başlığı..."</em>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Doğal Dil & Analiz</span>
            <span className="text-cyan-400 font-bold flex items-center">Sohbeti Başlat <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>
      );
    }

    case 'finance': {
      const usd = finance.find(f => f.code === 'USDTRY');
      const eur = finance.find(f => f.code === 'EURTRY');
      const gold = finance.find(f => f.code === 'GA');
      const btc = finance.find(f => f.code === 'BTC');

      return (
        <div className="flex flex-col justify-between h-full space-y-2">
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[9px] text-gray-400 block">USD/TRY</span>
              <strong className="text-[11px] text-white font-mono">{usd?.sell || 47.8}₺</strong>
              <span className="text-[8px] text-emerald-400 block">%{usd?.changeRate || 0.2}</span>
            </div>
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[9px] text-gray-400 block">EUR/TRY</span>
              <strong className="text-[11px] text-white font-mono">{eur?.sell || 55.3}₺</strong>
              <span className="text-[8px] text-rose-400 block">%{eur?.changeRate || -0.1}</span>
            </div>
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[9px] text-amber-400 block">Gr Altın</span>
              <strong className="text-[11px] text-white font-mono">{gold?.sell?.toLocaleString() || 4476}₺</strong>
              <span className="text-[8px] text-emerald-400 block">%{gold?.changeRate || 0.8}</span>
            </div>
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[9px] text-orange-400 block">Bitcoin</span>
              <strong className="text-[11px] text-white font-mono">${btc?.sell ? (btc.sell/1000).toFixed(1)+'k' : '96.4k'}</strong>
              <span className="text-[8px] text-emerald-400 block">%{btc?.changeRate || 2.4}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>Canlı Kurlar & Kripto</span>
            <span className="text-cyan-400 font-medium flex items-center">Tüm Piyasaları İncele <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>
      );
    }

    case 'weather': {
      return (
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">İstanbul</span>
              <span className="text-[10px] text-gray-400">Açık & Güneşli</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-400 font-mono">18°C</span>
              <span className="text-[9px] text-gray-400 block">Hissedilen: 18°</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>Open-Meteo Canlı</span>
            <span className="text-cyan-400 font-medium">5 Günlük Tahmin &gt;</span>
          </div>
        </div>
      );
    }

    case 'system': {
      const cpu = systemStats?.cpu.usagePercent || 18.7;
      const ram = systemStats?.memory.usagePercent || 54.4;
      return (
        <div className="flex flex-col justify-between h-full space-y-2">
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-400">CPU Yükü</span>
                <span className="text-cyan-400 font-mono font-bold">%{cpu}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(cpu, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-400">RAM Kullanımı</span>
                <span className="text-purple-400 font-mono font-bold">%{ram}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(ram, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>{systemStats?.cpu.cores || 16} Çekirdek Telemetrisi</span>
            <span className="text-cyan-400 font-medium">Detaylar &gt;</span>
          </div>
        </div>
      );
    }

    case 'kanban': {
      const todo = tasks.filter(t => t.status === 'todo').length;
      const inprog = tasks.filter(t => t.status === 'inprogress').length;
      const done = tasks.filter(t => t.status === 'done').length;

      return (
        <div className="flex flex-col justify-between h-full space-y-2">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[9px] text-blue-300 block">Yapılacak</span>
              <strong className="text-xs text-white font-mono">{todo}</strong>
            </div>
            <div className="p-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[9px] text-amber-300 block">Devam Eden</span>
              <strong className="text-xs text-white font-mono">{inprog}</strong>
            </div>
            <div className="p-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-emerald-300 block">Bitti</span>
              <strong className="text-xs text-white font-mono">{done}</strong>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>Toplam {tasks.length} Görev</span>
            <span className="text-cyan-400 font-medium">Panoyu Aç &gt;</span>
          </div>
        </div>
      );
    }

    case 'pomodoro': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">25:00 Odaklanma</span>
            <span className="text-[10px] text-cyan-400">🌧️ Yağmur Ambient Sesleri</span>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-md">
            Başlat
          </span>
        </div>
      );
    }

    case 'notes': {
      const topNote = notes[0];
      return (
        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block truncate">{topNote?.title || 'Hızlı Notlarım'}</span>
            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{topNote?.content || 'Markdown not ekleyin...'}</p>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>{notes.length} Not Kayıtlı</span>
            <span className="text-cyan-400 font-medium">Editörü Aç &gt;</span>
          </div>
        </div>
      );
    }

    case 'radio': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Lofi Beats & PowerTürk</span>
            <span className="text-[10px] text-gray-400">Canlı Müzik & Radyo</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
      );
    }

    case 'worldclock': {
      return (
        <div className="flex flex-col justify-between h-full">
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[8px] text-gray-400">Londra</span>
              <strong className="text-[10px] text-white block font-mono">15:58</strong>
            </div>
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[8px] text-gray-400">New York</span>
              <strong className="text-[10px] text-white block font-mono">10:58</strong>
            </div>
            <div className="p-1 rounded-lg bg-white/[0.02]">
              <span className="text-[8px] text-gray-400">Tokyo</span>
              <strong className="text-[10px] text-white block font-mono">00:58</strong>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 pt-1 border-t border-white/5 block text-right">Zaman Dilimleri &gt;</span>
        </div>
      );
    }

    case 'hackernews': {
      return (
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-center gap-1.5">
            <span className="px-1 bg-orange-500 text-black text-[9px] font-bold rounded">Y</span>
            <span className="text-xs font-bold text-white truncate">Hacker News Trendleri</span>
          </div>
          <span className="text-[10px] text-gray-400">Yazılım & AI Haberleri Canlı Akış</span>
          <span className="text-[10px] text-orange-400 pt-1 border-t border-white/5 block text-right">Trendleri Gör &gt;</span>
        </div>
      );
    }

    case 'cryptoheatmap': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Kripto Isı Haritası</span>
            <span className="text-[10px] text-emerald-400">BTC +%2.4 • ETH +%1.8</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">Portföy Hesapla &gt;</span>
        </div>
      );
    }

    case 'uptime': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">API & Site Ping</span>
            <span className="text-[10px] text-emerald-400">4/4 Servis Çalışıyor</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
      );
    }

    case 'expenses': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Bütçe & Harcama</span>
            <span className="text-[10px] text-gray-400">Net: +7.550₺</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Gider Ekle &gt;</span>
        </div>
      );
    }

    case 'snippets': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Snippet Vault</span>
            <span className="text-[10px] text-gray-400">Git, Docker, TypeScript</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">Kod Kopyala &gt;</span>
        </div>
      );
    }

    case 'breathe': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Nefes & Mola</span>
            <span className="text-[10px] text-cyan-300">4-4-4-4 Box Breathing</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">Nefes Al</span>
        </div>
      );
    }

    case 'journal': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Günün Mood & Günlüğü</span>
            <span className="text-[10px] text-purple-300">🚀 Verimli</span>
          </div>
          <span className="text-[10px] text-purple-400 font-medium">Giriş Yap &gt;</span>
        </div>
      );
    }

    case 'clipboard': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Hızlı Taslak & Metin</span>
            <span className="text-[10px] text-gray-400">BÜYÜK / küçük / slugify</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">Kullan &gt;</span>
        </div>
      );
    }

    case 'network': {
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-xs font-bold text-white block">Ağ & IP Bilgisi</span>
            <span className="text-[10px] text-emerald-400">Bağlantı Aktif</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">Ping Test &gt;</span>
        </div>
      );
    }

    case 'habit': {
      return (
        <div className="flex flex-col justify-between h-full">
          <span className="text-xs font-bold text-white">Bugünkü İlerleme</span>
          <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
            <span>Zinciri Kırma</span>
            <span>2/4 🔥</span>
          </div>
          <span className="text-[10px] text-cyan-400 text-right">Alışkanlıkları Yönet &gt;</span>
        </div>
      );
    }

    case 'speeddial': {
      return (
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-300">GitHub</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-300">TRT Haber</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-300">TradingView</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-300">ChatGPT</span>
          </div>
          <span className="text-[10px] text-cyan-400 text-right pt-1 border-t border-white/5">Tüm Bağlantılar &gt;</span>
        </div>
      );
    }

    case 'quote': {
      return (
        <div className="flex flex-col justify-between h-full">
          <p className="text-[11px] italic text-gray-300 line-clamp-2">
            "Hayatta en hakiki mürşit ilimdir, fendir."
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>— M. K. Atatürk</span>
            <span className="text-cyan-400">AI Yorumu Al &gt;</span>
          </div>
        </div>
      );
    }

    case 'clock': {
      const now = new Date();
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <span className="text-base font-black text-white font-mono">
              {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-gray-400 block">
              {now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">Takvimi Aç &gt;</span>
        </div>
      );
    }

    default:
      return (
        <div className="flex items-center justify-between h-full text-xs text-gray-400">
          <span>Detayları görüntülemek için tıklayın</span>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>
      );
  }
};
