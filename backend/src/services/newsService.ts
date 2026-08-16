import Parser from 'rss-parser';
import { NewsItem, NewsFeedSource } from '../types';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['image', 'image'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['dc:creator', 'creator'],
    ],
  },
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

export const SOURCES: NewsFeedSource[] = [
  // --- GÜNDEM (TÜRKİYE) ---
  { id: 'trt-gundem', name: 'TRT Haber (Gündem)', url: 'https://www.trthaber.com/gundem_articles.rss', category: 'Gündem', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'haberturk-gundem', name: 'Habertürk (Gündem)', url: 'https://www.haberturk.com/rss/kategori/gundem.xml', category: 'Gündem', logo: 'https://im.haberturk.com/assets/images/logo/logo-ht.svg' },
  { id: 'hurriyet-gundem', name: 'Hürriyet (Gündem)', url: 'https://www.hurriyet.com.tr/rss/gundem', category: 'Gündem', logo: 'https://i.hurimg.com/i/hurriyet/75/0x0/5c4b18c6c03c0e18f0907d72.png' },
  { id: 'ntv-gundem', name: 'NTV Haber', url: 'https://www.ntv.com.tr/gundem.rss', category: 'Gündem', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },
  { id: 'sozcu-gundem', name: 'Sözcü Gazetesi', url: 'https://www.sozcu.com.tr/rss/gundem.xml', category: 'Gündem', logo: 'https://www.sozcu.com.tr/static/img/sozcu-logo.svg' },
  { id: 'ensonhaber', name: 'Ensonhaber', url: 'https://www.ensonhaber.com/rss/ensonhaber.xml', category: 'Gündem', logo: 'https://icdn.ensonhaber.com/assets/front/images/logo.png' },

  // --- EKONOMİ & FİNANS ---
  { id: 'trt-ekonomi', name: 'TRT Haber (Ekonomi)', url: 'https://www.trthaber.com/ekonomi_articles.rss', category: 'Ekonomi', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'haberturk-ekonomi', name: 'Habertürk (Ekonomi)', url: 'https://www.haberturk.com/rss/kategori/ekonomi.xml', category: 'Ekonomi', logo: 'https://im.haberturk.com/assets/images/logo/logo-ht.svg' },
  { id: 'hurriyet-ekonomi', name: 'Hürriyet (Ekonomi)', url: 'https://www.hurriyet.com.tr/rss/ekonomi', category: 'Ekonomi', logo: 'https://i.hurimg.com/i/hurriyet/75/0x0/5c4b18c6c03c0e18f0907d72.png' },
  { id: 'ntv-para', name: 'NTV Para & Finans', url: 'https://www.ntv.com.tr/para.rss', category: 'Ekonomi', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },

  // --- BİLİM & TEKNOLOJİ ---
  { id: 'trt-teknoloji', name: 'TRT Haber (Teknoloji)', url: 'https://www.trthaber.com/bilim_teknoloji_articles.rss', category: 'Teknoloji', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'shiftdelete', name: 'ShiftDelete.Net', url: 'https://shiftdelete.net/feed', category: 'Teknoloji', logo: 'https://shiftdelete.net/wp-content/themes/shiftdelete/assets/img/sdn-logo.svg' },
  { id: 'chip-online', name: 'Chip Online', url: 'https://www.chip.com.tr/rss', category: 'Teknoloji', logo: 'https://www.chip.com.tr/images/logo.svg' },
  { id: 'webtekno', name: 'Webtekno', url: 'https://www.webtekno.com/rss.xml', category: 'Teknoloji', logo: 'https://www.webtekno.com/assets/img/logo.svg' },
  { id: 'donanimhaber', name: 'DonanımHaber', url: 'https://www.donanimhaber.com/rss/tum/', category: 'Teknoloji', logo: 'https://www.donanimhaber.com/favicon.ico' },
  { id: 'ntv-teknoloji', name: 'NTV Teknoloji', url: 'https://www.ntv.com.tr/teknoloji.rss', category: 'Teknoloji', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },

  // --- DÜNYA & GLOBAL HABERLER ---
  { id: 'trt-dunya', name: 'TRT Haber (Dünya)', url: 'https://www.trthaber.com/dunya_articles.rss', category: 'Dünya', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'hurriyet-dunya', name: 'Hürriyet (Dünya)', url: 'https://www.hurriyet.com.tr/rss/dunya', category: 'Dünya', logo: 'https://i.hurimg.com/i/hurriyet/75/0x0/5c4b18c6c03c0e18f0907d72.png' },
  { id: 'haberturk-dunya', name: 'Habertürk (Dünya)', url: 'https://www.haberturk.com/rss/kategori/dunya.xml', category: 'Dünya', logo: 'https://im.haberturk.com/assets/images/logo/logo-ht.svg' },
  { id: 'ntv-dunya', name: 'NTV Dünya', url: 'https://www.ntv.com.tr/dunya.rss', category: 'Dünya', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },
  { id: 'euronews-tr', name: 'Euronews Türkçe', url: 'https://tr.euronews.com/rss', category: 'Dünya', logo: 'https://static.euronews.com/website/images/euronews-logo-main-white.svg' },
  { id: 'dw-turkce', name: 'DW Türkçe', url: 'https://rss.dw.com/xml/rss-tur-all', category: 'Dünya', logo: 'https://www.dw.com/manifest-icons/icon-192x192.png' },
  { id: 'bbc-world', name: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'Dünya', logo: 'https://news.files.bbci.co.uk/include/articles/public/turkce/images/metadata/poster-1024x576.png' },
  { id: 'guardian-world', name: 'The Guardian (Dünya)', url: 'https://www.theguardian.com/world/rss', category: 'Dünya', logo: 'https://assets.guim.co.uk/images/favicons/45199a07a1b89be04400cf9d750c8e71/152x152.png' },
  { id: 'aljazeera-world', name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'Dünya', logo: 'https://www.aljazeera.com/images/aljazeera-logo.svg' }
];

