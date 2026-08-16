import { storageService } from './storageService';
import { telegramBotService } from './telegramBotService';
import { financeService } from './financeService';
import { systemService } from './systemService';
import { minimaxService } from './minimaxService';
import axios from 'axios';

export interface AutomationWorkflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'interval' | 'time' | 'price_threshold' | 'system_cpu' | 'event_task';
    config: {
      intervalMinutes?: number;
      timeOfDay?: string; // "08:30"
      symbol?: string;    // "USDTRY", "BTC", "GA"
      operator?: '>' | '<';
      threshold?: number;
      cpuPercent?: number;
    };
  };
  action: {
    type: 'telegram_message' | 'create_task' | 'generate_briefing' | 'webhook';
    config: {
      telegramMessage?: string;
      taskTitle?: string;
      webhookUrl?: string;
      webhookMethod?: 'GET' | 'POST';
    };
  };
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'idle';
  lastMessage?: string;
}

const DEFAULT_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'wf-morning-briefing',
    name: '🌅 Sabah 08:30 Telegram Yönetici Brifingi',
    enabled: true,
    trigger: {
      type: 'time',
      config: { timeOfDay: '08:30' }
    },
    action: {
      type: 'generate_briefing',
      config: { telegramMessage: 'Günün Yönetici Brifingi hazırlandı.' }
    },
    lastStatus: 'idle'
  },
  {
    id: 'wf-usd-alert',
    name: '🚨 Dolar > 38.00 TL Eşik Alarmı',
    enabled: true,
    trigger: {
      type: 'price_threshold',
      config: { symbol: 'USDTRY', operator: '>', threshold: 38.0 }
    },
    action: {
      type: 'telegram_message',
      config: { telegramMessage: '⚠️ DİKKAT: Dolar kuru belirlenen 38.00 TL eşiğini aştı!' }
    },
    lastStatus: 'idle'
  },
  {
    id: 'wf-cpu-guard',
    name: '💻 Kritik CPU Yükü > %90 Koruma Alarmı',
    enabled: true,
    trigger: {
      type: 'system_cpu',
      config: { cpuPercent: 90 }
    },
    action: {
      type: 'telegram_message',
      config: { telegramMessage: '🔥 UYARI: Sistem işlemci kullanımı %90 eşiğini aştı!' }
    },
    lastStatus: 'idle'
  }
];

export class AutomationService {
  private workflows: AutomationWorkflow[] = [];
  private timer: NodeJS.Timeout | null = null;
  private lastTriggeredMinute: string = '';

  constructor() {
    this.init();
  }

  private async init() {
    const data = storageService.getData();
    if (data.automations && Array.isArray(data.automations) && data.automations.length > 0) {
      this.workflows = data.automations;
    } else {
      this.workflows = DEFAULT_WORKFLOWS;
      this.save();
    }

    // Start evaluation loop every 45 seconds
    this.timer = setInterval(() => {
      this.evaluateWorkflows();
    }, 45000);
  }

  private save() {
    storageService.updateData({ automations: this.workflows });
  }

  getWorkflows(): AutomationWorkflow[] {
    return this.workflows;
  }

  saveWorkflow(workflow: AutomationWorkflow): AutomationWorkflow {
    const existingIndex = this.workflows.findIndex(w => w.id === workflow.id);
    if (existingIndex >= 0) {
      this.workflows[existingIndex] = { ...this.workflows[existingIndex], ...workflow };
    } else {
      this.workflows.push(workflow);
    }
    this.save();
    return workflow;
  }

  deleteWorkflow(id: string): boolean {
    const initialLen = this.workflows.length;
    this.workflows = this.workflows.filter(w => w.id !== id);
    if (this.workflows.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  async executeAction(workflow: AutomationWorkflow): Promise<{ success: boolean; message: string }> {
    try {
      const { type, config } = workflow.action;

      if (type === 'telegram_message') {
        const msg = config.telegramMessage || `⚡ [Otomasyon Tetiklendi]: ${workflow.name}`;
        await telegramBotService.sendMessage(msg);
        return { success: true, message: 'Telegram mesajı başarıyla iletildi.' };
      }

      if (type === 'create_task') {
        const title = config.taskTitle || `Otomasyon Görevi: ${workflow.name}`;
        const data = storageService.getData();
        const currentTasks = data.tasks || [];
        const newTask = {
          id: 'task_' + Date.now(),
          title,
          status: 'todo' as const,
          priority: 'high' as const,
          createdAt: new Date().toISOString()
        };
        storageService.updateData({ tasks: [newTask, ...currentTasks] });
        return { success: true, message: `Panoya yeni görev eklendi: "${title}"` };
      }

      if (type === 'webhook' && config.webhookUrl) {
        const method = config.webhookMethod || 'POST';
        await axios({
          method,
          url: config.webhookUrl,
          data: { workflowId: workflow.id, name: workflow.name, triggeredAt: new Date().toISOString() },
          timeout: 8000
        });
        return { success: true, message: 'Webhook başarıyla tetiklendi.' };
      }

      if (type === 'generate_briefing') {
        const finance = await financeService.getFinanceData().catch(() => []);
        const usd = finance.find(f => f.code === 'USDTRY')?.sell || 36.85;
        const btc = finance.find(f => f.code === 'BTC')?.sell || 96000;
        const gold = finance.find(f => f.code === 'GA')?.sell || 3470;

        const msg = `🌅 *Günlük Otomasyon Raporu*\n\n📌 *Piyasalar:*\n• Dolar: ${usd}₺\n• Gram Altın: ${gold}₺\n• BTC: $${btc.toLocaleString()}\n\n✅ Sistemler stabil çalışıyor.`;
        await telegramBotService.sendMessage(msg);
        return { success: true, message: 'Yönetici brifingi Telegram üzerinden gönderildi.' };
      }

      return { success: true, message: 'Aksiyon başarıyla tamamlandı.' };
    } catch (err: any) {
      return { success: false, message: 'Aksiyon hatası: ' + err.message };
    }
  }

  async evaluateWorkflows() {
    const now = new Date();
    const currentMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const wf of this.workflows) {
      if (!wf.enabled) continue;

      let triggered = false;

      // 1. Time trigger e.g. "08:30"
      if (wf.trigger.type === 'time' && wf.trigger.config.timeOfDay === currentMinute && this.lastTriggeredMinute !== currentMinute) {
        triggered = true;
      }

      // 2. Price threshold trigger
      if (wf.trigger.type === 'price_threshold') {
        try {
          const finance = await financeService.getFinanceData();
          const item = finance.find(f => f.code === wf.trigger.config.symbol);
          if (item && wf.trigger.config.threshold) {
            if (wf.trigger.config.operator === '>' && item.sell >= wf.trigger.config.threshold) {
              triggered = true;
            } else if (wf.trigger.config.operator === '<' && item.sell <= wf.trigger.config.threshold) {
              triggered = true;
            }
          }
        } catch {
          // ignore
        }
      }

      // 3. System CPU trigger
      if (wf.trigger.type === 'system_cpu' && wf.trigger.config.cpuPercent) {
        try {
          const stats = await systemService.getSystemStats();
          if (stats.cpu.usagePercent >= wf.trigger.config.cpuPercent) {
            triggered = true;
          }
        } catch {
          // ignore
        }
      }

      if (triggered) {
        const res = await this.executeAction(wf);
        wf.lastRun = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        wf.lastStatus = res.success ? 'success' : 'failed';
        wf.lastMessage = res.message;
        this.save();
      }
    }

    this.lastTriggeredMinute = currentMinute;
  }
}

export const automationService = new AutomationService();
