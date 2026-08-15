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
  };
}

export interface NewsFeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  logo: string;
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
