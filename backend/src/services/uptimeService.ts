import axios from 'axios';

export interface UptimeCheckResult {
  url: string;
  name: string;
  isOnline: boolean;
  statusCode?: number;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

export class UptimeService {
  async checkEndpoint(url: string, name: string): Promise<UptimeCheckResult> {
    const startTime = Date.now();
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const res = await axios.get(targetUrl, {
        timeout: 6000,
        validateStatus: () => true // accept all status codes to read latency & code
      });

      const latencyMs = Date.now() - startTime;
      const isOnline = res.status >= 200 && res.status < 400;

      return {
        url: targetUrl,
        name: name || targetUrl,
        isOnline,
        statusCode: res.status,
        latencyMs,
        checkedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        url: targetUrl,
        name: name || targetUrl,
        isOnline: false,
        latencyMs,
        checkedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        error: err.code || err.message || 'Bağlantı kurulamadı'
      };
    }
  }

  async checkMultiple(targets: Array<{ url: string; name: string }>): Promise<UptimeCheckResult[]> {
    const promises = targets.map(t => this.checkEndpoint(t.url, t.name));
    return Promise.all(promises);
  }
}

export const uptimeService = new UptimeService();
