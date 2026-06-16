# TASK.md — Backtesting Journal Website

> Website personal untuk mencatat, menganalisis, dan memvisualisasikan hasil trading.
> Stack: Next.js 14 (App Router) + Supabase + Tailwind CSS
> Design: Modern minimalist — dark base, monospace data, aksen hijau/merah untuk PnL

---

## 🗂️ Struktur Proyek

```
backtesting-journal/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Dashboard
│   ├── gallery/
│   │   └── page.tsx              # Galeri Trade
│   └── add-trade/
│       └── page.tsx              # Form Tambah Data
├── components/
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── TradeCard.tsx
│   │   ├── TradeModal.tsx
│   │   └── Navbar.tsx
│   └── charts/
│       ├── WinRateChart.tsx
│       ├── PnLChart.tsx
│       └── TechniqueBarChart.tsx
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Helper functions
├── types/
│   └── trade.ts                  # TypeScript interfaces
└── public/
    └── uploads/                  # (opsional jika pakai local)
```

---

## 🗄️ Database Schema — Supabase

### Tabel: `trades`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid` (PK, default gen_random_uuid()) | ID unik |
| `created_at` | `timestamptz` (default now()) | Waktu dibuat |
| `trade_date` | `date` | Tanggal trade |
| `pair` | `text` | Contoh: BTCUSDT, EUR/USD |
| `direction` | `text` | 'LONG' atau 'SHORT' |
| `entry_price` | `numeric` | Harga entry |
| `exit_price` | `numeric` | Harga exit |
| `stop_loss` | `numeric` | Level stop loss |
| `take_profit` | `numeric` | Level take profit |
| `pnl` | `numeric` | Profit/Loss (bisa positif/negatif) |
| `rr` | `numeric` | Risk:Reward ratio |
| `result` | `text` | 'WIN', 'LOSS', 'BREAKEVEN' |
| `technical_analysis` | `text[]` | Array: ['RSI', 'EMA', 'Support/Resistance'] |
| `reason` | `text` | Alasan/narasi trade |
| `screenshot_url` | `text` | URL gambar dari Supabase Storage |
| `notes` | `text` | Catatan tambahan (opsional) |

