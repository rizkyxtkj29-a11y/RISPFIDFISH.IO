# 🗺️ PETA ARSITEKTUR & PANDUAN CEPAT PROJECT: RISPFID FISH

> **PANDUAN OPERASIONAL CEPAT (QUICK ACCESS GUIDE)**
> Dokumen ini dirancang agar developer dan AI Assistant (Antigravity/Gemini) **tidak perlu membaca seluruh baris kodingan** saat melakukan perbaikan (*debugging*) maupun penambahan fitur baru (*feature update*).
> Cukup cari topik di **Matriks Solusi Cepat** di bawah ini untuk langsung menuju file dan fungsi yang tepat.

---

## ⚡ 1. MATRIKS SOLUSI CEPAT (FEATURE-TO-FILE MATRIX)

Gunakan tabel ini sebagai kompas utama: **Cari apa yang ingin diubah ➔ Buka file terkait**.

| Kategori / Topik | Hal yang Ingin Diubah / Diperbaiki | File Target Utama | Fungsi / Properti Penting |
| :--- | :--- | :--- | :--- |
| 🐟 **Visual & Bentuk Ikan** | Anatomi, bentuk tubuh, sisik, corak loreng, mata realistis, sirip, warna spesies | `src/utils/assetGenerator.ts` | `drawFish()`, `drawRealisticEye()`, `drawArowana()`, `drawTigerfish()`, dll. |
| 📐 **Skala Ukuran Ikan** | Ukuran relatif ikan di tangki (ikan kecil vs predator besar), rasio pertumbuhan | `src/game/entities/FishSprite.ts` | `updateScale()`, `speciesFactor` |
| ⏳ **Timer & Status Ikan** | Timer hitung mundur dewasa (`⏳ MM:SS`), status lapar/siap jual, badge ikan | `src/game/entities/FishSprite.ts` | `timerBadgeText`, `statusIcon`, `update()` |
| 🏊‍♂️ **Perilaku Renang Ikan** | Kecepatan renang, AI gerak ikan, mengejar pakan, batas gerak dalam akuarium | `src/game/entities/FishSprite.ts` | `pickNewTarget()`, `update()`, `setBounds()` |
| 🍲 **Pemberian Pakan** | Mengklik tangki untuk menjatuhkan pakan, partikel pakan melayang dan dimakan | `src/game/entities/FoodParticle.ts`<br>`src/game/scenes/AquariumScene.ts` | `dropFood()`, `FoodParticle.update()` |
| 💎 **Ekonomi & Saldo Koin** | Tambah/kurang koin, harga beli/jual ikan, aturan jual hanya saat dewasa (2.2x) | `src/services/storageService.ts` | `buyFish()`, `sellFish()`, `recordTransaction()` |
| 🛑 **Batas Kapasitas Tangki** | Batas maksimal ikan di akuarium (Strict **20 Ekor**) | `src/services/storageService.ts` | `StorageService.MAX_CAPACITY = 20` |
| 🌿 **Batas & Tata Aquascape** | Batas 6 dekorasi, layout Takashi Amano (sayap kiri/kanan, hardscape, laguna tengah) | `src/game/entities/AquariumBackground.ts`<br>`src/services/storageService.ts` | `rebuildDecorations()`, `MAX_DECORATIONS = 6` |
| 🪨 **Visual Upgrade Batu Kali** | Munculnya bebatuan sungai alami 3D saat kapasitas akuarium di-upgrade | `src/game/entities/AquariumBackground.ts` | `renderRiverStones()` |
| 🫧 **Visual Aerator & Gelembung** | Posisi batu diffuser fisik (1-5 titik), aliran gelembung udara, partikel mikro | `src/game/entities/AquariumBackground.ts`<br>`src/game/entities/BubbleSystem.ts` | `rebuildHardware()`, `spawnBubble()`, `diffuserPositions` |
| 🧼 **Visual Filter & Kualitas Air** | Hardware filter fisik (bio-sponge/canister), riak air, warna air keruh vs jernih | `src/game/entities/AquariumBackground.ts`<br>`src/services/storageService.ts` | `rebuildHardware()`, `cleanAquarium()`, `qRatio` |
| 🛒 **Toko & Pasar Akuatik** | Modal Toko (Tab Ikan, Pakan, Aquascape, Fasilitas Akuarium) | `src/components/Modals/ShopModal.ts` | `renderFishTab()`, `renderAquariumFacilities()`, dll. |
| ⚙️ **Modal Fasilitas Akuarium** | Modal upgrade tangki dari tombol HUD (Kuras, Filter, Aerator, Kapasitas) | `src/components/Modals/AquariumUpgradeModal.ts` | `render()`, event listener upgrade |
| 🎒 **Inventaris & Tas Pemain** | Pasang/tarik tanaman dekorasi, stok pakan, daftar ikan yang dimiliki | `src/components/Modals/InventoryModal.ts` | `renderFishTab()`, `renderItemsTab()`, pasang dekorasi |
| 🔍 **Detail & Jual Ikan** | Popup saat ikan di-klik di tangki, tombol ganti nama, tombol jual ikan dewasa | `src/components/Modals/FishDetailModal.ts` | `render()`, tombol jual terkunci jika belum dewasa |
| 📚 **Koleksi & Ensiklopedia** | Ensiklopedia 14 ikan air tawar Indonesia, asal habitat, status konservasi | `src/components/Modals/CollectionModal.ts`<br>`src/data/fishSpecies.ts` | `FISH_SPECIES_LIST`, `CollectionModal.render()` |
| 🏆 **Misi & Prestasi** | Misi harian, klaim hadiah koin/XP, level up | `src/components/Modals/MissionModal.ts`<br>`src/data/missions.ts` | `DAILY_MISSIONS_DEF`, `claimMissionReward()` |
| 👤 **Profil & Akun Pemain** | Statistik akun, ganti nama pemain, integrasi login Supabase | `src/components/Modals/ProfileModal.ts` | `render()`, login/register |
| 🎵 **Musik & Audio Sound** | BGM simulasi santai (104 BPM marimba + bass + air), SFX koin, pakan, gelembung | `src/services/soundService.ts` | `startBgm()`, `playCoin()`, `playFeed()`, `toggleMute()` |
| 🎛️ **HUD & Navigasi Layar** | Bar atas (Koin, Level, Kualitas Air) & Dock bawah (Shop, Inv, Misi, dll.) | `src/components/HUD.ts`<br>`src/styles/hud.css` | `update()`, setup navigasi dock |
| 💾 **Database & Sinkronisasi** | Dual-mode: LocalStorage (Offline) + Supabase PostgreSQL (Online) | `src/services/storageService.ts`<br>`src/services/supabase.ts` | `loadFromLocalStorage()`, `saveToSupabase()` |

