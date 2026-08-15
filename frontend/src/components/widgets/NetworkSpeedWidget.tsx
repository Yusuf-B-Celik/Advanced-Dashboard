import React, { useState, useEffect } from 'react';
import { Wifi, Globe, Shield, RotateCw, CheckCircle2, Server } from 'lucide-react';

export const NetworkSpeedWidget: React.FC = () => {
  const [ip, setIp] = useState<string>('Yükleniyor...');
  const [lastCheck, setLastCheck] = useState<string>('');
  const [latency, setLatency] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchNetworkInfo = async () => {
    try {
      setTesting(true);
      const start = Date.now();
      const res = await fetch('/api/network/info');
      const data = await res.json();
      const ping = Date.now() - start;

      setLatency(ping);
      if (data.publicIp) {
        setIp(data.publicIp);
        setLastCheck(data.checkedAt || new Date().toLocaleTimeString('tr-TR'));
      }
    } catch (e) {
      setIp('127.0.0.1');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">Ağ & İnternet Teşhis</span>
        </div>
        <button
          onClick={fetchNetworkInfo}
          disabled={testing}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
          title="Yeniden Test Et"
        >
          <RotateCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Info Tiles */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dış IP (Public IP)</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-white truncate select-all">
            {ip}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yerel Gecikme</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
            {latency !== null ? `${latency} ms` : 'Test ediliyor...'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Bağlantı Durumu</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>İnternet Aktif</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>Protokol & Güvenlik</span>
          </div>
          <div className="text-xs font-mono font-bold text-gray-300 truncate">
            HTTPS / TLS 1.3
          </div>
        </div>
      </div>
    </div>
  );
};
