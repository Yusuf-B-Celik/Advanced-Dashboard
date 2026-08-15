import React, { useState } from 'react';
import { Code2, Copy, Check, Plus, Trash2, Tag, Terminal } from 'lucide-react';
import { CodeSnippet } from '../../types';

const INITIAL_SNIPPETS: CodeSnippet[] = [
  {
    id: '1',
    title: 'Docker Temizleme Komutları',
    language: 'bash',
    tags: ['Docker', 'DevOps'],
    code: 'docker system prune -a --volumes -f'
  },
  {
    id: '2',
    title: 'Git Son Commit Mesajını Değiştir',
    language: 'bash',
    tags: ['Git'],
    code: 'git commit --amend -m "Yeni commit mesajı"'
  },
  {
    id: '3',
    title: 'TypeScript Debounce Fonksiyonu',
    language: 'typescript',
    tags: ['TypeScript', 'Frontend'],
    code: `export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`
  },
  {
    id: '4',
    title: 'FastAPI CORS Ayarı',
    language: 'python',
    tags: ['Python', 'Backend'],
    code: `from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])`
  }
];

export const SnippetVaultWidget: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    const saved = localStorage.getItem('dashboard_code_snippets');
    return saved ? JSON.parse(saved) : INITIAL_SNIPPETS;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Tümü');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('bash');
  const [tagInput, setTagInput] = useState('');

  const allTags = ['Tümü', ...Array.from(new Set(snippets.flatMap(s => s.tags)))];

  const filtered = snippets.filter(s => selectedTag === 'Tümü' || s.tags.includes(selectedTag));

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const newSnippet: CodeSnippet = {
      id: `snip-${Date.now()}`,
      title: title.trim(),
      code: code.trim(),
      language: lang,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    const updated = [newSnippet, ...snippets];
    setSnippets(updated);
    localStorage.setItem('dashboard_code_snippets', JSON.stringify(updated));
    setTitle('');
    setCode('');
    setTagInput('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    localStorage.setItem('dashboard_code_snippets', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">Kod Parçacıkları (Snippet Vault)</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
          title="Yeni Snippet Ekle"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tag Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
              selectedTag === tag
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Başlık (örn. Docker Prune)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Etiketler (virgülle ayırın)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <textarea
            rows={3}
            placeholder="Kod veya terminal komutu..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-cyan-300 font-mono focus:outline-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-bold text-xs"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
        {filtered.map(s => {
          const isCopied = copiedId === s.id;
          return (
            <div
              key={s.id}
              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 group transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-xs text-white">{s.title}</strong>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(s.id, s.code)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] transition"
                    title="Kopyala"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-rose-300"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <pre className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-cyan-200 overflow-x-auto select-all">
                <code>{s.code}</code>
              </pre>

              <div className="flex items-center gap-1.5 flex-wrap">
                {s.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/5">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
