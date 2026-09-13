import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  BookOpen, 
  Star, 
  Shuffle, 
  ChevronRight,
  Globe,
  Sparkles,
  Loader2,
  ExternalLink,
  Lightbulb,
  Check,
  RotateCcw
} from 'lucide-react';
import { ENGLISH_DICTIONARY, DICTIONARY_CATEGORIES, DictionaryEntry } from '../../data/englishDictionaryData';
import { useDashboard } from '../../contexts/DashboardContext';

interface OnlineLookupData {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
  }>;
  aiExplanation?: {
    level?: string;
    partOfSpeech?: string;
    simpleDefEn?: string;
    meaningTr?: string;
    exampleEn?: string;
    exampleTr?: string;
    funTipTr?: string;
  };
}

export const EnglishDictionaryWidget: React.FC = () => {
  const { settings } = useDashboard();

  // Active View Tab: 'curated' | 'online' | 'flashcard'
  const [activeTab, setActiveTab] = useState<'curated' | 'online' | 'flashcard'>('curated');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'A1' | 'A2'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Online Live Lookup State
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineResult, setOnlineResult] = useState<OnlineLookupData | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [aiExplaining, setAiExplaining] = useState(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('english_dict_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('english_dict_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Audio Pronunciation Player
  const playAudioOrSpeak = (word: string, audioUrl?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (audioUrl && audioUrl.trim().length > 0) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {
          speakFallback(word);
        });
        return;
      } catch {
        // fallback
      }
    }
    speakFallback(word);
  };

  const speakFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered Local Words
  const filteredWords = useMemo(() => {
    return ENGLISH_DICTIONARY.filter(item => {
      if (onlyFavorites && !favorites.includes(item.id)) return false;
      if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.meaningTr.toLowerCase().includes(q) ||
          item.definitionEn.toLowerCase().includes(q) ||
          item.exampleEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, selectedLevel, selectedCategory, favorites, onlyFavorites]);

  // Online Lookup Handler
  const handleOnlineSearch = async (wordToSearch?: string) => {
    const target = (wordToSearch || onlineQuery || searchTerm).trim();
    if (!target) return;

    try {
      setOnlineLoading(true);
      setOnlineError(null);
      setActiveTab('online');
      setOnlineQuery(target);

      // Fetch from backend proxy or direct Free Dictionary API
      let resData: any = null;
      try {
        const res = await fetch(`/api/dictionary/lookup?word=${encodeURIComponent(target)}`);
        const json = await res.json();
        if (json.success && json.data) {
          resData = json.data;
        }
      } catch {
        // Direct client-side fetch fallback
        const fallbackRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(target)}`);
        const fallbackJson = await fallbackRes.json();
        if (Array.isArray(fallbackJson) && fallbackJson.length > 0) {
          const item = fallbackJson[0];
          let audio = '';
          if (Array.isArray(item.phonetics)) {
            for (const p of item.phonetics) {
              if (p.audio) { audio = p.audio; break; }
            }
          }
          resData = {
            word: item.word,
            phonetic: item.phonetic || item.phonetics?.[0]?.text,
            audioUrl: audio,
            meanings: item.meanings || []
          };
        }
      }

      if (resData) {
        setOnlineResult(resData);
        // Automatically request Turkish explanation & examples
        triggerAiExplanation(resData.word, resData);
      } else {
        setOnlineError(`"${target}" için internet sözlüğünde sonuç bulunamadı.`);
        setOnlineResult(null);
      }
    } catch (err: any) {
      setOnlineError(err.message || 'İnternet sözlük araması sırasında bir hata oluştu.');
      setOnlineResult(null);
    } finally {
      setOnlineLoading(false);
    }
  };

  // Generate Turkish explanation & examples
  const triggerAiExplanation = async (word: string, currentData?: OnlineLookupData) => {
    try {
      setAiExplaining(true);
      const res = await fetch('/api/dictionary/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel,
          planType: settings.minimaxPlanType,
          apiProtocol: settings.minimaxProtocol
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOnlineResult(prev => prev ? ({ ...prev, aiExplanation: json.data }) : currentData ? ({ ...currentData, aiExplanation: json.data }) : null);
      }
    } catch (e) {
      console.warn('AI explain fallback:', e);
    } finally {
      setAiExplaining(false);
    }
  };

  // Flashcard handler
  const nextRandomCard = () => {
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    setCardIndex(Math.floor(Math.random() * filteredWords.length));
  };

  const currentFlashcard = filteredWords[cardIndex % Math.max(1, filteredWords.length)] || filteredWords[0];

  return (
    <div className="flex flex-col h-full space-y-2.5 p-1">
      {/* Top Header & Tab Controls */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>English Dictionary</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Canlı İnternet & A1-A2
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">
              İnternetten canlı kelime çekme, Türkçe açıklamalar ve örnek cümleler
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOnlyFavorites(prev => !prev)}
            className={`p-1.5 rounded-xl border transition text-xs ${
              onlyFavorites 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
            }`}
            title="Favori Kelimelerim"
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          
          <div className="p-0.5 rounded-xl bg-white/5 border border-white/10 flex text-[10px]">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                activeTab === 'curated' ? 'bg-cyan-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kütüphane
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === 'online' ? 'bg-cyan-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>İnternet</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('flashcard');
                setIsFlipped(false);
              }}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                activeTab === 'flashcard' ? 'bg-cyan-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kartlar
            </button>
          </div>
        </div>
      </div>

      {/* --- TAB 1: CURATED A1-A2 LIBRARY --- */}
      {activeTab === 'curated' && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2">
          {/* Search bar with quick web lookup trigger */}
          <div className="relative shrink-0 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="A1-A2 kelime veya anlam ara..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
              />
            </div>
            {searchTerm.trim() && (
              <button
                onClick={() => handleOnlineSearch(searchTerm)}
                className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition flex items-center gap-1 shrink-0"
                title="İnternet Sözlüğünde Ara"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">İnternette Ara</span>
              </button>
            )}
          </div>

          {/* Level & Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {(['all', 'A1', 'A2'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition border ${
                  selectedLevel === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5'
                }`}
              >
                {lvl === 'all' ? 'Tüm Seviyeler' : `Seviye ${lvl}`}
              </button>
            ))}

            <div className="w-[1px] h-4 bg-white/10 shrink-0" />

            {DICTIONARY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* List View */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {filteredWords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                <BookOpen className="w-8 h-8 opacity-40" />
                <p className="text-xs font-semibold">Kütüphanede bulunamadı. İnternet sözlüğünde aramak ister misiniz?</p>
                {searchTerm.trim() && (
                  <button
                    onClick={() => handleOnlineSearch(searchTerm)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" /> "{searchTerm}" Kelimesini İnternetten Çek
                  </button>
                )}
              </div>
            ) : (
              filteredWords.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                        {item.word}
                      </h4>
                      {item.phonetic && (
                        <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                          {item.phonetic}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {item.level}
                      </span>
                      <span className="text-[9px] text-gray-400 italic">
                        ({item.type})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => playAudioOrSpeak(item.word, undefined, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 transition"
                        title="Seslendir"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 transition"
                        title="Favori"
                      >
                        <Star className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-cyan-200/90 leading-snug">
                      <strong className="text-gray-400 font-normal">EN: </strong>
                      {item.definitionEn}
                    </p>
                    <p className="text-emerald-300 font-semibold">
                      <strong className="text-gray-400 font-normal">TR: </strong>
                      {item.meaningTr}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] space-y-0.5">
                    <p className="text-gray-200 italic">"{item.exampleEn}"</p>
                    <p className="text-gray-400 text-[10px]">{item.exampleTr}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: LIVE INTERNET DICTIONARY & AI EXPLANATION --- */}
      {activeTab === 'online' && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2.5">
          {/* Online Search Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleOnlineSearch(); }} 
            className="flex items-center gap-1.5 shrink-0"
          >
            <div className="relative flex-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={onlineQuery}
                onChange={(e) => setOnlineQuery(e.target.value)}
                placeholder="İnternetten çekilecek kelimeyi yazın (Örn: resilience, serendipity, apple)..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-cyan-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={onlineLoading || !onlineQuery.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
            >
              {onlineLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>İnternetten Çek</span>
            </button>
          </form>

          {/* Online Results View */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
            {onlineLoading ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-gray-300 font-semibold">
                  İnternet sözlüğünden kelime ve tanımlar çekiliyor...
                </p>
              </div>
            ) : onlineError ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                <p className="text-xs text-rose-300 font-medium">{onlineError}</p>
                <p className="text-[11px] text-gray-400">Yazımı kontrol edip tekrar arayabilirsiniz.</p>
              </div>
            ) : onlineResult ? (
              <div className="space-y-2.5 animate-in fade-in">
                {/* Word Hero Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-cyan-500/10 to-transparent border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white capitalize">
                        {onlineResult.word}
                      </h2>
                      {onlineResult.phonetic && (
                        <span className="text-xs text-cyan-300 font-mono">
                          {onlineResult.phonetic}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      İnternet Sözlük Verisi (Oxford / Wiktionary API)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => playAudioOrSpeak(onlineResult.word, onlineResult.audioUrl)}
                      className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition flex items-center gap-1 text-xs font-bold"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Telaffuz</span>
                    </button>
                    <button
                      onClick={() => triggerAiExplanation(onlineResult.word)}
                      disabled={aiExplaining}
                      className="p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/40 transition flex items-center gap-1 text-xs font-bold"
                      title="AI ile Türkçe Açıklama & Örnek Cümle Üret"
                    >
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>{aiExplaining ? 'Üretiliyor...' : 'AI Açıklama'}</span>
                    </button>
                  </div>
                </div>

                {/* AI Turkish Explanation Card */}
                {onlineResult.aiExplanation && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>Türkçe Açıklama & Özel Örnek Cümle:</span>
                      </span>
                      {onlineResult.aiExplanation.level && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-200 text-[10px]">
                          {onlineResult.aiExplanation.level}
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-emerald-300 font-bold text-sm">
                        TR: {onlineResult.aiExplanation.meaningTr}
                      </p>
                      {onlineResult.aiExplanation.simpleDefEn && (
                        <p className="text-cyan-200/90 text-xs">
                          EN: {onlineResult.aiExplanation.simpleDefEn}
                        </p>
                      )}
                    </div>

                    {onlineResult.aiExplanation.exampleEn && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                        <p className="text-white font-medium italic">
                          "{onlineResult.aiExplanation.exampleEn}"
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          {onlineResult.aiExplanation.exampleTr}
                        </p>
                      </div>
                    )}

                    {onlineResult.aiExplanation.funTipTr && (
                      <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{onlineResult.aiExplanation.funTipTr}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Meanings from Internet Dictionary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300">İngilizce Tanımlar & Örnekler:</h4>
                  {onlineResult.meanings.map((meaning, mIdx) => (
                    <div 
                      key={mIdx}
                      className="p-3 rounded-2xl bg-white/[0.025] border border-white/5 space-y-2"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                        {meaning.partOfSpeech}
                      </span>

                      <div className="space-y-2 text-xs">
                        {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                          <div key={dIdx} className="space-y-1 pl-2 border-l-2 border-cyan-500/30">
                            <p className="text-gray-200">
                              <strong className="text-gray-400">{dIdx + 1}. </strong>
                              {def.definition}
                            </p>
                            {def.example && (
                              <p className="text-gray-400 text-[11px] italic">
                                Example: "{def.example}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                          <span className="text-gray-500">Eş Anlamlılar:</span>
                          {meaning.synonyms.slice(0, 5).map((syn, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleOnlineSearch(syn)}
                              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-300 transition"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
                <Globe className="w-8 h-8 opacity-40 text-cyan-400" />
                <p className="text-xs font-semibold">
                  İnternetten kelime çekmek için yukarıdaki kutuya bir kelime yazıp arayın.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {['innovation', 'resilience', 'curiosity', 'adventure', 'harmony'].map((w) => (
                    <button
                      key={w}
                      onClick={() => handleOnlineSearch(w)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-cyan-300 border border-white/5"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: FLASHCARD MODE --- */}
      {activeTab === 'flashcard' && currentFlashcard && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div 
            onClick={() => setIsFlipped(prev => !prev)}
            className="flex-1 min-h-[220px] p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/15 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-cyan-500/40 transition-all select-none relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentFlashcard.level}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] uppercase font-bold text-gray-300">
                  {currentFlashcard.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => playAudioOrSpeak(currentFlashcard.word, undefined, e)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                  title="Seslendir"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => toggleFavorite(currentFlashcard.id, e)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                  title="Favoriye Ekle"
                >
                  <Star className={`w-4 h-4 ${favorites.includes(currentFlashcard.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            <div className="text-center py-4 space-y-2">
              <h2 className="text-2xl font-black text-white tracking-wide">
                {currentFlashcard.word}
              </h2>
              {currentFlashcard.phonetic && (
                <span className="text-xs text-gray-400 font-mono block">
                  {currentFlashcard.phonetic}
                </span>
              )}

              {isFlipped ? (
                <div className="space-y-2 pt-2 animate-in fade-in zoom-in-95">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                    <strong className="text-sm text-emerald-300 block font-bold">
                      {currentFlashcard.meaningTr}
                    </strong>
                  </div>
                  <p className="text-xs text-gray-300 italic">
                    "{currentFlashcard.exampleEn}"
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {currentFlashcard.exampleTr}
                  </p>
                </div>
              ) : (
                <div className="pt-3">
                  <p className="text-xs text-cyan-300 font-medium">
                    {currentFlashcard.definitionEn}
                  </p>
                  <span className="text-[10px] text-gray-500 block mt-2">
                    (Kartı çevirmek ve Türkçe karşılığını görmek için tıkla)
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-gray-400 border-t border-white/5 pt-2">
              Kategori: <span className="text-gray-200 capitalize font-medium">{currentFlashcard.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={nextRandomCard}
              className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" /> Rastgele Kelime
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(prev => prev + 1);
              }}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
            >
              Sonraki Kart <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
