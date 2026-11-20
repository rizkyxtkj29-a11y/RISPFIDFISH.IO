import { PlayerFish } from '../../types/game';
import { SPECIES_MAP } from '../../data/fishSpecies';
import { storage } from '../../services/storageService';
import { AssetGenerator } from '../../utils/assetGenerator';
import { formatCoins, formatSecondsToTime } from '../../utils/formatters';
import { Toast } from '../Toast';

export class FishDetailModal {
  private overlay: HTMLElement;
  private currentFish: PlayerFish | null = null;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window" style="max-width: 580px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 22px;">🐠</span>
            <h2>Informasi & Perawatan Ikan</h2>
          </div>
          <button class="modal-close-btn" id="fish-detail-close">✕</button>
        </div>
        <div class="modal-body" id="fish-detail-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#fish-detail-close');
    closeBtn?.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  public open(fish: PlayerFish): void {
    this.currentFish = fish;
    this.render();
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay.classList.remove('open');
  }

  private render(): void {
    const body = this.overlay.querySelector('#fish-detail-body');
    if (!body || !this.currentFish) return;

    const fish = this.currentFish;
    const sp = SPECIES_MAP.get(fish.speciesId);
    if (!sp) return;

    const imgUrl = AssetGenerator.generateFishDataUrl(sp, 260, 160);
    const isAdult = fish.stage === 'adult';
    const remainingSeconds = Math.max(0, Math.ceil(sp.growthTimeSeconds - fish.ageSeconds));
    const stageLabel = isAdult 
      ? 'Dewasa Sempurna (Siap Jual)' 
      : fish.stage === 'medium' 
        ? `Fase Remaja (⏳ Sisa ${formatSecondsToTime(remainingSeconds)})` 
        : `Anakan / Bibit (⏳ Sisa ${formatSecondsToTime(remainingSeconds)})`;

    body.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center;">
        <div class="card-img-preview" style="width: 190px; height: 130px; margin: 0; background: rgba(0,0,0,0.25);">
          <img src="${imgUrl}" alt="${fish.nickname}" />
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="fish-rename-input" value="${fish.nickname}" 
              style="padding: 4px 8px; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: #FFF; font-weight: 800; font-size: 15px; width: 150px;" />
            <button id="btn-save-nickname" style="padding: 4px 8px; background: var(--color-aqua-green); color: #fff; border-radius: 6px; font-size: 11px; font-weight: 700;">Simpan</button>
          </div>
          <div style="font-size: 12px; font-style: italic; color: var(--color-text-secondary);">${sp.name} (${sp.scientificName})</div>
          <div style="display: flex; gap: 6px; margin-top: 2px;">
            <span class="badge-rarity ${sp.rarity}">${sp.rarity}</span>
            <span class="badge-origin ${sp.originType}">${sp.originType.toUpperCase()}</span>
            ${isAdult ? '<span class="badge-rarity epic" style="background: rgba(128, 237, 153, 0.2); color: #80ED99; border: 1px solid #80ED99;">💰 SIAP JUAL</span>' : `<span class="badge-rarity common" style="background: rgba(255, 209, 102, 0.15); color: #FFD166; border: 1px solid #FFD166;">⏳ ${formatSecondsToTime(remainingSeconds)}</span>`}
          </div>
        </div>
      </div>

      <div class="detail-specs-grid" style="margin-top: 10px;">
        <div class="spec-box">
          <span class="spec-label">Fase Tumbuh</span>
          <span class="spec-val" style="color: ${isAdult ? '#80ED99' : '#FFD166'};">${stageLabel}</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Panjang Tubuh</span>
          <span class="spec-val">${fish.currentSizeCm} cm (Maks ${sp.maxSizeCm} cm)</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Usia Pemeliharaan</span>
          <span class="spec-val">${formatSecondsToTime(fish.ageSeconds)}</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Nilai Jual Saat Ini</span>
          <span class="spec-val" style="color: var(--color-gold-coin); display: flex; align-items: center; gap: 5px;">
            <span class="coin-icon-gold"></span>
            ${formatCoins(fish.sellPrice)}
          </span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px; background: rgba(255,255,255,0.03); padding: 14px; border-radius: var(--radius-sm);">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="font-weight: 600;">Tingkat Kenyang</span>
            <span style="color: #FFD166; font-weight: 700;">${Math.round(fish.hunger)}%</span>
          </div>
          <div style="height: 7px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
            <div style="width: ${fish.hunger}%; height: 100%; background: #FFD166;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="font-weight: 600;">Tingkat Kesehatan</span>
            <span style="color: #52B788; font-weight: 700;">${Math.round(fish.health)}%</span>
          </div>
          <div style="height: 7px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
            <div style="width: ${fish.health}%; height: 100%; background: #52B788;"></div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px;">
        <button class="btn-buy" id="btn-feed-this-fish" style="padding: 10px 18px;">
          🍲 Beri Makan Ikan Ini
        </button>
        <button class="btn-sell" id="btn-sell-this-fish" style="padding: 10px 18px; ${isAdult ? '' : 'opacity: 0.6; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);'}">
          ${isAdult ? `💰 Jual Ikan (${formatCoins(fish.sellPrice)})` : `⏳ Belum Dewasa (${formatSecondsToTime(remainingSeconds)})`}
        </button>
      </div>
    `;

    // Save rename
    body.querySelector('#btn-save-nickname')?.addEventListener('click', () => {
      const input = body.querySelector('#fish-rename-input') as HTMLInputElement;
      if (input && input.value.trim()) {
        fish.nickname = input.value.trim();
        Toast.show(`Nama diubah menjadi "${fish.nickname}"`, 'success');
        this.render();
      }
    });

    // Feed
    body.querySelector('#btn-feed-this-fish')?.addEventListener('click', () => {
      const res = storage.feedAquarium();
      if (res.success) {
        Toast.show(res.message, 'success');
        this.render();
      }
    });

    // Sell
    body.querySelector('#btn-sell-this-fish')?.addEventListener('click', async () => {
      if (fish.stage !== 'adult') {
        const remaining = Math.max(0, Math.ceil(sp.growthTimeSeconds - fish.ageSeconds));
        Toast.show(`Ikan belum dewasa! Tunggu timer selesai (${formatSecondsToTime(remaining)}) agar siap dijual.`, 'info');
        return;
      }
      if (confirm(`Yakin ingin menjual ${fish.nickname} seharga ${formatCoins(fish.sellPrice)}?`)) {
        const res = await storage.sellFish(fish.id);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.close();
        } else {
          Toast.show(res.message, 'error');
        }
      }
    });
  }
}
