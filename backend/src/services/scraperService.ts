import axios from 'axios';

export interface ScrapedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  siteName: string;
  isYouTube: boolean;
  author?: string;
  publishedTime?: string;
}

export class ScraperService {
  async scrapeUrl(rawUrl: string): Promise<ScrapedContent> {
    let targetUrl = rawUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const isYouTube = targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be');

    try {
      if (isYouTube) {
        // Fetch YouTube metadata via oEmbed API
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
        const oembedRes = await axios.get(oembedUrl, { timeout: 5000 }).catch(() => null);
        const ytData = oembedRes?.data || {};

        return {
          url: targetUrl,
          title: ytData.title || 'YouTube Video',
          description: `Kanal / Yapımcı: ${ytData.author_name || 'YouTube'}`,
          content: `Bu bir YouTube video bağlantısıdır.\nVideo Başlığı: ${ytData.title || 'Bilinmeyen Video'}\nKanal: ${ytData.author_name || 'Bilinmiyor'}\nBağlantı: ${targetUrl}`,
          siteName: 'YouTube',
          isYouTube: true,
          author: ytData.author_name
        };
      }

      const res = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 8000
      });

      const html = res.data;
      if (typeof html !== 'string') {
        throw new Error('HTML içeriği okunamadı.');
      }

      // Simple regex based title, meta extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      const title = (ogTitleMatch?.[1] || titleMatch?.[1] || 'Web Sayfası').trim();

      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = (ogDescMatch?.[1] || metaDescMatch?.[1] || '').trim();

      const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
      const siteName = siteNameMatch?.[1] || new URL(targetUrl).hostname.replace('www.', '');

      // Strip tags, script, style
      let cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

      // Limit to 4000 chars for LLM context
      cleanText = cleanText.slice(0, 4000);

      return {
        url: targetUrl,
        title,
        description,
        content: cleanText,
        siteName,
        isYouTube: false
      };
    } catch (err: any) {
      console.warn('[ScraperService] Error scraping:', err.message);
      return {
        url: targetUrl,
        title: targetUrl,
        description: 'Web sayfası içeriği doğrudan okunamadı.',
        content: `URL: ${targetUrl}\n(Sayfa içeriği bot koruması veya ağ kısıtlaması nedeniyle çekilemedi. Başlık ve URL üzerinden analiz yapılacak.)`,
        siteName: new URL(targetUrl).hostname.replace('www.', ''),
        isYouTube
      };
    }
  }
}

export const scraperService = new ScraperService();
