import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, MessageSquare, TrendingUp, RotateCw, Globe, Bot, X } from 'lucide-react';
import { HackerNewsStory } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

export const HackerNewsTechWidget: React.FC = () => {
  const { settings } = useDashboard();
  const [stories, setStories] = useState<HackerNewsStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<{ id: number; title: string; summary: string } | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hackernews?limit=15');
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('HN fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleAiSummarize = async (story: HackerNewsStory) => {
    try {
      setSummarizingId(story.id);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Aşağıdaki Hacker News teknoloji/yazılım başlığını Türkçe olarak 3 maddede özetle ve yazılımcılar için neden önemli olduğunu açıkla:\nBaşlık: ${story.title}\nLink/Domain: ${story.domain || story.url}`
            }
          ],
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel || 'MiniMax-M3',
          planType: settings.minimaxPlanType || 'token_plan',
          apiProtocol: settings.minimaxProtocol || 'anthropic'
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setAiSummary({ id: story.id, title: story.title, summary: data.reply });
      }
    } catch (e) {
      console.error('HN AI summary failed:', e);
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-orange-500 text-black font-black text-[10px] px-1.5 leading-none">
            Y
          </div>
          <span className="text-xs font-bold text-white">Hacker News & Tech Trends</span>
        </div>
        <button
          onClick={fetchStories}
          disabled={loading}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
          title="Yenile"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      </div>

      {/* AI Summary Banner if active */}
      {aiSummary && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-950/40 via-purple-950/20 to-black/60 border border-orange-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-orange-300 font-bold text-xs">
              <Bot className="w-3.5 h-3.5" />
              <span className="truncate max-w-[280px]">MiniMax-M3 Türkçe Analiz: {aiSummary.title}</span>
            </div>
            <button onClick={() => setAiSummary(null)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <MarkdownViewer content={aiSummary.summary} />
        </div>
      )}

      {/* Story List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
        {loading && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 space-y-2 text-gray-400 text-xs">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span>Hacker News akışı taranıyor...</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">Haber bulunamadı.</div>
        ) : (
          stories.map((s, idx) => {
            const isSummarizing = summarizingId === s.id;
            return (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-orange-500/30 transition-all flex items-start gap-2.5 group"
              >
                <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-orange-400 pt-0.5 w-4 shrink-0">
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-200 group-hover:text-orange-300 transition line-clamp-2 leading-snug flex items-center gap-1.5"
                  >
                    <span>{s.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 text-orange-400" />
                  </a>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-orange-400 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {s.score} puan
                    </span>
                    {s.domain && (
                      <span className="truncate max-w-[120px] text-gray-400">
                        {s.domain}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <MessageSquare className="w-3 h-3" />
                      {s.descendants}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAiSummarize(s)}
                  disabled={isSummarizing}
                  className="p-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition shrink-0 self-center disabled:opacity-50"
                  title="MiniMax-M3 ile Türkçe Özetle"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
