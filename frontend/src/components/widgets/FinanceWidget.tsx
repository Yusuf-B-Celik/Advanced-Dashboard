import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  DollarSign, 
  Coins, 
  BarChart3, 
  Clock 
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { FinanceItem } from '../../types';

export const FinanceWidget: React.FC = () => {
  const { finance, financeLoading, refreshFinance } = useDashboard();
  const [activeTab, setActiveTab] = useState<'all' | 'currency_gold' | 'crypto' | 'converter'>('all');
  
  // Converter State
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [fromCode, setFromCode] = useState<string>('USDTRY');
  const [toTarget, setToTarget] = useState<string>('TRY');

  const filteredItems = finance.filter(item => {
    if (activeTab === 'currency_gold') return item.type === 'currency' || item.type === 'gold' || item.type === 'bist';
    if (activeTab === 'crypto') return item.type === 'crypto';
    return true;
  });

  // Calculate Conversion
  const calculateConversion = () => {
    const fromItem = finance.find(f => f.code === fromCode);
    if (!fromItem) return 0;
    const rate = fromItem.sell || 1;
    return convertAmount * rate;
  };

  const renderSparkline = (history?: number[], isPositive = true) => {
    if (!history || history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 70;
    const height = 24;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              activeTab === 'all' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Tüm Piyasalar
          </button>
          <button
            onClick={() => setActiveTab('currency_gold')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              activeTab === 'currency_gold' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Döviz & Altın
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              activeTab === 'crypto' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            Kripto
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'converter' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Hesapla</span>
          </button>
        </div>

        {finance.length > 0 && (
          <span className="text-[10px] text-gray-400 flex items-center gap-1 hidden sm:flex">
            <Clock className="w-3 h-3" />
            {finance[0]?.lastUpdated}
          </span>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'converter' ? (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h4 className="text-xs font-bold text-gray-200">Döviz & Varlık Hesaplayıcı</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Miktar</label>
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Varlık / Kur</label>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                {finance.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.code}) - {item.sell} {item.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400">Karşılığı (Tahmini Değer):</span>
              <div className="text-xl font-extrabold text-cyan-300">
                {calculateConversion().toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-cyan-400/30" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-y-auto max-h-[360px] pr-1">
          {filteredItems.map((item) => {
            const isPositive = item.changeRate >= 0;
            return (
              <div
                key={item.code}
                className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-gray-200">{item.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{item.code}</span>
                  </div>

                  <div className="text-base font-extrabold text-white">
                    {item.sell.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                  </div>

                  <div className={`text-[11px] font-semibold flex items-center gap-0.5 mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>%{Math.abs(item.changeRate)}</span>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="pl-2">
                  {renderSparkline(item.history, isPositive)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
