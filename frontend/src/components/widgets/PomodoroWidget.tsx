import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Coffee, 
  Brain 
} from 'lucide-react';
import confetti from 'canvas-confetti';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export const PomodoroWidget: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi' | 'cafe'>('none');

  // Web Audio Context for generating relaxing ambient sounds locally
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const modeDurations: Record<PomodoroMode, number> = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'work') {
        setSessionsCompleted(prev => prev + 1);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeDurations[mode]);
  };

  // Web Audio Synthesizer for Ambient focus noise
  const toggleAmbientSound = (type: 'rain' | 'lofi' | 'cafe') => {
    if (ambientSound === type) {
      stopAmbientSound();
      setAmbientSound('none');
      return;
    }

    stopAmbientSound();
    setAmbientSound(type);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Generate pink/white noise buffer for natural ambient rain/cafe
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 450;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(0);

      noiseNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn('Audio synth warning:', e);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const totalSec = modeDurations[mode];
  const progressPercent = ((totalSec - timeLeft) / totalSec) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full items-center justify-between space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
        <button
          onClick={() => switchMode('work')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'work' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Odaklan (25d)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'shortBreak' ? 'bg-emerald-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Mola (5d)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'longBreak' ? 'bg-purple-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Uzun Mola (15d)
        </button>
      </div>

      {/* Circular Progress & Clock */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-40 h-40 -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="currentColor"
            strokeWidth="8"
            className={mode === 'work' ? 'text-cyan-400' : mode === 'shortBreak' ? 'text-emerald-400' : 'text-purple-400'}
            fill="transparent"
            strokeDasharray={2 * Math.PI * 68}
            strokeDashoffset={2 * Math.PI * 68 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-white font-mono tracking-wider">
            {timeFormatted}
          </span>
          <span className="text-[11px] text-gray-400 font-medium mt-0.5">
            {mode === 'work' ? '🚀 Odak Zamanı' : '☕ Dinlenme'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition"
          title="Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition ${
            isActive
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/30'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" /> Duraklat
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Başlat
            </>
          )}
        </button>
      </div>

      {/* Ambient Sound Generators & Streak */}
      <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500">Ambiyans:</span>
          <button
            onClick={() => toggleAmbientSound('rain')}
            className={`px-2 py-0.5 rounded text-[10px] border transition ${
              ambientSound === 'rain' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-gray-400 border-transparent'
            }`}
          >
            🌧️ Yağmur
          </button>
          <button
            onClick={() => toggleAmbientSound('cafe')}
            className={`px-2 py-0.5 rounded text-[10px] border transition ${
              ambientSound === 'cafe' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 text-gray-400 border-transparent'
            }`}
          >
            ☕ Kafe
          </button>
        </div>

        <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{sessionsCompleted} Oturum</span>
        </div>
      </div>
    </div>
  );
};
