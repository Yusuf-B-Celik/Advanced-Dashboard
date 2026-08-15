import axios from 'axios';
import { newsService } from './newsService';
import { financeService } from './financeService';
import { webSearchService } from './webSearchService';

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SummaryResult {
  bullets: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyTakeaway: string;
  source: string;
  analyzedAt: string;
  modelUsed: string;
}

export interface MiniMaxConfig {
  apiKey?: string;
  planType?: 'pay_as_you_go' | 'token_plan'; // Pay-as-you-go vs Token Plan
  apiProtocol?: 'anthropic' | 'openai' | 'native'; // Anthropic API, OpenAI API, Native
  model?: string; // MiniMax-M3, MiniMax-Text-01, MiniMax-M2.7, abab6.5s-chat
  region?: 'global' | 'global_alt' | 'china' | 'custom';
  customBaseUrl?: string;
  groupId?: string;
  enableLiveContext?: boolean; // Injects live market, news and web search
}

export class MiniMaxService {
  private defaultApiKey: string = process.env.MINIMAX_API_KEY || '';
  private defaultModel: string = 'MiniMax-M3';

  private getBaseUrls(config: MiniMaxConfig): string[] {
    if (config.customBaseUrl && config.customBaseUrl.trim()) {
      return [config.customBaseUrl.trim().replace(/\/+$/, '')];
    }
    if (config.region === 'china') {
      return ['https://api.minimaxi.chat', 'https://api.minimax.chat', 'https://api.minimax.io'];
    }
    return ['https://api.minimax.io', 'https://api.minimax.chat', 'https://api.minimaxi.chat'];
  }

  /**
   * Build comprehensive real-time context (Live Market Data, Breaking News, Web Search)
   */
  async buildLiveSystemContext(userQuery?: string): Promise<string> {
    const now = new Date().toLocaleString('tr-TR', { 
      timeZone: 'Europe/Istanbul',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    let context = `[SİSTEM BİLGİSİ - CANLI VERİ VE ZAMAN AKIŞI]
Şu anki Türkiye Saati ve Tarihi: ${now}

`;

    // 1. Live Market & Finance Data
    try {
      const quotes = await financeService.getFinanceData();
      if (quotes && quotes.length > 0) {
        context += `[CANLI PİYASA VE DÖVİZ KURLARI]\n`;
        quotes.slice(0, 10).forEach((q: any) => {
          context += `- ${q.name} (${q.code}): ${q.sell} ${q.unit} (Değişim: %${q.changeRate})\n`;
        });
        context += '\n';
      }
    } catch (e) {
      // ignore
    }

    // 2. Latest Turkish Breaking News
    try {
      const news = await newsService.fetchAllNews();
      if (news && news.length > 0) {
        context += `[SON DAKİKA TÜRKİYE VE DÜNYA HABERLERİ (SON 24 SAAT)]
`;
        news.slice(0, 15).forEach((n, idx) => {
          context += `${idx + 1}. [${n.category}] (${n.source}) ${n.title} - ${n.snippet || ''}\n`;
        });
        context += '\n';
      }
    } catch (e) {
      // ignore
    }

    // 3. Live Web Search if user query mentions specific current topic / search query
    if (userQuery && userQuery.trim().length > 3) {
      const qLower = userQuery.toLowerCase();
      const needsSearch = qLower.includes('dolar') || qLower.includes('altın') || 
                          qLower.includes('gündem') || qLower.includes('haber') || 
                          qLower.includes('borsa') || qLower.includes('kimdir') ||
                          qLower.includes('son durum') || qLower.includes('nedir') ||
                          qLower.includes('fiyat') || qLower.includes('maç');

      if (needsSearch) {
        try {
          const searchResults = await webSearchService.searchWeb(userQuery, 4);
          if (searchResults.length > 0) {
            context += `[CANLI WEB ARAMA SONUÇLARI]
`;
            searchResults.forEach(r => {
              context += `- ${r.title}: ${r.snippet} (Kaynak: ${r.link})\n`;
            });
            context += '\n';
          }
        } catch (e) {
          // ignore
        }
      }
    }

    context += `Sen Türkçe ve küresel konularda uzman, son derece bilgili, samimi, analitik ve tarafsız bir Yapay Zeka Asistanısın (MiniMax-M3).
Yukarıda sana sunulan canlı piyasa kurlarını, son dakika haberlerini ve web arama verilerini doğrulanmış güncel kaynaklar olarak kullanarak kullanıcının sorularına eksiksiz, zengin ve biçimlendirilmiş (Markdown başlıkları, maddeleri, tabloları ve kalın vurgular) Türkçe yanıtlar ver.`;

    return context;
  }

  /**
   * Stream Chat Completion (Server-Sent Events)
   */
  async createChatCompletionStream(
    messages: MiniMaxMessage[],
    config: MiniMaxConfig = {},
    onChunk: (chunkText: string) => void
  ): Promise<void> {
    const apiKey = config.apiKey?.trim() || this.defaultApiKey;
    const model = config.model?.trim() || this.defaultModel;
    const protocol = config.apiProtocol || 'anthropic';

    if (!apiKey) {
      throw new Error('MiniMax API Key (veya Token Plan Subscription Key) bulunamadı.');
    }

    // Get last user query to inject relevant web search
    const lastUserQuery = messages.filter(m => m.role === 'user').pop()?.content || '';
    const liveSystemPrompt = await this.buildLiveSystemContext(lastUserQuery);

    const baseUrls = this.getBaseUrls(config);

    // Try Anthropic Stream first (recommended), then OpenAI stream
    for (const baseUrl of baseUrls) {
      try {
        if (protocol === 'anthropic' || protocol === 'native') {
          const url = `${baseUrl}/anthropic/v1/messages`;
          const chatMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }));

          if (chatMessages.length === 0) {
            chatMessages.push({ role: 'user', content: 'Merhaba' });
          }

          const response = await axios.post(
            url,
            {
              model: model || 'MiniMax-M3',
              messages: chatMessages,
              system: liveSystemPrompt,
              max_tokens: 3000,
              stream: true
            },
            {
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
              },
              responseType: 'stream',
              timeout: 45000
            }
          );

          await new Promise<void>((resolve, reject) => {
            let buffer = '';
            response.data.on('data', (chunk: Buffer) => {
              buffer += chunk.toString('utf-8');
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6);
                  if (dataStr === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      onChunk(parsed.delta.text);
                    } else if (parsed.type === 'text_delta' && parsed.text) {
                      onChunk(parsed.text);
                    }
                  } catch (e) {
                    // non-json line
                  }
                }
              }
            });

