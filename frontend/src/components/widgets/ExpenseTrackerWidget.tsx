import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Sparkles,
  Mic,
  MicOff,
  Bot,
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseItem } from '../../types';
import { useDashboard } from '../../contexts/DashboardContext';

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: '1', title: 'MiniMax AI Aboneliği', amount: 350, type: 'expense', category: 'Yazılım', date: '2026-08-14' },
  { id: '2', title: 'Freelance Proje Ödemesi', amount: 8500, type: 'income', category: 'İş', date: '2026-08-12' },
  { id: '3', title: 'Sunucu & Domain', amount: 420, type: 'expense', category: 'Altyapı', date: '2026-08-10' },
  { id: '4', title: 'Kahve & Mola', amount: 180, type: 'expense', category: 'Kişisel', date: '2026-08-15' },
];

export const ExpenseTrackerWidget: React.FC = () => {
  const { settings } = useDashboard();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('dashboard_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Genel');
  const [showAdd, setShowAdd] = useState(false);

  // AI Expense State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiExpensePrompt, setAiExpensePrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().slice(0, 10)
    };

    const updated = [newItem, ...expenses];
    setExpenses(updated);
    localStorage.setItem('dashboard_expenses', JSON.stringify(updated));
    setTitle('');
    setAmount('');
    setShowAdd(false);
  };

  const handleAiExpenseAdd = async (textToProcess?: string) => {
    const input = (textToProcess || aiExpensePrompt).trim();
    if (!input) return;

    try {
      setIsAiProcessing(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Aşağıdaki kullanıcı harcama/gelir cümlesinden tutar ve kategoriyi çıkar ve SADECE saf bir JSON döndür:\n"${input}"\n\nBeklenen JSON formatı:\n{"title": "Harcama veya gelir başlığı", "amount": 450, "type": "expense" | "income", "category": "Yazılım" | "Altyapı" | "İş" | "Kişisel" | "Fatura" | "Genel"}`
            }
          ],
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel || 'MiniMax-M3',
          planType: settings.minimaxPlanType || 'token_plan',
          apiProtocol: settings.minimaxProtocol || 'anthropic'
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        let cleanJson = data.reply.trim();
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleanJson);

        const newItem: ExpenseItem = {
          id: `exp-${Date.now()}`,
          title: parsed.title || input,
          amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 100,
          type: (parsed.type === 'income' ? 'income' : 'expense'),
          category: parsed.category || 'Genel',
          date: new Date().toISOString().slice(0, 10)
        };

        const updated = [newItem, ...expenses];
        setExpenses(updated);
        localStorage.setItem('dashboard_expenses', JSON.stringify(updated));

        setAiExpensePrompt('');
        setShowAiModal(false);
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (err) {
      console.error('AI Expense error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiExpensePrompt(transcript);
      handleAiExpenseAdd(transcript);
    };

    recognition.start();
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('dashboard_expenses', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Bütçe & Harcama Takibi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAiModal(true)}
            className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition"
            title="AI ile Konuşarak Harcama Ekle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">AI Harcama</span>
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition"
            title="Manuel Kayıt Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-300 font-medium block">Toplam Gelir</span>
          <strong className="text-xs sm:text-sm text-emerald-400 font-mono">+{totalIncome.toLocaleString()}₺</strong>
        </div>
        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] text-rose-300 font-medium block">Toplam Gider</span>
          <strong className="text-xs sm:text-sm text-rose-400 font-mono">-{totalExpense.toLocaleString()}₺</strong>
        </div>
        <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] text-cyan-300 font-medium block">Net Bakiye</span>
          <strong className={`text-xs sm:text-sm font-mono ${netBalance >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>
            {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString()}₺
          </strong>
        </div>
      </div>

      {/* AI Expense Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Bot className="w-4 h-4" />
                <span>AI ile Harcama veya Gelir Ekle</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300">
                Harcamanızı veya gelirinizi doğal dille yazın veya konuşun. MiniMax-M3 tutarı, türü ve kategoriyi otomatik olarak ayrıştıracaktır.
              </p>

              <textarea
                rows={2}
                value={aiExpensePrompt}
                onChange={(e) => setAiExpensePrompt(e.target.value)}
                placeholder='Örn: "Bugün marketten 480 lira mutfak alışverişi yaptım" veya "Müşteriden 12500 TL yazılım ücreti geldi"'
                className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                    isListening ? 'bg-red-500 text-white animate-pulse border-red-400' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isListening ? 'Dinleniyor...' : 'Sesle Söyle'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-gray-300 text-xs"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleAiExpenseAdd()}
                    disabled={isAiProcessing || !aiExpensePrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
                    <span>{isAiProcessing ? 'Ayrıştırılıyor...' : 'Kaydı Ekle'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Açıklama (örn. Market)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            />
            <input
              type="number"
              placeholder="Tutar (₺)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400'}`}
              >
                Gider
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
              >
                Gelir
              </button>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2 py-1 rounded-lg bg-gray-900 border border-white/10 text-xs text-white"
            >
              <option value="Genel">Genel</option>
              <option value="Yazılım">Yazılım</option>
              <option value="Altyapı">Altyapı</option>
              <option value="İş">İş / Gelir</option>
              <option value="Kişisel">Kişisel</option>
              <option value="Fatura">Fatura</option>
            </select>

            <button type="submit" className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-bold text-xs">
              Ekle
            </button>
          </div>
        </form>
      )}

      {/* Expense List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] pr-1">
        {expenses.map(item => (
          <div
            key={item.id}
            className="p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${item.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {item.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">{item.title}</span>
                <span className="text-[10px] text-gray-400">{item.category} • {item.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}₺
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-rose-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
