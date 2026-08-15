import React, { useState, useEffect } from 'react';
import { Globe, Clock, Sun, Moon, Sparkles, Sliders } from 'lucide-react';

interface CityTime {
  name: string;
  country: string;
  timeZone: string;
  flag: string;
}

const CITIES: CityTime[] = [
  { name: 'İstanbul', country: 'Türkiye', timeZone: 'Europe/Istanbul', flag: '🇹🇷' },
  { name: 'Londra', country: 'Birleşik Krallık', timeZone: 'Europe/London', flag: '🇬🇧' },
  { name: 'New York', country: 'ABD (Doğu)', timeZone: 'America/New_York', flag: '🇺🇸' },
  { name: 'San Francisco', country: 'ABD (Batı)', timeZone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'Tokyo', country: 'Japonya', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Dubai', country: 'BAE', timeZone: 'Asia/Dubai', flag: '🇦🇪' },
  { name: 'Berlin', country: 'Almanya', timeZone: 'Europe/Berlin', flag: '🇩🇪' },
  { name: 'Sidney', country: 'Avustralya', timeZone: 'Australia/Sydney', flag: '🇦🇺' },
];

export const WorldClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [offsetHours, setOffsetHours] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCityTime = (timeZone: string) => {
    const targetDate = new Date(time.getTime() + offsetHours * 3600 * 1000);
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(targetDate);
    const hourStr = parts.find(p => p.type === 'hour')?.value || '00';
    const hourNum = parseInt(hourStr, 10);
    const isDay = hourNum >= 7 && hourNum < 19;
    const isWorkHour = hourNum >= 9 && hourNum <= 18;

    return {
      formattedTime: formatter.format(targetDate),
      hourNum,
      isDay,
      isWorkHour,
      dayName: new Intl.DateTimeFormat('tr-TR', { timeZone, weekday: 'short' }).format(targetDate)
    };
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">Küresel Zaman & Toplantı Planlayıcı</span>
        </div>
        {offsetHours !== 0 && (
          <button
            onClick={() => setOffsetHours(0)}
            className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
          >
            Şimdiye Dön ({offsetHours > 0 ? `+${offsetHours}s` : `${offsetHours}s`})
          </button>
        )}
      </div>

      {/* Interactive Time Slider */}
      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-400" />
            Toplantı / Zaman Kaydırıcı:
          </span>
          <span className="font-mono text-cyan-300 font-bold">
            {offsetHours === 0 ? 'Canlı Akış' : `${offsetHours > 0 ? '+' : ''}${offsetHours} Saat Fark`}
          </span>
        </div>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={offsetHours}
          onChange={(e) => setOffsetHours(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* World Cities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {CITIES.map(city => {
          const { formattedTime, isDay, isWorkHour, dayName } = getCityTime(city.timeZone);
          return (
            <div
              key={city.name}
              className={`p-3 rounded-2xl border transition-all ${
                isWorkHour
                  ? 'bg-cyan-500/[0.04] border-cyan-500/30'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{city.flag}</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  {isDay ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                  {dayName}
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight">
                {formattedTime}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <strong className="text-gray-200 font-medium truncate">{city.name}</strong>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isWorkHour ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'}`}>
                  {isWorkHour ? 'Mesai' : 'Kapalı'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