---

## 🏗️ 2. ARSITEKTUR & ALIRAN DATA (DATA FLOW)

```
[ Pemain / User Input ]
       │
       ├──► Klik Air Tangki ──────► AquariumScene (Spawn FoodParticle)
       ├──► Klik Ikan di Tangki ──► FishDetailModal (Inspect / Rename / Sell)
       └──► Navigasi HUD / Dock ──► Modals (Shop, Inventory, Collection, Upgrade, Profile)
                                            │
                                            ▼
                                 [ StorageService ] (Single Source of Truth)
                                            │
                         ┌──────────────────┴──────────────────┐
                         ▼                                     ▼
                [ LocalStorage ]                     [ Supabase Database ]
              (Fallback / Offline)                    (Online / PostgreSQL)
                         │
                         ▼ (notify subscriber)
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
 [ HUD Component ]               [ AquariumScene (Phaser 3) ]
 (Update Angka Koin,             ├── AquariumBackground (Air, Pasir, Batu Kali, Filter, Aerator, Aquascape)
  Level, Kualitas Air)           ├── BubbleSystem (Gelembung naik sesuai aeratorLevel)
                                 └── FishSprite (20 Ikan: gerak, scale, timer dewasa)
```

---

## 📂 3. DAFTAR DIREKTORI & PERAN FILE LENGKAP

### A. Core Entry & Layout (`src/`)
* **`src/main.ts`**: Entry point utama. Menginisialisasi Phaser Game instance, HUD DOM layer, dan BGM audio listener (interaksi pertama klik pemain mengaktifkan Web Audio).
* **`src/styles/main.css`**: Desain visual global, warna palet (*Deep Ocean, Ocean Blue, Aqua Green, Sand, Gold Coin*), dan konfigurasi canvas responsive landscape.
* **`src/styles/hud.css`**: Styling bar status atas dan dock tombol bawah.
* **`src/styles/modals.css`**: Styling popup modal, kartu item, grid responsif, dan bilah scrollbar khusus.

