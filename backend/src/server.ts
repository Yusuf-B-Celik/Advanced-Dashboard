import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { newsService } from './services/newsService';
import { minimaxService } from './services/minimaxService';
import { financeService } from './services/financeService';
import { systemService } from './services/systemService';
import { storageService } from './services/storageService';
import { hackerNewsService } from './services/hackerNewsService';
import { uptimeService } from './services/uptimeService';
import { tunnelService } from './services/tunnelService';
import { scraperService } from './services/scraperService';
import { telegramBotService } from './services/telegramBotService';
import { ttsService } from './services/ttsService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- NEWS ROUTES ---
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const category = req.query.category as string | undefined;
    const source = req.query.source as string | undefined;
    const search = req.query.search as string | undefined;

    let items = await newsService.fetchAllNews(forceRefresh);

    if (category && category !== 'Tümü') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (source && source !== 'Tümü') {
      items = items.filter(i => i.source.toLowerCase().includes(source.toLowerCase()));
    }
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      count: items.length,
      lastUpdated: new Date().toISOString(),
      items: items.slice(0, 100)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/news/sources', (_req: Request, res: Response) => {
  res.json({
    success: true,
    sources: newsService.getSources()
  });
});

// --- AI / MINIMAX ROUTES ---
app.post('/api/ai/summarize-article', async (req: Request, res: Response) => {
  try {
    const { title, content, source, apiKey, model, planType, apiProtocol, region, customBaseUrl, groupId, articleId } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Başlık gereklidir.' });
    }

    const savedSettings = storageService.getData().settings as any;
    const config = {
      apiKey: apiKey || savedSettings.minimaxApiKey,
      model: model || savedSettings.minimaxModel || 'MiniMax-M3',
      planType: planType || savedSettings.minimaxPlanType || 'token_plan',
      apiProtocol: apiProtocol || savedSettings.minimaxProtocol || 'anthropic',
      region: region || savedSettings.minimaxRegion || 'global',
      customBaseUrl: customBaseUrl || savedSettings.minimaxBaseUrl,
      groupId: groupId || savedSettings.minimaxGroupId
    };

    const summary = await minimaxService.summarizeNewsArticle(
      title,
      content || title,
      source || 'Haber Kaynağı',
      config
    );

    if (articleId) {
      newsService.updateNewsSummary(articleId, summary);
    }

    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai/roundup', async (req: Request, res: Response) => {
  try {
    const { apiKey, model, planType, apiProtocol, region, customBaseUrl, groupId } = req.body;
    const allNews = await newsService.fetchAllNews();
    const headlines = allNews.slice(0, 15).map(n => ({
      title: n.title,
      source: n.source,
      category: n.category
    }));

    const savedSettings = storageService.getData().settings as any;
    const config = {
      apiKey: apiKey || savedSettings.minimaxApiKey,
      model: model || savedSettings.minimaxModel || 'MiniMax-M3',
      planType: planType || savedSettings.minimaxPlanType || 'token_plan',
      apiProtocol: apiProtocol || savedSettings.minimaxProtocol || 'anthropic',
      region: region || savedSettings.minimaxRegion || 'global',
      customBaseUrl: customBaseUrl || savedSettings.minimaxBaseUrl,
      groupId: groupId || savedSettings.minimaxGroupId
    };

    const roundup = await minimaxService.generate24hRoundup(headlines, config);
    res.json({ success: true, roundup });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, apiKey, model, planType, apiProtocol, region, customBaseUrl, groupId } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Mesaj dizisi gereklidir.' });
    }

    const savedSettings = storageService.getData().settings as any;
    const config = {
      apiKey: apiKey || savedSettings.minimaxApiKey,
      model: model || savedSettings.minimaxModel || 'MiniMax-M3',
      planType: planType || savedSettings.minimaxPlanType || 'token_plan',
      apiProtocol: apiProtocol || savedSettings.minimaxProtocol || 'anthropic',
      region: region || savedSettings.minimaxRegion || 'global',
      customBaseUrl: customBaseUrl || savedSettings.minimaxBaseUrl,
      groupId: groupId || savedSettings.minimaxGroupId
    };

    if (!config.apiKey) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        success: true,
        reply: `👋 Merhaba! Ben **MiniMax-M3 Yapay Zeka Asistanınız**.
Şu anda demo moddasınız. Sorduğunuz soru: *" ${lastUserMsg} "*

Canlı **MiniMax-M3** modeli (Pay-as-you-go veya Token Plan Subscription Key) ile yanıt üretmek ve haberleri doğrudan MiniMax ile analiz etmek için lütfen sağ üstteki **⚙️ Ayarlar** panelinden API / Subscription Key anahtarınızı kaydedin.

Desteklenen Seçenekler:
- 💳 **Pay-as-you-go Planı** veya 🎟️ **Token Planı (Subscription Key)**
- ⚡ **Anthropic SDK Protokolü** (\`/anthropic/v1/messages\`) veya **OpenAI Protokolü** (\`/v1/chat/completions\`)
- 🌐 **Global Platform** (\`api.minimax.io\` & \`api.minimax.chat\`)`,
        isFallback: true
      });
    }

    const reply = await minimaxService.createChatCompletion(messages, config);
    res.json({ success: true, reply, isFallback: false });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SSE Streaming AI Endpoint
