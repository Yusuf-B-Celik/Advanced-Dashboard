import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { Readable } from 'stream';

export interface TTSOptions {
  voice?: 'tr-TR-AhmetNeural' | 'tr-TR-EmelNeural';
  rate?: string; // e.g. "+0%", "+15%", "-10%"
  pitch?: string;
}

export class TTSService {
  async getSpeechStream(text: string, options: TTSOptions = {}): Promise<Readable> {
    const voice = options.voice || 'tr-TR-AhmetNeural';
    const cleanText = this.sanitizeTextForSpeech(text);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(cleanText, {
      rate: options.rate || 'default',
      pitch: options.pitch || 'default'
    });

    return audioStream;
  }

  async getSpeechBuffer(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const stream = await this.getSpeechStream(text, options);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  private sanitizeTextForSpeech(text: string): string {
    return text
      .replace(/[*#`_~>\[\]\(\)]/g, ' ') // Strip markdown formatting
      .replace(/\bTL\b/g, 'Türk Lirası')
      .replace(/₺/g, ' Türk Lirası ')
      .replace(/\$/g, ' Dolar ')
      .replace(/€/g, ' Euro ')
      .replace(/%/g, ' yüzde ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3500); // Safety limit for single speech turn
  }
}

export const ttsService = new TTSService();
