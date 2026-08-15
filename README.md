# 🌌 Nexus Advanced Dashboard (25+ Widget & MiniMax AI)

<p align="center">
  <strong>Ultra Modern, Tamamen Özelleştirilebilir, Yapay Zeka Destekli ve Çok Fonksiyonlu Kişisel Komut Merkezi</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/MiniMax-M3_AI-7000ff?style=for-the-badge" alt="MiniMax-M3" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT" />
</p>

---

## 🚀 Genel Bakış

**Nexus Advanced Dashboard**, yerel çalışan (local-first), geliştiriciler, profesyoneller ve günlük üretkenlik arayanlar için tasarlanmış yüksek performanslı bir komut merkezidir. **MiniMax-M3** yapay zeka modeli entegrasyonu, gerçek zamanlı token akışı (SSE), web arama enjeksiyonu, canlı haber taraması, donanım telemetrisi ve 25'ten fazla etkileşimli widget içerir.

---

## ✨ Öne Çıkan Özellikler

### 🤖 MiniMax-M3 Yapay Zeka & Canlı Copilot
- **SSE Token Streaming**: Yanıtların harf harf akıcı akışı.
- **Çift Protokol Desteği**: Hem resmi Anthropic SDK uyumlu (`/anthropic/v1/messages`) hem de OpenAI Chat Completions ve Native V2 desteği.
- **Abonelik & Anahtar Esnekliği**: Hem **Pay-as-you-go** hem de **Token Plan** (Subscription Key) desteği.
- **Canlı Web & Piyasa Enjeksiyonu**: DuckDuckGo web araması, son dakika Türkçe haberler ve anlık kurlarla zenginleştirilmiş sistem istemi.
- **Sesle & Konuşarak Ekleme**: Kanban, Notlar, Alışkanlıklar ve Bütçe widget'larına mikrofon veya doğal dille anında kayıt ekleme.

---

### 🧩 25+ Tam Fonksiyonel Widget Koleksiyonu

| Kategori | Widget'lar | Açıklama |
|---|---|---|
| 📰 **Haber & AI** | 1. Türk Basını & 24s Haberler<br>2. MiniMax-M3 AI Asistanı<br>3. Hacker News & Tech Trends<br>4. Günün Sözü & İlham | 12 Türkçe RSS, 3 maddelik AI özetleme, sesli okuma (TTS), canlı teknoloji trendleri. |
| 📈 **Finans & Kripto** | 5. Döviz, Altın & BIST 100<br>6. Kripto Isı Haritası & Portföy<br>7. Bütçe & Harcama Takibi | Canlı serbest piyasa ve Binance kurları, 24s getiri haritası, gelir/gider kaydı ve AI harcama ekleme. |
| 💻 **Geliştirici & Sistem** | 8. Sistem Telemetrisi (CPU, RAM, Disk)<br>9. GitHub Trend Projeler<br>10. Servis & API Uptime Ping<br>11. Snippet Vault (Kod Deposu)<br>12. Ağ & İnternet Teşhis | 16 çekirdek yük analizi, CPU sıcaklığı, disk bölümleri, indirme/yükleme hızı (RX/TX), HTTP 200 ping monitörü. |
| ⚡ **Üretkenlik & Odak** | 13. Görev & Proje Panosu (Kanban)<br>14. Pomodoro & Odaklanma Sesleri<br>15. Markdown Not Defteri<br>16. Alışkanlık & Zinciri Kırma<br>17. Nefes & Odaklanma Molası<br>18. Günün Mood & Günlüğü | Sesli/AI görev ekleme, Web Audio Yağmur/Kafe ambient sesleri, 4-7-8 & Box Breathing animasyonu, emoji mood takibi. |
| 🛠️ **Araçlar & Yaşam & Medya** | 19. Saat & Türkçe Takvim<br>20. Dünya Saatleri & Toplantı Planlayıcı<br>21. Hava Durumu & Kalitesi (81 İl)<br>22. Hızlı Araçlar (Şifre, QR, Birim, KDV, Base64, Hash, JSON, RNG)<br>23. Hızlı Taslak & Metin Dönüştürücü<br>24. Hızlı Başlatıcı & Bağlantılar<br>25. Lofi & Canlı Radyolar | 81 Türkiye ili, 12 canlı radyo istasyonu, 9 alt sekmeli İsviçre çakısı araç kutusu. |

---

## 🛠️ Teknoloji Yığını

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Lucide Icons, Canvas-Confetti, React-Markdown.
- **Backend**: Node.js, Express, TypeScript, SystemInformation, Axios, RSS-Parser, DuckDuckGo Search.
- **AI**: MiniMax-M3 (Token Plan & Pay-as-you-go, Anthropic Messages / OpenAI / Native API).

---

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm veya pnpm / yarn

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/Yusuf-B-Celik/Advanced-Dashboard.git
cd Advanced-Dashboard
```

### 2. Bağımlılıkları Yükleyin
```bash
npm run install:all
```
*(veya sırasıyla `npm install`, `cd backend && npm install`, `cd ../frontend && npm install`)*

### 3. Ortam Değişkenleri (Opsiyonel)
Backend dizininde `.env` dosyasını oluşturabilirsiniz (Ayarlar arayüzünden de API anahtarı girilebilir):
```bash
cp backend/.env.example backend/.env
```

### 4. Uygulamayı Başlatın
```bash
npm run dev
```

- **Frontend Arayüzü**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
