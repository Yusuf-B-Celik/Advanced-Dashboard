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
  Check,
  UserCheck,
  Mic2
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
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<'tr-TR-AhmetNeural' | 'tr-TR-EmelNeural'>('tr-TR-AhmetNeural');
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      stopAudio();
      setAudioUrl(null);

      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol,
          userName: settings.userName || 'Yusuf Bey',
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // High quality Neural Voice Synthesis from Backend
  const handlePlayNeuralAudio = async () => {
    if (!briefing) return;

    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speechRate;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    try {
      setTtsLoading(true);
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: briefing,
          voice: selectedVoice,
          rate: speechRate === 1.25 ? '+25%' : speechRate === 1.5 ? '+50%' : 'default'
        })
      });

      if (!res.ok) throw new Error('Ses üretilemedi.');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.playbackRate = speechRate;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audioRef.current = audio;

      audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.warn('Neural TTS failed, falling back to Web Speech API:', err.message);
      // Fallback to browser TTS if network is unavailable
      if ('speechSynthesis' in window) {
        const clean = briefing.replace(/[#*`_~>\-]/g, ' ');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = 'tr-TR';
        utter.rate = speechRate;
        utter.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
      }
    } finally {
      setTtsLoading(false);
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
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleVoiceChange = (voice: 'tr-TR-AhmetNeural' | 'tr-TR-EmelNeural') => {
    setSelectedVoice(voice);
    stopAudio();
    setAudioUrl(null); // Force re-synthesis with new voice
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-3xl glass-panel rounded-3xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl animate-in zoom-in-95 max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Günün Yönetici Brifingi (Executive Intelligence)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {generatedAt ? `${generatedAt} Sentez` : 'Canlı AI'}
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

        {/* Studio Neural TTS Player Control Bar */}
        <div className="px-5 py-3.5 bg-black/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayNeuralAudio}
              disabled={loading || !briefing || ttsLoading}
              className={`p-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50 ${
                isPlaying 
                  ? 'bg-amber-500 text-black shadow-amber-500/30 hover:scale-105' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/30 hover:scale-105'
              }`}
            >
              {ttsLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Stüdyo Sesi Hazırlanıyor...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Duraklat</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stüdyo Seslendirmesi Dinle</span>
                </>
              )}
            </button>

            {/* Voice Model Selector (Ahmet vs Emel) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => handleVoiceChange('tr-TR-AhmetNeural')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedVoice === 'tr-TR-AhmetNeural'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Ahmet - Tok & Karizmatik Yönetici Sesi"
              >
                🎙️ Ahmet (Tok Erkek)
              </button>
              <button
                onClick={() => handleVoiceChange('tr-TR-EmelNeural')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedVoice === 'tr-TR-EmelNeural'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Emel - Akıcı & Berrak Haber Spikeri Sesi"
              >
                🎙️ Emel (Akıcı Kadın)
              </button>
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
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 transition"
              title="Okuma Hızı"
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-black/30">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RotateCw className="w-9 h-9 text-cyan-400 animate-spin" />
              <div className="text-center">
                <span className="text-sm font-bold text-white block">Günün Yönetici Brifingi Hazırlanıyor...</span>
                <span className="text-xs text-gray-400">Piyasalar, haberler, görevler ve hava durumu MiniMax-M3 ile analiz ediliyor</span>
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
