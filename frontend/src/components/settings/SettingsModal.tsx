import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Palette, 
  Clock, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Server,
  Zap,
  CreditCard,
  Ticket,
  Send,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetLayout, widgets } = useDashboard();
  
  const [apiKey, setApiKey] = useState(settings.minimaxApiKey || '');
  const [planType, setPlanType] = useState<'pay_as_you_go' | 'token_plan'>(settings.minimaxPlanType || 'token_plan');
  const [protocol, setProtocol] = useState<'anthropic' | 'openai' | 'native'>(settings.minimaxProtocol || 'anthropic');
  const [model, setModel] = useState(settings.minimaxModel || 'MiniMax-M3');
  const [region, setRegion] = useState<'global' | 'global_alt' | 'china' | 'custom'>(settings.minimaxRegion || 'global');
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.minimaxBaseUrl || '');
  const [groupId, setGroupId] = useState(settings.minimaxGroupId || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Telegram Bot Settings State
  const [telegramToken, setTelegramToken] = useState(settings.telegram?.botToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegram?.chatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegram?.enabled ?? false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [telegramTestMsg, setTelegramTestMsg] = useState('');

  if (!isOpen) return null;

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMsg('Lütfen önce bir API veya Subscription Key girin.');
      return;
    }

    try {
      setTestStatus('testing');
      setTestMsg('MiniMax-M3 API bağlantısı test ediliyor...');

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Merhaba, bu bir sistem testidir. 1 kelimeyle yanıt ver.' }],
          apiKey: apiKey.trim(),
          model: model,
          planType: planType,
          apiProtocol: protocol,
          region: region,
          customBaseUrl: customBaseUrl.trim(),
          groupId: groupId.trim()
        })
      });

      const data = await res.json();
      if (data.success && !data.isFallback) {
        setTestStatus('success');
        setTestMsg(`✓ MiniMax-M3 (${protocol.toUpperCase()}) bağlantısı başarıyla kuruldu!`);
      } else {
        throw new Error(data.error || 'MiniMax API yanıt vermedi.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMsg(`Bağlantı hatası: ${e.message}`);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramTestStatus('error');
      setTelegramTestMsg('Lütfen Bot Token ve Chat ID girin.');
      return;
    }

    try {
      setTelegramTestStatus('testing');
      setTelegramTestMsg('Telegram mesajı gönderiliyor...');
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramToken.trim(),
          chatId: telegramChatId.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestStatus('success');
        setTelegramTestMsg('✓ Test mesajı Telegram hesabınıza başarıyla iletildi!');
      } else {
        throw new Error(data.error || 'Mesaj gönderilemedi.');
      }
    } catch (e: any) {
      setTelegramTestStatus('error');
      setTelegramTestMsg(`Hata: ${e.message}`);
    }
  };

  const handleSave = async () => {
    const telegramConfig = {
      botToken: telegramToken.trim(),
      chatId: telegramChatId.trim(),
      enabled: telegramEnabled,
      notifyOnUptimeFail: true,
      notifyDailyBriefing: false
    };

    updateSettings({
      minimaxApiKey: apiKey.trim(),
      minimaxPlanType: planType,
      minimaxProtocol: protocol,
      minimaxModel: model,
      minimaxRegion: region,
      minimaxBaseUrl: customBaseUrl.trim(),
      minimaxGroupId: groupId.trim(),
      telegram: telegramConfig
    });

    // Also sync to backend telegram service
    fetch('/api/telegram/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: telegramConfig })
    }).catch(() => {});

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = () => {
    const backup = {
      settings,
      widgets,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.settings) updateSettings(parsed.settings);
        if (parsed.widgets) {
          localStorage.setItem('dashboard_widgets_v2', JSON.stringify(parsed.widgets));
          window.location.reload();
        }
      } catch (err) {
        alert('Geçersiz yedek dosyası!');
      }
    };
    reader.readAsText(file);
  };

  const THEMES = [
    { id: 'midnight-glass', name: 'Midnight Glass (Siber Mavi)', color: 'bg-cyan-500' },
    { id: 'cyber-neon', name: 'Cyber Neon (Fuşya & Neon)', color: 'bg-pink-500' },
    { id: 'deep-oled', name: 'Deep OLED (Saf Siyah)', color: 'bg-zinc-900' },
    { id: 'aurora', name: 'Aurora Borealis (Kutup Yeşili)', color: 'bg-emerald-500' },
    { id: 'clean-light', name: 'Clean Light (Aydınlık)', color: 'bg-blue-100' },
  ];

  const WALLPAPERS = [
    { id: 'gradient-dark', name: 'Siber Gradyan Mesh' },
    { id: 'gradient-cyber', name: 'Neon Cyber Mesh' },
    { id: 'gradient-aurora', name: 'Aurora Yeşil Mesh' },
    { id: 'oled-black', name: 'Saf OLED Siyah' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/15 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Dashboard & MiniMax Yapılandırması</h2>
              <span className="text-xs text-gray-400">MiniMax-M3, Token Plan & Pay-as-you-go Entegrasyonu</span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: MiniMax AI Configuration */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-slate-900/60 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">MiniMax-M3 Model & Plan Seçimi</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Official API Docs Uyumlu
              </span>
            </div>

            {/* Plan Type Selector (Pay-as-you-go vs Token Plan) */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Hesap & Abonelik Tipi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanType('token_plan')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    planType === 'token_plan'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <strong className="text-xs block text-gray-200">Token Plan (Subscription)</strong>
                    <span className="text-[10px] text-gray-400">Aylık Token Planı / Subscription Key</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('pay_as_you_go')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    planType === 'pay_as_you_go'
                      ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <strong className="text-xs block text-gray-200">Pay-as-you-go</strong>
                    <span className="text-[10px] text-gray-400">Standart Kullandıkça Öde API Key</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Key Input */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                {planType === 'token_plan' ? 'MiniMax Subscription Key (Token Plan)' : 'MiniMax API Key (Pay-as-you-go)'} *
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={planType === 'token_plan' ? 'Subscription Key giriniz...' : 'API Key giriniz (ey...)'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Model & Protocol Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="MiniMax-M3">MiniMax-M3 (En Yeni Amiral Gemisi - Önerilen)</option>
                  <option value="MiniMax-Text-01">MiniMax-Text-01</option>
                  <option value="MiniMax-M2.7">MiniMax-M2.7</option>
                  <option value="MiniMax-M2.5">MiniMax-M2.5</option>
                  <option value="abab6.5s-chat">abab6.5s-chat (Hafif & Hızlı)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">API Protokolü</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="anthropic">Anthropic API (/anthropic/v1/messages) - Önerilen</option>
                  <option value="openai">OpenAI API (/v1/chat/completions)</option>
                  <option value="native">MiniMax Native V2 (/v1/text/chatcompletion_v2)</option>
                </select>
              </div>
            </div>

            {/* Region / Endpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Bölge & Endpoint</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="global">Global Platform (api.minimax.io)</option>
                  <option value="global_alt">Global Alternatif (api.minimax.chat)</option>
                  <option value="china">Çin / Asya (api.minimaxi.chat)</option>
                  <option value="custom">Özel URL (Custom Endpoint)</option>
                </select>
              </div>

              {region === 'custom' ? (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Özel Base URL</label>
                  <input
                    type="text"
                    placeholder="https://api.minimax.io"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Group ID (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Sadece bazı kurumsal hesaplar için..."
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Test Connection Button */}
            <div className="pt-1">
              <button
                onClick={handleTestApiKey}
                disabled={testStatus === 'testing'}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>{testStatus === 'testing' ? 'MiniMax-M3 Test Ediliyor...' : 'MiniMax-M3 Bağlantısını Test Et'}</span>
              </button>
            </div>

            {testMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                testStatus === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {testMsg}
              </div>
            )}
          </div>

          {/* Section 2: Themes & Appearance */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Görsel Tema & Renk Paleti</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => updateSettings({ theme: th.id })}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    settings.theme === th.id
                      ? 'bg-white/10 border-cyan-500/50 text-white font-bold'
                      : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${th.color}`} />
                    <span className="text-xs">{th.name}</span>
                  </div>
                  {settings.theme === th.id && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Wallpaper Style */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Arka Plan Deseni</h3>
            <div className="grid grid-cols-2 gap-2">
              {WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => updateSettings({ wallpaper: wp.id })}
                  className={`p-2.5 rounded-xl border text-xs text-center transition ${
                    settings.wallpaper === wp.id
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {wp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Telegram Bot & Remote Control */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 via-cyan-950/20 to-black/40 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Telegram Bot & Uzaktan Kontrol</h3>
                  <span className="text-[10px] text-gray-400">Telegram'dan görev, harcama, not ekleyin ve bildirim alın</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {telegramEnabled && (
              <div className="space-y-3 pt-2 border-t border-white/5 animate-in fade-in">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Telegram Bot Token</label>
                  <input
                    type="password"
                    placeholder="Örn: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500/50"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    @BotFather üzerinden ücretsiz oluşturduğunuz HTTP API token'ı.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Telegram Chat ID</label>
                  <input
                    type="text"
                    placeholder="Örn: 987654321"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500/50"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    @userinfobot üzerinden öğrenebileceğiniz kullanıcı veya grup ID'niz.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={telegramTestStatus === 'testing' || !telegramToken}
                  className="w-full py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${telegramTestStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{telegramTestStatus === 'testing' ? 'Test Mesajı Gönderiliyor...' : 'Telegram Bağlantısını Test Et'}</span>
                </button>

                {telegramTestMsg && (
                  <div className={`p-2.5 rounded-xl text-xs ${
                    telegramTestStatus === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {telegramTestMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Refresh Interval */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Haber & Finans Otomatik Yenileme</span>
            </h3>
            <select
              value={settings.refreshIntervalSeconds || 300}
              onChange={(e) => updateSettings({ refreshIntervalSeconds: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="60">Her 1 Dakikada Bir</option>
              <option value="300">Her 5 Dakikada Bir (Önerilen)</option>
              <option value="600">Her 10 Dakikada Bir</option>
              <option value="1800">Her 30 Dakikada Bir</option>
            </select>
          </div>

          {/* Section 5: Backup & Reset */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-gray-300">Yedekleme & Sıfırlama</h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yedeği İndir (JSON)</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs flex items-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Yedek Yükle</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>

              <button
                onClick={resetLayout}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs flex items-center gap-1.5 transition ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılan Yerleşime Dön</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <span>Ayarları Kaydet</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