### SQL untuk buat tabel:

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  trade_date DATE NOT NULL,
  pair TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('LONG', 'SHORT')) NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  pnl NUMERIC NOT NULL,
  rr NUMERIC NOT NULL,
  result TEXT CHECK (result IN ('WIN', 'LOSS', 'BREAKEVEN')) NOT NULL,
  technical_analysis TEXT[] DEFAULT '{}',
  reason TEXT NOT NULL,
  screenshot_url TEXT,
  notes TEXT
);
```

### Supabase Storage Bucket:
```
Bucket name: trade-screenshots
Policy: Public read, authenticated write
```

---

## 📋 TASK LIST

### Phase 1 — Setup & Foundation
- [ ] **T-01** Init project Next.js 14 dengan TypeScript dan Tailwind CSS
- [ ] **T-02** Install dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `recharts`, `lucide-react`, `date-fns`
- [ ] **T-03** Buat project di Supabase, jalankan SQL schema di atas
- [ ] **T-04** Buat bucket `trade-screenshots` di Supabase Storage (public)
- [ ] **T-05** Setup environment variables (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **T-06** Buat `lib/supabase.ts` — inisialisasi Supabase client
- [ ] **T-07** Buat `types/trade.ts` — TypeScript interface untuk data trade
- [ ] **T-08** Buat `components/ui/Navbar.tsx` — navigasi Dashboard / Gallery / Add Trade
- [ ] **T-09** Setup global CSS: dark theme, font (Geist Mono untuk data, Inter untuk teks), warna aksen

### Phase 2 — Dashboard Page (`/`)
- [ ] **T-10** Fetch semua data dari tabel `trades` di Supabase
- [ ] **T-11** Hitung statistik: total trade, win rate (%), total PnL, rata-rata RR
- [ ] **T-12** Buat `StatCard.tsx` — komponen kartu statistik (angka besar + label kecil)
- [ ] **T-13** Tampilkan 4 stat cards: Total Trade, Win Rate, Total PnL, Avg RR
- [ ] **T-14** Buat `WinRateChart.tsx` — donut/pie chart Win vs Loss vs Breakeven (Recharts)
- [ ] **T-15** Buat `PnLChart.tsx` — line/area chart PnL kumulatif per waktu (Recharts)
- [ ] **T-16** Buat `TechniqueBarChart.tsx` — bar chart teknikal analisis paling sering dipakai
- [ ] **T-17** Susun layout Dashboard: stat cards (row atas) + 3 chart (grid bawah)
- [ ] **T-18** Tambahkan filter periode: All Time / Bulan Ini / 7 Hari

### Phase 3 — Gallery Page (`/gallery`)
- [ ] **T-19** Fetch semua trade yang punya `screenshot_url` dari Supabase
- [ ] **T-20** Buat grid gambar responsive (3 kolom desktop, 2 tablet, 1 mobile)
- [ ] **T-21** Buat `TradeCard.tsx` — kartu gambar dengan overlay: pair, result badge (WIN/LOSS), PnL
- [ ] **T-22** Buat `TradeModal.tsx` — modal detail saat gambar diklik, isi:
  - Screenshot trade (full size)
  - Pair + Direction + Date
  - PnL (hijau/merah) + RR
  - Technical Analysis (badge tags)
  - Reason/Alasan (paragraf)
  - Notes (jika ada)
- [ ] **T-23** Filter gallery: All / WIN / LOSS / by Pair / by Teknikal
- [ ] **T-24** Animasi modal: fade + scale-up saat buka, klik overlay untuk tutup

### Phase 4 — Add Trade Page (`/add-trade`)
- [ ] **T-25** Buat form dengan field:
  - Trade Date (date picker)
  - Pair (text input)
  - Direction (toggle LONG/SHORT)
  - Entry / Exit / SL / TP (number inputs)
  - PnL (auto-hitung atau manual)
  - RR (auto-hitung dari SL/TP/Entry)
  - Result (radio: WIN/LOSS/BREAKEVEN)
  - Technical Analysis (multi-select checkbox/tag input): RSI, MACD, EMA, SMA, Bollinger Bands, Support/Resistance, Trendline, Fibonacci, Volume, Price Action, Divergence, dll.
  - Reason (textarea)
  - Screenshot Upload (file input → Supabase Storage)
  - Notes (textarea, opsional)
- [ ] **T-26** Auto-kalkulasi RR dari Entry, SL, TP saat field berubah
- [ ] **T-27** Upload gambar ke Supabase Storage, simpan URL ke tabel
- [ ] **T-28** Submit form → insert ke tabel `trades` → redirect ke Gallery
- [ ] **T-29** Validasi form: required fields, format angka, file size max 5MB
- [ ] **T-30** Toast notifikasi sukses/gagal setelah submit

### Phase 5 — Polish & Detail
- [ ] **T-31** Loading skeleton untuk semua section yang fetch data
- [ ] **T-32** Empty state: tampilkan pesan + tombol "Add First Trade" jika data kosong
- [ ] **T-33** Responsif mobile untuk semua halaman
- [ ] **T-34** Warna PnL konsisten: hijau `#22c55e` untuk profit, merah `#ef4444` untuk loss
- [ ] **T-35** Error boundary dan handling error Supabase
- [ ] **T-36** (Opsional) Edit/Delete trade dari modal di Gallery
- [ ] **T-37** (Opsional) Export data ke CSV

---

## 🎨 Design Token

```css
/* Palette */
--bg-base: #0a0a0a;       /* Background utama */
--bg-surface: #111111;    /* Card/panel */
--bg-border: #1f1f1f;     /* Garis border */
--text-primary: #f5f5f5;  /* Teks utama */
--text-muted: #6b7280;    /* Label/secondary */
--accent-win: #22c55e;    /* Hijau — WIN / Profit */
--accent-loss: #ef4444;   /* Merah — LOSS */
--accent-neutral: #3b82f6; /* Biru — netral/aksen UI */

/* Typography */
--font-display: 'Geist Mono', monospace;  /* Angka & data */
--font-body: 'Inter', sans-serif;         /* Teks umum */
```

