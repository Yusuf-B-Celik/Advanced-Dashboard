import axios from 'axios';

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source?: string;
}

function cleanHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ouml;/gi, 'ö')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&uuml;/gi, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&Idot;/g, 'İ')
    .replace(/&yacute;/gi, 'ı')
    .replace(/&Yacute;/g, 'I')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class WebSearchService {
  /**
   * High-reliability Multi-Engine Search (Yahoo + Google News + Wikipedia + Tech HN)
   */
  async searchWeb(query: string, maxResults: number = 6): Promise<SearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const results: SearchResult[] = [];
    const seenLinks = new Set<string>();

    const addResult = (res: SearchResult) => {
      if (
        res.link && 
        res.link.startsWith('http') && 
        !seenLinks.has(res.link) && 
        !res.link.includes('yahoo.com') && 
        !res.link.includes('bing.com')
      ) {
        seenLinks.add(res.link);
        results.push({
          title: cleanHtmlEntities(res.title),
          snippet: cleanHtmlEntities(res.snippet),
          link: res.link,
          source: res.source || 'Web Arama'
        });
      }
    };

    // 1. Yahoo Web Search (Direct deep web articles)
    try {
      const yUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(cleanQuery)}`;
      const res = await axios.get(yUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 4500
      });

      const html = res.data;
      const links = [...html.matchAll(/<h3[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const l of links) {
        let realUrl = l[1];
        const ruMatch = realUrl.match(/\/RU=([^/]+)\//);
        if (ruMatch) {
          try {
            realUrl = decodeURIComponent(ruMatch[1]);
          } catch {
            // keep raw
          }
        }
        let rawTitle = l[2]
          .replace(/^[^\s]+\s+›\s+[^\s]+\s+/, '')
          .replace(/^›\s+/, '')
          .trim();

        if (rawTitle.length > 5 && realUrl.startsWith('http')) {
          addResult({
            title: rawTitle,
            link: realUrl,
            snippet: rawTitle,
            source: 'Web Arama'
          });
        }
      }
    } catch (err: any) {
      console.warn('[WebSearchService] Yahoo search error:', err.message);
    }

    // 2. Google News RSS Search (Live news & publications)
    try {
      const gUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=tr&gl=TR&ceid=TR:tr`;
      const res = await axios.get(gUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
        },
        timeout: 4000
      });

      const items = [...res.data.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/gi)];

      for (const it of items.slice(0, 4)) {
        const title = it[1];
        const link = it[2];
        const snippet = it[3];
        if (title && link) {
          addResult({
            title,
            link,
            snippet: snippet || title,
            source: 'Google Haberler'
          });
        }
      }
    } catch (err: any) {
      console.warn('[WebSearchService] Google News search error:', err.message);
    }

    // 3. Wikipedia API (Turkish / Global)
    try {
      const wikiUrl = `https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
      const res = await axios.get(wikiUrl, {
        headers: { 'User-Agent': 'NexusDashboard/2.0 (contact@nexus.local)' },
        timeout: 3500
      });
      const items = res.data?.query?.search || [];
      for (const item of items.slice(0, 2)) {
        const title = item.title;
        const link = `https://tr.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
        const snippet = item.snippet;
        addResult({
          title: `${title} - Vikipedi`,
          link,
          snippet: snippet || title,
          source: 'Vikipedi'
        });
      }
    } catch (err: any) {
      console.warn('[WebSearchService] Wikipedia search error:', err.message);
    }

    // 4. Hacker News Algolia API (for tech/coding topics)
    if (results.length < maxResults) {
      try {
        const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(cleanQuery)}&tags=story&hitsPerPage=3`;
        const res = await axios.get(hnUrl, { timeout: 3500 });
        const hits = res.data?.hits || [];
        for (const hit of hits) {
          if (hit.url && hit.title) {
            addResult({
              title: hit.title,
              link: hit.url,
              snippet: `Hacker News Points: ${hit.points || 0}, Comments: ${hit.num_comments || 0}`,
              source: 'Hacker News'
            });
          }
        }
      } catch {
        // ignore
      }
    }

    return results.slice(0, maxResults);
  }
}

export const webSearchService = new WebSearchService();
