import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Sparkles, 
  RotateCw, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Globe, 
  Layers, 
  ArrowRight,
  BookmarkPlus
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

interface ResearchResult {
  query: string;
  executiveSummary: string;
  mermaidDiagram: string;
  citations: Array<{ title: string; url: string; snippet: string }>;
  fullReportMarkdown: string;
  researchedAt: string;
}

export const DeepResearchWidget: React.FC = () => {
  const { settings, addNote } = useDashboard();
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'sources'>('report');
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const SUGGESTIONS = [
    '2026 Yapay Zeka Ajan Mimarileri ve Geleceği',
    'Küresel Yarı İletken ve Çip Sektörü Analizi',
    'Modern Web Geliştirme: Next.js vs Vite & Rust Tooling',
    'Merkez Bankaları Faiz Politikaları ve Makro Etkileri'
  ];

  const handleStartResearch = async (targetQuery?: string) => {
    const q = (targetQuery || queryInput).trim();
    if (!q) return;

    try {
      setLoading(true);
      setCurrentStep(1);
      setResult(null);
      setSavedToNotes(false);

      // Visual step transitions
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 2500);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 5500);

      const res = await fetch('/api/ai/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        throw new Error(data.error || 'Araştırma tamamlanamadı.');
      }
    } catch (err: any) {
      console.error('[DeepResearch Error]:', err.message);
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const handleCopy = () => {
    if (result?.fullReportMarkdown && navigator.clipboard) {
      navigator.clipboard.writeText(result.fullReportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const blob = new Blob([result.fullReportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arastirma_${result.query.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToNotes = () => {
    if (!result) return;
    addNote({
      title: `📊 Araştırma: ${result.query.slice(0, 35)}`,
      content: result.fullReportMarkdown,
      category: 'Araştırma',
      tags: ['Derin Araştırma', 'AI Rapor']
    });
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2500);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Search Input & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Compass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            placeholder="Bir konu yazın (Örn: '2026 AI Trendleri ve Kıyaslaması')..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <button
          onClick={() => handleStartResearch()}
          disabled={loading || !queryInput.trim()}
          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Araştırılıyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Otonom Araştır</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Topic Chips */}
      {!result && !loading && (
        <div className="space-y-2 py-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            💡 Popüler Araştırma Konuları:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(sug);
                  handleStartResearch(sug);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 hover:text-cyan-300 text-gray-300 text-xs border border-white/10 transition flex items-center gap-1"
              >
                <span>{sug}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multi-step loading visualization */}
      {loading && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 my-auto">
          <div className="flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin" />
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">Otonom Ajan Araştırma Yapıyor</h4>
              <p className="text-xs text-gray-400">İnternet taranıyor, sayfalar kazınıyor ve çapraz doğrulama yapılıyor...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentStep >= 1 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Search className="w-4 h-4" />
              <span>1. Çoklu Arama Sorgusu</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentStep >= 2 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Globe className="w-4 h-4" />
              <span>2. Web Kazıma & Doğrulama</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${currentStep >= 3 ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Sparkles className="w-4 h-4" />
              <span>3. Zihin Haritası & Sentez</span>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          {/* Result Sub Tabs & Action Buttons */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  activeTab === 'report' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                📑 Tam Araştırma Raporu
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'sources' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🔗 Kaynaklar</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {result.citations.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveToNotes}
                className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  savedToNotes ? 'bg-emerald-500 text-black' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
                title="Pano Not Defterine Kaydet"
              >
                {savedToNotes ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{savedToNotes ? 'Kaydedildi' : 'Notlara Kaydet'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                title="Raporu Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadReport}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition"
                title="Markdown Olarak İndir (.md)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto pr-1">
            {activeTab === 'report' ? (
              <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 p-2 bg-black/20 rounded-2xl border border-white/5">
                <MarkdownViewer content={result.fullReportMarkdown} />
              </div>
            ) : (
              <div className="space-y-2 p-1">
                {result.citations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Özel web kaynağı bulunamadı, doğrudan genel bilgi tabanından sentezlendi.
                  </div>
                ) : (
                  result.citations.map((cite, idx) => (
                    <a
                      key={idx}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-start justify-between gap-3 group transition block"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                            {cite.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {cite.snippet}
                        </p>
                        <span className="text-[10px] text-cyan-400 truncate block">
                          {cite.url}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 shrink-0" />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
