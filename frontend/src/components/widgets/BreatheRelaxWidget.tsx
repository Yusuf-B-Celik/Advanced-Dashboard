import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, Sparkles, Heart } from 'lucide-react';

type BreathingPattern = 'box' | '478' | 'calm';

export const BreatheRelaxWidget: React.FC = () => {
  const [pattern, setPattern] = useState<BreathingPattern>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Nefes Al' | 'Tut' | 'Nefes Ver' | 'Dinlen'>('Nefes Al');
  const [counter, setCounter] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        setCounter(prev => {
          if (prev > 1) return prev - 1;

          // Transition phase
          if (pattern === 'box') {
            // Box: Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s
            if (phase === 'Nefes Al') { setPhase('Tut'); return 4; }
            if (phase === 'Tut') { setPhase('Nefes Ver'); return 4; }
            if (phase === 'Nefes Ver') { setPhase('Dinlen'); return 4; }
            if (phase === 'Dinlen') {
              setCycleCount(c => c + 1);
              setPhase('Nefes Al');
              return 4;
            }
          } else if (pattern === '478') {
            // 4-7-8: Inhale 4s -> Hold 7s -> Exhale 8s
            if (phase === 'Nefes Al') { setPhase('Tut'); return 7; }
            if (phase === 'Tut') { setPhase('Nefes Ver'); return 8; }
            if (phase === 'Nefes Ver') {
              setCycleCount(c => c + 1);
              setPhase('Nefes Al');
              return 4;
            }
          } else {
            // Calm: Inhale 4s -> Exhale 6s
            if (phase === 'Nefes Al') { setPhase('Nefes Ver'); return 6; }
            if (phase === 'Nefes Ver') {
              setCycleCount(c => c + 1);
              setPhase('Nefes Al');
              return 4;
            }
          }
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, pattern]);

  const toggleActive = () => {
    if (!isActive) {
      setPhase('Nefes Al');
      setCounter(4);
    }
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase('Nefes Al');
    setCounter(4);
    setCycleCount(0);
  };

  const getCircleScale = () => {
    if (!isActive) return 'scale-90';
    if (phase === 'Nefes Al') return 'scale-125';
    if (phase === 'Tut') return 'scale-125 ring-4 ring-cyan-400/40';
    if (phase === 'Nefes Ver') return 'scale-90';
    return 'scale-90';
  };

  return (
    <div className="flex flex-col h-full items-center justify-between space-y-3 py-1">
      {/* Pattern Selector */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>Nefes & Odaklanma Molası</span>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => { setPattern('box'); resetSession(); }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${pattern === 'box' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}
          >
            Kare (4-4-4-4)
          </button>
          <button
            onClick={() => { setPattern('478'); resetSession(); }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${pattern === '478' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}
          >
            4-7-8 Rahatlama
          </button>
        </div>
      </div>

      {/* Animated Breathing Orb */}
      <div className="relative flex items-center justify-center my-4">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-purple-500/30 border border-cyan-400/50 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out shadow-2xl shadow-cyan-500/20 ${getCircleScale()}`}
        >
          <span className="text-xs font-extrabold text-cyan-300 tracking-wider uppercase mb-0.5">
            {isActive ? phase : 'Başlamaya Hazır'}
          </span>
          <span className="text-2xl font-black text-white font-mono">
            {isActive ? counter : '4'}
          </span>
        </div>
      </div>

      {/* Cycle Stats & Controls */}
      <div className="flex items-center justify-between w-full pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          <span>Tamamlanan Tur: <strong className="text-white">{cycleCount}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSession}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleActive}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
          >
            {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isActive ? 'Duraklat' : 'Başlat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
