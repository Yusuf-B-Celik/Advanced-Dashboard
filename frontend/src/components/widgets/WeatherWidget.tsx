import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  CloudLightning,
  Search,
  ChevronDown
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  conditionCode: number;
  conditionText: string;
  aqi: number;
  daily: Array<{
    date: string;
    dayName: string;
    maxTemp: number;
    minTemp: number;
    code: number;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
  }>;
}

// 81 Provinces of Turkey with Coordinates
export const TURKEY_PROVINCES: Record<string, { lat: number; lon: number }> = {
  'Adana': { lat: 37.0000, lon: 35.3213 },
  'Adıyaman': { lat: 37.7648, lon: 38.2786 },
  'Afyonkarahisar': { lat: 38.7507, lon: 30.5567 },
  'Ağrı': { lat: 39.7191, lon: 43.0503 },
  'Amasya': { lat: 40.6533, lon: 35.8331 },
  'Ankara': { lat: 39.9334, lon: 32.8597 },
  'Antalya': { lat: 36.8969, lon: 30.7133 },
  'Artvin': { lat: 41.1828, lon: 41.8183 },
  'Aydın': { lat: 37.8560, lon: 27.8416 },
  'Balıkesir': { lat: 39.6484, lon: 27.8826 },
  'Bilecik': { lat: 40.1451, lon: 29.9799 },
  'Bingöl': { lat: 38.8853, lon: 40.4983 },
  'Bitlis': { lat: 38.4006, lon: 42.1095 },
  'Bolu': { lat: 40.7350, lon: 31.6061 },
  'Burdur': { lat: 37.7203, lon: 30.2908 },
  'Bursa': { lat: 40.1828, lon: 29.0667 },
  'Çanakkale': { lat: 40.1553, lon: 26.4142 },
  'Çankırı': { lat: 40.6013, lon: 33.6134 },
  'Çorum': { lat: 40.5506, lon: 34.9556 },
  'Denizli': { lat: 37.7765, lon: 29.0864 },
  'Diyarbakır': { lat: 37.9144, lon: 40.2306 },
  'Edirne': { lat: 41.6772, lon: 26.5557 },
  'Elazığ': { lat: 38.6810, lon: 39.2264 },
  'Erzincan': { lat: 39.7500, lon: 39.5000 },
  'Erzurum': { lat: 39.9000, lon: 41.2700 },
  'Eskişehir': { lat: 39.7767, lon: 30.5206 },
  'Gaziantep': { lat: 37.0662, lon: 37.3833 },
  'Giresun': { lat: 40.9128, lon: 38.3895 },
  'Gümüşhane': { lat: 40.4600, lon: 39.4700 },
  'Hakkari': { lat: 37.5800, lon: 43.7300 },
  'Hatay': { lat: 36.4018, lon: 36.3498 },
  'Isparta': { lat: 37.7648, lon: 30.5566 },
  'Mersin': { lat: 36.8000, lon: 34.6333 },
  'İstanbul': { lat: 41.0082, lon: 28.9784 },
  'İzmir': { lat: 38.4192, lon: 27.1287 },
  'Kars': { lat: 40.6167, lon: 43.1000 },
  'Kastamonu': { lat: 41.3887, lon: 33.7827 },
  'Kayseri': { lat: 38.7312, lon: 35.4787 },
  'Kırklareli': { lat: 41.7333, lon: 27.2167 },
  'Kırşehir': { lat: 39.1425, lon: 34.1709 },
  'Kocaeli': { lat: 40.8533, lon: 29.8815 },
  'Konya': { lat: 37.8667, lon: 32.4833 },
  'Kütahya': { lat: 39.4167, lon: 29.9833 },
  'Malatya': { lat: 38.3552, lon: 38.3095 },
  'Manisa': { lat: 38.6191, lon: 27.4289 },
  'Kahramanmaraş': { lat: 37.5858, lon: 36.9371 },
  'Mardin': { lat: 37.3212, lon: 40.7245 },
  'Muğla': { lat: 37.2153, lon: 28.3636 },
  'Muş': { lat: 38.7432, lon: 41.5064 },
  'Nevşehir': { lat: 38.6244, lon: 34.7144 },
  'Niğde': { lat: 37.9667, lon: 34.6833 },
  'Ordu': { lat: 40.9839, lon: 37.8764 },
  'Rize': { lat: 41.0201, lon: 40.5234 },
  'Sakarya': { lat: 40.7569, lon: 30.3783 },
  'Samsun': { lat: 41.2928, lon: 36.3313 },
  'Siirt': { lat: 37.9333, lon: 41.9500 },
  'Sinop': { lat: 42.0231, lon: 35.1531 },
  'Sivas': { lat: 39.7477, lon: 37.0179 },
  'Tekirdağ': { lat: 40.9833, lon: 27.5167 },
  'Tokat': { lat: 40.3167, lon: 36.5500 },
  'Trabzon': { lat: 41.0027, lon: 39.7168 },
  'Tunceli': { lat: 39.1079, lon: 39.5401 },
  'Şanlıurfa': { lat: 37.1591, lon: 38.7969 },
  'Uşak': { lat: 38.6823, lon: 29.4082 },
  'Van': { lat: 38.4891, lon: 43.4089 },
  'Yozgat': { lat: 39.8181, lon: 34.8147 },
  'Zonguldak': { lat: 41.4564, lon: 31.7987 },
  'Aksaray': { lat: 38.3687, lon: 34.0370 },
  'Bayburt': { lat: 40.2552, lon: 40.2249 },
  'Karaman': { lat: 37.1759, lon: 33.2287 },
  'Kırıkkale': { lat: 39.8468, lon: 33.5153 },
  'Batman': { lat: 37.8812, lon: 41.1293 },
  'Şırnak': { lat: 37.5164, lon: 42.4594 },
  'Bartın': { lat: 41.6344, lon: 32.3375 },
  'Ardahan': { lat: 41.1105, lon: 42.7022 },
  'Iğdır': { lat: 39.9196, lon: 44.0454 },
  'Yalova': { lat: 40.6500, lon: 29.2667 },
  'Karabük': { lat: 41.2061, lon: 32.6204 },
  'Kilis': { lat: 36.7184, lon: 37.1212 },
  'Osmaniye': { lat: 37.0742, lon: 36.2478 },
  'Düzce': { lat: 40.8438, lon: 31.1565 }
};

