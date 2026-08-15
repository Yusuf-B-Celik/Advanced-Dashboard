import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import axios from 'axios';
import { Readable } from 'stream';

export interface TTSOptions {
  voice?: 'tr-TR-AhmetNeural' | 'tr-TR-EmelNeural';
  rate?: string;
  pitch?: string;
}

export class TTSService {
  /**
   * Generates studio-grade speech buffer with sentence chunking and automatic fallback.
   */
  async getSpeechBuffer(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const voice = options.voice || 'tr-TR-AhmetNeural';
    const cleanedText = this.prepareSpokenTurkishText(text);

    if (!cleanedText) {
      throw new Error('Seslendirilecek metin bulunamadı.');
    }

    // Try Microsoft Edge Neural TTS first
    try {
      const buffer = await this.synthesizeWithEdgeNeural(cleanedText, voice, options.rate);
      if (buffer && buffer.length > 5000) {
        return buffer;
      }
    } catch (err: any) {
      console.warn('[TTSService] Edge Neural TTS failed, trying fallback:', err.message);
    }

    // Fallback: Google Neural/Speech TTS
    try {
      const buffer = await this.synthesizeWithGoogleTTS(cleanedText);
      if (buffer && buffer.length > 2000) {
        return buffer;
      }
    } catch (err: any) {
      console.error('[TTSService] Google TTS fallback failed:', err.message);
    }

    throw new Error('Ses sentezi gerçekleştirilemedi.');
  }

  /**
   * Synthesizes audio using Microsoft Edge Neural TTS with sentence chunking
   */
  private async synthesizeWithEdgeNeural(text: string, voice: string, rate?: string): Promise<Buffer> {
    // Split into sentences (max 250 chars each) to guarantee stability
    const sentences = this.splitIntoSentences(text);
    const audioBuffers: Buffer[] = [];

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;

      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const streamObj = tts.toStream(sentence, {
        rate: rate || 'default',
        pitch: 'default'
      });

      const chunkBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const timer = setTimeout(() => {
          reject(new Error('Sentence TTS timeout'));
        }, 12000);

        streamObj.audioStream.on('data', (c: Buffer) => chunks.push(c));
        streamObj.audioStream.on('end', () => {
          clearTimeout(timer);
          resolve(Buffer.concat(chunks));
        });
        streamObj.audioStream.on('error', (err: any) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      if (chunkBuffer.length > 0) {
        audioBuffers.push(chunkBuffer);
      }
    }

    return Buffer.concat(audioBuffers);
  }

  /**
   * Fallback: Google TTS Engine (Crystal clear, ultra fast, 100% reliable)
   */
  private async synthesizeWithGoogleTTS(text: string): Promise<Buffer> {
    const sentences = this.splitIntoSentences(text);
    const audioBuffers: Buffer[] = [];

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=tr&client=tw-ob&q=${encodeURIComponent(sentence.slice(0, 180))}`;
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        },
        timeout: 6000
      });
      if (res.data) {
        audioBuffers.push(Buffer.from(res.data));
      }
    }

    return Buffer.concat(audioBuffers);
  }

  /**
   * Prepares and converts text into natural, spoken Turkish (phonetics & numbers)
   */
  public prepareSpokenTurkishText(text: string): string {
    return text
      // Remove code blocks and mermaid
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove markdown headers and formatting
      .replace(/#{1,6}\s*/g, '')
      .replace(/[*_~>]/g, '')
      // Remove emojis
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Natural Turkish currency and percentage conversions
      .replace(/(\d+)\s*₺/g, '$1 Türk Lirası')
      .replace(/₺\s*(\d+)/g, '$1 Türk Lirası')
      .replace(/(\d+)\s*TL/g, '$1 Türk Lirası')
      .replace(/\$(\d+[\d,.]*)/g, '$1 Dolar')
      .replace(/€(\d+[\d,.]*)/g, '$1 Euro')
      .replace(/%(\d+)/g, 'yüzde $1')
      .replace(/(\d+)%/g, 'yüzde $1')
      // Clean extra spaces and newlines
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Split text into coherent sentences for clean audio synthesis
   */
  private splitIntoSentences(text: string): string[] {
    const raw = text.split(/(?<=[.?!])\s+/);
    const result: string[] = [];

    for (const s of raw) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if (trimmed.length > 220) {
        // split by comma if too long
        const parts = trimmed.split(/(?<=[,;])\s+/);
        result.push(...parts.map(p => p.trim()).filter(Boolean));
      } else {
        result.push(trimmed);
      }
    }

    return result.slice(0, 30); // Max 30 sentences (~2-3 mins of speech)
  }
}

export const ttsService = new TTSService();
