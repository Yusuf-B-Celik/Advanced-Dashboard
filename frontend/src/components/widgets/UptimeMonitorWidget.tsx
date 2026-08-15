import React, { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, RotateCw, CheckCircle2, XCircle, ExternalLink, Globe } from 'lucide-react';
import { UptimeTarget } from '../../types';

const INITIAL_TARGETS: UptimeTarget[] = [
  { id: '1', name: 'Google DNS', url: 'https://google.com' },
  { id: '2', name: 'GitHub API', url: 'https://api.github.com' },
  { id: '3', name: 'Local Backend', url: 'http://localhost:3001/api/finance' },
  { id: '4', name: 'Cloudflare', url: 'https://1.1.1.1' },
];

export const UptimeMonitorWidget: React.FC = () => {
  const [targets, setTargets] = useState<UptimeTarget[]>(() => {
    const saved = localStorage.getItem('dashboard_uptime_targets');
    return saved ? JSON.parse(saved) : INITIAL_TARGETS;
  });

  const [checking, setChecking] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const checkUptime = async () => {
    if (targets.length === 0) return;
    try {
      setChecking(true);
      const res = await fetch('/api/uptime/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: targets.map(t => ({ url: t.url, name: t.name }))
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setTargets(prev =>
          prev.map(t => {
            const resItem = data.results.find((r: any) => r.url === t.url || r.name === t.name);
            if (resItem) {
              return {
                ...t,
                isOnline: resItem.isOnline,
                statusCode: resItem.statusCode,
                latencyMs: resItem.latencyMs,
                lastChecked: resItem.checkedAt
              };
            }
            return t;
          })
        );
      }
    } catch (err) {
      console.error('Uptime check error:', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkUptime();
    const interval = setInterval(checkUptime, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newTarget: UptimeTarget = {
      id: `target-${Date.now()}`,
      name: newName.trim() || newUrl.replace(/^https?:\/\//, ''),
      url: newUrl.trim()
    };

    const updated = [...targets, newTarget];
    setTargets(updated);
    localStorage.setItem('dashboard_uptime_targets', JSON.stringify(updated));
    setNewUrl('');
    setNewName('');
    setShowAddForm(false);
    checkUptime();
  };

  const handleDeleteTarget = (id: string) => {
    const updated = targets.filter(t => t.id !== id);
    setTargets(updated);
    localStorage.setItem('dashboard_uptime_targets', JSON.stringify(updated));
  };

  const onlineCount = targets.filter(t => t.isOnline).length;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Servis & API Uptime Ping</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {onlineCount}/{targets.length} Aktif
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
            title="Yeni Servis Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={checkUptime}
            disabled={checking}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
            title="Ping Testi Yap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddTarget} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in">
          <input
            type="text"
            placeholder="Servis Adı (örn. Üretim API)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="URL (örn. https://api.site.com)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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

      {/* Targets List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
        {targets.map(t => (
          <div
            key={t.id}
            className="p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between gap-3 group transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5">
                {t.isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                )}
              </span>

              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{t.name}</span>
                  {t.statusCode && (
                    <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${t.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {t.statusCode}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 truncate block max-w-[200px]">
                  {t.url}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {t.latencyMs !== undefined && (
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${t.latencyMs < 200 ? 'text-emerald-400' : t.latencyMs < 600 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {t.latencyMs}ms
                  </span>
                  <span className="text-[9px] text-gray-500 block">{t.lastChecked}</span>
                </div>
              )}

              <button
                onClick={() => handleDeleteTarget(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-rose-500/20 text-gray-500 hover:text-rose-300"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
