import { spawn, execSync, ChildProcess } from 'child_process';
import axios from 'axios';

export interface TunnelStatus {
  installed: boolean;
  version?: string;
  isRunning: boolean;
  url: string | null;
  qrUrl: string | null;
  error?: string;
}

export class TunnelService {
  private ngrokProcess: ChildProcess | null = null;
  private currentUrl: string | null = null;

  isInstalled(): { installed: boolean; version?: string } {
    try {
      const output = execSync('ngrok version', { encoding: 'utf-8', timeout: 3000 });
      return { installed: true, version: output.trim() };
    } catch {
      return { installed: false };
    }
  }

  async getStatus(): Promise<TunnelStatus> {
    const installInfo = this.isInstalled();
    if (!installInfo.installed) {
      return {
        installed: false,
        isRunning: false,
        url: null,
        qrUrl: null
      };
    }

    try {
      // Query ngrok's local client API
      const res = await axios.get('http://127.0.0.1:4040/api/tunnels', { timeout: 1500 });
      const tunnels = res.data?.tunnels || [];
      const httpsTunnel = tunnels.find((t: any) => t.proto === 'https') || tunnels[0];

      if (httpsTunnel && httpsTunnel.public_url) {
        this.currentUrl = httpsTunnel.public_url;
        return {
          installed: true,
          version: installInfo.version,
          isRunning: true,
          url: this.currentUrl,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(this.currentUrl || '')}`
        };
      }
    } catch {
      // ngrok local api is not running
    }

    return {
      installed: true,
      version: installInfo.version,
      isRunning: false,
      url: null,
      qrUrl: null
    };
  }

  async startTunnel(port: number = 5173): Promise<{ success: boolean; url?: string; qrUrl?: string; error?: string }> {
    const installInfo = this.isInstalled();
    if (!installInfo.installed) {
      return { success: false, error: 'Sisteminizde ngrok yüklü bulunamadı. Lütfen önce ngrok yükleyin.' };
    }

    // Check if already running
    const status = await this.getStatus();
    if (status.isRunning && status.url) {
      return { success: true, url: status.url, qrUrl: status.qrUrl || undefined };
    }

    try {
      // Spawn ngrok process
      this.ngrokProcess = spawn('ngrok', ['http', port.toString(), '--log=stdout'], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.ngrokProcess.on('error', (err) => {
        console.error('[TunnelService] Ngrok process error:', err);
      });

      this.ngrokProcess.on('exit', () => {
        this.ngrokProcess = null;
        this.currentUrl = null;
      });

      // Poll local ngrok API for up to 10 seconds to get public URL
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const res = await axios.get('http://127.0.0.1:4040/api/tunnels', { timeout: 1000 });
          const tunnels = res.data?.tunnels || [];
          const httpsTunnel = tunnels.find((t: any) => t.proto === 'https') || tunnels[0];
          if (httpsTunnel && httpsTunnel.public_url) {
            const publicUrl: string = httpsTunnel.public_url;
            this.currentUrl = publicUrl;
            return {
              success: true,
              url: publicUrl,
              qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(publicUrl)}`
            };
          }
        } catch {
          // Keep polling
        }
      }

      return { success: false, error: 'Ngrok tüneli başlatılamadı veya zaman aşımına uğradı.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Ngrok başlatılırken hata oluştu.' };
    }
  }

  async stopTunnel(): Promise<{ success: boolean }> {
    try {
      if (this.ngrokProcess) {
        this.ngrokProcess.kill('SIGTERM');
        this.ngrokProcess = null;
      }
      try {
        execSync('pkill -f "ngrok http" || true');
      } catch {}
      this.currentUrl = null;
      return { success: true };
    } catch (err: any) {
      console.warn('[TunnelService] Stop error:', err.message);
      return { success: true };
    }
  }
}

export const tunnelService = new TunnelService();
