import Parser from 'rss-parser';
import { NewsItem, NewsFeedSource } from '../types';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
      ['image', 'image'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['dc:creator', 'creator'],
    ],
  },
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

export const SOURCES: NewsFeedSource[] = [
  { id: 'trt-gundem', name: 'TRT Haber (Gündem)', url: 'https://www.trthaber.com/gundem_articles.rss', category: 'Gündem', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'trt-ekonomi', name: 'TRT Haber (Ekonomi)', url: 'https://www.trthaber.com/ekonomi_articles.rss', category: 'Ekonomi', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'trt-teknoloji', name: 'TRT Haber (Teknoloji)', url: 'https://www.trthaber.com/bilim_teknoloji_articles.rss', category: 'Teknoloji', logo: 'https://www.trthaber.com/static/images/logo.svg' },
  { id: 'aa-guncel', name: 'Anadolu Ajansı', url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'Gündem', logo: 'https://cdnuploads.aa.com.tr/assets/new_design/images/aa-logo-icon.png' },
  { id: 'aa-ekonomi', name: 'Anadolu Ajansı (Ekonomi)', url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi', category: 'Ekonomi', logo: 'https://cdnuploads.aa.com.tr/assets/new_design/images/aa-logo-icon.png' },
  { id: 'ntv-gundem', name: 'NTV Haber', url: 'https://www.ntv.com.tr/gundem.rss', category: 'Gündem', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },
  { id: 'ntv-teknoloji', name: 'NTV Teknoloji', url: 'https://www.ntv.com.tr/teknoloji.rss', category: 'Teknoloji', logo: 'https://cdn.ntv.com.tr/img/logo-ntv.svg' },
  { id: 'bbc-turkce', name: 'BBC Türkçe', url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'Dünya', logo: 'https://news.files.bbci.co.uk/include/articles/public/turkce/images/metadata/poster-1024x576.png' },
  { id: 'sozcu-gundem', name: 'Sözcü Gazetesi', url: 'https://www.sozcu.com.tr/rss/gundem.xml', category: 'Gündem', logo: 'https://www.sozcu.com.tr/static/img/sozcu-logo.svg' },
  { id: 'webtekno', name: 'Webtekno', url: 'https://www.webtekno.com/rss.xml', category: 'Teknoloji', logo: 'https://www.webtekno.com/assets/img/logo.svg' },
  { id: 'donanimhaber', name: 'DonanımHaber', url: 'https://www.donanimhaber.com/rss/tum/', category: 'Teknoloji', logo: 'https://www.donanimhaber.com/favicon.ico' },
  { id: 'ensonhaber', name: 'Ensonhaber', url: 'https://www.ensonhaber.com/rss/ensonhaber.xml', category: 'Gündem', logo: 'https://icdn.ensonhaber.com/assets/front/images/logo.png' }
];

let cachedNews: NewsItem[] = [];
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes cache

function extractImage(item: any): string | undefined {
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }
  if (item.enclosure && typeof item.enclosure === 'object' && item.enclosure.url) {
    return item.enclosure.url;
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
        console.warn(`[NewsService] Failed to fetch feed from ${source.name}:`, err.message || err);
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
