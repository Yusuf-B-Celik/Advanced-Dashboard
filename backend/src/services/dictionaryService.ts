import axios from 'axios';

export interface OnlineDictionaryMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  synonyms?: string[];
  antonyms?: string[];
}

export interface OnlineDictionaryResult {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  audioUrl?: string;
  meanings: OnlineDictionaryMeaning[];
  sourceUrls?: string[];
}

export class DictionaryService {
  private cache: Map<string, OnlineDictionaryResult> = new Map();

  async lookupWord(word: string): Promise<OnlineDictionaryResult | null> {
    const clean = word.trim().toLowerCase();
    if (!clean) return null;

    if (this.cache.has(clean)) {
      return this.cache.get(clean)!;
    }

    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`;
      const response = await axios.get(url, { timeout: 8000 });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const item = response.data[0];
        
        // Find best audio
        let bestAudio = '';
        if (Array.isArray(item.phonetics)) {
          for (const ph of item.phonetics) {
            if (ph.audio && ph.audio.trim().length > 0) {
              bestAudio = ph.audio;
              break;
            }
          }
        }

        const result: OnlineDictionaryResult = {
          word: item.word || clean,
          phonetic: item.phonetic || (item.phonetics?.[0]?.text) || '',
          phonetics: item.phonetics || [],
          audioUrl: bestAudio,
          meanings: item.meanings || [],
          sourceUrls: item.sourceUrls || []
        };

        this.cache.set(clean, result);
        return result;
      }
      return null;
    } catch (err: any) {
      console.warn(`Online dictionary lookup failed for "${clean}":`, err?.message || err);
      return null;
    }
  }
}

export const dictionaryService = new DictionaryService();
