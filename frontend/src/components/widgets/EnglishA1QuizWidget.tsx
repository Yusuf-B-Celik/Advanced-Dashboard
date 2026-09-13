import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  RotateCcw, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Flame,
  Play,
  Settings2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { A1_QUIZ_QUESTIONS, QUIZ_CATEGORIES, QuizQuestion } from '../../data/englishQuizData';

export const EnglishA1QuizWidget: React.FC = () => {
  // Config & Setup State
  const [isStarted, setIsStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Sound / TTS function
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start / Restart Quiz
  const startQuiz = (customQuestions?: QuizQuestion[]) => {
    let pool = customQuestions || [...A1_QUIZ_QUESTIONS];
    if (!customQuestions && selectedCategory !== 'all') {
      pool = pool.filter(q => q.category === selectedCategory);
    }
    
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = customQuestions ? customQuestions.length : Math.min(questionCount, shuffled.length);
    const selected = shuffled.slice(0, count);

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setWrongQuestions([]);
    setIsFinished(false);
    setIsStarted(true);
  };

  const currentQ = activeQuestions[currentIndex];

  // Handle Option Click
  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
    setIsAnswerSubmitted(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 10 + streak * 2);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      // Speak audio automatically on correct
      speakWord(currentQ.targetWord);
    } else {
      setStreak(0);
      setWrongQuestions(prev => [...prev, currentQ]);
    }
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      if (score >= activeQuestions.length * 7) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // Pre-quiz Setup Screen
  if (!isStarted) {
    return (
      <div className="flex flex-col h-full justify-between space-y-4 p-1">
        {/* Header Hero */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                İngilizce A1 Kelime Quiz
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  A1 Elementary
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Temel kelimeleri test et, telaffuzunu dinle ve pekiştir.</p>
            </div>
          </div>
        </div>

        {/* Configuration Boxes */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Question Count Selector */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Soru Sayısı:</span>
              <span className="text-cyan-400 font-bold">{questionCount} Soru</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 10, 15, 20, 25].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    questionCount === cnt
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-gray-300">Konu / Kategori:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {QUIZ_CATEGORIES.slice(0, 6).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left truncate transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => startQuiz()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-black font-extrabold text-xs tracking-wide shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-black" />
          Testi Başlat ({questionCount} Soru)
        </button>
      </div>
    );
  }

  // Quiz Finished / Scorecard Screen
  if (isFinished) {
    const accuracy = Math.round(((activeQuestions.length - wrongQuestions.length) / activeQuestions.length) * 100);

    return (
      <div className="flex flex-col h-full justify-between space-y-3 p-1">
        {/* Results Header */}
        <div className="text-center space-y-1.5 py-2">
          <div className="inline-flex p-3 rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-1">
            <Award className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-base font-extrabold text-white">Quiz Tamamlandı!</h3>
          <p className="text-xs text-gray-400">Tebrikler, A1 seviyesi kelime testini tamamladın.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 block">Toplam Puan</span>
            <strong className="text-base font-black text-cyan-400">{score}</strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 block">Doğruluk</span>
            <strong className={`text-base font-black ${accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              %{accuracy}
            </strong>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 block">En İyi Seri</span>
            <strong className="text-base font-black text-orange-400 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-400" /> {bestStreak}
            </strong>
          </div>
        </div>

        {/* Mistakes Review List */}
        {wrongQuestions.length > 0 ? (
          <div className="flex-1 min-h-0 p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-red-400 sticky top-0 bg-transparent pb-1">
              <span>Yanlış Yapılan Sorular ({wrongQuestions.length}):</span>
              <button
                onClick={() => startQuiz(wrongQuestions)}
                className="text-[10px] underline hover:text-red-300"
              >
                Sadece Bunları Tekrar Çöz
              </button>
            </div>
            {wrongQuestions.map((wq, i) => (
              <div key={i} className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-0.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">{wq.targetWord}</strong>
                  <span className="text-emerald-400 font-semibold">{wq.meaningTr}</span>
                </div>
                <p className="text-[10px] text-gray-400 italic">"{wq.exampleSentence}" ({wq.exampleSentenceTr})</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-xs font-bold text-emerald-300">
              🌟 Mükemmel! Hiçbir soruda yanlış yapmadın.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsStarted(false)}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" /> Ayarlar
          </button>
          <button
            onClick={() => startQuiz()}
            className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz Question View
  return (
    <div className="flex flex-col h-full justify-between space-y-3 p-1">
      {/* Top Status & Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] border border-cyan-500/30">
              Soru {currentIndex + 1} / {activeQuestions.length}
            </span>
            {streak > 1 && (
              <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-orange-400 animate-pulse">
                <Flame className="w-3 h-3 fill-orange-400" /> {streak} Seri
              </span>
            )}
          </div>
          <span className="text-cyan-400 font-bold font-mono text-xs">{score} Puan</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card: No answer giveaway */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 text-[10px] uppercase font-bold tracking-wider">
            {currentQ.category}
          </span>
          {isAnswerSubmitted && (
            <button
              onClick={() => speakWord(currentQ.targetWord)}
              className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center gap-1 text-[11px] font-semibold border border-cyan-500/30"
              title="Kelimeyi Dinle (Pronounce)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">Dinle</span>
            </button>
          )}
        </div>

        <div className="text-center py-2 space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-wide">
            {currentQ.prompt}
          </h2>
          <p className="text-xs text-cyan-300 font-medium">
            {currentQ.subPrompt}
          </p>
        </div>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {currentQ.options.map((opt, i) => {
          let btnStyle = 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-200 border-white/10';
          
          if (isAnswerSubmitted) {
            if (opt === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10';
            } else if (opt === selectedOption) {
              btnStyle = 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-bold';
            } else {
              btnStyle = 'opacity-40 bg-white/[0.01] border-white/5 text-gray-400';
            }
          }

          return (
            <button
              key={i}
              disabled={isAnswerSubmitted}
              onClick={() => handleSelectOption(opt)}
              className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between group ${btnStyle}`}
            >
              <span className="font-semibold">{opt}</span>
              {isAnswerSubmitted && opt === currentQ.correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswerSubmitted && opt === selectedOption && opt !== currentQ.correctAnswer && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next Button if Answered */}
      {isAnswerSubmitted && (
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in">
          <div className="text-[11px] text-gray-300 space-y-0.5">
            <p>
              <strong className="text-cyan-300 font-bold">{currentQ.targetWord}: </strong>
              <span className="text-emerald-300 font-semibold">{currentQ.meaningTr}</span>
              <span className="text-gray-400"> — {currentQ.simpleDefEn}</span>
            </p>
            <p className="italic text-gray-400 text-[10px]">
              "{currentQ.exampleSentence}" ({currentQ.exampleSentenceTr})
            </p>
          </div>
          
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-1.5"
          >
            {currentIndex + 1 === activeQuestions.length ? 'Sonuçları Gör' : 'Sonraki Soru'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
