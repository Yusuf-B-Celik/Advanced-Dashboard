import React, { useState } from 'react';
import { 
  Volume2, 
  MessageSquare, 
  Lightbulb, 
  Shuffle, 
  ChevronRight
} from 'lucide-react';
import { DAILY_IDIOMS } from '../../data/englishExtraData';

export const EnglishDailySpeakingWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredList = DAILY_IDIOMS;
  const currentItem = filteredList[currentIndex % Math.max(1, filteredList.length)] || DAILY_IDIOMS[0];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextRandom = () => {
    setCurrentIndex(Math.floor(Math.random() * filteredList.length));
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-2.5 p-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Daily English & Idioms</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Günün İfadesi
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">
              Deyimler, phrasal verbler ve diyalog pratikleri
            </span>
          </div>
        </div>

        <button
          onClick={nextRandom}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1 text-[11px]"
          title="Rastgele Deyim"
        >
          <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] hidden sm:inline">Rastgele</span>
        </button>
      </div>

      {/* Main Phrase Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-white/[0.05] to-emerald-500/[0.05] border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {currentItem.type.replace('_', ' ')}
          </span>
          <button
            onClick={() => speak(currentItem.phrase)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 transition flex items-center gap-1 text-[10px]"
          >
            <Volume2 className="w-3.5 h-3.5" /> Dinle
          </button>
        </div>

        <div className="text-center space-y-1 py-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            "{currentItem.phrase}"
          </h2>
          <p className="text-xs text-emerald-300 font-semibold">
            {currentItem.meaningTr}
          </p>
          <p className="text-[11px] text-gray-400 italic">
            Definition: {currentItem.meaningEn}
          </p>
        </div>

        {/* Dialog Example Box */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Günlük Konuşma Örneği:</span>
          </div>
          <div className="space-y-1 pl-2 border-l-2 border-cyan-500/40 text-[11px]">
            <p className="text-gray-300">
              <strong className="text-cyan-300">A: </strong>
              {currentItem.exampleDialog.speakerA}
            </p>
            <p className="text-gray-300">
              <strong className="text-emerald-300">B: </strong>
              {currentItem.exampleDialog.speakerB}
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-0.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{currentItem.tipTr}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredList.length - 1))}
          className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition"
        >
          ← Önceki
        </button>
        <button
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition flex items-center justify-center gap-1"
        >
          Sonraki İfade <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