export const WeatherWidget: React.FC = () => {
  const { settings, updateSettings } = useDashboard();
  const [selectedCity, setSelectedCity] = useState(settings.weatherCity || 'İstanbul');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const allCityNames = Object.keys(TURKEY_PROVINCES).sort((a, b) => a.localeCompare(b, 'tr'));

  const filteredCities = allCityNames.filter(c => 
    c.toLocaleLowerCase('tr').includes(citySearch.toLocaleLowerCase('tr'))
  );

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      const coords = TURKEY_PROVINCES[city] || TURKEY_PROVINCES['İstanbul'];
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();

      const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const dailyList = data.daily?.time?.slice(0, 5).map((t: string, i: number) => {
        const d = new Date(t);
        return {
          date: t,
          dayName: i === 0 ? 'Bugün' : days[d.getDay()],
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weather_code[i]
        };
      }) || [];

      // Next 6 hours
      const currentHour = new Date().getHours();
      const hourlyList = data.hourly?.time?.slice(currentHour, currentHour + 6).map((t: string, i: number) => ({
        time: t.split('T')[1]?.slice(0, 5) || `${currentHour + i}:00`,
        temp: Math.round(data.hourly.temperature_2m[currentHour + i] || 0)
      })) || [];

      const code = data.current?.weather_code || 0;
      const getConditionText = (c: number) => {
        if (c === 0) return 'Açık & Güneşli';
        if (c <= 3) return 'Parçalı Bulutlu';
        if (c <= 48) return 'Sisli';
        if (c <= 67) return 'Yağmurlu';
        if (c <= 77) return 'Kar Yağışlı';
        if (c <= 82) return 'Sağanak Yağışlı';
        return 'Gök Gürültülü Fırtına';
      };

      setWeather({
        city,
        temp: Math.round(data.current?.temperature_2m || 18),
        feelsLike: Math.round(data.current?.apparent_temperature || 18),
        humidity: Math.round(data.current?.relative_humidity_2m || 60),
        windSpeed: Math.round(data.current?.wind_speed_10m || 12),
        uvIndex: Math.round(data.current?.uv_index || 3),
        conditionCode: code,
        conditionText: getConditionText(code),
        aqi: 35,
        daily: dailyList,
        hourly: hourlyList
      });
    } catch (e) {
      console.warn('Weather fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setShowSearchDropdown(false);
    setCitySearch('');
    updateSettings({ weatherCity: newCity });
  };

  const getWeatherIcon = (code: number, size = "w-6 h-6") => {
    if (code === 0) return <Sun className={`${size} text-amber-400`} />;
    if (code <= 3) return <CloudSun className={`${size} text-cyan-300`} />;
    if (code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
    if (code <= 77) return <CloudSnow className={`${size} text-indigo-300`} />;
    return <CloudLightning className={`${size} text-purple-400`} />;
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* City Selector with 81 Province Search */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSearchDropdown(!showSearchDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedCity} (81 İl)</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <span className="text-[11px] text-gray-400">Open-Meteo Canlı</span>
        </div>

        {/* Search Dropdown Modal */}
        {showSearchDropdown && (
          <div className="absolute left-0 top-full mt-2 w-64 z-50 p-2 rounded-2xl bg-gray-950/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Şehir ara (örn. İzmir, Trabzon)..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
              {filteredCities.map(c => (
                <button
                  key={c}
                  onClick={() => handleCityChange(c)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    selectedCity === c ? 'bg-cyan-500 text-black font-bold' : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span>{c}</span>
                  {selectedCity === c && <span className="text-[10px]">Seçili</span>}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <div className="text-center py-3 text-xs text-gray-500">Şehir bulunamadı</div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading || !weather ? (
        <div className="flex items-center justify-center h-36">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Main Temp & Condition */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/50 border border-cyan-500/20">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.conditionCode, "w-10 h-10")}
              <div>
                <div className="text-2xl font-extrabold text-white">
                  {weather.temp}°C
                </div>
                <div className="text-xs text-cyan-300 font-medium">
                  {weather.conditionText}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-gray-400 space-y-0.5">
              <div>Hissedilen: <strong className="text-gray-200">{weather.feelsLike}°C</strong></div>
              <div>Nem: <strong className="text-gray-200">%{weather.humidity}</strong></div>
              <div>Rüzgar: <strong className="text-gray-200">{weather.windSpeed} km/s</strong></div>
            </div>
          </div>

          {/* Hourly Mini Curve */}
          <div className="grid grid-cols-6 gap-1 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            {weather.hourly.map((h, i) => (
              <div key={i} className="text-[10px] text-gray-300">
                <div className="text-gray-500">{h.time}</div>
                <div className="font-bold text-white mt-1">{h.temp}°</div>
              </div>
            ))}
          </div>

          {/* 5-Day Forecast */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            {weather.daily.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/5 transition">
                <span className="w-12 text-gray-300 font-medium">{d.dayName}</span>
                <div className="flex items-center gap-1.5">
                  {getWeatherIcon(d.code, "w-4 h-4")}
                </div>
                <div className="text-right space-x-2 text-xs">
                  <span className="font-bold text-white">{d.maxTemp}°</span>
                  <span className="text-gray-500">{d.minTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
