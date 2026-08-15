import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  RotateCw, 
  FileText, 
  Video, 
  Copy, 
  Check, 
  Share2, 
  BookOpen, 
  Layers, 
  Network,
  ListOrdered
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  siteName: string;
  isYouTube: boolean;
}

export const WebSummarizerWidget: React.FC = () => {
  const { settings } = useDashboard();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'mindmap'>('summary');

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setScraped(null);
      setAnalysis(null);

      const res = await fetch('/api/scraper/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'İçerik özetlenemedi.');
      }

      setScraped(data.scraped);
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (analysis && navigator.clipboard) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sample quick test links
  const sampleLinks = [
    { label: 'Webrazzi Tech', url: 'https://webrazzi.com' },
    { label: 'Hacker News', url: 'https://news.ycombinator.com' },
    { label: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleAnalyze} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            placeholder="Makale, haber veya YouTube URL'si yapıştırın..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !urlInput.trim()}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition disabled:opacity-50 shrink-0"
        >
          {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{loading ? 'Analiz Ediliyor...' : 'Özetle & Çıkar'}</span>
        </button>
      </form>

      {/* Quick suggestions when empty */}
      {!scraped && !loading && !error && (
        <div className="flex items-center gap-2 text-[11px] text-gray-400 overflow-x-auto pb-1">
          <span className="shrink-0 text-gray-500">Örnek:</span>
          {sampleLinks.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(s.url);
              }}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300/80 hover:text-cyan-300 border border-white/5 whitespace-nowrap transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-mono">
          {error}
        </div>
      )}

      {/* Content Analysis View */}
      {scraped && analysis && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2 animate-in fade-in">
          {/* Metadata Card */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                {scraped.isYouTube ? <Video className="w-3.5 h-3.5 text-rose-400" /> : <BookOpen className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs truncate" title={scraped.title}>
                  {scraped.title}
                </h4>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span>{scraped.siteName}</span>
                  <span>•</span>
                  <a
                    href={scraped.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Orijinal Link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition shrink-0"
              title="Özeti Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Analysis Result Body */}
          <div className="flex-1 overflow-y-auto p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <MarkdownViewer content={analysis} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!scraped && !loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Akıllı Makale & Video Araştırmacısı</h4>
            <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">
              Herhangi bir URL yapıştırın; MiniMax içeriği analiz edip 3 maddelik yönetici özeti ve görsel zihin haritası çıkarsın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
