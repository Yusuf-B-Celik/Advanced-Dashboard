import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  DollarSign,
  Newspaper,
  Code2,
  Mail,
  Square
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { MarkdownViewer } from '../common/MarkdownViewer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export const AIAssistantWidget: React.FC = () => {
  const { settings } = useDashboard();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Merhaba! Ben **MiniMax-M3 Yapay Zeka Asistanınız**.
Son 24 saatlik Türkçe haberleri analiz edebilir, canlı piyasa ve döviz kurlarını yorumlayabilir, kod yazabilir veya dilediğiniz herhangi bir konuda güncel web verileriyle yardımcı olabilirim.

*Nasıl yardımcı olabilirim?*`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setInput('');
    setIsLoading(true);

    const apiMessages = [...messages, userMessage]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel || 'MiniMax-M3',
          planType: settings.minimaxPlanType || 'token_plan',
          apiProtocol: settings.minimaxProtocol || 'anthropic',
          region: settings.minimaxRegion || 'global',
          customBaseUrl: settings.minimaxBaseUrl,
          groupId: settings.minimaxGroupId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok || !res.body) {
        throw new Error(`Sunucu hatası (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages(prev =>
                  prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedText } : m)
                );
              } else if (parsed.error) {
                accumulatedText += `\n\n*(Hata: ${parsed.error})*`;
                setMessages(prev =>
                  prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedText } : m)
                );
              }
            } catch (e) {
              // non-json line
            }
          }
        }
      }

      // Finalize streaming
      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
        );
      } else {
        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId ? {
            ...m,
            content: `⚠️ Yanıt oluşturulurken bir aksaklık oluştu: ${err.message}`,
            isStreaming: false
          } : m)
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Sohbet temizlendi. Yeni bir soru sorabilir veya aşağıdaki hızlı butonları kullanabilirsiniz.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: '📰 Gündemi Yorumla', prompt: 'Son 24 saatte Türkiye ve dünya gündeminde öne çıkan en kritik 3 gelişmeyi ve piyasalara etkilerini analiz eder misin?', icon: Newspaper },
    { label: '📈 Piyasa & Dolar', prompt: 'Canlı döviz kurlarını ve gram altının durumunu özetleyip kısa bir piyasa değerlendirmesi yapar mısın?', icon: DollarSign },
    { label: '💻 Kod & Problem', prompt: 'Modern TypeScript ile yüksek performanslı bir LRU Cache sınıfı yazar mısın?', icon: Code2 },
    { label: '✍️ E-posta Taslağı', prompt: 'Yöneticime haftalık proje ilerleme raporunu sunan profesyonel ve net bir e-posta taslağı hazırla.', icon: Mail },
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Model Badge & Actions */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-300">Model:</span>
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {settings.minimaxModel || 'MiniMax-M3'}
          </span>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30 hidden sm:inline">
            Canlı Web & Piyasa Verisi
          </span>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition"
          title="Sohbeti Temizle"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-500/30 text-gray-300 hover:text-white border border-white/5 text-xs whitespace-nowrap flex items-center gap-1.5 transition shrink-0 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[300px] max-h-[580px]">
        {messages.map((m) => {
          const isAssistant = m.role === 'assistant';
          const isCopied = copiedId === m.id;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isAssistant
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[88%] sm:max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                  isAssistant
                    ? 'bg-white/[0.04] border border-white/10 text-gray-200'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-md shadow-cyan-500/10'
                }`}
              >
                {/* Content */}
                {isAssistant ? (
                  <div>
                    {m.content ? (
                      <MarkdownViewer content={m.content} />
                    ) : (
                      <div className="flex items-center gap-2 py-1 text-cyan-300 text-xs">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>MiniMax-M3 yanıt üretiyor...</span>
                      </div>
                    )}
                    {m.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                )}

                {/* Timestamp & Copy Button */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-gray-400">
                  <span>{m.timestamp}</span>

                  {isAssistant && m.content && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-1"
                      title="Kopyala"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="MiniMax-M3'e bir soru sorun, piyasa veya haberleri analiz ettirin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 pl-4 pr-12 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="absolute right-2 p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition"
              title="Yanıtı Durdur"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold transition disabled:opacity-30 disabled:hover:from-cyan-500 shadow-md shadow-cyan-500/20"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
