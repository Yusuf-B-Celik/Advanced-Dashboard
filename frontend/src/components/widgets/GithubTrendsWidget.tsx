import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  ExternalLink, 
  Sparkles, 
  Code 
} from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
}

const LANGUAGES = ['Tümü', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go'];

export const GithubTrendsWidget: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedLang, setSelectedLang] = useState('Tümü');
  const [loading, setLoading] = useState(true);

  const fetchTrends = async (lang: string) => {
    try {
      setLoading(true);
      const url = lang === 'Tümü' ? '/api/github/trends' : `/api/github/trends?language=${lang.toLowerCase()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setRepos(data.repos);
      }
    } catch (e) {
      console.warn('Github fetch warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(selectedLang);
  }, [selectedLang]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Language Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedLang === lang ? 'bg-cyan-500 text-black shadow-sm' : 'bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
        {loading ? (
          <div className="flex items-center justify-center h-36">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          repos.map(r => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate">
                  {r.fullName}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 shrink-0 ml-1" />
              </div>

              <p className="text-[11px] text-gray-400 line-clamp-1 mt-1">
                {r.description || 'Açıklama bulunmuyor.'}
              </p>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                {r.language && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                    {r.language}
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  {r.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {r.forks.toLocaleString()}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};
