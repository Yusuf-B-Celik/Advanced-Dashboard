import React, { useState } from 'react';
import { Clipboard, Copy, Check, Trash2, ArrowRightLeft, AlignLeft } from 'lucide-react';

export const ClipboardHistoryWidget: React.FC = () => {
  const [text, setText] = useState(() => localStorage.getItem('dashboard_scratchpad_text') || '');
  const [copied, setCopied] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    localStorage.setItem('dashboard_scratchpad_text', val);
  };

  const transformText = (mode: 'upper' | 'lower' | 'title' | 'camel' | 'slug' | 'clean') => {
    if (!text) return;
    let res = text;
    if (mode === 'upper') res = text.toUpperCase();
    else if (mode === 'lower') res = text.toLowerCase();
    else if (mode === 'title') {
      res = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    } else if (mode === 'camel') {
      res = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    } else if (mode === 'slug') {
      res = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    } else if (mode === 'clean') {
      res = text.replace(/\s+/g, ' ').trim();
    }
    setText(res);
    localStorage.setItem('dashboard_scratchpad_text', res);
  };

  const handleCopy = () => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clipboard className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">Hızlı Taslak & Metin Dönüştürücü</span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">
          {wordCount} kelime • {charCount} harf
        </div>
      </div>

      {/* Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          onClick={() => transformText('upper')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          BÜYÜK
        </button>
        <button
          onClick={() => transformText('lower')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          küçük
        </button>
        <button
          onClick={() => transformText('title')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          Başlık
        </button>
        <button
          onClick={() => transformText('camel')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          camelCase
        </button>
        <button
          onClick={() => transformText('slug')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          kebab-slug
        </button>
        <button
          onClick={() => transformText('clean')}
          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold"
        >
          Boşluk Temizle
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          rows={5}
          placeholder="Buraya geçici metin, link veya notlarınızı yapıştırın..."
          value={text}
          onChange={handleTextChange}
          className="w-full flex-1 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button
          onClick={() => { setText(''); localStorage.removeItem('dashboard_scratchpad_text'); }}
          className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Temizle</span>
        </button>

        <button
          onClick={handleCopy}
          disabled={!text}
          className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
        </button>
      </div>
    </div>
  );
};
