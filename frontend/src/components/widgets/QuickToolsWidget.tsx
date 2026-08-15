import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Scale, 
  Code, 
  Copy, 
  Check, 
  RefreshCw,
  QrCode,
  Calculator,
  Binary,
  Clock,
  Palette,
  FileCode,
  Dices,
  Download
} from 'lucide-react';

export const QuickToolsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'password' | 'qrcode' | 'converter' | 'percent' | 'base64' | 'timestamp' | 'color' | 'json' | 'random'
  >('password');

  // --- Password Generator State ---
  const [pwLength, setPwLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPw, setGeneratedPw] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generatePassword = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let res = '';
    for (let i = 0; i < pwLength; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPw(res);
  };

  useEffect(() => {
    generatePassword();
  }, [pwLength, useUpper, useNumbers, useSymbols]);

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  // --- QR Code State ---
  const [qrText, setQrText] = useState('https://github.com');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrText || ' ')}`;

  // --- Unit Converter State ---
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'temp' | 'data' | 'speed'>('length');
  const [unitValue, setUnitValue] = useState<number>(10);

  // --- Percentage & VAT Calculator ---
  const [basePrice, setBasePrice] = useState<number>(1000);
  const [vatRate, setVatRate] = useState<number>(20);
  const [discountRate, setDiscountRate] = useState<number>(15);

  const vatAmount = (basePrice * vatRate) / 100;
  const totalWithVat = basePrice + vatAmount;
  const discountAmount = (basePrice * discountRate) / 100;
  const priceAfterDiscount = Math.max(0, basePrice - discountAmount);

  // --- Base64 & Hash State ---
  const [rawText, setRawText] = useState('Nexus Dashboard 2026');
  const [base64Encoded, setBase64Encoded] = useState('');
  const [base64Decoded, setBase64Decoded] = useState('');

  useEffect(() => {
    try {
      setBase64Encoded(btoa(unescape(encodeURIComponent(rawText))));
    } catch {
      setBase64Encoded('');
    }
  }, [rawText]);

  // --- Timestamp Converter ---
  const [epochSec, setEpochSec] = useState<number>(Math.floor(Date.now() / 1000));
  const dateFromEpoch = new Date(epochSec * 1000).toLocaleString('tr-TR');

  // --- Color & Gradient Generator ---
  const [color1, setColor1] = useState('#00f0ff');
  const [color2, setColor2] = useState('#7000ff');

  // --- JSON Formatter / Validator ---
  const [jsonInput, setJsonInput] = useState('{"name":"Nexus Dashboard","version":"3.0","active":true,"widgets":25}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const formatJson = (minify = false) => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonOutput(minify ? JSON.stringify(obj) : JSON.stringify(obj, null, 2));
      setJsonError('');
    } catch (e: any) {
      setJsonError('Geçersiz JSON formatı: ' + e.message);
    }
  };

  // --- Random Generator (Dice & Coin) ---
  const [randomResult, setRandomResult] = useState<string>('Hazır');
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setRandomResult(`🎲 Zar: ${roll}`);
  };

  const flipCoin = () => {
    const flip = Math.random() < 0.5 ? '🪙 Yazı' : '🪙 Tura';
    setRandomResult(flip);
  };

  const generateRng = () => {
    const min = Math.min(minNum, maxNum);
    const max = Math.max(minNum, maxNum);
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomResult(`🔢 Rastgele Sayı: ${val}`);
  };

  const tabs = [
    { id: 'password', label: 'Şifre', icon: Lock },
    { id: 'qrcode', label: 'QR Kod', icon: QrCode },
    { id: 'converter', label: 'Birimler', icon: Scale },
    { id: 'percent', label: 'Yüzde/KDV', icon: Calculator },
    { id: 'base64', label: 'Base64/URL', icon: Binary },
    { id: 'timestamp', label: 'Timestamp', icon: Clock },
    { id: 'color', label: 'Renk & CSS', icon: Palette },
    { id: 'json', label: 'JSON', icon: FileCode },
    { id: 'random', label: 'Rastgele/Zar', icon: Dices },
  ] as const;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Tabs Horizontal Scroll */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-2 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                isActive ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Password Generator */}
      {activeTab === 'password' && (
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 flex-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
            <span className="font-mono text-sm text-cyan-300 font-bold tracking-wider truncate mr-2 select-all">
              {generatedPw}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={generatePassword}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                title="Yeni Şifre"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => copyToClipboard(generatedPw, 'pw')}
                className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold text-xs flex items-center gap-1"
              >
                {copiedKey === 'pw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'pw' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Uzunluk: <strong>{pwLength}</strong> karakter</span>
              <input
                type="range"
                min="6"
                max="36"
                value={pwLength}
                onChange={(e) => setPwLength(Number(e.target.value))}
                className="w-32 accent-cyan-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-300">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="rounded accent-cyan-400" />
                <span>Büyük Harf</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="rounded accent-cyan-400" />
                <span>Sayılar</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="rounded accent-cyan-400" />
                <span>Semboller</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: QR Code Generator */}
      {activeTab === 'qrcode' && (
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 flex-1 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2 rounded-2xl bg-white flex items-center justify-center shrink-0">
            <img src={qrUrl} alt="QR Code" className="w-28 h-28 object-contain" />
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-gray-400 block">Metin veya URL Girin:</label>
            <input
              type="text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                download="qr-code.png"
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR İndir</span>
              </a>
              <button
                onClick={() => copyToClipboard(qrText, 'qr')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'qr' ? 'Kopyalandı' : 'Metni Kopyala'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Unit Converter */}
      {activeTab === 'converter' && (
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={unitValue}
              onChange={(e) => setUnitValue(Number(e.target.value))}
              className="w-24 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none font-mono"
            />
            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              {(['length', 'weight', 'temp', 'data', 'speed'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setUnitType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    unitType === t ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {t === 'length' ? 'Uzunluk' : t === 'weight' ? 'Ağırlık' : t === 'temp' ? 'Sıcaklık' : t === 'data' ? 'Veri' : 'Hız'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {unitType === 'length' && (
              <>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Kilometre</span>
                  <strong className="text-white text-sm">{unitValue} km</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Mil (Miles)</span>
                  <strong className="text-cyan-300 text-sm">{(unitValue * 0.621371).toFixed(2)} mi</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Metre</span>
                  <strong className="text-purple-300 text-sm">{(unitValue * 1000).toLocaleString()} m</strong>
                </div>
              </>
            )}
            {unitType === 'weight' && (
              <>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Kilogram</span>
                  <strong className="text-white text-sm">{unitValue} kg</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Pound (lbs)</span>
                  <strong className="text-cyan-300 text-sm">{(unitValue * 2.20462).toFixed(2)} lbs</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Gram</span>
                  <strong className="text-purple-300 text-sm">{(unitValue * 1000).toLocaleString()} g</strong>
                </div>
              </>
            )}
            {unitType === 'temp' && (
              <>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Celsius</span>
                  <strong className="text-white text-sm">{unitValue} °C</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Fahrenheit</span>
                  <strong className="text-cyan-300 text-sm">{((unitValue * 9/5) + 32).toFixed(1)} °F</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Kelvin</span>
                  <strong className="text-purple-300 text-sm">{(unitValue + 273.15).toFixed(2)} K</strong>
                </div>
              </>
            )}
            {unitType === 'data' && (
              <>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Gigabyte</span>
                  <strong className="text-white text-sm">{unitValue} GB</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Megabyte</span>
                  <strong className="text-cyan-300 text-sm">{(unitValue * 1024).toLocaleString()} MB</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Terabyte</span>
                  <strong className="text-purple-300 text-sm">{(unitValue / 1024).toFixed(3)} TB</strong>
                </div>
              </>
            )}
            {unitType === 'speed' && (
              <>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">km/s (km/h)</span>
                  <strong className="text-white text-sm">{unitValue} km/s</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">mph</span>
                  <strong className="text-cyan-300 text-sm">{(unitValue * 0.621371).toFixed(1)} mph</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-400 block text-[10px]">Knot</span>
                  <strong className="text-purple-300 text-sm">{(unitValue * 0.539957).toFixed(1)} kn</strong>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Percentage & VAT */}
      {activeTab === 'percent' && (
        <div className="space-y-3 flex-1">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Ana Tutar (₺)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">KDV Oranı (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">İndirim Oranı (%)</label>
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-400 block">KDV Tutarı</span>
              <strong className="text-cyan-300 font-mono">+{vatAmount.toLocaleString()}₺</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-300 block">KDV Dahil Toplam</span>
              <strong className="text-emerald-400 font-mono">{totalWithVat.toLocaleString()}₺</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-gray-400 block">İndirim Tutarı</span>
              <strong className="text-rose-300 font-mono">-{discountAmount.toLocaleString()}₺</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 block">İndirimli Fiyat</span>
              <strong className="text-purple-300 font-mono">{priceAfterDiscount.toLocaleString()}₺</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Base64 / URL */}
      {activeTab === 'base64' && (
        <div className="space-y-2 flex-1">
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dönüştürülecek metin..."
            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
          />
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Base64 Kodlama:</span>
              <button
                onClick={() => copyToClipboard(base64Encoded, 'b64')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'b64' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Kopyala</span>
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 truncate select-all">{base64Encoded}</div>
          </div>
        </div>
      )}

      {/* Tab 6: Timestamp */}
      {activeTab === 'timestamp' && (
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={epochSec}
              onChange={(e) => setEpochSec(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono"
            />
            <button
              onClick={() => setEpochSec(Math.floor(Date.now() / 1000))}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-bold"
            >
              Şimdi
            </button>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <span className="text-gray-400 block text-[10px]">Tarih & Saat (TR):</span>
            <strong className="text-base text-white font-mono mt-0.5 block">{dateFromEpoch}</strong>
          </div>
        </div>
      )}

      {/* Tab 7: Color & Gradient */}
      {activeTab === 'color' && (
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
              <span className="text-xs font-mono text-white uppercase">{color1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
              <span className="text-xs font-mono text-white uppercase">{color2}</span>
            </div>
          </div>

          <div
            className="h-12 rounded-xl border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner"
            style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
          >
            Önizleme
          </div>

          <button
            onClick={() => copyToClipboard(`background: linear-gradient(135deg, ${color1}, ${color2});`, 'css')}
            className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-cyan-300 font-mono font-bold flex items-center justify-center gap-1.5"
          >
            {copiedKey === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>CSS Kodu Kopyala</span>
          </button>
        </div>
      )}

      {/* Tab 8: JSON Formatter */}
      {activeTab === 'json' && (
        <div className="space-y-2 flex-1">
          <textarea
            rows={2}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="JSON yapıştırın..."
            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-gray-200 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => formatJson(false)}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs"
            >
              Formatla (Beautify)
            </button>
            <button
              onClick={() => formatJson(true)}
              className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-xs"
            >
              Küçült (Minify)
            </button>
          </div>
          {jsonError ? (
            <div className="text-[10px] text-rose-400 font-mono">{jsonError}</div>
          ) : jsonOutput ? (
            <pre className="p-2 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-cyan-200 max-h-24 overflow-y-auto select-all">
              {jsonOutput}
            </pre>
          ) : null}
        </div>
      )}

      {/* Tab 9: Random RNG & Dice */}
      {activeTab === 'random' && (
        <div className="space-y-3 flex-1">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <strong className="text-base sm:text-lg font-bold text-cyan-300 font-mono">{randomResult}</strong>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={rollDice}
              className="flex-1 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs transition"
            >
              🎲 Zar At (1-6)
            </button>
            <button
              onClick={flipCoin}
              className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition"
            >
              🪙 Yazı - Tura
            </button>
            <button
              onClick={generateRng}
              className="flex-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition"
            >
              🔢 Sayı Üret
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