app.post('/api/ai/chat/stream', async (req: Request, res: Response) => {
  const { messages, apiKey, model, planType, apiProtocol, region, customBaseUrl, groupId } = req.body;
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Mesaj dizisi gereklidir.' });
  }

  const savedSettings = storageService.getData().settings as any;
  const config = {
    apiKey: apiKey || savedSettings.minimaxApiKey,
    model: model || savedSettings.minimaxModel || 'MiniMax-M3',
    planType: planType || savedSettings.minimaxPlanType || 'token_plan',
    apiProtocol: apiProtocol || savedSettings.minimaxProtocol || 'anthropic',
    region: region || savedSettings.minimaxRegion || 'global',
    customBaseUrl: customBaseUrl || savedSettings.minimaxBaseUrl,
    groupId: groupId || savedSettings.minimaxGroupId
  };

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!config.apiKey) {
    const demoReply = `👋 Merhaba! Ben **MiniMax-M3 Yapay Zeka Asistanınız**.\n\nCanlı streaming yanıtları ve Türkçe haber/finans analizleri için lütfen **⚙️ Ayarlar** panelinden **MiniMax Key** (Token Plan Subscription Key veya Pay-as-you-go) bilginizi girin.`;
    for (const word of demoReply.split(' ')) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise(r => setTimeout(r, 40));
    }
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    await minimaxService.createChatCompletionStream(
      messages,
      config,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// --- FINANCE ROUTES ---
app.get('/api/finance', async (_req: Request, res: Response) => {
  try {
    const items = await financeService.getFinanceData();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SYSTEM TELEMETRY ROUTES ---
app.get('/api/system', async (_req: Request, res: Response) => {
  try {
    const stats = await systemService.getSystemStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- HACKER NEWS TECH ROUTES ---
app.get('/api/hackernews', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    const stories = await hackerNewsService.getTopStories(limit);
    res.json({ success: true, stories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- UPTIME MONITOR ROUTES ---
app.post('/api/uptime/check', async (req: Request, res: Response) => {
  try {
    const { targets } = req.body;
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ success: false, error: 'Kontrol edilecek hedefler gereklidir.' });
    }
    const results = await uptimeService.checkMultiple(targets);
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- NETWORK INFO ROUTE ---
app.get('/api/network/info', async (_req: Request, res: Response) => {
  try {
    // Fast public IP and ISP lookup
    const ipRes = await axios.get('https://api.ipify.org?format=json', { timeout: 4000 }).catch(() => null);
    const ip = ipRes?.data?.ip || '127.0.0.1';

    res.json({
      success: true,
      publicIp: ip,
      checkedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      online: true
    });
  } catch (err: any) {
    res.json({ success: true, publicIp: '127.0.0.1', online: true });
  }
});

// --- NGROK MOBILE TUNNEL ROUTES ---
app.get('/api/tunnel/status', async (_req: Request, res: Response) => {
  try {
    const status = await tunnelService.getStatus();
    res.json({ success: true, ...status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tunnel/start', async (req: Request, res: Response) => {
  try {
    const port = parseInt(req.body.port as string) || 5173;
    const result = await tunnelService.startTunnel(port);
    if (result.success) {
      res.json({ success: true, url: result.url, qrUrl: result.qrUrl });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tunnel/stop', async (_req: Request, res: Response) => {
  try {
    await tunnelService.stopTunnel();
    res.json({ success: true, message: 'Tünel sonlandırıldı.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- WEB & YOUTUBE SCRAPER & MINDMAP ROUTE ---
app.post('/api/scraper/summarize', async (req: Request, res: Response) => {
  try {
    const { url, apiKey, model, planType, apiProtocol } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL adresi gereklidir.' });
    }

    const scraped = await scraperService.scrapeUrl(url);

    // Prompt MiniMax for structured executive summary + Mermaid.js mind map
    const prompt = `Aşağıdaki web sayfası veya video içeriğini analiz et:
URL: ${scraped.url}
Başlık: ${scraped.title}
Kaynak: ${scraped.siteName}
İçerik: ${scraped.content}

Lütfen Türkçe olarak şu 3 bölümü hazırla:
1. 📌 **3 Maddelik Yönetici Özeti**: En can alıcı noktalar.
2. 💡 **Kilit Çıkarımlar ve Değerlendirme**: Neden önemli ve ne anlama geliyor?
3. 🧠 **Görsel Zihin Haritası (Mind Map)**: Aşağıdaki formatta bir Mermaid mindmap kodu oluştur (yalnızca \`\`\`mermaid ile başlasın):
\`\`\`mermaid
mindmap
  root((${scraped.title.slice(0, 20)}))
    Ana Fikir 1
      Detay 1.1
      Detay 1.2
    Ana Fikir 2
      Detay 2.1
    Ana Fikir 3
      Detay 3.1
\`\`\``;

    const analysis = await minimaxService.createChatCompletion(
      [
        { role: 'system', content: 'Sen web ve video içeriklerini analiz edip görsel zihin haritaları (mind map) ve özetler çıkaran uzman bir araştırmacısın.' },
        { role: 'user', content: prompt }
      ],
      { apiKey, model, planType, apiProtocol }
    );

    res.json({
      success: true,
      scraped,
      analysis
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TELEGRAM BOT ROUTES ---
app.get('/api/telegram/config', (_req: Request, res: Response) => {
  res.json({ success: true, config: telegramBotService.getConfig() });
});

app.post('/api/telegram/config', async (req: Request, res: Response) => {
  try {
    const { config } = req.body;
    telegramBotService.updateConfig(config);

    // Save to storage
    const data = storageService.getData();
    const updatedSettings = { ...(data.settings || {}), telegram: config };
    storageService.updateData({ settings: updatedSettings });

    res.json({ success: true, config: telegramBotService.getConfig() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/telegram/test', async (req: Request, res: Response) => {
  try {
    const { botToken, chatId } = req.body;
    if (botToken) {
      telegramBotService.updateConfig({ botToken, chatId });
    }
    const result = await telegramBotService.sendMessage(
      '🚀 *Nexus Dashboard Bağlantı Testi!*\n\nTelegram Bot entegrasyonunuz başarıyla aktifleştirildi. Artık buradan bildirim alabilir ve dashboard\'unuzu yönetebilirsiniz.',
      chatId
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- NEURAL TURKISH TTS ROUTE (Microsoft Neural Voices) ---
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'tr-TR-AhmetNeural', rate = 'default' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Metin gereklidir.' });
    }

    const audioBuffer = await ttsService.getSpeechBuffer(text, { voice, rate });
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'Cache-Control': 'no-cache'
    });
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('[TTS Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- EXECUTIVE DAILY BRIEFING ROUTE (High-Intelligence Digest) ---
app.post('/api/ai/briefing', async (req: Request, res: Response) => {
  try {
    const { apiKey, model, planType, apiProtocol, userName = 'Yusuf Bey', weatherCity = 'İstanbul' } = req.body;

    const [finance, news] = await Promise.all([
      financeService.getFinanceData().catch(() => []),
      newsService.fetchAllNews().catch(() => [])
    ]);
    const data = storageService.getData();

    const usd = finance.find((f: any) => f.code === 'USDTRY')?.sell || 36.85;
    const eur = finance.find((f: any) => f.code === 'EURTRY')?.sell || 38.45;
    const gold = finance.find((f: any) => f.code === 'GA')?.sell || 3470;
    const btc = finance.find((f: any) => f.code === 'BTC')?.sell || 96000;
    
    // Top 5 news items
    const topNewsSummaries = news.slice(0, 5).map((n: any, idx: number) => `${idx + 1}. [${n.source}] ${n.title} (${n.snippet || ''})`).join('\n');
    const pendingTasks = (data.tasks || []).filter((t: any) => t.status !== 'done').map((t: any) => t.title).slice(0, 5).join(', ');

    const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const prompt = `Kullanıcı: ${userName}
Tarih: ${dateStr}
Şehir: ${weatherCity}

GÜNCEL BİLGİLER:
- Piyasalar: Dolar: ${usd} TL | Euro: ${eur} TL | Gram Altın: ${gold} TL | Bitcoin: $${btc.toLocaleString()}
- Bekleyen Görevler: ${pendingTasks || 'Bugün bekleyen kritik görev yok'}
- Son Haberler:
${topNewsSummaries}

GÖREV:
${userName} için kısa, net, sadece MADDE MADDE özet bilgiler içeren bir Günlük Yönetici Brifingi hazırla.

BİÇİM (Yalnızca aşağıdaki maddeleri doldur, uzun dolgu paragraflar veya edebi laflar ASLA yazma):

- ☀️ **Hava & Lokasyon**: ${weatherCity} için kısa durum.
- 📈 **Piyasa Özeti**: Dolar: ${usd} TL, Euro: ${eur} TL, Altın: ${gold} TL, BTC: $${btc.toLocaleString()} (Tek cümlelik net piyasa yorumu).
- 📰 **Kritik Gündem Başlıkları**:
  - En önemli haber 1 (Kısa 1 cümle)
  - En önemli haber 2 (Kısa 1 cümle)
  - En önemli haber 3 (Kısa 1 cümle)
- 🎯 **Bekleyen Görevler**: ${pendingTasks}
- 💡 **Günün Notu**: 1 kısa cümlelik odak veya motivasyon tavsiyesi.`;

    const briefing = await minimaxService.createChatCompletion(
      [
        { role: 'system', content: 'Sen üst düzey yöneticilere sadece net, madde madde, kısa ve öz özet bilgi veren bir asistansın. Asla uzun cümleler veya gereksiz dolgu paragraflar yazmazsın.' },
        { role: 'user', content: prompt }
      ],
      { apiKey, model, planType, apiProtocol }
    );

    res.json({
      success: true,
      briefing,
      generatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- GITHUB TRENDS ROUTE ---
app.get('/api/github/trends', async (req: Request, res: Response) => {
  try {
    const language = (req.query.language as string) || '';
    const query = language ? `language:${language}+stars:>100` : 'stars:>500';
    const response = await axios.get(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=12`, {
      headers: {
        'User-Agent': 'Advanced-Dashboard-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 6000
    });

    const repos = response.data.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      description: item.description,
      url: item.html_url,
      stars: item.stargazers_count,
      forks: item.forks_count,
      language: item.language,
      owner: item.owner?.login,
      avatarUrl: item.owner?.avatar_url
    })) || [];

    res.json({ success: true, repos });
  } catch (err: any) {
    // Fallback popular repos
    res.json({
      success: true,
      repos: [
        { id: 1, name: 'react', fullName: 'facebook/react', description: 'The library for web and native user interfaces.', stars: 228000, forks: 46000, language: 'JavaScript', url: 'https://github.com/facebook/react' },
        { id: 2, name: 'vue', fullName: 'vuejs/core', description: 'Progressive JavaScript Framework for building modern web UIs.', stars: 45000, forks: 8100, language: 'TypeScript', url: 'https://github.com/vuejs/core' },
        { id: 3, name: 'shadcn-ui', fullName: 'shadcn-ui/ui', description: 'Beautifully designed components built with Tailwind CSS.', stars: 74000, forks: 6200, language: 'TypeScript', url: 'https://github.com/shadcn-ui/ui' },
        { id: 4, name: 'ollama', fullName: 'ollama/ollama', description: 'Get up and running with Llama 3, Mistral, and other LLMs locally.', stars: 105000, forks: 9500, language: 'Go', url: 'https://github.com/ollama/ollama' }
      ]
    });
  }
});

// --- LOCAL STORAGE / PERSISTENCE ROUTES ---
app.get('/api/storage', (_req: Request, res: Response) => {
  res.json({ success: true, data: storageService.getData() });
});

app.post('/api/storage', (req: Request, res: Response) => {
  try {
    const updated = storageService.updateData(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Advanced Dashboard Backend] Running on http://localhost:${PORT}`);
});
