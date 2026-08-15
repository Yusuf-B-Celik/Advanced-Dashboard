import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Quote, 
  Bot, 
  Check 
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

const QUOTES = [
  { text: 'Hayatta en hakiki mürşit ilimdir, fendir.', author: 'Mustafa Kemal Atatürk' },
  { text: 'Geleceği tahmin etmenin en iyi yolu, onu inşa etmektir.', author: 'Alan Kay' },
  { text: 'Bilgi güçtür, ancak paylaşıldığı zaman değer kazanır.', author: 'Francis Bacon' },
  { text: 'Sadelik, nihai gelişmişlik düzeyidir.', author: 'Leonardo da Vinci' },
  { text: 'Zorluklar, yetenekleri ortaya çıkaran fırsatlardır.', author: 'Epiktetos' },
  { text: 'Büyük işler, küçük şeylerin bir araya getirilmesiyle başarılır.', author: 'Vincent van Gogh' },
];

export const QuoteWidget: React.FC = () => {
  const { settings } = useDashboard();
  const [index, setIndex] = useState(0);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const current = QUOTES[index % QUOTES.length];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % QUOTES.length);
    setAiComment(null);
  };

  const handleAskAI = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `"${current.text}" - ${current.author} sözünü modern iş, teknoloji ve kişisel gelişim perspektifinden 2 vurucu cümleyle açıklar mısın?`
            }
          ],
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setAiComment(data.reply);
      }
    } catch (e) {
      setAiComment('Yapay zeka yorumu alınamadı.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-3">
      {/* Quote Container */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900/40 to-cyan-950/30 border border-white/10 relative overflow-hidden flex-1 flex flex-col justify-center">
        <Quote className="w-8 h-8 text-cyan-400/20 absolute -top-1 -left-1" />
        
        <p className="text-sm font-semibold text-white italic leading-relaxed relative z-10">
          "{current.text}"
        </p>

        <span className="text-xs text-cyan-300 font-bold mt-2 block text-right">
          — {current.author}
        </span>

        {aiComment && (
          <div className="mt-3 pt-2.5 border-t border-white/10 text-xs text-purple-200 bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[10px] text-purple-300 mb-1">
              <Bot className="w-3 h-3" />
              <span>MiniMax-M3 Perspektifi:</span>
            </div>
            <p className="leading-relaxed">{aiComment}</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Farklı Söz</span>
        </button>

        <button
          onClick={handleAskAI}
          disabled={isAnalyzing}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Yorumlanıyor...' : 'AI ile Yorumla'}</span>
        </button>
      </div>
    </div>
  );
};