let cachedNews: NewsItem[] = [];
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function extractImage(item: any): string | undefined {
  if (item.enclosure && item.enclosure.url && (item.enclosure.type?.startsWith('image') || item.enclosure.url.match(/\.(jpg|jpeg|png|webp|gif)/i))) {
    return item.enclosure.url;
  }
  if (item.enclosure && typeof item.enclosure === 'object' && item.enclosure.url) {
    return item.enclosure.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item.image && typeof item.image === 'string') {
    return item.image;
  }

  // Regex extract from html description or contentEncoded
  const rawHtml = (item.contentEncoded || '') + ' ' + (item.description || '') + ' ' + (item['content'] || '');
  const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const url = imgMatch[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  }

  return undefined;
}

function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'news_' + Math.abs(hash).toString(36);
}

export class NewsService {
  async fetchAllNews(forceRefresh = false): Promise<NewsItem[]> {
    const now = Date.now();
    if (!forceRefresh && cachedNews.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
      return cachedNews;
    }

    const promises = SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        if (!feed || !feed.items) return [];

        return feed.items.map((item) => {
          const title = (item.title || '').trim();
          const link = item.link || '';
          const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
          const rawDesc = item.contentEncoded || item.content || item.description || item.summary || '';
          const cleanedText = cleanHtml(rawDesc);
          const snippet = cleanedText.length > 180 ? cleanedText.slice(0, 180) + '...' : cleanedText;
          const imageUrl = extractImage(item);
          const id = hashString(link || title);

          const newsItem: NewsItem = {
            id,
            title,
            link,
            pubDate,
            content: cleanedText || title,
            snippet: snippet || title,
            source: source.name,
            category: source.category,
            imageUrl,
            sourceLogo: source.logo
          };
          return newsItem;
        });
      } catch (err: any) {
        console.warn(`[NewsService] Feed fetch skipped (${source.name}):`, err.message || err);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    const allItems: NewsItem[] = [];
    const seenLinks = new Set<string>();

    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!item.title || item.title.length < 5) continue;
          if (seenLinks.has(item.link)) continue;
          seenLinks.add(item.link);
          allItems.push(item);
        }
      }
    }

    // Sort by publication date descending
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    if (allItems.length > 0) {
      cachedNews = allItems;
      lastFetchTime = now;
    }

    return cachedNews;
  }

  getSources(): NewsFeedSource[] {
    return SOURCES;
  }

  getNewsById(id: string): NewsItem | undefined {
    return cachedNews.find(item => item.id === id);
  }

  updateNewsSummary(id: string, aiSummary: NewsItem['aiSummary']) {
    const item = cachedNews.find(i => i.id === id);
    if (item) {
      item.aiSummary = aiSummary;
    }
  }
}

export const newsService = new NewsService();
