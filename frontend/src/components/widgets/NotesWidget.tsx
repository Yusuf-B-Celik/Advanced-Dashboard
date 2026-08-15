import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Copy, 
  Check, 
  Save, 
  FileText,
  Sparkles,
  Mic,
  MicOff,
  Bot,
  X
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

export const NotesWidget: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, settings } = useDashboard();
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Note Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleCreateNew = () => {
    const newNote = {
      title: 'Yeni Not ' + (notes.length + 1),
      content: '# Yeni Not\n\nBuraya Markdown formatında notlarınızı yazabilirsiniz...',
      category: 'Genel'
    };
    addNote(newNote);
  };

  const handleAiNoteGenerate = async (topicToUse?: string) => {
    const topic = (topicToUse || aiTopic).trim();
    if (!topic) return;

    try {
      setIsAiGenerating(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Aşağıdaki konu hakkında Türkçe, zengin başlıklı, maddeli, kod bloklu veya tablolu profesyonel bir Markdown not belgesi hazırla:\nKonu: "${topic}"\nİlk satıra # ile başlayan net bir başlık koy.`
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
        const lines = data.reply.split('\n');
        const firstLine = lines.find((l: string) => l.startsWith('#')) || '# ' + topic;
        const cleanTitle = firstLine.replace(/^#+\s*/, '').trim() || topic;

        addNote({
          title: cleanTitle.slice(0, 30),
          content: data.reply,
          category: 'AI Üretimi'
        });

        setAiTopic('');
        setShowAiModal(false);
        setIsPreview(true);
      }
    } catch (err) {
      console.error('AI Note generation error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma (Web Speech API) özelliğini desteklemiyor.');
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
      setAiTopic(transcript);
      handleAiNoteGenerate(transcript);
    };

    recognition.start();
  };

  const handleCopy = () => {
    if (activeNote && navigator.clipboard) {
      navigator.clipboard.writeText(activeNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Note Tabs & Action bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[55%] pb-0.5">
          {notes.map(n => (
            <button
              key={n.id}
              onClick={() => setActiveNoteId(n.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                (activeNote?.id === n.id)
                  ? 'bg-cyan-500 text-black shadow-sm font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              {n.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAiModal(true)}
            className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition"
            title="AI ile Not Üret"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">AI Not</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition"
            title="Yeni Not Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`p-1.5 rounded-lg border transition ${
              isPreview ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
            }`}
            title={isPreview ? 'Düzenleme Modu' : 'Önizleme Modu'}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Metni Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {notes.length > 1 && (
            <button
              onClick={() => activeNote && deleteNote(activeNote.id)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
              title="Notu Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* AI Note Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Bot className="w-4 h-4" />
                <span>MiniMax AI ile Not Hazırla</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300">
                Hakkında not tutmak istediğiniz konuyu yazın veya sesli konuşun. MiniMax-M3 Markdown formatında eksiksiz bir not üretecektir.
              </p>

              <textarea
                rows={3}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder='Örn: "Docker Compose ile PostgreSQL ve Redis ayağa kaldırma rehberi ve env ayarları..."'
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
                  <span>{isListening ? 'Dinleniyor...' : 'Sesle Anlat'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-gray-300 text-xs"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleAiNoteGenerate()}
                    disabled={isAiGenerating || !aiTopic.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    <span>{isAiGenerating ? 'Oluşturuluyor...' : 'Notu Üret'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Editor */}
      {activeNote && (
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
          placeholder="Not Başlığı..."
          className="w-full px-2.5 py-1 text-xs font-bold text-white bg-transparent border-b border-white/5 focus:outline-none focus:border-cyan-500/50"
        />
      )}

      {/* Editor / Preview Body */}
      {activeNote ? (
        <div className="flex-1 overflow-y-auto min-h-[180px]">
          {isPreview ? (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-300">
              <MarkdownViewer content={activeNote.content} />
            </div>
          ) : (
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Notunuzu yazın... (Markdown desteklenir)"
              className="w-full h-full p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 resize-none font-mono leading-relaxed"
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-xs text-gray-500">
          Not bulunamadı. Yeni bir not ekleyin.
        </div>
      )}

      {/* Word Count */}
      {activeNote && (
        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
          <span>{activeNote.content.length} Karakter • {activeNote.content.split(/\s+/).filter(Boolean).length} Kelime</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Save className="w-3 h-3" /> Otomatik Kaydedildi
          </span>
        </div>
      )}
    </div>
  );
};
