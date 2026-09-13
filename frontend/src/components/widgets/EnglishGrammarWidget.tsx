import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  HelpCircle, 
  ArrowLeft
} from 'lucide-react';
import { ENGLISH_GRAMMAR_TOPICS, GRAMMAR_LEVELS } from '../../data/englishGrammarData';

export const EnglishGrammarWidget: React.FC = () => {
  // Navigation & Filter State
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Quick check mini-quiz state for active topic
  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  // Sound / TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter topics
  const filteredTopics = ENGLISH_GRAMMAR_TOPICS.filter(topic => {
    if (selectedLevel !== 'all' && topic.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        topic.title.toLowerCase().includes(q) ||
        topic.titleTr.toLowerCase().includes(q) ||
        topic.category.toLowerCase().includes(q) ||
        topic.summaryTr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeTopic = ENGLISH_GRAMMAR_TOPICS.find(t => t.id === activeTopicId) || null;

  // Handle Quick Check option selection
  const handleAnswerSelect = (questionId: string, option: string) => {
    if (submittedQuestions[questionId]) return;
    setQuickAnswers(prev => ({ ...prev, [questionId]: option }));
    setSubmittedQuestions(prev => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="flex flex-col h-full space-y-2.5 p-1">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {activeTopic ? (
            <button
              onClick={() => setActiveTopicId(null)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 transition flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold">Konular</span>
            </button>
          ) : (
            <div className="p-2 rounded-2xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <GraduationCap className="w-4 h-4" />
            </div>
          )}
          
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>İngilizce Gramer Rehberi</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                A1 - C2 Kapsamlı
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">
              {activeTopic ? `${activeTopic.level} • ${activeTopic.category}` : 'Formüller, kurallar, sık yapılan hatalar ve pratik'}
            </span>
          </div>
        </div>
      </div>

      {/* Main View: Topic Detail or Topic List */}
      {activeTopic ? (
        /* --- Topic Detail View --- */
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-transparent border border-pink-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase">
                {activeTopic.level}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {activeTopic.category}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white">
              {activeTopic.title}
            </h2>
            <p className="text-xs text-gray-300">
              {activeTopic.summaryTr}
            </p>
          </div>

          {/* Formula / Structure Box */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-cyan-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Cümle Yapısı & Formül:</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-cyan-200 break-words">
              {activeTopic.formula}
            </div>
          </div>

          {/* Key Rules */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Önemli Kurallar & Püf Noktalar:</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
              {activeTopic.detailedRulesTr.map((rule, rIdx) => (
                <li key={rIdx} className="leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Example Sentences */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Örnek Cümleler & Kullanım:</span>
            </h4>
            <div className="space-y-1.5">
              {activeTopic.examples.map((ex, exIdx) => (
                <div 
                  key={exIdx} 
                  className="p-2.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/5 transition flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 text-xs">
                    <p className="text-white font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      {ex.en}
                    </p>
                    <p className="text-[11px] text-gray-400 pl-3">
                      {ex.tr}
                    </p>
                  </div>
                  <button
                    onClick={() => speakText(ex.en)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 transition shrink-0"
                    title="Cümleyi Dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          {activeTopic.commonMistakes.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Sık Yapılan Hatalar (Dikkat!):</span>
              </h4>
              <div className="space-y-1.5">
                {activeTopic.commonMistakes.map((mis, mIdx) => (
                  <div key={mIdx} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-mono font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {mis.wrong}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {mis.correct}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 italic pt-0.5">
                      💡 {mis.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Quick Check Quiz */}
          {activeTopic.quickCheck.length > 0 && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Hızlı Konu Pratiği (Quick Check):</span>
                </h4>
              </div>

              <div className="space-y-3">
                {activeTopic.quickCheck.map((q, qIdx) => {
                  const isSubmitted = submittedQuestions[q.id];
                  const userAns = quickAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswer;

                  return (
                    <div key={q.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <p className="text-xs font-semibold text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => {
                          let optStyle = 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5';
                          if (isSubmitted) {
                            if (opt === q.correctAnswer) {
                              optStyle = 'bg-emerald-500/30 text-emerald-200 border-emerald-500/60 font-bold';
                            } else if (opt === userAns) {
                              optStyle = 'bg-rose-500/30 text-rose-200 border-rose-500/60 font-bold';
                            } else {
                              optStyle = 'opacity-40 bg-white/5 text-gray-500';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isSubmitted}
                              onClick={() => handleAnswerSelect(q.id, opt)}
                              className={`p-2 rounded-xl text-[11px] text-left border transition ${optStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && (
                        <div className="text-[10px] text-gray-300 pt-1 border-t border-white/5">
                          {isCorrect ? (
                            <span className="text-emerald-400 font-bold">✓ Doğru! </span>
                          ) : (
                            <span className="text-rose-400 font-bold">✗ Yanlış. Doğru cevap: {q.correctAnswer}. </span>
                          )}
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- Topics List View --- */
        <div className="flex-1 min-h-0 flex flex-col space-y-2">
          {/* Search bar */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Gramer konusu ara (Örn: Past Simple, Conditionals...)"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {GRAMMAR_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] whitespace-nowrap transition border ${
                  selectedLevel === lvl.id
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Topics List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className="p-3 rounded-2xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/5 hover:border-pink-500/40 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-pink-500/15 text-pink-300 border border-pink-500/30">
                      {topic.level}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {topic.category}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition" />
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-200 transition">
                  {topic.title}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {topic.summaryTr}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500 border-t border-white/5">
                  <span>{topic.examples.length} Örnek • Formül Rehberi</span>
                  <span className="text-pink-400 font-semibold">Konuyu İncele →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
