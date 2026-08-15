import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Bot 
} from 'lucide-react';
import { NewsItem } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';

interface NewsDetailModalProps {
  article: NewsItem | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ article: initialArticle, onClose }) => {
  const { news, summarizeArticle, savedNewsIds, toggleSaveNews } = useDashboard();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!initialArticle) return null;

  // Real-time synchronization with latest news state in context
  const article = news.find(n => n.id === initialArticle.id) || initialArticle;
  const isSaved = savedNewsIds.includes(article.id);

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      await summarizeArticle(article);
    } catch (e) {
      console.error('Summary failed:', e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToRead = article.aiSummary?.keyTakeaway 
          ? `Haber Özeti: ${article.aiSummary.bullets.join('. ')}. Sonuç: ${article.aiSummary.keyTakeaway}`
          : `${article.title}. ${article.content}`;
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\n\n${article.link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pozitif / Olumlu Gelişme
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Kritik / Olumsuz Gelişme
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-cyan-400 border border-cyan-500/30">
            <TrendingUp className="w-3.5 h-3.5" /> Bilgilendirici / Nötr
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/15 shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {article.category}
            </span>
            <span className="text-sm font-medium text-gray-400 truncate">
              {article.source}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-xl border transition ${isPlayingAudio ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'}`}
              title={isPlayingAudio ? 'Durdur' : 'Sesli Dinle (TTS)'}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => toggleSaveNews(article.id)}
              className={`p-2 rounded-xl border transition ${isSaved ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'}`}
              title={isSaved ? 'Kaydedilenlerden Çıkar' : 'Haberi Kaydet'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition"
              title="Linki Kopyala"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 transition"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Date */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.pubDate).toLocaleString('tr-TR')}</span>
              {copied && <span className="text-cyan-400 font-semibold ml-2">✓ Link Kopyalandı!</span>}
            </div>
          </div>

          {/* Article Image if present */}
          {article.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden max-h-72 border border-white/10">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* MiniMax AI Summary Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-slate-900/60 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  MiniMax-M3 Yapay Zeka Özeti & Analizi
                </h3>
              </div>

              {article.aiSummary && getSentimentBadge(article.aiSummary.sentiment)}
            </div>

            {article.aiSummary ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="space-y-2">
                  {article.aiSummary.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-sm shadow-cyan-400" />
                      <p className="leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-cyan-300 font-medium italic">
                    💡 <strong>Kritik Çıkarım:</strong> {article.aiSummary.keyTakeaway}
                  </div>
                  <div className="text-[10px] text-gray-400 shrink-0">
                    Model: {article.aiSummary.modelUsed || 'MiniMax-M3'} • {article.aiSummary.analyzedAt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <p className="text-xs text-gray-300">
                  Bu haberi MiniMax-M3 ile analiz ederek 3 maddede özetleyin ve tarafsızlık/duygu puanını çıkarın.
                </p>
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                  <span>{isSummarizing ? 'MiniMax Analiz Ediyor...' : 'MiniMax ile Özetle'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Full Article Content */}
          <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed space-y-4">
            <p>{article.content}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <span className="text-xs text-gray-400">
            Kaynak: <strong className="text-gray-200">{article.source}</strong>
          </span>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <span>Orijinal Habere Git</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
