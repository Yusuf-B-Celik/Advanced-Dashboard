import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles 
} from 'lucide-react';

export const ClockCalendarWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const dayNumber = time.getDate();
  const year = time.getFullYear();

  return (
    <div className="flex flex-col h-full justify-between items-center text-center p-2">
      {/* Date Header */}
      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold uppercase tracking-widest">
        <CalendarIcon className="w-3.5 h-3.5" />
        <span>{dayName}</span>
      </div>

      {/* Big Digital Clock */}
      <div className="my-3">
        <div className="text-4xl font-black text-white font-mono tracking-wider flex items-center justify-center">
          <span>{hours}</span>
          <span className="text-cyan-400 animate-pulse">:</span>
          <span>{minutes}</span>
          <span className="text-cyan-400 animate-pulse">:</span>
          <span className="text-2xl text-gray-400 font-medium ml-0.5">{seconds}</span>
        </div>
        <div className="text-sm font-bold text-gray-300 mt-1">
          {dayNumber} {monthName} {year}
        </div>
      </div>

      {/* Week Info */}
      <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
        <span>Saat Dilimi: <strong>GMT+3 (İstanbul)</strong></span>
        <span className="text-cyan-400 font-medium">Yerel Sistem</span>
      </div>
    </div>
  );
};
