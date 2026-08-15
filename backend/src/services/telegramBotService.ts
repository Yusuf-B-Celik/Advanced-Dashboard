import axios from 'axios';
import { storageService } from './storageService';
import { financeService } from './financeService';
import { minimaxService } from './minimaxService';
import { newsService } from './newsService';
import { FinanceItem, NewsItem } from '../types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyOnUptimeFail: boolean;
  notifyDailyBriefing: boolean;
}

export class TelegramBotService {
  private config: TelegramConfig = {
    botToken: '',
    chatId: '',
    enabled: false,
    notifyOnUptimeFail: true,
    notifyDailyBriefing: false
  };

  private isPolling = false;
  private lastUpdateId = 0;
  private pollTimeout: any = null;

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    try {
      const data = storageService.getData();
      if (data.settings?.telegram) {
        this.config = { ...this.config, ...data.settings.telegram };
        if (this.config.enabled && this.config.botToken) {
          this.startPolling();
        }
      }
    } catch (e) {
      console.warn('[TelegramBotService] Failed to load config:', e);
    }
  }

  public updateConfig(newConfig: Partial<TelegramConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (this.config.enabled && this.config.botToken) {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  public getConfig(): TelegramConfig {
    return this.config;
  }

  public async sendMessage(text: string, customChatId?: string): Promise<{ success: boolean; error?: string }> {
    const token = this.config.botToken;
    const chat = customChatId || this.config.chatId;

    if (!token || !chat) {
      return { success: false, error: 'Telegram Bot Token veya Chat ID eksik.' };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await axios.post(url, {
        chat_id: chat,
        text,
        parse_mode: 'Markdown'
      }, { timeout: 8000 });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.description || err.message;
      return { success: false, error: errorMsg };
    }
  }

  public startPolling() {
    if (this.isPolling || !this.config.botToken) return;
    this.isPolling = true;
    console.log('[TelegramBotService] Polling started.');
    this.pollLoop();
  }

  public stopPolling() {
    this.isPolling = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
    console.log('[TelegramBotService] Polling stopped.');
  }

  private async pollLoop() {
    if (!this.isPolling || !this.config.botToken) return;

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/getUpdates`;
      const res = await axios.get(url, {
        params: {
          offset: this.lastUpdateId + 1,
          timeout: 20
        },
        timeout: 25000
      });

      const updates = res.data?.result || [];
      for (const update of updates) {
        this.lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          await this.handleIncomingMessage(update.message);
        }
      }
    } catch (err: any) {
      // transient network error
    }

    if (this.isPolling) {
      this.pollTimeout = setTimeout(() => this.pollLoop(), 2000);
    }
  }

  private async handleIncomingMessage(msg: any) {
    const chatId = msg.chat?.id?.toString();
    const text = msg.text?.trim() || '';
    if (!chatId || !text) return;

    if (!this.config.chatId) {
      this.config.chatId = chatId;
    }

    try {
      // 1. Command: /start or /yardim
      if (text.startsWith('/start') || text.startsWith('/yardim')) {
        const welcome = `👋 *Nexus Dashboard Telegram Asistanına Hoş Geldiniz!*\n\n` +
          `Aşağıdaki komutlarla dashboard'unuzu uzaktan yönetebilirsiniz:\n\n` +
          `📋 \`/gorev [başlık]\` - Kanban panonuza yeni görev ekler\n` +
          `📝 \`/not [içerik]\` - Not defterine yeni not kaydeder\n` +
          `💰 \`/harcama [tutar açıklama]\` - Bütçeye harcama/gelir ekler\n` +
          `📈 \`/piyasa\` - Canlı döviz, altın ve kripto kurlarını getirir\n` +
          `🎙️ \`/brifing\` - Günün yönetici özetini anında hazırlar\n` +
          `💡 _Veya doğrudan herhangi bir soru sorun, MiniMax-M3 yanıtlasın!_`;
        await this.sendMessage(welcome, chatId);
        return;
      }

      // 2. Command: /gorev
      if (text.startsWith('/gorev')) {
        const taskTitle = text.replace(/^\/gorev\s*/, '').trim();
        if (!taskTitle) {
          await this.sendMessage('⚠️ Lütfen görev başlığı belirtin. Örn: `/gorev Haftalık raporu hazırla`', chatId);
          return;
        }

        const data = storageService.getData();
        const newTask = {
          id: 'task_' + Date.now(),
          title: taskTitle,
          status: 'todo' as const,
          priority: 'medium' as const,
          tags: ['Telegram'],
          createdAt: new Date().toISOString()
        };
        const updatedTasks = [newTask, ...(data.tasks || [])];
        storageService.updateData({ tasks: updatedTasks });

        await this.sendMessage(`✅ *Görev Panoya Eklendi:*\n"${taskTitle}"`, chatId);
        return;
      }

      // 3. Command: /not
      if (text.startsWith('/not')) {
        const noteContent = text.replace(/^\/not\s*/, '').trim();
        if (!noteContent) {
          await this.sendMessage('⚠️ Lütfen not içeriği belirtin. Örn: `/not Toplantı kararları...`', chatId);
          return;
        }

        const data = storageService.getData();
        const newNote = {
          id: 'note_' + Date.now(),
          title: noteContent.slice(0, 30),
          content: noteContent,
          category: 'Telegram',
          updatedAt: new Date().toISOString()
        };
        const updatedNotes = [newNote, ...(data.notes || [])];
        storageService.updateData({ notes: updatedNotes });

        await this.sendMessage(`📝 *Not Kaydedildi:*\n"${newNote.title}..."`, chatId);
        return;
      }

      // 4. Command: /harcama
      if (text.startsWith('/harcama')) {
        const expText = text.replace(/^\/harcama\s*/, '').trim();
        if (!expText) {
          await this.sendMessage('⚠️ Lütfen harcama belirtin. Örn: `/harcama 350 TL Market alışverişi`', chatId);
          return;
        }

        // Parse via MiniMax
        const parseReply = await minimaxService.createChatCompletion([
          {
            role: 'user',
            content: `Aşağıdaki metinden tutar ve kategoriyi JSON olarak çıkar (sadece JSON döndür):\n"${expText}"\nFormat: {"title": "Açıklama", "amount": 100, "type": "expense", "category": "Kişisel"}`
          }
        ]);

        let parsed: any = {};
        try {
          const clean = parseReply.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(clean);
        } catch {
          parsed = { title: expText, amount: 100, type: 'expense', category: 'Genel' };
        }

        await this.sendMessage(`💰 *Harcama/Gelir Kaydedildi:*\n${parsed.title} - ${parsed.amount}₺ (${parsed.type === 'income' ? 'Gelir' : 'Gider'})`, chatId);
        return;
      }

      // 5. Command: /piyasa
      if (text.startsWith('/piyasa')) {
        const finance: FinanceItem[] = await financeService.getFinanceData();
        const usd = finance.find((f: FinanceItem) => f.code === 'USDTRY');
        const eur = finance.find((f: FinanceItem) => f.code === 'EURTRY');
        const gold = finance.find((f: FinanceItem) => f.code === 'GA');
        const btc = finance.find((f: FinanceItem) => f.code === 'BTC');

        const msg = `📊 *Canlı Piyasa Kurları:*\n\n` +
          `💵 *USD/TRY:* ${usd?.sell || 0}₺ (${usd?.changeRate || 0}%)\n` +
          `💶 *EUR/TRY:* ${eur?.sell || 0}₺ (${eur?.changeRate || 0}%)\n` +
          `🥇 *Gram Altın:* ${gold?.sell?.toLocaleString() || 0}₺ (${gold?.changeRate || 0}%)\n` +
          `🪙 *Bitcoin:* $${btc?.sell?.toLocaleString() || 0} (${btc?.changeRate || 0}%)`;

        await this.sendMessage(msg, chatId);
        return;
      }

      // 6. Command: /brifing
      if (text.startsWith('/brifing')) {
        const finance: FinanceItem[] = await financeService.getFinanceData();
        const news: NewsItem[] = await newsService.fetchAllNews();
        const topNews = news.slice(0, 3).map((n: NewsItem) => n.title).join('; ');
        const usdVal = finance.find((f: FinanceItem) => f.code === 'USDTRY')?.sell;
        const goldVal = finance.find((f: FinanceItem) => f.code === 'GA')?.sell;

        const aiReply = await minimaxService.createChatCompletion([
          {
            role: 'user',
            content: `Kullanıcı için Telegram üzerinden 3 paragraflık kısa, samimi ve bilge bir Günlük Yönetici Brifingi hazırla. Döviz: USD ${usdVal}₺, Altın: ${goldVal}₺. Son haberler: ${topNews}.`
          }
        ]);

        await this.sendMessage(`🎙️ *Günlük Yönetici Brifingi:*\n\n${aiReply || 'Brifing üretilemedi.'}`, chatId);
        return;
      }

      // 7. General AI Question
      const aiReply = await minimaxService.createChatCompletion(
        [
          {
            role: 'system',
            content: 'Sen Nexus Dashboard kişisel asistanısın. Telegram üzerinden gelen sorulara Türkçe, net ve yardımcı bir dille yanıt ver.'
          },
          {
            role: 'user',
            content: text
          }
        ]
      );

      await this.sendMessage(aiReply || 'Yanıt üretilemedi.', chatId);
    } catch (err: any) {
      await this.sendMessage(`⚠️ Bir hata oluştu: ${err.message}`, chatId);
    }
  }
}

export const telegramBotService = new TelegramBotService();
