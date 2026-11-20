import { storage } from '../../services/storageService';
import { SPECIES_MAP } from '../../data/fishSpecies';
import { AssetGenerator } from '../../utils/assetGenerator';
import { formatCoins, formatSecondsToTime } from '../../utils/formatters';
import { Toast } from '../Toast';
import { PlayerFish } from '../../types/game';

export class InventoryModal {
  private overlay: HTMLElement;
  private currentTab: 'fish' | 'items' = 'fish';
  public onInspectFish?: (fish: PlayerFish) => void;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 22px;">🎒</span>
            <h2>Inventaris Pemain</h2>
          </div>
          <button class="modal-close-btn" id="inv-close-btn">✕</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="fish">🐟 Ikan Peliharaan</button>
          <button class="tab-btn" data-tab="items">📦 Pakan & Perlengkapan</button>
        </div>
        <div class="modal-body" id="inv-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#inv-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const tabs = this.overlay.querySelectorAll('.tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        tabs.forEach((t) => t.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentTab = target.dataset.tab as any;
        this.renderTabContent();
      });
    });
  }

  public open(): void {
    this.renderTabContent();
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay.classList.remove('open');
  }

  private renderTabContent(): void {
    const body = this.overlay.querySelector('#inv-body');
    if (!body) return;

    if (this.currentTab === 'fish') {
      this.renderFishTab(body);
    } else {
      this.renderItemsTab(body);
    }
  }

  private renderFishTab(container: Element): void {
    const fishList = storage.getFishList();
    if (fishList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          <span style="font-size: 40px;">🐠</span>
          <p style="margin-top: 10px; font-size: 15px;">Belum ada ikan di akuarium Anda.</p>
          <p style="font-size: 12px;">Kunjungi Pasar Akuatik untuk mengadopsi ikan tawar khas Nusantara!</p>
        </div>
      `;
      return;
    }

    const adultList = fishList.filter((f) => f.stage === 'adult');
    const adultCount = adultList.length;
    const totalAdultCoins = adultList.reduce((acc, f) => acc + (f.sellPrice || 0), 0);

    container.innerHTML = `
      <!-- Action Bar: Status & Quick Sell All Button -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🐡</span>
          <span style="font-size: 13px; color: var(--color-text-secondary);">
            Total Ikan: <strong style="color: #fff;">${fishList.length} Ekor</strong> 
            <span style="color: ${adultCount > 0 ? '#80ED99' : '#FFD166'}; font-weight: 700;">
              (${adultCount > 0 ? `${adultCount} Siap Jual` : 'Belum Ada Siap Jual'})
            </span>
          </span>
        </div>
        ${
          adultCount > 0
            ? `
          <button class="btn-buy" id="btn-sell-all-adults" style="background: linear-gradient(135deg, #FF9E00, #E85D04); border-color: #FFAA00; padding: 7px 16px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(232, 93, 4, 0.4); cursor: pointer;">
            <span>💰</span>
            <span>Jual Semua Ikan Dewasa (${adultCount} Ekor • +${formatCoins(totalAdultCoins)})</span>
          </button>
        `
            : `
          <div style="font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px;">
            <span>⏳</span>
            <span>Tunggu timer ikan hingga status "Siap Jual"</span>
          </div>
        `
        }
      </div>

      <div class="cards-grid">
        ${fishList.map((f) => {
          const sp = SPECIES_MAP.get(f.speciesId);
          if (!sp) return '';
          const imgUrl = AssetGenerator.generateFishDataUrl(sp, 200, 120);
          const isAdult = f.stage === 'adult';
          const remainingSeconds = Math.max(0, Math.ceil(sp.growthTimeSeconds - f.ageSeconds));
          const stageName = isAdult ? 'Dewasa' : f.stage === 'medium' ? 'Remaja' : 'Anakan';

          return `
            <div class="item-card rarity-${sp.rarity}">
              <div class="card-header-badge">
                <span class="badge-rarity ${sp.rarity}">${sp.rarity}</span>
                ${
                  isAdult
                    ? '<span style="font-size: 11px; font-weight: 800; color: #80ED99;">💰 Siap Jual</span>'
                    : `<span style="font-size: 11px; font-weight: 800; color: #FFD166;">⏳ ${formatSecondsToTime(remainingSeconds)}</span>`
                }
              </div>
              <div class="card-img-preview">
                <img src="${imgUrl}" alt="${f.nickname}" />
              </div>
              <div class="card-info">
                <div class="card-title">${f.nickname}</div>
                <div class="card-scientific">${sp.name} (${sp.scientificName})</div>
                
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: var(--color-text-muted);">Kenyang</span>
                    <span style="color: #FFD166;">${Math.round(f.hunger)}%</span>
                  </div>
                  <div style="height: 5px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${f.hunger}%; height: 100%; background: #FFD166;"></div>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
                    <span style="color: var(--color-text-muted);">Kesehatan</span>
                    <span style="color: #80ED99;">${Math.round(f.health)}%</span>
                  </div>
                  <div style="height: 5px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${f.health}%; height: 100%; background: #52B788;"></div>
                  </div>
                </div>
              </div>
              <div class="card-footer" style="gap: 8px;">
                <div class="price-tag" style="font-size: 12px;">
                  <span class="coin-icon-gold"></span>
                  <span>${formatCoins(f.sellPrice)}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-buy btn-inspect" data-fish-id="${f.id}" style="padding: 5px 10px; font-size: 11px;">Detail</button>
                  <button class="btn-sell" data-fish-id="${f.id}" style="padding: 5px 10px; font-size: 11px; ${isAdult ? '' : 'opacity: 0.6; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);'}">
                    ${isAdult ? 'Jual' : `⏳ ${formatSecondsToTime(remainingSeconds)}`}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Inspect
    container.querySelectorAll('.btn-inspect').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.fishId;
        const fish = storage.getFishList().find((f) => f.id === id);
        if (fish && this.onInspectFish) {
          this.close();
          this.onInspectFish(fish);
        }
      });
    });

    // Sell
    container.querySelectorAll('.btn-sell').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.fishId;
        if (!id) return;
        const fish = storage.getFishList().find((f) => f.id === id);
        if (!fish) return;

        if (fish.stage !== 'adult') {
          const sp = SPECIES_MAP.get(fish.speciesId);
          const remaining = sp ? Math.max(0, Math.ceil(sp.growthTimeSeconds - fish.ageSeconds)) : 60;
          Toast.show(`Ikan belum dewasa! Tunggu timer selesai (${formatSecondsToTime(remaining)}) agar siap dijual.`, 'info');
          return;
        }

        if (confirm(`Yakin ingin menjual ${fish.nickname} seharga ${formatCoins(fish.sellPrice)}?`)) {
          const res = await storage.sellFish(id);
          if (res.success) {
            Toast.show(res.message, 'success');
            this.renderTabContent();
          } else {
            Toast.show(res.message, 'error');
          }
        }
      });
    });

    // Sell All Adults (Single Click Batch Operation)
    const sellAllBtn = container.querySelector('#btn-sell-all-adults');
    sellAllBtn?.addEventListener('click', async () => {
      if (confirm(`Jual semua ${adultCount} ekor ikan dewasa sekaligus seharga total ${formatCoins(totalAdultCoins)}?`)) {
        const res = await storage.sellAllAdultFish();
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      }
    });
  }

  private renderItemsTab(container: Element): void {
    const inv = storage.getInventory();
    const aq = storage.getAquarium();
    const installedDecos = aq.decorations || [];
    const isDecoFull = installedDecos.length >= 6;

    if (inv.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          <span style="font-size: 40px;">📦</span>
          <p style="margin-top: 10px; font-size: 15px;">Inventaris pakan & dekorasi Anda kosong.</p>
          <p style="font-size: 12px;">Beli pakan atau aquascape di Pasar Akuatik!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); font-size: 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Tema Tangki:</span>
          <strong style="color: #80ED99; font-size: 12px;">
            🎨 ${(aq.theme || 'nature').toUpperCase()} STYLE
          </strong>
        </div>
        <div style="font-size: 11px; color: var(--color-text-muted);">
          Ganti tema di Toko ➔ Tab Tema Aquascape
        </div>
      </div>

      <div class="cards-grid">
        ${inv.map((item) => {
          const matchingDeco = installedDecos.find((d) => d.name === item.name);
          const isInstalled = !!matchingDeco;

          return `
            <div class="item-card">
              <div class="card-img-preview" style="background: rgba(22, 134, 154, 0.15);">
                <span style="font-size: 38px;">${
                  item.category === 'food' ? '🍲' : item.category === 'decoration' ? '🌿' : '⚙️'
                }</span>
              </div>
              <div class="card-info">
                <div class="card-title">${item.name}</div>
                <div style="font-size: 11px; font-weight: 700; color: ${isInstalled ? '#80ED99' : '#FFD166'};">
                  ${isInstalled ? '✅ Terpasang di Aquascape' : `Tersedia: ${item.quantity}x`}
                </div>
                <div class="card-desc">${item.description}</div>
              </div>
              <div class="card-footer">
                ${
                  item.category === 'food'
                    ? `<button class="btn-buy btn-use-food" data-item-id="${item.itemId}">Beri Makan</button>`
                    : item.category === 'decoration'
                    ? isInstalled
                      ? `<button class="btn-sell btn-remove-deco" data-deco-id="${matchingDeco.id}" style="padding: 6px 12px; font-size: 11px;">Tarik dari Tangki</button>`
                      : `<button class="btn-buy btn-place-deco" data-item-id="${item.itemId}" ${isDecoFull ? 'disabled style="opacity: 0.5;"' : ''}>
                          ${isDecoFull ? 'Aquascape Penuh (6/6)' : '📍 Pasang ke Tangki'}
                         </button>`
                    : `<button class="btn-buy" disabled>Aktif</button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Food use button
    container.querySelectorAll('.btn-use-food').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = (e.currentTarget as HTMLElement).dataset.itemId;
        const res = storage.feedAquarium(itemId);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        }
      });
    });

    // Place decoration button
    container.querySelectorAll('.btn-place-deco').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = (e.currentTarget as HTMLElement).dataset.itemId;
        if (!itemId) return;
        const res = storage.placeDecoration(itemId);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });

    // Remove decoration button
    container.querySelectorAll('.btn-remove-deco').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const decoId = (e.currentTarget as HTMLElement).dataset.decoId;
        if (!decoId) return;
        const res = storage.removeDecoration(decoId);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }
}
