import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Sparkles,
  Mic,
  MicOff,
  Bot,
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDashboard } from '../../contexts/DashboardContext';

export const HabitTrackerWidget: React.FC = () => {
  const { habits, toggleHabitToday, addHabit, deleteHabit, settings } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(7);

  // AI Habit State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiHabitPrompt, setAiHabitPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (id: string) => {
    toggleHabitToday(id);
    const habit = habits.find(h => h.id === id);
    if (habit && !habit.completedDates.includes(todayStr)) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({ name: name.trim(), targetDaysPerWeek: targetDays });
    setName('');
    setShowAdd(false);
  };

  const handleAiHabitAdd = async (textToProcess?: string) => {
    const input = (textToProcess || aiHabitPrompt).trim();
    if (!input) return;

    try {
      setIsAiProcessing(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Aşağıdaki kullanıcı cümlesinden alışkanlık hedefini çıkar ve SADECE saf bir JSON döndür:\n"${input}"\n\nBeklenen JSON formatı:\n{"name": "Alışkanlık başlığı (örn: Günde 2L Su İç)", "targetDaysPerWeek": 7}`
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
        let cleanJson = data.reply.trim();
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleanJson);

        addHabit({
          name: parsed.name || input,
          targetDaysPerWeek: parsed.targetDaysPerWeek || 7
        });

        setAiHabitPrompt('');
        setShowAiModal(false);
        confetti({ particleCount: 30, spread: 45 });
      }
    } catch (err) {
      console.error('AI habit creation error:', err);
      addHabit({ name: input, targetDaysPerWeek: 7 });
      setAiHabitPrompt('');
      setShowAiModal(false);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiHabitPrompt(transcript);
      handleAiHabitAdd(transcript);
    };

    recognition.start();
  };

  // Get last 5 days
  const lastDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    return d.toISOString().split('T')[0];
  });

  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white">Bugünkü Başarı: %{completionPercentage}</span>
          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAiModal(true)}
            className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition"
            title="AI ile Konuşarak Alışkanlık Ekle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">AI Ekle</span>
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition"
            title="Manuel Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Habits List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[190px]">
        {habits.map(h => {
          const isDoneToday = h.completedDates.includes(todayStr);
          return (
            <div
              key={h.id}
              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => handleToggle(h.id)}
                  className={`p-1 rounded-lg transition ${
                    isDoneToday ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isDoneToday ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div>
                  <span className={`text-xs font-bold block truncate ${isDoneToday ? 'line-through text-gray-400' : 'text-gray-100'}`}>
                    {h.name}
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {h.completedDates.length} Gün Tamamlandı
                  </span>
                </div>
              </div>

              {/* 5-day mini dots */}
              <div className="flex items-center gap-1 shrink-0">
                {lastDays.map(date => {
                  const done = h.completedDates.includes(date);
                  return (
                    <div
                      key={date}
                      className={`w-2 h-2 rounded-full ${done ? 'bg-cyan-400 shadow-xs shadow-cyan-400' : 'bg-white/10'}`}
                      title={date}
                    />
                  );
                })}

                <button
                  onClick={() => deleteHabit(h.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition ml-1"
                  title="Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Habit Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Bot className="w-4 h-4" />
                <span>AI ile Alışkanlık Planla</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300">
                Kazanmak istediğiniz alışkanlığı ve haftalık hedefinizi söyleyin veya yazın.
              </p>

              <textarea
                rows={2}
                value={aiHabitPrompt}
                onChange={(e) => setAiHabitPrompt(e.target.value)}
                placeholder='Örn: "Haftada 4 gün spor salonuna git ve ağırlık çalış..."'
                className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                    isListening ? 'bg-red-500 text-white animate-pulse border-red-400' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isListening ? 'Dinleniyor...' : 'Sesle Konuş'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-gray-300 text-xs"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleAiHabitAdd()}
                    disabled={isAiProcessing || !aiHabitPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
                    <span>{isAiProcessing ? 'Planlanıyor...' : 'Alışkanlığı Ekle'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white">Yeni Alışkanlık Ekle</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Alışkanlık Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 30 Sayfa Kitap Oku"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-300 text-xs hover:bg-white/10"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
