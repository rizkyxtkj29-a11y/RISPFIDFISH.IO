import { FISH_SPECIES_LIST } from '../../data/fishSpecies';
import { FishSpecies } from '../../types/game';
import { storage } from '../../services/storageService';
import { AssetGenerator } from '../../utils/assetGenerator';

export class CollectionModal {
  private overlay: HTMLElement;
  private selectedSpecies: FishSpecies;

  constructor() {
    this.selectedSpecies = FISH_SPECIES_LIST[0];
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window" style="max-width: 900px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 22px;">📖</span>
            <h2>Ensiklopedia Ikan Air Tawar Nusantara</h2>
          </div>
          <button class="modal-close-btn" id="collection-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="encyclopedia-container">
            <div class="encyclopedia-list" id="encyclopedia-list"></div>
            <div class="encyclopedia-detail" id="encyclopedia-detail"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#collection-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  public open(): void {
    this.render();
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay.classList.remove('open');
  }

  private render(): void {
    const listEl = this.overlay.querySelector('#encyclopedia-list');
    const detailEl = this.overlay.querySelector('#encyclopedia-detail');
    if (!listEl || !detailEl) return;

    const discovered = storage.getDiscoveredSpecies();

    // 1. Render Left List
    listEl.innerHTML = FISH_SPECIES_LIST.map((sp) => {
      const isUnlocked = discovered.has(sp.id);
      const isSelected = sp.id === this.selectedSpecies.id;
      const thumbUrl = AssetGenerator.generateFishDataUrl(sp, 90, 60);

      return `
        <div class="encyclopedia-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}" data-species-id="${sp.id}">
          <img src="${thumbUrl}" class="encyclopedia-thumb" alt="${sp.name}" />
          <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <div style="font-size: 13px; font-weight: 700; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; color: #FFFFFF;">
              ${isUnlocked ? sp.name : '??? (Belum Ditemukan)'}
            </div>
            <div style="font-size: 10px; font-style: italic; color: var(--color-text-secondary);">
              ${isUnlocked ? sp.scientificName : 'Misteri Alam'}
            </div>
          </div>
          <span style="margin-left: auto; font-size: 14px;">${isUnlocked ? '✅' : '🔒'}</span>
        </div>
      `;
    }).join('');

    // Bind list clicks
    listEl.querySelectorAll('.encyclopedia-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.speciesId;
        const sp = FISH_SPECIES_LIST.find((s) => s.id === id);
        if (sp) {
          this.selectedSpecies = sp;
          this.render();
        }
      });
    });

    // 2. Render Right Detail
    const sp = this.selectedSpecies;
    const isUnlocked = discovered.has(sp.id);
    const heroImgUrl = AssetGenerator.generateFishDataUrl(sp, 320, 180);

    detailEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="font-size: 22px; font-weight: 800; color: #FFFFFF;">${isUnlocked ? sp.name : 'Spesies Misterius'}</h3>
          <p style="font-size: 14px; font-style: italic; color: var(--color-text-secondary); margin-top: 2px;">
            ${isUnlocked ? sp.scientificName : 'Taxon incertae sedis'}
          </p>
        </div>
        <div style="display: flex; gap: 6px;">
          <span class="badge-rarity ${sp.rarity}">${sp.rarity}</span>
          <span class="badge-origin ${sp.originType}">${sp.originType.toUpperCase()}</span>
        </div>
      </div>

      <div class="detail-hero-img" style="${!isUnlocked ? 'filter: brightness(0.2) contrast(1.5);' : ''}">
        <img src="${heroImgUrl}" alt="${sp.name}" />
      </div>

      <div style="font-size: 13px; line-height: 1.5; color: var(--color-text-primary);">
        ${isUnlocked ? sp.description : 'Spesies ini belum tercatat dalam koleksi akuarium Anda. Dapatkan di Pasar Akuatik atau rawat benih hingga dewasa untuk membuka ensiklopedia ini secara lengkap.'}
      </div>

      <div class="detail-specs-grid">
        <div class="spec-box">
          <span class="spec-label">📍 Asal Habitat</span>
          <span class="spec-val">${isUnlocked ? sp.originHabitat : 'Hutan Pedalaman Nusantara'}</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">📏 Ukuran Maksimal</span>
          <span class="spec-val">${sp.maxSizeCm} cm</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">💧 Kualitas Air Ideal</span>
          <span class="spec-val">Minimal ${sp.preferredWaterQuality}%</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">⚡ Karakter Renang</span>
          <span class="spec-val">${sp.swimSpeed > 90 ? 'Lincah & Cepat' : 'Anggun & Tenang'}</span>
        </div>
      </div>

      <div class="fact-box">
        <strong>💡 Fakta Unik & Konservasi:</strong><br/>
        ${isUnlocked ? sp.uniqueFact : 'Pelihara spesies ini untuk menyingkap rahasia adaptasi dan ekologinya.'}
      </div>
    `;
  }
}
