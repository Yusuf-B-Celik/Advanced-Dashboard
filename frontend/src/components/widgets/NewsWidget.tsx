import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  ExternalLink, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Filter,
  Layers,
  X
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { NewsItem } from '../../types';
import { NewsDetailModal } from './NewsDetailModal';
import { MarkdownViewer } from '../common/MarkdownViewer';

const CATEGORIES = ['Tümü', 'Gündem', 'Ekonomi', 'Teknoloji', 'Dünya'];

export const NewsWidget: React.FC = () => {
  const { 
    news, 
    newsLoading, 
    selectedCategory, 
    setSelectedCategory, 
    selectedSource, 
    setSelectedSource,
    summarizeArticle,
    generateRoundup,
    savedNewsIds,
    toggleSaveNews,
    searchQuery
  } = useDashboard();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [roundupData, setRoundupData] = useState<{ title: string; summary: string } | null>(null);
  const [isGeneratingRoundup, setIsGeneratingRoundup] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Filter sources dynamically
  const sources = useMemo(() => {
    const set = new Set(news.map(n => n.source));
    return ['Tümü', ...Array.from(set)];
  }, [news]);

  // Filtered news items
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      if (showSavedOnly && !savedNewsIds.includes(item.id)) return false;
      if (selectedCategory !== 'Tümü' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedSource !== 'Tümü' && item.source !== selectedSource) return false;
      
      const query = (localSearch || searchQuery).toLowerCase().trim();
      if (query) {
        return item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
      }
      return true;
    });
  }, [news, selectedCategory, selectedSource, localSearch, searchQuery, showSavedOnly, savedNewsIds]);

  const handleQuickSummarize = async (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation();
    try {
      setSummarizingId(item.id);
      const summary = await summarizeArticle(item);
      if (selectedArticle && selectedArticle.id === item.id) {
        setSelectedArticle({ ...selectedArticle, aiSummary: summary });
      }
    } catch (err) {
      // handled
    } finally {
      setSummarizingId(null);
    }
  };

  const handleCreateRoundup = async () => {
    try {
      setIsGeneratingRoundup(true);
      const res = await generateRoundup();
      setRoundupData(res);
    } catch (err) {
      // handled
    } finally {
      setIsGeneratingRoundup(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'Az önce';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat önce`;
      return `${Math.floor(diffSec / 86400)} gün önce`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setShowSavedOnly(false); }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat && !showSavedOnly
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
              showSavedOnly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Kaydedilenler ({savedNewsIds.length})</span>
          </button>
        </div>

        {/* 24h AI Panorama Button */}
        <button
          onClick={handleCreateRoundup}
          disabled={isGeneratingRoundup}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingRoundup ? 'animate-spin' : ''}`} />
          <span>{isGeneratingRoundup ? 'MiniMax Analiz Ediyor...' : '24s Gündem Panoraması (AI)'}</span>
        </button>
      </div>

      {/* Sub Filter & Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Haberlerde ara..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Source Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {sources.map(src => (
              <option key={src} value={src} className="bg-gray-900 text-white">
                {src}
              </option>
            ))}
          </select>
          <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 24h Roundup Banner if open */}
      {roundupData && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900/80 border border-purple-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>{roundupData.title}</span>
            </div>
            <button onClick={() => setRoundupData(null)} className="text-gray-400 hover:text-white text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <MarkdownViewer content={roundupData.summary} />
        </div>
      )}

      {/* News List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[300px]">
        {newsLoading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-gray-400">
            <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Popüler Türkçe haber kaynakları taranıyor...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
            <Layers className="w-8 h-8 opacity-30 mb-2" />
            <span>Kriterlere uygun haber bulunamadı.</span>
          </div>
        ) : (
          filteredNews.map(item => {
            const isSaved = savedNewsIds.includes(item.id);
            const isSummarizing = summarizingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col sm:flex-row gap-3 relative overflow-hidden"
              >
                {/* News Thumbnail if present */}
                {item.imageUrl && (
                  <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* News Meta & Body */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium truncate">
                        {item.source}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 ml-auto shrink-0">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(item.pubDate)}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-gray-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-1">
                      {item.snippet}
                    </p>
                  </div>

                  {/* AI Summary Badge or Action */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                    {item.aiSummary ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MiniMax Özeti Hazır</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleQuickSummarize(e, item)}
                        disabled={isSummarizing}
                        className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <Sparkles className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                        <span>{isSummarizing ? 'Özetleniyor...' : 'AI ile 3 Maddede Özetle'}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSaveNews(item.id); }}
                        className={`p-1 rounded-lg hover:bg-white/10 transition ${isSaved ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title={isSaved ? 'Kaydedildi' : 'Kaydet'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition"
                        title="Kaynağa Git"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Detail Modal */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};
