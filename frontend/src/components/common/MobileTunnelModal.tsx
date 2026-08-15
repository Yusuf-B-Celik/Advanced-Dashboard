import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Globe, 
  Copy, 
  Check, 
  RotateCw, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  Play,
  Square,
  QrCode,
  Sparkles,
  Wifi
} from 'lucide-react';

interface MobileTunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TunnelState {
  installed: boolean;
  version?: string;
  isRunning: boolean;
  url: string | null;
  qrUrl: string | null;
}

export const MobileTunnelModal: React.FC<MobileTunnelModalProps> = ({ isOpen, onClose }) => {
  const [tunnel, setTunnel] = useState<TunnelState>({
    installed: false,
    isRunning: false,
    url: null,
    qrUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tunnel/status');
      const data = await res.json();
      if (data.success) {
        setTunnel({
          installed: data.installed,
          version: data.version,
          isRunning: data.isRunning,
          url: data.url,
          qrUrl: data.qrUrl
        });
      }
    } catch (err: any) {
      console.warn('Tunnel status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetchStatus();
    }
  }, [isOpen]);

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tunnel/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: 5173 })
      });
      const data = await res.json();
      if (data.success) {
        setTunnel(prev => ({
          ...prev,
          isRunning: true,
          url: data.url,
          qrUrl: data.qrUrl
        }));
      } else {
        setError(data.error || 'Ngrok tüneli başlatılamadı.');
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetch('/api/tunnel/stop', { method: 'POST' });
      setTunnel(prev => ({
        ...prev,
        isRunning: false,
        url: null,
        qrUrl: null
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tunnel.url && navigator.clipboard) {
      navigator.clipboard.writeText(tunnel.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Mobilden Kullanım & Ngrok Yayını</span>
                {tunnel.isRunning && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Canlı Yayında
                  </span>
                )}
              </h2>
              <span className="text-xs text-gray-400">Telefonunuzdan veya uzaktan anında güvenli erişim</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Alert */}
          {!tunnel.installed ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Sistemde Ngrok Bulunamadı</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Mobilden erişim için sisteminizde <code>ngrok</code> kurulu olmalıdır. Terminalde aşağıdaki komutla kurabilirsiniz:
              </p>
              <pre className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-cyan-300 overflow-x-auto select-all">
                <code>curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc &gt;/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok</code>
              </pre>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300">Ngrok Kurulu ({tunnel.version || 'v3'})</span>
              </div>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                title="Durumu Yenile"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          {/* Active Tunnel Display & QR Code */}
          {tunnel.isRunning && tunnel.url ? (
            <div className="space-y-4 animate-in fade-in">
              {/* QR Code Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-black/60 to-purple-950/30 border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  Telefon Kameranızla QR Kodu Okutun
                </span>

                <div className="p-3 rounded-2xl bg-white shadow-2xl shadow-cyan-500/20">
                  <img
                    src={tunnel.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(tunnel.url)}`}
                    alt="Mobil Erişim QR Kodu"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
                  Aynı Wi-Fi ağına bağlı olmanıza gerek yoktur; HTTPS tüneli üzerinden her yerden çalışır.
                </p>
              </div>

              {/* Public URL Box */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-[10px] text-gray-400 block font-medium">Genel HTTPS Bağlantısı:</span>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={tunnel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-mono text-cyan-300 hover:underline truncate flex items-center gap-1"
                  >
                    <span>{tunnel.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 shrink-0 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Mobil Yayını Başlatın</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Dashboard'unuzu mobil cihazlarda kullanmak için tek tıkla güvenli tüneli aktifleştirin.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {tunnel.isRunning ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Yayını Durdur (Tüneli Kapat)</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading || !tunnel.installed}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Tünel Başlatılıyor...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mobilden Erişimi Başlat (Ngrok)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
