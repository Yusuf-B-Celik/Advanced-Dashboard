export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  snippet: string;
  source: string;
  category: string;
  imageUrl?: string;
  sourceLogo?: string;
  aiSummary?: {
    bullets: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTakeaway: string;
    analyzedAt: string;
    modelUsed?: string;
  };
}

export interface FinanceItem {
  code: string;
  name: string;
  type: 'currency' | 'gold' | 'bist' | 'crypto';
  buy: number;
  sell: number;
  changeRate: number;
  unit: string;
  lastUpdated: string;
  history?: number[];
}

export interface SystemStats {
  cpu: {
    usagePercent: number;
    cores: number;
    model: string;
    speedGhz: number;
    perCoreUsage?: number[];
    temperature?: number;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    swapTotal?: number;
    swapUsed?: number;
    swapUsagePercent?: number;
  };
  disk: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    partitions?: Array<{
      fs: string;
      mount: string;
      size: number;
      used: number;
      use: number;
    }>;
  };
  network?: {
    rxBytesSec: number;
    txBytesSec: number;
    iface: string;
  };
  os: {
    platform: string;
    distro: string;
    arch: string;
    hostname: string;
    uptimeSeconds: number;
    nodeVersion?: string;
    processUptimeSeconds?: number;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate?: string;
  tags?: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  category?: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  completedDates: string[]; // YYYY-MM-DD
  targetDaysPerWeek: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'productive' | 'tired' | 'stressed' | 'happy';
  note: string;
  aiReflection?: string;
}

export interface UptimeTarget {
  id: string;
  name: string;
  url: string;
  isOnline?: boolean;
  statusCode?: number;
  latencyMs?: number;
  lastChecked?: string;
}

export interface HackerNewsStory {
  id: number;
  title: string;
  url: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
  domain?: string;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  icon: string;
  colSpan: number; // 1 to 12
  rowSpan?: number;
  visible: boolean;
  category: 'news' | 'ai' | 'finance' | 'system' | 'productivity' | 'utilities' | 'media' | 'developer';
  workspaces: string[]; // ['all', 'genel', 'haberler', 'sistem', 'odaklanma']
}

export interface UserSettings {
  minimaxApiKey?: string;
  minimaxPlanType?: 'pay_as_you_go' | 'token_plan';
  minimaxProtocol?: 'anthropic' | 'openai' | 'native';
  minimaxModel: string;
  minimaxRegion?: 'global' | 'global_alt' | 'china' | 'custom';
  minimaxBaseUrl?: string;
  minimaxGroupId?: string;
  theme: string;
  wallpaper: string;
  refreshIntervalSeconds: number;
  userName: string;
  weatherCity: string;
  viewMode?: 'compact' | 'expanded';
}