            response.data.on('end', () => {
              resolve();
            });

            response.data.on('error', (err: any) => {
              reject(err);
            });
          });

          return;
        } else {
          // OpenAI stream protocol
          const url = `${baseUrl}/v1/chat/completions`;
          const formattedMessages: any[] = [{ role: 'system', content: liveSystemPrompt }];
          messages.forEach(m => {
            if (m.role !== 'system') formattedMessages.push(m);
          });

          const response = await axios.post(
            url,
            {
              model: model || 'MiniMax-M3',
              messages: formattedMessages,
              max_tokens: 3000,
              temperature: 0.7,
              stream: true
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              responseType: 'stream',
              timeout: 45000
            }
          );

          await new Promise<void>((resolve, reject) => {
            let buffer = '';
            response.data.on('data', (chunk: Buffer) => {
              buffer += chunk.toString('utf-8');
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6);
                  if (dataStr === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      onChunk(content);
                    }
                  } catch (e) {
                    // ignore
                  }
                }
              }
            });

            response.data.on('end', () => resolve());
            response.data.on('error', (err: any) => reject(err));
          });

          return;
        }
      } catch (err: any) {
        console.warn(`[MiniMaxService] Stream attempt failed on ${baseUrl}:`, err.message);
      }
    }

    // Fallback to non-streaming if stream connection encounters issue
    const syncReply = await this.createChatCompletion(messages, config);
    onChunk(syncReply);
  }

  /**
   * Synchronous Chat Completion with Live Context
   */
  async createChatCompletion(
    messages: MiniMaxMessage[],
    config: MiniMaxConfig = {},
    customSystemPrompt?: string
  ): Promise<string> {
    const apiKey = config.apiKey?.trim() || this.defaultApiKey;
    const model = config.model?.trim() || this.defaultModel;
    const protocol = config.apiProtocol || 'anthropic';

    if (!apiKey) {
      throw new Error('MiniMax API Key (veya Token Plan Subscription Key) bulunamadı.');
    }

    const lastUserQuery = messages.filter(m => m.role === 'user').pop()?.content || '';
    const systemPrompt = customSystemPrompt || await this.buildLiveSystemContext(lastUserQuery);

    const baseUrls = this.getBaseUrls(config);
    let lastError: any = null;

    const protocolsToTry: Array<'anthropic' | 'openai' | 'native'> = 
      protocol === 'anthropic' ? ['anthropic', 'openai', 'native'] :
      protocol === 'openai' ? ['openai', 'anthropic', 'native'] :
      ['native', 'openai', 'anthropic'];

    for (const baseUrl of baseUrls) {
      for (const proto of protocolsToTry) {
        try {
          if (proto === 'anthropic') {
            return await this.callAnthropicApi(baseUrl, apiKey, model, messages, systemPrompt);
          } else if (proto === 'openai') {
            return await this.callOpenAiApi(baseUrl, apiKey, model, messages, systemPrompt);
          } else {
            return await this.callNativeV2Api(baseUrl, apiKey, model, messages, config.groupId);
          }
        } catch (err: any) {
          lastError = err;
        }
      }
    }

    const errMsg = lastError?.response?.data?.error?.message || 
                   lastError?.response?.data?.base_resp?.status_msg || 
                   lastError?.message || 
                   'MiniMax API yanıt vermedi.';
    throw new Error(`MiniMax API Çağrısı Başarısız: ${errMsg}`);
  }

  private async callAnthropicApi(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: MiniMaxMessage[],
    systemPrompt?: string
  ): Promise<string> {
    const url = `${baseUrl}/anthropic/v1/messages`;
    
    let system = systemPrompt;
    const chatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const m of messages) {
      if (m.role === 'system' && !system) {
        system = m.content;
      } else {
        chatMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        });
      }
    }

    if (chatMessages.length === 0) {
      chatMessages.push({ role: 'user', content: 'Merhaba' });
    }

    const payload: any = {
      model: model || 'MiniMax-M3',
      messages: chatMessages,
      max_tokens: 3000,
    };

    if (system) {
      payload.system = system;
    }

    const response = await axios.post(url, payload, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 35000
    });

    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      const textBlock = response.data.content.find((c: any) => c.type === 'text');
      if (textBlock && textBlock.text) {
        return textBlock.text;
      }
    }

    throw new Error('Anthropic formatında metin yanıtı bulunamadı.');
  }

  private async callOpenAiApi(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: MiniMaxMessage[],
    systemPrompt?: string
  ): Promise<string> {
    const url = `${baseUrl}/v1/chat/completions`;
    
    const formattedMessages = [...messages];
    if (systemPrompt && !formattedMessages.some(m => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const payload = {
      model: model || 'MiniMax-M3',
      messages: formattedMessages,
      max_tokens: 3000,
      temperature: 0.7,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 35000
    });

    if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    throw new Error('OpenAI formatında mesaj içeriği bulunamadı.');
  }

  private async callNativeV2Api(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: MiniMaxMessage[],
    groupId?: string
  ): Promise<string> {
    let url = `${baseUrl}/v1/text/chatcompletion_v2`;
    if (groupId) {
      url += `?GroupId=${encodeURIComponent(groupId)}`;
    }

    const payload = {
      model: model || 'MiniMax-M3',
      messages: messages.map(m => ({
        sender_type: m.role === 'assistant' ? 'BOT' : 'USER',
        sender_name: m.role === 'assistant' ? 'MiniMax' : 'User',
        text: m.content
      })),
      stream: false,
      temperature: 0.7,
      tokens_to_generate: 2048
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 35000
    });

    if (response.data && response.data.reply) {
      return response.data.reply;
    }
    if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    return JSON.stringify(response.data);
  }

  /**
   * Summarize a single news article
   */
  async summarizeNewsArticle(
    title: string,
    content: string,
    source: string,
    config: MiniMaxConfig = {}
  ): Promise<SummaryResult> {
    const apiKey = config.apiKey?.trim() || this.defaultApiKey;
    const model = config.model?.trim() || this.defaultModel;

    if (!apiKey) {
      return this.generateFallbackSummary(title, content, source);
    }

    const systemPrompt = `Sen tarafsız, analitik ve son derece net Türkçe haber özetleri çıkaran bir Yapay Zeka Haber Analistisin. 
Sana verilen haberi incele ve aşağıdaki JSON formatında yanıt ver. Başka hiçbir açıklama yazma, SADECE saf geçerli JSON döndür:
{
  "bullets": [
    "Olayın özeti ve temel gelişme",
    "İlgili kurumlar, kişiler veya rakamsal veriler",
    "Beklenen sonuç veya kamuoyuna yansıması"
  ],
  "sentiment": "positive" | "neutral" | "negative",
  "keyTakeaway": "Haberin tek cümlelik en kritik çıkarımı."
}`;

    const userPrompt = `Haber Başlığı: ${title}
Kaynak: ${source}
Haber Metni: ${content.slice(0, 3500)}`;

    try {
      const reply = await this.createChatCompletion(
        [{ role: 'user', content: userPrompt }],
        config,
        systemPrompt
      );

      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [parsed.keyTakeaway || title],
          sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
          keyTakeaway: parsed.keyTakeaway || title,
          source: source,
          analyzedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: model
        };
      }
      throw new Error('Geçerli JSON formatı alınamadı.');
    } catch (err: any) {
      console.warn('[MiniMaxService] Heuristic fallback for news summary:', err.message);
      const fallback = this.generateFallbackSummary(title, content, source);
      return fallback;
    }
  }

  /**
   * 24-hour panorama roundup
   */
  async generate24hRoundup(
    headlines: Array<{ title: string; source: string; category: string }>,
    config: MiniMaxConfig = {}
  ): Promise<{ title: string; summary: string }> {
    const apiKey = config.apiKey?.trim() || this.defaultApiKey;
    const model = config.model?.trim() || this.defaultModel;

    const headlinesText = headlines.slice(0, 15).map((h, i) => `${i + 1}. [${h.category}] (${h.source}) ${h.title}`).join('\n');

    if (!apiKey) {
      return {
        title: 'Son 24 Saatin Gündem Panoraması (Otomatik Analiz)',
        summary: `Türkiye ve dünya gündeminde son 24 saatte öne çıkan ${headlines.length} kritik başlık analiz edildi. Gündem, ekonomi ve teknoloji alanlarında hareketlilik sürüyor.`
      };
    }

    const prompt = `Aşağıdaki son 24 saatlik Türk haber başlıklarını inceleyerek kapsamlı, akıcı ve profesyonel bir "24 Saatlik Gündem Özeti" hazırla.
Başlıklar:
${headlinesText}

Lütfen yanıtını zengin Markdown formatında ver:
# 🌍 Son 24 Saatin Türkiye ve Dünya Panoraması
## 📌 Ana Temalar ve Genel Değerlendirme
(Detaylı 2 paragraf)

## 📊 Kategori Bazlı Kritik Gelişmeler
- **Gündem & Politika**: ...
- **Ekonomi & Piyasa**: ...
- **Teknoloji & Bilim**: ...
- **Dünya & Dış Politika**: ...`;

    try {
      const summaryText = await this.createChatCompletion(
        [{ role: 'user', content: prompt }],
        config
      );

      return {
        title: `${model} ile 24 Saatlik Gündem Panoraması`,
        summary: summaryText
      };
    } catch (err: any) {
      return {
        title: 'Son 24 Saatlik Gündem Panoraması',
        summary: `MiniMax API çağrısı sırasında bir aksaklık oluştu (${err.message}). Başlıklar akışta güncel olarak listelenmektedir.`
      };
    }
  }

  private generateFallbackSummary(title: string, content: string, source: string): SummaryResult {
    const clean = content.replace(/\s+/g, ' ').trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);

    const b1 = sentences[0] || title;
    const b2 = sentences[1] || `${source} kaynaklı haberde gelişmeler takip ediliyor.`;
    const b3 = sentences[2] || 'Yetkililerden ve ilgili kurumlardan gelecek açıklamalar bekleniyor.';

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    const lower = (title + ' ' + content).toLowerCase();
    if (lower.includes('rekor') || lower.includes('başarı') || lower.includes('kazandı') || lower.includes('artış') || lower.includes('müjde') || lower.includes('büyüme')) {
      sentiment = 'positive';
    } else if (lower.includes('kaza') || lower.includes('vefat') || lower.includes('kayıp') || lower.includes('kriz') || lower.includes('düşüş') || lower.includes('uyarı') || lower.includes('deprem') || lower.includes('yangın')) {
      sentiment = 'negative';
    }

    return {
      bullets: [b1, b2, b3],
      sentiment,
      keyTakeaway: `${source} tarafından aktarılan haberde: "${title}" konusu öne çıkıyor.`,
      source,
      analyzedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Heuristic Engine'
    };
  }
}

export const minimaxService = new MiniMaxService();
