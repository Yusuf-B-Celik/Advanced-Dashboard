import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Search, 
  Volume2, 
  Trophy
} from 'lucide-react';
import { IRREGULAR_VERBS } from '../../data/englishExtraData';

export const EnglishIrregularVerbsWidget: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'table' | 'quiz'>('table');

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [v2Input, setV2Input] = useState('');
  const [v3Input, setV3Input] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Filtered Verbs
  const filteredVerbs = useMemo(() => {
    if (!searchTerm.trim()) return IRREGULAR_VERBS;
    const q = searchTerm.toLowerCase();
    return IRREGULAR_VERBS.filter(v => 
      v.v1.toLowerCase().includes(q) ||
      v.v2.toLowerCase().includes(q) ||
      v.v3.toLowerCase().includes(q) ||
      v.meaningTr.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const currentQuizVerb = IRREGULAR_VERBS[quizIndex % IRREGULAR_VERBS.length];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheckQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEvaluated) return;
    setIsEvaluated(true);

    const v2Correct = v2Input.trim().toLowerCase() === currentQuizVerb.v2.toLowerCase();
    const v3Correct = v3Input.trim().toLowerCase() === currentQuizVerb.v3.toLowerCase() ||
                      (currentQuizVerb.v3.includes('/') && currentQuizVerb.v3.toLowerCase().includes(v3Input.trim().toLowerCase()));

    if (v2Correct && v3Correct) {
      setQuizScore(prev => prev + 10);
      speak(`${currentQuizVerb.v1}, ${currentQuizVerb.v2}, ${currentQuizVerb.v3}`);
    }
  };

  const handleNextQuiz = () => {
    setV2Input('');
    setV3Input('');
    setIsEvaluated(false);
    setQuizIndex(prev => Math.floor(Math.random() * IRREGULAR_VERBS.length));
  };

  return (
    <div className="flex flex-col h-full space-y-2.5 p-1">
      {/* Header & Mode Switch */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Irregular Verbs Master</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                V1-V2-V3
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">
              Düzensiz fiiller tablosu ve interaktif 3 hal testi
            </span>
          </div>
        </div>

        <div className="p-0.5 rounded-xl bg-white/5 border border-white/10 flex">
          <button
            onClick={() => setMode('table')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
              mode === 'table' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tablo
          </button>
          <button
            onClick={() => {
              setMode('quiz');
              handleNextQuiz();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
              mode === 'quiz' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Quiz
          </button>
        </div>
      </div>

      {mode === 'table' ? (
        /* --- Verb Table View --- */
        <div className="flex-1 min-h-0 flex flex-col space-y-2">
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Fiil veya Türkçe anlam ara..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {filteredVerbs.map(v => (
              <div
                key={v.id}
                className="p-2.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/5 transition flex items-center justify-between gap-2 group"
              >
                <div className="grid grid-cols-3 gap-2 flex-1 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-500 block">V1 (Base)</span>
                    <strong className="text-white font-bold">{v.v1}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">V2 (Past)</span>
                    <strong className="text-amber-300 font-bold">{v.v2}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block">V3 (Participle)</span>
                    <strong className="text-cyan-300 font-bold">{v.v3}</strong>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {v.meaningTr}
                  </span>
                  <button
                    onClick={() => speak(`${v.v1}, ${v.v2}, ${v.v3}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 transition"
                    title="Sesli Dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- Interactive Quiz Mode --- */
        <div className="flex-1 flex flex-col justify-between space-y-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              V2 ve V3 Hallerini Yaz
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1 text-xs">
              <Trophy className="w-3.5 h-3.5" /> {quizScore} Puan
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <span className="text-xs text-gray-400">Türkçe Anlamı: {currentQuizVerb.meaningTr}</span>
            <h2 className="text-2xl font-black text-white">{currentQuizVerb.v1}</h2>
            <p className="text-[11px] text-gray-400 italic">"{currentQuizVerb.exampleEn}"</p>
          </div>

          <form onSubmit={handleCheckQuiz} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">V2 (Past Simple)</label>
                <input
                  type="text"
                  disabled={isEvaluated}
                  value={v2Input}
                  onChange={(e) => setV2Input(e.target.value)}
                  placeholder="Örn: went"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">V3 (Past Participle)</label>
                <input
                  type="text"
                  disabled={isEvaluated}
                  value={v3Input}
                  onChange={(e) => setV3Input(e.target.value)}
                  placeholder="Örn: gone"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {isEvaluated && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Doğru Cevap:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    V1: {currentQuizVerb.v1} • V2: {currentQuizVerb.v2} • V3: {currentQuizVerb.v3}
                  </span>
                </div>
              </div>
            )}

            {!isEvaluated ? (
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition"
              >
                Cevabı Kontrol Et
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuiz}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition"
              >
                Sonraki Fiil →
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
