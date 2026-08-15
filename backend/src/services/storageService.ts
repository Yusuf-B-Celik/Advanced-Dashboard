import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DashboardData {
  settings: {
    minimaxApiKey?: string;
    minimaxModel?: string;
    theme?: string;
    wallpaper?: string;
    refreshIntervalSeconds?: number;
    userName?: string;
    telegram?: any;
  };
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    dueDate?: string;
    tags?: string[];
  }>;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    category?: string;
  }>;
  bookmarks: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string;
    category?: string;
  }>;
  habits: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
    completedDates: string[]; // ISO string YYYY-MM-DD
    targetDaysPerWeek: number;
  }>;
  savedNewsIds: string[];
  customWidgetsLayout?: any;
}

const DEFAULT_DATA: DashboardData = {
  settings: {
    minimaxModel: 'MiniMax-Text-01',
    theme: 'midnight-glass',
    wallpaper: 'gradient-cyber',
    refreshIntervalSeconds: 300,
    userName: 'Kullanıcı'
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Dashboard widgetlarını incele ve özelleştir',
      description: 'Yapay zeka, haberler ve sistem durumunu takip et.',
      status: 'inprogress',
      priority: 'high',
      createdAt: new Date().toISOString(),
      tags: ['Dashboard', 'Kurulum']
    },
    {
      id: 'task-2',
      title: 'MiniMax API Key ayarla',
      description: 'Ayarlar panelinden MiniMax API anahtarını girerek canlı sinirsel özetlemeyi aç.',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      tags: ['YapayZeka', 'MiniMax']
    },
    {
      id: 'task-3',
      title: 'Günün haber özetini oku',
      description: 'Son 24 saatteki Türkiye ve dünya gündemini tek tıkla analiz et.',
      status: 'done',
      priority: 'low',
      createdAt: new Date().toISOString(),
      tags: ['Haberler']
    }
  ],
  notes: [
    {
      id: 'note-1',
      title: '🌟 Hoş Geldiniz! Dashboard Notları',
      content: `# Gelişmiş Yerel Dashboard

- **Haberler**: TRT, AA, NTV, BBC Türkçe, Sözcü ve teknoloji sitelerinden 24 saatlik anlık akış.
- **MiniMax AI**: Her haberin altında "AI ile Özetle" butonu veya yapay zeka asistanı.
- **Finans**: Canlı Dolar, Euro, Altın, BIST 100 ve Kripto paralar.
- **Özelleştirme**: Sağ üstteki "+ Widget Ekle" butonu ile istediğin bileşenleri ekle/kaldır.

> *"Geleceği tahmin etmenin en iyi yolu, onu yaratmaktır."*`,
      updatedAt: new Date().toISOString(),
      category: 'Genel'
    }
  ],
  bookmarks: [
    { id: 'bm-1', title: 'GitHub', url: 'https://github.com', icon: 'Github', category: 'Geliştirici' },
    { id: 'bm-2', title: 'TRT Haber', url: 'https://www.trthaber.com', icon: 'Globe', category: 'Haber' },
    { id: 'bm-3', title: 'TradingView', url: 'https://tr.tradingview.com', icon: 'TrendingUp', category: 'Finans' },
    { id: 'bm-4', title: 'ChatGPT', url: 'https://chatgpt.com', icon: 'Bot', category: 'AI' },
    { id: 'bm-5', title: 'YouTube', url: 'https://youtube.com', icon: 'Video', category: 'Medya' },
    { id: 'bm-6', title: 'Anadolu Ajansı', url: 'https://www.aa.com.tr', icon: 'Newspaper', category: 'Haber' }
  ],
  habits: [
    { id: 'h-1', name: 'Gündemi & Haberleri Oku', targetDaysPerWeek: 7, completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 'h-2', name: 'Su İç (2.5 Litre)', targetDaysPerWeek: 7, completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 'h-3', name: '25 Dk Pomodoro Odaklanma', targetDaysPerWeek: 5, completedDates: [] },
    { id: 'h-4', name: 'Yeni Bir Teknoloji / Kod İncele', targetDaysPerWeek: 5, completedDates: [] }
  ],
  savedNewsIds: []
};

export class StorageService {
  private data: DashboardData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DashboardData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return { ...DEFAULT_DATA, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[StorageService] Failed to read db.json, using defaults:', e);
    }
    this.saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  private saveData(data: DashboardData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[StorageService] Error saving db.json:', e);
    }
  }

  getData(): DashboardData {
    return this.data;
  }

  updateData(partial: Partial<DashboardData>): DashboardData {
    this.data = {
      ...this.data,
      ...partial,
      settings: { ...this.data.settings, ...(partial.settings || {}) }
    };
    this.saveData(this.data);
    return this.data;
  }
}

export const storageService = new StorageService();
