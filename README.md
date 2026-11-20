# 🐟 RISPFID FISH — Aquarium Simulator & Nusantara Fish Collection

**RISPFID FISH** adalah game simulasi memelihara ikan akuarium 2D berbasis web dengan fokus koleksi ikan air tawar khas Nusantara (endemik dan asli Indonesia). Game dibangun menggunakan engine **Phaser 3**, **TypeScript**, **Vite**, dan terintegrasi dengan backend **Supabase** (PostgreSQL, Authentication, Row Level Security, dan Stored Procedures/RPC).

> 🗺️ **PANDUAN & PETA STRUKTUR KODINGAN**:
> Untuk mempermudah update dan perbaikan fitur tanpa harus membaca seluruh kodingan:
> - Rujuk **[PROJECT_MAP.md](PROJECT_MAP.md)** untuk melihat Matriks Solusi Cepat (*Feature-to-File Matrix*), alur data, dan relasi antar komponen.
> - Aturan otomatis Antigravity / AI Assistant telah diset di **[AGENTS.md](AGENTS.md)** & **[GEMINI.md](GEMINI.md)** agar AI selalu membaca mapping terlebih dahulu.

---

## 🌟 Fitur Utama

### 1. Visual Akuarium Hidup & Natural
- **Animasi Ikan**: Ikan berenang bebas dengan physics natural, orientasi adaptif, gerakan kibasan sirip & ekor (tail waggle), serta pembesaran dinamis dari anakan (*small*), remaja (*medium*), hingga dewasa sempurna (*adult*).
- **Interaksi Sentuh / Klik**: Klik di dalam air untuk menjatuhkan pakan ikan; klik langsung pada ikan untuk mengelus, melihat gelembung cinta (✨), serta membuka panel inspeksi detail.
- **Ekosistem Air**: Tanaman air (*Vallisneria*, *Anubias*) melambai perlahan, gelembung oksigen dari aerator meletup di permukaan, pencahayaan *caustics* air bergerak dinamis, dan dasar pasir sungai alami (*#E8D2A0*).
- **Kualitas Air Realistis**: Air dapat berangsur keruh jika pakan menumpuk atau filter belum di-upgrade; lakukan **Kuras Air** untuk memulihkan kejernihan 100%.

### 2. Ensiklopedia Ikan Air Tawar Nusantara (14 Spesies Akurat)
Game menyajikan informasi ilmiah, habitat asal, status keterancaman, dan fakta konservasi:
- **Common**: Ikan Sumatra (*Puntigrus tetrazona*), Medaka Sulawesi (*Oryzias woworae* - Endemik Pulau Muna).
- **Uncommon**: Botia Badut (*Chromobotia macracanthus*), Cupang Ikan Gabus (*Betta channoides* - Endemik Mahakam).
- **Rare**: Beseng-beseng (*Marosatherina ladigesi* - Endemik Karst Maros), Cupang Sebuku (*Betta albimarginata*), Buntal Palembang (*Pao palembangensis*), Toman Bunga (*Channa pleurophthalma*).
- **Epic**: Rainbow Boesemani (*Melanotaenia boesemani* - Endemik Ayamaru Papua), Rainbow Merah Sentani (*Glossolepis incisus*), Ikan Elang / Tigerfish (*Datnioides microlepis*).
- **Legendary**: Arwana Papua (*Scleropages jardinii*), Rainbow Kurumoi (*Melanotaenia parva / kurumoi* - Sangat Langka), Arwana Super Red Kalimantan (*Scleropages formosus* - Endemik Kapuas/Sentarum).

### 3. Sistem Ekonomi & Toko Lengkap
- **Pasar Akuatik (Shop)**:
  - *Fish Shop*: Mengadopsi bibit ikan Nusantara.
  - *Food Shop*: Pelet Harian, Cacing Sutra Tubifex, Artemia Salina Organik, Udang Krill Premium.
  - *Decoration Shop*: Tanaman air, kayu apung Rasamala, bebatuan karst Maros, dan arca purbakala Sriwijaya.
  - *Aquarium Facilities*: Upgrade Bio-Sponge Filter, Upgrade Aerator Turbo, dan Ekspansi Kapasitas Tank.
- **Inventaris & Penjualan**: Menjual ikan dewasa dengan kalkulasi dinamis berdasarkan tingkat kesehatan dan fase pertumbuhan.

### 4. Misi Harian & Pencapaian (Achievements)
- Misi harian diperbarui: Memberi makan ikan, adopsi ikan baru, menjaga kejernihan air, dan panen ternak.
- Achievement milestone: Buka spesies langka, capai kapasitas mega, dan kumpulkan koin bonus.

### 5. Dual-Mode Storage: Supabase Online & Mode Tamu (Offline Dev)
- **Supabase Online Mode**: Saat file `.env` diisi dengan kredensial Supabase, seluruh data pemain disimpan ke PostgreSQL dan setiap transaksi divalidasi di sisi server (RPC `buy_fish_transaction`, `sell_fish_transaction`) dengan Row Level Security (RLS).
- **Mode Tamu / Offline Dev**: Jika kredensial belum diisi, game otomatis berjalan penuh dengan *Local Ledger Engine* yang menerapkan aturan validasi saldo, kapasitas, dan audit transaksi yang identik.

---

## 🛠️ Teknologi yang Digunakan

- **Game Engine**: Phaser 3 (v3.88.2)
- **Language**: TypeScript (Strict Mode)
- **Bundler & Dev Server**: Vite (v8)
- **Backend**: Supabase (PostgreSQL, GoTrue Auth, Realtime)
- **Sound**: Web Audio API Procedural Synthesis (Bubble plops, feeding splash, coin chimes, soothing underwater ambiance)
- **UI FX**: Canvas Confetti & Glassmorphism Design System

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
- Node.js versi 18+ (disarankan Node.js v20 atau v24)
- npm versi 9+

### 2. Instalasi Dependency
Dependency telah terpasang di workspace ini. Bila Anda mengklon ke mesin baru:
```bash
npm install
```

### 3. Konfigurasi Supabase (Opsional)
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan:
```env
VITE_SUPABASE_URL=https://id-project-anda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```
Jalankan file SQL Migration pada **Supabase SQL Editor**:
```
supabase/migrations/20261120000000_init_rispfid_fish.sql
```
*(Catatan: Jika `.env` dibiarkan kosong, game tetap 100% dapat dimainkan dalam Mode Tamu).*

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 5. Membangun untuk Production (Build)
```bash
npm run build
```
Hasil build production yang siap dideploy berada di folder `dist/`.

Untuk menguji hasil build secara lokal:
```bash
npm run preview
```

---

## 📁 Struktur Folder Project

```
├── public/
│   ├── assets/
│   │   ├── fish/
│   │   ├── aquarium/
│   │   ├── decorations/
│   │   └── audio/
│   └── favicon.svg
├── src/
│   ├── game/
│   │   ├── config/          # Konfigurasi Phaser 3 (resizing, physics, renderer)
│   │   ├── entities/        # FishSprite, FoodParticle, BubbleSystem, AquariumBackground
│   │   ├── scenes/          # AquariumScene (main orchestrator)
│   │   └── systems/         # Swimming pathfinding, feeding & water tick
│   ├── components/
│   │   ├── HUD.ts           # Top status bar & bottom navigation dock
│   │   ├── Toast.ts         # Floating notifications
│   │   └── Modals/          # Shop, Inventory, Collection, Mission, FishDetail, Upgrade, Profile
│   ├── data/
│   │   ├── fishSpecies.ts   # Data 14 spesies ikan air tawar Nusantara
│   │   ├── items.ts         # Data pakan, dekorasi, & upgrade akuarium
│   │   └── missions.ts      # Misi harian & pencapaian prestasi
│   ├── services/
│   │   ├── supabase.ts      # Client Supabase & auto-detection
│   │   ├── storageService.ts# Dual-layer data repository & atomic transactions
│   │   └── soundService.ts  # Web Audio API procedural soundscape
│   ├── types/
│   │   ├── game.ts          # TypeScript interfaces untuk entitas game
│   │   └── database.ts      # Supabase PostgreSQL database schema types
│   ├── styles/
│   │   ├── main.css         # Variabel tema aquatic, typography & layout
│   │   ├── hud.css          # Top bar & dock styles
│   │   └── modals.css       # Glassmorphism modal & card grids
│   ├── utils/
│   │   ├── assetGenerator.ts# Procedural SVG/Canvas fish & texture generator
│   │   └── formatters.ts    # Format mata uang Koin, angka & durasi
│   ├── main.ts              # Entrypoint aplikasi
│   └── vite-env.d.ts
├── supabase/
│   └── migrations/
│       └── 20261120000000_init_rispfid_fish.sql # Schema lengkap, RLS, & RPCs
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎨 Palet Warna Identitas
- **Deep Ocean**: `#0B5367`
- **Ocean Blue**: `#16869A`
- **Aqua Green**: `#36A65C`
- **Sand**: `#E8D2A0`
- **Gold Coin**: `#FFD166`
- **Dark Panel**: `#123D50`

---
© 2026 RISPFID FISH — Dikembangkan dengan dedikasi untuk pelestarian fauna ikan air tawar Nusantara.
