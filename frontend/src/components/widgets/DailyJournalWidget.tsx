import React, { useState } from 'react';
import { BookOpen, Sparkles, Smile, Zap, Coffee, Frown, CheckCircle, Bot } from 'lucide-react';
import { JournalEntry } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';

const MOODS = [
  { id: 'great', emoji: '🤩', label: 'Harika' },
  { id: 'productive', emoji: '🚀', label: 'Verimli' },
  { id: 'happy', emoji: '😊', label: 'Huzurlu' },
  { id: 'tired', emoji: '😴', label: 'Yorgun' },
  { id: 'stressed', emoji: '🤯', label: 'Stresli' },
] as const;

export const DailyJournalWidget: React.FC = () => {
  const { settings } = useDashboard();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('dashboard_journal_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const todayEntry = entries.find(e => e.date === todayStr);

  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>(todayEntry?.mood || 'productive');
  const [note, setNote] = useState(todayEntry?.note || '');
  const [isAiReflecting, setIsAiReflecting] = useState(false);
  const [aiThought, setAiThought] = useState(todayEntry?.aiReflection || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const updated = entries.filter(e => e.date !== todayStr);
    const newEntry: JournalEntry = {
      id: todayStr,
      date: todayStr,
      mood: selectedMood,
      note,
      aiReflection: aiThought
    };
    const finalEntries = [newEntry, ...updated];
    setEntries(finalEntries);
    localStorage.setItem('dashboard_journal_entries', JSON.stringify(finalEntries));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAiReflect = async () => {
    if (!note.trim()) return;
    try {
      setIsAiReflecting(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Kullanıcı bugünkü günlüğüne şu notu düştü (Ruh Hali: ${selectedMood}): "${note}". 
Kullanıcıya moral veren, bilgece ve ilham dolu 2 cümlelik samimi bir geri bildirim ve tavsiye yaz.`
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
        setAiThought(data.reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiReflecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white">Günün Mikro Günlüğü & Mood</span>
        </div>
        <span className="text-[10px] text-gray-400">
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
        </span>
      </div>

      {/* Mood Selector */}
      <div className="flex items-center justify-between gap-1 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
        {MOODS.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMood(m.id)}
            className={`flex-1 py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 transition ${
              selectedMood === m.id
                ? 'bg-purple-500/20 border border-purple-500/50 scale-105'
                : 'hover:bg-white/5 opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-base sm:text-lg">{m.emoji}</span>
            <span className="text-[9px] font-bold text-gray-300 truncate">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Note Area */}
      <div className="flex-1 flex flex-col space-y-2">
        <textarea
          rows={3}
          placeholder="Bugün nasıl geçti? Aklındaki bir düşünce veya başardığın bir şey yaz..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full flex-1 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
        />

        {aiThought && (
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2 animate-in fade-in">
            <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px] italic">{aiThought}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button
          onClick={handleAiReflect}
          disabled={isAiReflecting || !note.trim()}
          className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiReflecting ? 'animate-spin' : ''}`} />
          <span>{isAiReflecting ? 'Düşünüyor...' : 'AI Yorumu Al'}</span>
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition flex items-center gap-1"
        >
          {savedSuccess && <CheckCircle className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? 'Kaydedildi!' : 'Günlüğü Kaydet'}</span>
        </button>
      </div>
    </div>
  );
};
