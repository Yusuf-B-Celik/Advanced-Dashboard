import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Mic,
  MicOff,
  X,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDashboard } from '../../contexts/DashboardContext';
import { TaskItem } from '../../types';

export const KanbanWidget: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, settings } = useDashboard();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [tagInput, setTagInput] = useState('');

  // AI Natural Language Add State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const columns: Array<{ id: TaskItem['status']; title: string; color: string; border: string }> = [
    { id: 'todo', title: 'Yapılacaklar', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    { id: 'inprogress', title: 'Devam Edenler', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' },
    { id: 'done', title: 'Tamamlananlar', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'todo',
      priority,
      tags: tags.length > 0 ? tags : ['Genel']
    });

    setTitle('');
    setDescription('');
    setTagInput('');
    setShowAddModal(false);
  };

  const handleAiTaskAdd = async (textToProcess?: string) => {
    const input = (textToProcess || aiPrompt).trim();
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
              content: `Aşağıdaki kullanıcı talebinden bir görev nesnesi çıkar ve SADECE saf bir JSON döndür (markdown backtick kullanma, sadece JSON):\n"${input}"\n\nBeklenen JSON formatı:\n{"title": "Kısa ve net görev başlığı", "description": "Detaylı açıklama", "priority": "low" | "medium" | "high", "tags": ["etiket1", "etiket2"]}`
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

        addTask({
          title: parsed.title || input,
          description: parsed.description,
          status: 'todo',
          priority: (['low', 'medium', 'high'].includes(parsed.priority) ? parsed.priority : 'medium') as any,
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI-Gorev']
        });

        setAiPrompt('');
        setShowAiModal(false);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('AI task creation error:', err);
      // Fallback
      addTask({
        title: input,
        status: 'todo',
        priority: 'medium',
        tags: ['Hızlı-Gorev']
      });
      setAiPrompt('');
      setShowAiModal(false);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma (Web Speech API) özelliğini desteklemiyor. Lütfen metin olarak yazın.');
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
      setAiPrompt(transcript);
      handleAiTaskAdd(transcript);
    };

    recognition.start();
  };

  const handleMove = (task: TaskItem, newStatus: TaskItem['status']) => {
    updateTaskStatus(task.id, newStatus);
    if (newStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#10b981', '#ff007f']
      });
    }
  };

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'high':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">Yüksek</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Orta</span>;
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Düşük</span>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Toplam <strong>{tasks.length}</strong> görev • {tasks.filter(t => t.status === 'done').length} tamamlandı
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition"
            title="Konuşarak veya Doğal Dille Görev Ekle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI ile Ekle</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manuel Ekle</span>
          </button>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`p-3 rounded-2xl bg-white/[0.02] border ${col.border} flex flex-col space-y-2.5 min-h-[220px]`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-mono text-gray-400">{colTasks.length}</span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 space-y-2 group transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-100 leading-snug">
                        {task.title}
                      </h4>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((t, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1 ml-auto">
                        {col.id === 'inprogress' && (
                          <button
                            onClick={() => handleMove(task, 'todo')}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                            title="Yapılacaklara Al"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'todo' && (
                          <button
                            onClick={() => handleMove(task, 'inprogress')}
                            className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold flex items-center gap-0.5"
                          >
                            <span>Başla</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'inprogress' && (
                          <button
                            onClick={() => handleMove(task, 'done')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-0.5"
                          >
                            <span>Bitir</span>
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'done' && (
                          <button
                            onClick={() => handleMove(task, 'inprogress')}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                            title="Geri Al"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Quick Task Add Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Bot className="w-4 h-4" />
                <span>AI ile Konuşarak Görev Ekle</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300">
                Görevi doğal dille yazın veya mikrofona konuşun. MiniMax-M3 otomatik olarak başlık, öncelik ve etiketleri analiz edecektir.
              </p>

              <div className="relative">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder='Örn: "Yarın öğlene kadar sunum slaytlarını bitir ve yüksek öncelikli olarak işaretle..."'
                  className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

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
                    onClick={() => handleAiTaskAdd()}
                    disabled={isAiProcessing || !aiPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
                    <span>{isAiProcessing ? 'Analiz Ediliyor...' : 'Görevi Oluştur'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Yeni Görev Oluştur</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Görev Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Haftalık haber bültenini hazırla"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Açıklama (İsteğe bağlı)</label>
                <textarea
                  rows={2}
                  placeholder="Detaylar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Öncelik</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Etiketler (Virgülle)</label>
                  <input
                    type="text"
                    placeholder="Haber, Finans, Kod"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition"
                >
                  Görevi Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
