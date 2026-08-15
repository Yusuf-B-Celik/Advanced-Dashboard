import axios from 'axios';

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source?: string;
}

export class WebSearchService {
  /**
   * Search web for recent Turkish / Global queries using fast DuckDuckGo HTML parser
   */
  async searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      const cleanQuery = query.trim();
      if (!cleanQuery) return [];

      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery + ' son dakika güncel')}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 6000
      });

      const html = response.data;
      const results: SearchResult[] = [];

      // Extract result blocks
      const resultBlocks = html.split('class="result__body"').slice(1, maxResults + 1);

      for (const block of resultBlocks) {
        // Extract title & link
        const titleMatch = block.match(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/i) || 
                           block.match(/class="result__url[^>]*>([\s\S]*?)<\/span>/i);
        const linkMatch = block.match(/href="([^"]+)"/i);
        const snippetMatch = block.match(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/i) ||
                             block.match(/class="result__snippet[^>]*>([\s\S]*?)<\//i);

        const cleanText = (str?: string) => 
          str ? str.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim() : '';

        const title = cleanText(block.match(/class="result__title[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1]) || 'Sonuç';
        const snippet = cleanText(snippetMatch?.[1]);
        const link = linkMatch?.[1] || '';

        if (title && snippet) {
          results.push({ title, snippet, link });
        }
      }

      return results;
    } catch (err: any) {
      console.warn('[WebSearchService] Live web search error (non-fatal):', err.message);
      return [];
    }
  }
}

export const webSearchService = new WebSearchService();
