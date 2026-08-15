import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCw, 
  Sparkles, 
  Radio, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  CloudSun,
  Headphones,
  FastForward,
  Copy,
  Check
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({ isOpen, onClose }) => {
  const { settings, weatherCity } = useDashboard();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [copied, setCopied] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      stopAudio();
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol,
          userName: settings.userName || 'Değerli Kullanıcı',
          weatherCity: weatherCity || 'İstanbul'
        })
      });

      const data = await res.json();
      if (data.success) {
        setBriefing(data.briefing);
        setGeneratedAt(data.generatedAt);
      }
    } catch (err: any) {
      console.warn('Briefing error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !briefing) {
      fetchBriefing();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlayAudio = () => {
    if (!briefing || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    stopAudio();

    // Clean markdown symbols for natural TTS reading
    const cleanText = briefing
      .replace(/[#*`_~>\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr') || v.name.includes('Turkish') || v.name.includes('Yelda') || v.name.includes('Tolga') || v.name.includes('Emel'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseAudio = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleCopy = () => {
    if (briefing && navigator.clipboard) {
      navigator.clipboard.writeText(briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleRate = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);
    if (isPlaying) {
      // Re-trigger with new rate
      stopAudio();
      setTimeout(handlePlayAudio, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl animate-in zoom-in-95 max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Günlük Yönetici Brifingi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {generatedAt ? `${generatedAt} Canlı` : 'AI Sentez'}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {weatherCity}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefing}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
              title="Brifingi Yeniden Oluştur"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Visualizer & Player Control Strip */}
        <div className="px-5 py-3 bg-black/60 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isPlaying ? (
              <button
                onClick={handlePauseAudio}
                className="p-3 rounded-2xl bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition"
                title="Duraklat"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlayAudio}
                disabled={loading || !briefing}
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                title="Brifingi Sesli Dinle"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            )}

            <div>
              <span className="text-xs font-bold text-white block">
                {isPlaying ? 'Brifing Seslendiriliyor...' : isPaused ? 'Duraklatıldı' : 'Sesli Dinleyin (Türkçe TTS)'}
              </span>
              <span className="text-[10px] text-gray-400">
                {isPlaying ? 'Doğal Türkçe ses sentezi aktif' : 'Dinlemek için oynat butonuna basın'}
              </span>
            </div>
          </div>

          {/* Sound Wave Animation & Speed Selector */}
          <div className="flex items-center gap-3">
            {isPlaying && (
              <div className="flex items-center gap-1 h-5 px-2">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-5" />
                <span className="w-1 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.15s] h-3" />
                <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-6" />
                <span className="w-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.2s] h-4" />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.4s] h-2" />
              </div>
            )}

            <button
              onClick={toggleRate}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-cyan-300 transition"
              title="Okuma Hızını Değiştir"
            >
              {speechRate}x
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
              title="Metni Kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Briefing Text Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <div className="text-center">
                <span className="text-sm font-bold text-white block">Günün Yönetici Brifingi Hazırlanıyor...</span>
                <span className="text-xs text-gray-400">Piyasa, haberler, görevler ve hava durumu MiniMax ile sentezleniyor</span>
              </div>
            </div>
          ) : briefing ? (
            <div className="prose prose-invert max-w-none text-sm text-gray-200 leading-relaxed space-y-3">
              <MarkdownViewer content={briefing} />
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Brifing verisi henüz üretilemedi. Yeniden denemek için yukarıdaki yenile butonuna basın.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