### B. Game Engine & Visual (`src/game/`)
* **`src/game/config/phaserConfig.ts`**: Konfigurasi resolusi Phaser 3, auto-resize responsif, mode rendering canvas WebGL/Canvas2D.
* **`src/game/scenes/AquariumScene.ts`**: Scene utama tempat simulasi berjalan.
  * Menangani update loop per frame (`update(time, delta)`).
  * Tick interval game state setiap **1.0 detik** untuk penurunan timer ikan real-time yang presisi.
  * Mendengarkan event perubahan data dari `storage.subscribe()`.
* **`src/game/entities/AquariumBackground.ts`**:
  * Menggambar gradasi warna air berdasarkan `waterQuality` dan `filterLevel`.
  * Menggambar kontur pasir pantai dan kerikil.
  * **`renderRiverStones()`**: Menggambar formasi batu kali 3D alami yang **otomatis bertambah** setiap kapasitas tangki dinaikkan (8 ➔ 11 ➔ 14 ➔ 17 ➔ 20 ekor).
  * **`rebuildHardware()`**: Menampilkan perangkat fisik di tangki (Batu diffuser aerator 1-5 titik, selang silikon, filter bio-sponge/canister di kiri, lampu LED atas).
  * **`rebuildDecorations()`**: Menata 6 slot elemen aquascape gaya Takashi Amano dengan laguna tengah terbuka 40%-60%.
* **`src/game/entities/BubbleSystem.ts`**:
  * Mengatur kolom gelembung aerator yang sinkron dengan posisi fisik batu diffuser di dasar pasir.
  * Mendukung gelembung standar, gelembung apung besar, dan kabut mikro-oksigen di level 5.
* **`src/game/entities/FishSprite.ts`**:
  * Sprite ikan container (tubuh, nama, status icon, dan timer hitung mundur dewasa).
  * Menghitung sisa waktu hingga dewasa dan menampilkan `💰 SIAP JUAL` berwarna hijau zamrud saat dewasa.
  * Logika renang natural, fluktuasi waggle ekor, dan deteksi serpihan pakan terdekat.
* **`src/game/entities/FoodParticle.ts`**:
  * Serpihan pelet pakan yang melayang turun ke dasar pasir dengan goyangan air natural.

### C. UI & Modals (`src/components/`)
* **`src/components/HUD.ts`**: Antarmuka kontrol pemain (Koin, Level, Kualitas Air, Tombol Musik, dan Dock Navigasi).
* **`src/components/Toast.ts`**: Notifikasi melayang (Success, Error, Info).
* **`src/components/Modals/ShopModal.ts`**:
  * Tab 1: Ikan Nusantara (14 spesies dengan ilustrasi visual HD).
  * Tab 2: Pakan Ikan (Pelet, Cacing Darah, Udang Renik, Spirulina).
  * Tab 3: Aquascape & Dekorasi (Vallisneria, Anubias, Kayu Rasamala, Batu Karst, Arca Sriwijaya — Maks. 6 elemen).
  * Tab 4: Fasilitas Akuarium (Kuras Air, Filter Bio-Sponge, Aerator Silent, Ekspansi +3, Ekspansi Mega +6 lengkap dengan nomor stat, indikator segmen `[ ■ ■ ■ □ □ ]`, dan catatan efek nyata di tangki).
* **`src/components/Modals/InventoryModal.ts`**:
  * Tab Ikan: Daftar seluruh ikan milik pemain beserta status umur, timer dewasa, dan tombol jual.
  * Tab Barang & Aquascape: Stok pakan dan opsi pasang/tarik dekorasi ke dalam tangki akuarium.
* **`src/components/Modals/FishDetailModal.ts`**:
  * Kartu detail ikan yang diklik di akuarium: usia, tingkat lapar, kesehatan, timer siap jual, dan tombol jual ikan dewasa.
* **`src/components/Modals/AquariumUpgradeModal.ts`**:
  * Modal khusus fasilitas pemeliharaan yang diakses langsung dari tombol "Upgrade" pada dock HUD.
