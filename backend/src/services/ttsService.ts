import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export interface TTSOptions {
  voice?: 'tr-TR-AhmetNeural' | 'tr-TR-EmelNeural';
  rate?: string;
  pitch?: string;
}

export class TTSService {
  /**
   * Generates studio-grade Turkish speech buffer using Microsoft Edge Neural TTS
   */
  async getSpeechBuffer(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const voice = options.voice || 'tr-TR-AhmetNeural';
    const cleanedText = this.prepareSpokenTurkishText(text);

    if (!cleanedText) {
      throw new Error('Seslendirilecek metin bulunamadı.');
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const stream = tts.toStream(cleanedText, {
      rate: options.rate || 'default',
      pitch: options.pitch || 'default'
    });

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let settled = false;

      const finish = () => {
        if (!settled) {
          settled = true;
          const totalBuffer = Buffer.concat(chunks);
          if (totalBuffer.length > 500) {
            resolve(totalBuffer);
          } else {
            reject(new Error('Ses verisi yetersiz.'));
          }
        }
      };

      const timer = setTimeout(() => {
        if (chunks.length > 0) {
          finish();
        } else if (!settled) {
          settled = true;
          reject(new Error('TTS Zaman Aşımı'));
        }
      }, 10000);

      stream.audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.audioStream.on('end', () => {
        clearTimeout(timer);
        finish();
      });

      stream.audioStream.on('error', (_err: any) => {
        clearTimeout(timer);
        // If Microsoft closed the socket after transmitting audio frames, treat collected audio as success
        if (chunks.length > 0) {
          finish();
        } else if (!settled) {
          settled = true;
          reject(_err);
        }
      });
    });
  }

  /**
   * Cleans and prepares natural spoken Turkish text from bullet points
   */
  public prepareSpokenTurkishText(text: string): string {
    return text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove markdown bold/italic/headers
      .replace(/#{1,6}\s*/g, '')
      .replace(/[*_~>]/g, '')
      // Remove bullet dashes/dots
      .replace(/^\s*[-•*]\s+/gm, '')
      // Remove emojis
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Turkish currency conversions
      .replace(/(\d+)\s*₺/g, '$1 Türk Lirası')
      .replace(/₺\s*(\d+)/g, '$1 Türk Lirası')
      .replace(/(\d+)\s*TL/g, '$1 Türk Lirası')
      .replace(/\$(\d+[\d,.]*)/g, '$1 Dolar')
      .replace(/€(\d+[\d,.]*)/g, '$1 Euro')
      .replace(/%(\d+)/g, 'yüzde $1')
      .replace(/(\d+)%/g, 'yüzde $1')
      // Format newlines as natural speech pauses
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);
  }
}

export const ttsService = new TTSService();
