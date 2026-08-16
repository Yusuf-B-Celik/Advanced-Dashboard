import { minimaxService, MiniMaxConfig } from './minimaxService';
import { scraperService } from './scraperService';
import { webSearchService } from './webSearchService';

export interface DeepResearchResult {
  query: string;
  executiveSummary: string;
  keyFindings: string[];
  matrixTable: string;
  mermaidDiagram: string;
  citations: Array<{ title: string; url: string; snippet: string }>;
  fullReportMarkdown: string;
  researchedAt: string;
}

export class DeepResearchService {
  async executeResearch(
    query: string,
    config?: MiniMaxConfig
  ): Promise<DeepResearchResult> {
    if (!query || query.trim().length === 0) {
      throw new Error('Araştırma konusu boş olamaz.');
    }

    // Step 1: Generate 3-4 sub-queries for deep search
    const planningPrompt = `Sen dünyanın en iyi araştırma planlayıcısısın.
Kullanıcının araştırmak istediği konu: "${query}"

Bu konuyu internette en derin ve tarafsız şekilde araştırmak için 3 adet nokta atışı Google/DuckDuckGo arama sorgusu üret.
Yalnızca JSON formatında yanıt ver:
{
  "subQueries": ["sorgu 1", "sorgu 2", "sorgu 3"]
}`;

    let subQueries: string[] = [query, `${query} 2026 detaylar analiz`, `${query} karşılaştırma inceleme`];
    try {
      const planRes = await minimaxService.createChatCompletion(
        [{ role: 'user', content: planningPrompt }],
        config
      );
      const jsonMatch = planRes.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.subQueries) && parsed.subQueries.length > 0) {
          subQueries = parsed.subQueries.slice(0, 3);
        }
      }
    } catch {
      // fallback to default subqueries
    }

    // Step 2: Search web for each sub-query and scrape top pages
    const gatheredContexts: Array<{ title: string; url: string; content: string }> = [];

    for (const sq of subQueries) {
      try {
        const searchResults = await webSearchService.searchWeb(sq, 2);
        for (const res of searchResults) {
          if (res.link && !gatheredContexts.some(c => c.url === res.link)) {
            // Scrape clean content
            try {
              const scraped = await scraperService.scrapeUrl(res.link);
              gatheredContexts.push({
                title: scraped.title || res.title,
                url: res.link,
                content: (scraped.content || res.snippet).slice(0, 2000)
              });
            } catch {
              gatheredContexts.push({
                title: res.title,
                url: res.link,
                content: res.snippet
              });
            }
          }
        }
      } catch (err: any) {
        console.warn(`[DeepResearch] Search failed for subquery "${sq}":`, err.message);
      }
    }

    // If web search returned empty, perform direct search for query
    if (gatheredContexts.length === 0) {
      try {
        const fallbackSearch = await webSearchService.searchWeb(query, 4);
        for (const res of fallbackSearch) {
          gatheredContexts.push({
            title: res.title,
            url: res.link,
            content: res.snippet
          });
        }
      } catch (err: any) {
        console.warn('[DeepResearch] Fallback search failed:', err.message);
      }
    }

    const contextText = gatheredContexts
      .map((c, idx) => `[KAYNAK ${idx + 1}: ${c.title} (${c.url})]\n${c.content}`)
      .join('\n\n---\n\n');

    // Step 3: MiniMax Deep Synthesis into Harvard/Bloomberg Grade Research Dossier
    const synthesisPrompt = `Sen küresel bir istihbarat ve araştırma merkezinin Baş Analistisin.
Araştırma Konusu: "${query}"

İNTERNETTEN DERLENEN GÜNCEL VERİLER:
${contextText || 'İnternet verisi doğrudan MiniMax genel bilgi dağarcığından sentezlenecektir.'}

GÖREV:
"${query}" konusunda son derece derin, tarafsız, profesyonel ve yapılandırılmış bir "DERİN ARAŞTIRMA RAPORU" hazırla.

BİÇİM VE BÖLÜMLER (Eksiksiz olarak bu yapıyı kullan):

# 📑 Derin Araştırma Raporu: ${query}

## 1. 📌 Yönetici Özeti (Executive Summary)
Konunun özü, neden önemli olduğu ve kritik durum tespiti.

## 2. 💡 Kilit Bulgular ve Çıkarımlar
- En kritik bulgu 1 (detaylı)
- En kritik bulgu 2 (detaylı)
- En kritik bulgu 3 (detaylı)
- En kritik bulgu 4 (detaylı)

## 3. 📊 Karşılaştırma & Analiz Matrisi
Konudaki alternatifleri, parametreleri veya verileri kıyaslayan bir Markdown Tablosu oluştur.

## 4. 🧠 Görsel Zihin Haritası (Mind Map)
Aşağıdaki formatta bir Mermaid mindmap oluştur (Yalnızca \`\`\`mermaid bloğu içinde):
\`\`\`mermaid
mindmap
  root((${query.slice(0, 25)}))
    Ana Başlık 1
      Alt Detay 1.1
      Alt Detay 1.2
    Ana Başlık 2
      Alt Detay 2.1
    Ana Başlık 3
      Alt Detay 3.1
\`\`\`

## 5. 🎯 Stratejik Öneriler ve Sonuç
Uygulanabilir aksiyon adımları ve gelecek projeksiyonu.`;

    const fullReportMarkdown = await minimaxService.createChatCompletion(
      [
        { role: 'system', content: 'Sen dünyanın en kapsamlı derin araştırma ve analiz raporlarını hazırlayan otonom bir yapay zeka ajanısın.' },
        { role: 'user', content: synthesisPrompt }
      ],
      config
    );

    // Extract Mermaid diagram
    const mermaidMatch = fullReportMarkdown.match(/```mermaid([\s\S]*?)```/);
    const mermaidDiagram = mermaidMatch ? mermaidMatch[1].trim() : '';

    return {
      query,
      executiveSummary: fullReportMarkdown.slice(0, 300) + '...',
      keyFindings: [],
      matrixTable: '',
      mermaidDiagram,
      citations: gatheredContexts.map(c => ({
        title: c.title,
        url: c.url,
        snippet: c.content.slice(0, 150)
      })),
      fullReportMarkdown,
      researchedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  }
}

export const deepResearchService = new DeepResearchService();
