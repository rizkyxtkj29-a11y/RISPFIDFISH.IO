# ATURAN WAJIB ANTIGRAVITY & AI ASSISTANT: RISPFID FISH

> 🛑 **ATURAN UTAMA (MANDATORY OPERATIONAL RULE - PRIORITAS TERTINGGI)**
> Saat menangani permintaan pengguna terkait perbaikan bug (*troubleshooting/debugging*), penyesuaian visual, maupun penambahan fitur baru pada project ini:
> 
> 1. **DILARANG membaca seluruh kodingan dari awal atau melakukan pencarian file secara buta.**
> 2. **WAJIB membaca dan merujuk `PROJECT_MAP.md` (atau tabel ringkasan di bawah ini) terlebih dahulu.**
> 3. **Langsung targetkan hanya 1 atau 2 file yang relevan** sesuai dengan masalah yang dihadapi.
> 4. Setelah selesai mengedit file target, **selalu jalankan verifikasi `npm run build`** untuk memastikan tidak ada kesalahan kompilasi TypeScript (*Zero Error*).

---

## ⚡ MATRIKS CEPAT FILE TARGET (QUICK TARGET MATRIX)

| Kategori / Masalah | Apa yang Ingin Diperbaiki atau Ditambahkan? | File yang Harus Dibuka |
| :--- | :--- | :--- |
| 🐟 **Visual & Gambar Ikan** | Bentuk tubuh ikan, sisik, corak loreng harimau, mata realistis, sirip, warna spesies | `src/utils/assetGenerator.ts` |
| 📐 **Skala / Ukuran Ikan** | Ukuran ikan di tangki (ikan mini vs predator besar), rasio pertumbuhan | `src/game/entities/FishSprite.ts` |
| ⏳ **Timer & Status Ikan** | Timer hitung mundur dewasa (`⏳ MM:SS`), badge status lapar / siap jual | `src/game/entities/FishSprite.ts` |
| 🏊‍♂️ **Gerak & Renang Ikan** | AI renang ikan, batas area renang, kecepatan, mengejar makanan | `src/game/entities/FishSprite.ts` |
| 🍲 **Pakan Ikan** | Menjatuhkan pakan saat klik air, serpihan pelet melayang turun ke pasir | `src/game/entities/FoodParticle.ts`<br>`src/game/scenes/AquariumScene.ts` |
| 💎 **Koin & Ekonomi** | Saldo koin, transaksi, rumus harga jual ikan dewasa (2.2x payout) | `src/services/storageService.ts` |
| 🛑 **Kapasitas Maksimal Ikan** | Batas maksimal ikan di akuarium (**Strict 20 Ekor**) | `src/services/storageService.ts` |
| 🌿 **Batas & Posisi Aquascape** | Batas maksimal 6 dekorasi, susunan aquascape gaya Takashi Amano | `src/game/entities/AquariumBackground.ts`<br>`src/services/storageService.ts` |
| 🪨 **Visual Upgrade Batu Kali** | Batu sungai 3D alami yang bertambah di pasir saat upgrade kapasitas | `src/game/entities/AquariumBackground.ts` (`renderRiverStones`) |
| 🫧 **Visual Aerator & Gelembung** | Batu diffuser fisik (1-5 titik), aliran kolom gelembung, partikel mikro | `src/game/entities/AquariumBackground.ts`<br>`src/game/entities/BubbleSystem.ts` |
| 🧼 **Visual Filter & Kualitas Air** | Unit filter fisik (bio-sponge/canister di kiri), riak air, warna keruh/jernih | `src/game/entities/AquariumBackground.ts`<br>`src/services/storageService.ts` |
| 🛒 **Toko Akuatik (Shop)** | Modal Toko (Tab Ikan, Pakan, Aquascape, Fasilitas Akuarium) | `src/components/Modals/ShopModal.ts` |
| ⚙️ **Modal Fasilitas Tangki** | Modal fasilitas dari tombol Upgrade HUD (Kuras, Filter, Aerator, Kapasitas) | `src/components/Modals/AquariumUpgradeModal.ts` |
| 🎒 **Inventaris & Tas Pemain** | Pasang/tarik dekorasi ke tangki, stok pakan, daftar kepemilikan ikan | `src/components/Modals/InventoryModal.ts` |
| 🔍 **Detail & Jual Ikan** | Popup saat ikan di-klik di tangki, ganti nama, tombol jual terkunci | `src/components/Modals/FishDetailModal.ts` |
| 📚 **Koleksi & Ensiklopedia** | Ensiklopedia 14 ikan air tawar asli & endemik Indonesia, habitat, IUCN | `src/components/Modals/CollectionModal.ts`<br>`src/data/fishSpecies.ts` |
| 🏆 **Misi & Hadiah** | Misi harian, klaim koin/XP, level up | `src/components/Modals/MissionModal.ts`<br>`src/data/missions.ts` |
| 👤 **Profil & Supabase Sync** | Data pemain, statistik akun, sinkronisasi Supabase online | `src/components/Modals/ProfileModal.ts`<br>`src/services/supabase.ts` |
| 🎵 **Audio & Musik** | BGM simulasi santai (104 BPM marimba + bass + air), SFX koin, pakan, gelembung | `src/services/soundService.ts` |
| 🎛️ **HUD & Navigasi** | Tampilan bar atas (koin, level, air) dan dock navigasi bawah | `src/components/HUD.ts`<br>`src/styles/hud.css` |

---

## 📌 KONSTANTA ATURAN GAME YANG TIDAK BOLEH DILANGGAR
1. **Maksimal 20 Ekor Ikan**: Jangan mengubah `MAX_CAPACITY` di atas 20 tanpa instruksi eksplisit dari user.
2. **Maksimal 6 Elemen Aquascape**: Menjaga estetika tangki agar tidak padat (*overcrowded*).
3. **Ikan Hanya Bisa Dijual Saat Dewasa**: Mencegah eksploitasi ekonomi dan melatih pemain merawat ikan.
4. **Resolusi Tekstur Ikan 320x180 px**: Menjamin tampilan tajam di layar Retina / High-DPI.
