import React, { useState } from 'react';
import { Flame, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

export const CryptoHeatmapWidget: React.FC = () => {
  const { finance } = useDashboard();
  const cryptoItems = finance.filter(f => f.type === 'crypto');

  const [calcCoin, setCalcCoin] = useState(cryptoItems[0]?.code || 'BTC');
  const [calcAmount, setCalcAmount] = useState<string>('0.5');

  const selectedCoinObj = cryptoItems.find(c => c.code === calcCoin) || cryptoItems[0];
  const totalValue = selectedCoinObj ? (parseFloat(calcAmount) || 0) * selectedCoinObj.sell : 0;

  const getHeatmapColor = (rate: number) => {
    if (rate >= 5) return 'bg-emerald-500/30 border-emerald-500/60 text-emerald-300';
    if (rate >= 2) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
    if (rate > 0) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (rate === 0) return 'bg-white/5 border-white/10 text-gray-300';
    if (rate > -2) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (rate > -5) return 'bg-rose-500/20 border-rose-500/40 text-rose-400';
    return 'bg-rose-500/30 border-rose-500/60 text-rose-300';
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-white">Kripto Isı Haritası & Portföy</span>
        </div>
        <span className="text-[10px] text-gray-400">Canlı 24s Değişimler</span>
      </div>

      {/* Heatmap Tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {cryptoItems.map(c => {
          const isUp = c.changeRate >= 0;
          return (
            <div
              key={c.code}
              className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.03] cursor-pointer ${getHeatmapColor(
                c.changeRate
              )}`}
              onClick={() => setCalcCoin(c.code)}
            >
              <div className="flex items-center justify-between">
                <strong className="text-xs font-black">{c.code}</strong>
                {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
              </div>
              <div className="mt-2 text-xs font-mono font-bold">
                ${c.sell >= 1 ? c.sell.toLocaleString() : c.sell}
              </div>
              <div className="text-[10px] font-bold mt-0.5">
                {isUp ? '+' : ''}{c.changeRate}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Portfolio & Profit Calculator */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hızlı Varlık & Bakiye Hesaplayıcı</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={calcCoin}
            onChange={(e) => setCalcCoin(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-white/10 text-xs text-white focus:outline-none"
          >
            {cryptoItems.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
            ))}
          </select>

          <input
            type="number"
            step="any"
            value={calcAmount}
            onChange={(e) => setCalcAmount(e.target.value)}
            placeholder="Adet girin..."
            className="w-24 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none"
          />

          <div className="ml-auto text-right">
            <span className="text-[10px] text-gray-400 block">Toplam Tutar</span>
            <strong className="text-xs sm:text-sm text-emerald-400 font-mono font-bold">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