---

## 🚀 Execution Prompt

Copy prompt berikut ke Claude Code atau AI assistant untuk langsung eksekusi:

---

```
Kamu adalah senior full-stack developer. Buat website backtesting journal trading menggunakan Next.js 14 (App Router), TypeScript, Tailwind CSS, dan Supabase.

## Instruksi Umum
- Gunakan dark theme minimalist dengan palette: bg #0a0a0a, surface #111111, border #1f1f1f
- Font: Geist Mono untuk angka/data, Inter untuk teks
- Warna PnL: hijau #22c55e (profit/WIN), merah #ef4444 (loss/LOSS), biru #3b82f6 (aksen UI)
- Supabase client di lib/supabase.ts, gunakan env vars NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

## Database
Tabel `trades` di Supabase sudah ada dengan kolom:
id (uuid), created_at, trade_date (date), pair (text), direction (text: LONG/SHORT),
entry_price (numeric), exit_price (numeric), stop_loss (numeric), take_profit (numeric),
pnl (numeric), rr (numeric), result (text: WIN/LOSS/BREAKEVEN),
technical_analysis (text[]), reason (text), screenshot_url (text), notes (text)

Supabase Storage bucket: `trade-screenshots` (public)

## Yang harus dibuat:

### 1. Layout & Navbar (components/ui/Navbar.tsx)
Navbar sticky top, logo "TradeLog" di kiri (font mono), navigasi: Dashboard / Gallery / Add Trade

### 2. Dashboard Page (app/page.tsx)
- Fetch semua trades dari Supabase
- Tampilkan 4 StatCard: Total Trade, Win Rate (%), Total PnL (dengan warna), Avg RR
- Chart 1: Donut chart Win/Loss/Breakeven menggunakan Recharts
- Chart 2: Area chart PnL kumulatif per tanggal menggunakan Recharts
- Chart 3: Bar chart horizontal — teknikal analisis paling sering dipakai (hitung frekuensi dari array technical_analysis)
- Filter: All Time / Bulan Ini / 7 Hari (state lokal, filter data sebelum kalkulasi)

### 3. Gallery Page (app/gallery/page.tsx)
- Grid 3 kolom (responsive) semua trades yang punya screenshot_url
- Setiap kartu: gambar screenshot, overlay badge WIN/LOSS, pair name, PnL
- Klik kartu → buka TradeModal
- TradeModal: screenshot besar, semua detail trade (pair, direction, date, pnl, rr, technical_analysis sebagai badge tags, reason, notes)
- Filter atas: All / WIN / LOSS

### 4. Add Trade Page (app/add-trade/page.tsx)
Form dengan semua field trade. Fitur:
- Toggle LONG/SHORT untuk direction
- Auto-kalkulasi RR saat entry/sl/tp berubah: RR = (TP - Entry) / (Entry - SL) untuk LONG
- Multi-select untuk technical_analysis: tampilkan sebagai clickable tag chips (RSI, MACD, EMA, SMA, Bollinger Bands, Support/Resistance, Trendline, Fibonacci, Volume, Price Action)
- Upload screenshot ke Supabase Storage bucket 'trade-screenshots', simpan public URL
- Submit → insert ke tabel trades → redirect /gallery
- Loading state saat submit, toast sukses/error

Buat semua file sekaligus, mulai dari lib/supabase.ts, types/trade.ts, komponen UI, lalu halaman-halaman. Pastikan TypeScript strict, tidak ada `any`. Gunakan server components untuk fetch data di dashboard dan gallery.
```

---

## 📦 Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs recharts lucide-react date-fns clsx tailwind-merge
```

---

## ⚙️ Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

*Total estimasi task: 37 item | Estimasi waktu: 8–12 jam development*