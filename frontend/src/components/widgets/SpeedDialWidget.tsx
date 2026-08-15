import React, { useState } from 'react';
import { 
  Compass, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Globe, 
  X 
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

export const SpeedDialWidget: React.FC = () => {
  const { bookmarks, addBookmark, deleteBookmark } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Genel');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    addBookmark({
      title: title.trim(),
      url: validUrl,
      category: category.trim() || 'Genel'
    });

    setTitle('');
    setUrl('');
    setShowAdd(false);
  };

  const getFavicon = (u: string) => {
    try {
      const parsed = new URL(u);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Favori Bağlantılar ({bookmarks.length})</span>
        <button
          onClick={() => setShowAdd(true)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition"
          title="Bağlantı Ekle"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of speed dials */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-[220px] pr-1">
        {bookmarks.map((bm) => {
          const favicon = getFavicon(bm.url);
          return (
            <div
              key={bm.id}
              className="group relative p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 flex flex-col items-center justify-center text-center transition cursor-pointer"
              onClick={() => window.open(bm.url, '_blank')}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-110 transition-transform">
                {favicon ? (
                  <img
                    src={favicon}
                    alt={bm.title}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-cyan-400" />
                )}
              </div>

              <span className="text-[11px] font-bold text-gray-200 truncate max-w-full">
                {bm.title}
              </span>
              <span className="text-[9px] text-gray-500 truncate max-w-full">
                {bm.category}
              </span>

              {/* Delete Button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBookmark(bm.id);
                }}
                className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-gray-400 hover:text-red-400 transition"
                title="Sil"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white">Yeni Bağlantı Ekle</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Başlık *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: TRT Haber"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Web Adresi (URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://trthaber.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
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
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
