import React, { useState, useRef } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Disc, 
  ExternalLink,
  Search
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  color: string;
}

const STATIONS: Station[] = [
  {
    id: 'lofi',
    name: 'Lofi Study Beats 24/7',
    genre: 'Chill / Odaklanma',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'powerturk',
    name: 'Power Türk',
    genre: 'Türkçe Pop Hits',
    streamUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio',
    color: 'from-rose-500 to-amber-500'
  },
  {
    id: 'powerfm',
    name: 'Power FM',
    genre: 'Yabancı Hit & Pop',
    streamUrl: 'https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'joyfm',
    name: 'Joy FM',
    genre: 'Yabancı Slow & Akustik',
    streamUrl: 'https://listen.powerapp.com.tr/joyfm/mpeg/icecast.audio',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'joyturk',
    name: 'Joy Türk',
    genre: 'Türkçe Akustik & Slow',
    streamUrl: 'https://listen.powerapp.com.tr/joyturk/mpeg/icecast.audio',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'fenomen',
    name: 'Radyo Fenomen',
    genre: 'Top 40 Dance Hits',
    streamUrl: 'https://listen.powerapp.com.tr/fenomen/mpeg/icecast.audio',
    color: 'from-emerald-500 to-teal-700'
  },
  {
    id: 'trtradyo1',
    name: 'TRT Radyo 1',
    genre: 'Haber & Kültür & Sanat',
    streamUrl: 'https://rad-trt.medya.trt.com.tr/trtradyo1',
    color: 'from-red-600 to-red-800'
  },
  {
    id: 'trtradyo3',
    name: 'TRT Radyo 3',
    genre: 'Klasik Müzik & Caz',
    streamUrl: 'https://rad-trt.medya.trt.com.tr/trtradyo3',
    color: 'from-amber-600 to-yellow-700'
  },
  {
    id: 'trtfm',
    name: 'TRT FM',
    genre: 'Günün Şarkıları & Eğlence',
    streamUrl: 'https://rad-trt.medya.trt.com.tr/trtfm',
    color: 'from-blue-600 to-indigo-800'
  },
  {
    id: 'ambient',
    name: 'Deep Ambient Relax',
    genre: 'Meditasyon / Uyku',
    streamUrl: 'https://stream.zeno.fm/cv8ydp14y4zuv',
    color: 'from-teal-500 to-cyan-700'
  },
  {
    id: 'chillout',
    name: 'Ibiza Chillout Lounge',
    genre: 'Lounge / Deep House',
    streamUrl: 'https://stream.zeno.fm/99m1v5c3z8uv',
    color: 'from-violet-600 to-fuchsia-700'
  },
  {
    id: 'synthwave',
    name: 'Retro Synthwave Radio',
    genre: '80s Electro / Cyberpunk',
    streamUrl: 'https://stream.zeno.fm/e29wv44m7h0uv',
    color: 'from-pink-600 to-purple-800'
  }
];

export const RadioWidget: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<Station>(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredStations = STATIONS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.genre.toLowerCase().includes(search.toLowerCase())
  );

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setErrorMsg('');
      audioRef.current.src = currentStation.streamUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Radio stream error:', err);
          setErrorMsg('Yayın akışı yüklenemedi. Farklı bir radyo seçin.');
          setIsPlaying(false);
        });
    }
  };

  const selectStation = (st: Station) => {
    setCurrentStation(st);
    setErrorMsg('');
    if (audioRef.current) {
      audioRef.current.src = st.streamUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setErrorMsg('Yayın başlatılamadı.');
        });
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-3">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setErrorMsg('Yayın akışı kesildi veya desteklenmiyor.');
        }}
      />

      {/* Now Playing Banner */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentStation.color} text-white relative overflow-hidden shadow-lg`}>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black truncate">{currentStation.name}</h4>
              <span className="text-[11px] text-white/80">{currentStation.genre}</span>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-1 h-6">
            <div className={`w-1 bg-white rounded-full ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? '18px' : '4px' }} />
            <div className={`w-1 bg-white rounded-full ${isPlaying ? 'animate-bounce' : 'h-1'}`} style={{ height: isPlaying ? '24px' : '4px' }} />
            <div className={`w-1 bg-white rounded-full ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? '12px' : '4px' }} />
            <div className={`w-1 bg-white rounded-full ${isPlaying ? 'animate-bounce' : 'h-1'}`} style={{ height: isPlaying ? '20px' : '4px' }} />
          </div>
        </div>

        {errorMsg && (
          <div className="text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded mt-2 font-mono">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Play Controls & Volume */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'Durdur' : 'Canlı Dinle'}</span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Radyo veya tür ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-7 pr-3 py-1 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Stations List */}
      <div className="space-y-1 pt-1 border-t border-white/5 overflow-y-auto max-h-[160px] pr-1">
        {filteredStations.map((st) => (
          <button
            key={st.id}
            onClick={() => selectStation(st)}
            className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition ${
              currentStation.id === st.id
                ? 'bg-white/10 text-cyan-300 font-bold border border-cyan-500/30'
                : 'hover:bg-white/5 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{st.name}</span>
            </div>
            <span className="text-[10px] text-gray-500 shrink-0">{st.genre}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