* **`src/components/Modals/CollectionModal.ts`**:
  * Ensiklopedia visual 14 ikan air tawar asli & endemik Indonesia.
* **`src/components/Modals/MissionModal.ts`**:
  * Daftar misi harian (Beri makan, kuras air, beli ikan) dan pencapaian jangka panjang.
* **`src/components/Modals/ProfileModal.ts`**:
  * Pengaturan profil, login/register Supabase, dan statistik permainan.

### D. Data & Model (`src/data/` & `src/types/`)
* **`src/data/fishSpecies.ts`**: Database 14 spesies ikan air tawar Nusantara (Arwana Super Red, Arwana Jardini, Channa Serandang, Botia Badut, Buntal Palembang, Rainbow Boesemani, Rainbow Sentani, Rainbow Kurumoi, Rainbow Celebes, Cupang Albi, Cupang Gabus, Ikan Sumatra, Ikan Elang Tigerfish, Medaka Sulawesi).
* **`src/data/items.ts`**: Definisi item toko pakan, dekorasi, dan upgrade.
* **`src/data/missions.ts`**: Definisi misi harian dan reward.
* **`src/types/game.ts`**: Definisi tipe TypeScript untuk seluruh entitas game.
* **`src/types/database.ts`**: Skema tabel Supabase PostgreSQL.

### E. Services & Utilities (`src/services/` & `src/utils/`)
* **`src/services/storageService.ts`**:
  * Pengatur logika bisnis game (*Economy, Inventory, Growth, Health, Limits*).
  * Konstanta penting: `MAX_CAPACITY = 20`, `MAX_DECORATIONS = 6`.
  * Mekanisme sinkronisasi data online Supabase & offline fallback.
* **`src/services/soundService.ts`**:
  * Sintesis audio prosedural Web Audio API murni (tanpa file mp3/wav eksternal).
  * 16-bar soundtrack ceria & menenangkan (104 BPM, upright bass, marimba, warm rhodes, dan desau air mengalir).
  * SFX koin emas, taburan pakan, gelembung aerator, dan pembersihan air.
* **`src/utils/assetGenerator.ts`**:
  * Mesin gambar anatomi biologis ikan realistis beresolusi tinggi (320x180 px).
  * Menggunakan sistem `ctx.clip()` untuk mencegah corak loreng/sisik menembus keluar siluet tubuh.
  * Menggambar tekstur prosedural untuk tanaman, batu kali, kayu apung, dan perangkat hardware akuarium.
* **`src/utils/formatters.ts`**:
  * Pemformat angka ribuan koin dan konversi detik ke format `MM:SS`.

---

## ⚙️ 4. ATURAN KERJA & KONSTANTA PENTING (BUSINESS LOGIC RULES)

1. **Kapasitas Maksimal Ikan = 20 Ekor**
   * Lokasi: `StorageService.MAX_CAPACITY = 20` di `src/services/storageService.ts`.
   * Pembelian ikan baru atau ekspansi tangki tidak boleh melebihi 20 ekor agar akuarium tidak padat dan pemain tidak pusing.
2. **Kapasitas Maksimal Dekorasi Aquascape = 6 Elemen**
   * Lokasi: `StorageService.MAX_DECORATIONS = 6` di `src/services/storageService.ts`.
   * Menjaga estetika gaya Nature Aquascape Takashi Amano dengan area renang tengah tetap lapang.
3. **Penjualan Ikan Hanya Saat Dewasa**
   * Ikan kecil (*small*) dan remaja (*medium*) dilarang dijual agar pemain merawatnya hingga dewasa.
   * Saat dewasa (*adult*), ikan bernilai jual **2.2x lipat** dari harga beli dasar.
4. **Kejernihan Air & Durabilitas Filter**
   * Kualitas air berkurang perlahan seiring waktu dan pemberian pakan.
   * Filter Bio-Sponge memperlambat laju kekeruhan hingga `filterLevel * 15%`.
   * Kuras air mengembalikan kualitas air menjadi 100% prima.

---

## 🚀 5. CARA VERIFIKASI SETELAH PERBAIKAN / UPDATE
Setiap kali selesai melakukan modifikasi pada kode:
1. Jalankan `npm run build` di terminal untuk memastikan tidak ada kesalahan kompilasi TypeScript (*Zero Error*).
2. Periksa server development di `http://localhost:3000` (tetap aktif di background).
