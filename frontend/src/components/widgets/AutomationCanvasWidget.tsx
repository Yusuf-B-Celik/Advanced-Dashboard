import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  Play, 
  Plus, 
  Trash2, 
  Sparkles, 
  Zap, 
  Clock, 
  TrendingUp, 
  Cpu, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Check, 
  X,
  ArrowRight,
  RefreshCw,
  Power
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface AutomationWorkflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'interval' | 'time' | 'price_threshold' | 'system_cpu' | 'event_task';
    config: {
      intervalMinutes?: number;
      timeOfDay?: string;
      symbol?: string;
      operator?: '>' | '<';
      threshold?: number;
      cpuPercent?: number;
    };
  };
  action: {
    type: 'telegram_message' | 'create_task' | 'generate_briefing' | 'webhook';
    config: {
      telegramMessage?: string;
      taskTitle?: string;
      webhookUrl?: string;
      webhookMethod?: 'GET' | 'POST';
    };
  };
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'idle';
  lastMessage?: string;
}

export const AutomationCanvasWidget: React.FC = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Workflow State
  const [newWfName, setNewWfName] = useState('');
  const [newWfTriggerType, setNewWfTriggerType] = useState<AutomationWorkflow['trigger']['type']>('time');
  const [newWfTime, setNewWfTime] = useState('09:00');
  const [newWfPriceSymbol, setNewWfPriceSymbol] = useState('USDTRY');
  const [newWfPriceThreshold, setNewWfPriceThreshold] = useState('38.5');
  const [newWfActionType, setNewWfActionType] = useState<AutomationWorkflow['action']['type']>('telegram_message');
  const [newWfTelegramMsg, setNewWfTelegramMsg] = useState('⚡ Otomasyon tetiklendi!');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automations');
      const data = await res.json();
      if (data.success && data.workflows) {
        setWorkflows(data.workflows);
      }
    } catch (err: any) {
      console.warn('Failed to load workflows:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleEnable = async (wf: AutomationWorkflow) => {
    const updated = { ...wf, enabled: !wf.enabled };
    setWorkflows(prev => prev.map(w => w.id === wf.id ? updated : w));

    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: updated })
      });
    } catch {
      fetchWorkflows();
    }
  };

  const handleTestWorkflow = async (id: string) => {
    try {
      setTestingId(id);
      const res = await fetch(`/api/automations/test/${id}`, { method: 'POST' });
      const data = await res.json();
      setFeedback(data.message || (data.success ? 'Aksiyon çalıştırıldı.' : 'Hata oluştu.'));
      setTimeout(() => setFeedback(null), 3000);
      fetchWorkflows();
    } catch (err: any) {
      setFeedback('Test başarısız: ' + err.message);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
    } catch {
      fetchWorkflows();
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const newWf: AutomationWorkflow = {
      id: 'wf_' + Date.now(),
      name: newWfName.trim(),
      enabled: true,
      trigger: {
        type: newWfTriggerType,
        config: {
          timeOfDay: newWfTriggerType === 'time' ? newWfTime : undefined,
          symbol: newWfTriggerType === 'price_threshold' ? newWfPriceSymbol : undefined,
          operator: '>',
          threshold: newWfTriggerType === 'price_threshold' ? parseFloat(newWfPriceThreshold) : undefined,
          cpuPercent: newWfTriggerType === 'system_cpu' ? 90 : undefined
        }
      },
      action: {
        type: newWfActionType,
        config: {
          telegramMessage: newWfActionType === 'telegram_message' ? newWfTelegramMsg : undefined
        }
      },
      lastStatus: 'idle'
    };

    setWorkflows(prev => [newWf, ...prev]);
    setShowAddModal(false);
    setNewWfName('');

    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: newWf })
      });
    } catch {
      fetchWorkflows();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">
            Aktif Akışlar ({workflows.filter(w => w.enabled).length}/{workflows.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Akış</span>
          </button>
          <button
            onClick={fetchWorkflows}
            className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Workflow Canvas Cards */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {workflows.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 space-y-2">
            <Zap className="w-8 h-8 text-cyan-400/40 mx-auto" />
            <p>Henüz tanımlı otomasyon bulunmuyor.</p>
          </div>
        ) : (
          workflows.map(wf => (
            <div 
              key={wf.id}
              className={`p-3 rounded-2xl border transition relative overflow-hidden ${
                wf.enabled 
                  ? 'bg-white/[0.03] border-cyan-500/30 hover:border-cyan-500/50 shadow-lg shadow-cyan-500/5' 
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${wf.enabled ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
                  <h4 className="text-xs font-bold text-white">{wf.name}</h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTestWorkflow(wf.id)}
                    disabled={testingId === wf.id}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                    title="Şimdi Canlı Test Et"
                  >
                    <Play className={`w-3 h-3 ${testingId === wf.id ? 'animate-spin' : ''}`} />
                    <span>Test</span>
                  </button>

                  <button
                    onClick={() => handleToggleEnable(wf)}
                    className={`p-1.5 rounded-lg border transition ${
                      wf.enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-gray-500 border-white/10'
                    }`}
                    title={wf.enabled ? 'Aktif (Devre Dışı Bırak)' : 'Pasif (Etkinleştir)'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteWorkflow(wf.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Node Connection Flow (Trigger -> Action) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {/* Trigger Block */}
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    {wf.trigger.type === 'time' && <Clock className="w-3.5 h-3.5" />}
                    {wf.trigger.type === 'price_threshold' && <TrendingUp className="w-3.5 h-3.5" />}
                    {wf.trigger.type === 'system_cpu' && <Cpu className="w-3.5 h-3.5" />}
                    {wf.trigger.type === 'interval' && <Activity className="w-3.5 h-3.5" />}
                  </div>
                  <div className="truncate">
                    <span className="text-gray-400 text-[10px] block uppercase font-bold">Tetikleyici</span>
                    <span className="text-white font-medium truncate block">
                      {wf.trigger.type === 'time' && `Saat: ${wf.trigger.config.timeOfDay}`}
                      {wf.trigger.type === 'price_threshold' && `${wf.trigger.config.symbol} ${wf.trigger.config.operator} ${wf.trigger.config.threshold}`}
                      {wf.trigger.type === 'system_cpu' && `CPU > %${wf.trigger.config.cpuPercent}`}
                    </span>
                  </div>
                </div>

                {/* Action Block */}
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                    {wf.action.type === 'telegram_message' && <Send className="w-3.5 h-3.5" />}
                    {wf.action.type === 'generate_briefing' && <Sparkles className="w-3.5 h-3.5" />}
                    {wf.action.type === 'create_task' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="truncate">
                    <span className="text-gray-400 text-[10px] block uppercase font-bold">Eylem</span>
                    <span className="text-white font-medium truncate block">
                      {wf.action.type === 'telegram_message' && 'Telegram Bildirimi'}
                      {wf.action.type === 'generate_briefing' && 'Brifing Üret & Gönder'}
                      {wf.action.type === 'create_task' && 'Panoya Görev Ekle'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              {wf.lastRun && (
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Son Çalışma: {wf.lastRun}</span>
                  <span className={`font-bold ${wf.lastStatus === 'success' ? 'text-emerald-400' : wf.lastStatus === 'failed' ? 'text-rose-400' : 'text-gray-400'}`}>
                    {wf.lastStatus === 'success' ? '✓ Başarılı' : wf.lastStatus === 'failed' ? '✗ Hata' : 'Beklemede'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Workflow className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Yeni Otomasyon Akışı Oluştur</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Akış Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Akşam 19:00 Günlük Görev Hatırlatıcı"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Tetikleyici Türü</label>
                  <select
                    value={newWfTriggerType}
                    onChange={(e) => setNewWfTriggerType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="time">⏰ Belirli Saat (Günlük)</option>
                    <option value="price_threshold">📈 Fiyat / Kur Eşiği</option>
                    <option value="system_cpu">💻 Yüksek CPU Yükü</option>
                  </select>
                </div>

                <div>
                  {newWfTriggerType === 'time' && (
                    <>
                      <label className="text-gray-400 block mb-1 font-semibold">Saat</label>
                      <input
                        type="time"
                        value={newWfTime}
                        onChange={(e) => setNewWfTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </>
                  )}
                  {newWfTriggerType === 'price_threshold' && (
                    <>
                      <label className="text-gray-400 block mb-1 font-semibold">Eşik Değer (TL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newWfPriceThreshold}
                        onChange={(e) => setNewWfPriceThreshold(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Eylem Türü</label>
                <select
                  value={newWfActionType}
                  onChange={(e) => setNewWfActionType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none"
                >
                  <option value="telegram_message">📲 Telegram Mesajı Gönder</option>
                  <option value="generate_briefing">🎙️ Günün Brifingini Telegram'a At</option>
                  <option value="create_task">📋 Panoya Görev Ekle</option>
                </select>
              </div>

              {newWfActionType === 'telegram_message' && (
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Gönderilecek Mesaj</label>
                  <input
                    type="text"
                    value={newWfTelegramMsg}
                    onChange={(e) => setNewWfTelegramMsg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Akışı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
