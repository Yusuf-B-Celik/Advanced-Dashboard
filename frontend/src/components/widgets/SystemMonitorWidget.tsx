import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Server, 
  Clock, 
  Activity, 
  Zap, 
  Layers,
  Thermometer,
  Wifi,
  ArrowDown,
  ArrowUp,
  Sliders
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

export const SystemMonitorWidget: React.FC = () => {
  const { systemStats } = useDashboard();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'cores' | 'storage' | 'network'>('overview');

  if (!systemStats) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-2 text-xs text-gray-400">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Sistem donanım telemetrisi okunuyor...</span>
      </div>
    );
  }

  const { cpu, memory, disk, network, os } = systemStats;

  // Format Bytes to readable GB/MB
  const formatBytes = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}g ` : ''}${h}s ${m}d`;
  };

  const formatNetSpeed = (bytesSec: number) => {
    if (!bytesSec) return '0 KB/s';
    const mb = bytesSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    const kb = bytesSec / 1024;
    return `${kb.toFixed(0)} KB/s`;
  };

  const getLoadColor = (pct: number) => {
    if (pct < 50) return 'text-cyan-400 bg-cyan-400';
    if (pct < 80) return 'text-amber-400 bg-amber-400';
    return 'text-rose-400 bg-rose-400';
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'overview' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveSubTab('cores')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'cores' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            {cpu.cores} Çekirdek ({cpu.speedGhz}GHz)
          </button>
          <button
            onClick={() => setActiveSubTab('storage')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'storage' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Disk Bölümleri
          </button>
          <button
            onClick={() => setActiveSubTab('network')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'network' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Ağ & I/O
          </button>
        </div>

        {cpu.temperature && (
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Thermometer className="w-3.5 h-3.5" />
            <span>{cpu.temperature}°C</span>
          </div>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Main Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* CPU Gauge */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  İşlemci (CPU)
                </span>
                <strong className={`font-mono font-bold text-sm ${getLoadColor(cpu.usagePercent).split(' ')[0]}`}>
                  %{cpu.usagePercent}
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800/80 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getLoadColor(cpu.usagePercent).split(' ')[1]}`}
                  style={{ width: `${Math.min(cpu.usagePercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 block truncate font-mono">
                {cpu.model}
              </span>
            </div>

            {/* RAM Gauge */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  Bellek (RAM)
                </span>
                <strong className={`font-mono font-bold text-sm ${getLoadColor(memory.usagePercent).split(' ')[0]}`}>
                  %{memory.usagePercent}
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800/80 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(memory.usagePercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 block font-mono">
                {formatBytes(memory.usedBytes)} / {formatBytes(memory.totalBytes)}
              </span>
            </div>

            {/* Disk Gauge */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Depolama (Disk)
                </span>
                <strong className={`font-mono font-bold text-sm ${getLoadColor(disk.usagePercent).split(' ')[0]}`}>
                  %{disk.usagePercent}
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800/80 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(disk.usagePercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 block font-mono">
                {formatBytes(disk.usedBytes)} / {formatBytes(disk.totalBytes)}
              </span>
            </div>
          </div>

          {/* System & Host Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-500 block">İşletim Sistemi</span>
              <strong className="text-xs text-white truncate block font-mono">
                {os.distro} ({os.arch})
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-500 block">Sistem Uptime</span>
              <strong className="text-xs text-cyan-300 block font-mono">
                {formatUptime(os.uptimeSeconds)}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-500 block">Host & Node</span>
              <strong className="text-xs text-purple-300 block truncate font-mono">
                {os.hostname} ({os.nodeVersion || 'Node'})
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-500 block">Swap Alanı</span>
              <strong className="text-xs text-amber-300 block font-mono">
                {memory.swapTotal ? `${formatBytes(memory.swapUsed || 0)} / ${formatBytes(memory.swapTotal)}` : 'Devre Dışı'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* PER CORE TAB */}
      {activeSubTab === 'cores' && (
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
          <div className="text-xs text-gray-400 mb-2">
            İşlemci Modeli: <strong className="text-white font-mono">{cpu.model}</strong> • Çekirdek Sayısı: <strong className="text-cyan-400">{cpu.cores}</strong>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(cpu.perCoreUsage && cpu.perCoreUsage.length > 0 ? cpu.perCoreUsage : Array.from({ length: cpu.cores }).map(() => Math.round(cpu.usagePercent))).map((load, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-mono">Çekirdek #{idx + 1}</span>
                  <strong className={`font-mono ${getLoadColor(load).split(' ')[0]}`}>%{load}</strong>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getLoadColor(load).split(' ')[1]}`}
                    style={{ width: `${Math.min(load, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STORAGE PARTITIONS TAB */}
      {activeSubTab === 'storage' && (
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {(disk.partitions && disk.partitions.length > 0 ? disk.partitions : [
            { fs: '/dev/root', mount: '/', size: disk.totalBytes, used: disk.usedBytes, use: disk.usagePercent }
          ]).map((part, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <strong className="text-white font-mono">{part.mount}</strong>
                  <span className="text-[10px] text-gray-500 font-mono">({part.fs})</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">%{part.use}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(part.use, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Kullanılan: {formatBytes(part.used)}</span>
                <span>Toplam: {formatBytes(part.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NETWORK & I/O TAB */}
      {activeSubTab === 'network' && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-cyan-300">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>İndirme Hızı (RX)</span>
              </div>
              <strong className="text-base sm:text-lg font-mono font-bold text-white block">
                {formatNetSpeed(network?.rxBytesSec || 0)}
              </strong>
              <span className="text-[10px] text-cyan-300/80">Arayüz: {network?.iface || 'eth0'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-purple-300">
                <ArrowUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Yükleme Hızı (TX)</span>
              </div>
              <strong className="text-base sm:text-lg font-mono font-bold text-white block">
                {formatNetSpeed(network?.txBytesSec || 0)}
              </strong>
              <span className="text-[10px] text-purple-300/80">Arayüz: {network?.iface || 'eth0'}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1 text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Node.js Process Uptime:</span>
              <span className="font-mono text-white">{formatUptime(os.processUptimeSeconds || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mimari & Platform:</span>
              <span className="font-mono text-cyan-300">{os.platform} / {os.arch}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
