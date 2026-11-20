import { FISH_SPECIES_LIST } from '../../data/fishSpecies';
import { SHOP_ITEMS } from '../../data/items';
import { storage } from '../../services/storageService';
import { AssetGenerator } from '../../utils/assetGenerator';
import { formatCoins, formatNumber, formatSecondsToTime } from '../../utils/formatters';
import { Toast } from '../Toast';
import confetti from 'canvas-confetti';

export class ShopModal {
  private overlay: HTMLElement;
  private currentTab: 'fish' | 'food' | 'decoration' | 'aquarium' = 'fish';
  private fishQuantities: Map<string, number> = new Map();

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 20px;">🛒</span>
            <h2>Pasar Akuatik Nusantara</h2>
          </div>
          <button class="modal-close-btn" id="shop-close-btn">✕</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="fish">🐟 Ikan Nusantara</button>
          <button class="tab-btn" data-tab="food">🍲 Pakan Ikan</button>
          <button class="tab-btn" data-tab="decoration">🌿 Tema Aquascape</button>
          <button class="tab-btn" data-tab="aquarium">⚙️ Fasilitas Akuarium</button>
        </div>
        <div class="modal-body" id="shop-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#shop-close-btn');
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

  public open(defaultTab: 'fish' | 'food' | 'decoration' | 'aquarium' = 'fish'): void {
    this.currentTab = defaultTab;
    const tabs = this.overlay.querySelectorAll('.tab-btn');
    tabs.forEach((t) => {
      const el = t as HTMLElement;
      if (el.dataset.tab === defaultTab) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.renderTabContent();
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay.classList.remove('open');
  }

  private renderTabContent(): void {
    const body = this.overlay.querySelector('#shop-body');
    if (!body) return;

    if (this.currentTab === 'fish') {
      this.renderFishShop(body);
    } else if (this.currentTab === 'aquarium') {
      this.renderAquariumFacilities(body);
    } else if (this.currentTab === 'decoration') {
      this.renderAquascapeThemesShop(body);
    } else {
      this.renderItemShop(body, this.currentTab);
    }
  }

  private updateFishCardQty(container: Element, spId: string, qty: number): void {
    const sp = FISH_SPECIES_LIST.find((s) => s.id === spId);
    if (!sp) return;

    const qtyDisplay = container.querySelector(`.qty-display[data-species-id="${spId}"]`);
    if (qtyDisplay) qtyDisplay.textContent = String(qty);

    const priceVal = container.querySelector(`.price-val[data-species-id="${spId}"]`);
    if (priceVal) priceVal.textContent = formatCoins(sp.buyPrice * qty);

    const buyBtn = container.querySelector(`.btn-buy[data-species-id="${spId}"]`);
    if (buyBtn && !buyBtn.hasAttribute('disabled')) {
      buyBtn.textContent = `Adopsi (${qty})`;
    }
  }

  private renderFishShop(container: Element): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();
    const fishCount = storage.getFishList().filter((f) => f.inAquarium).length;
    const remainingSlots = Math.max(0, aq.capacity - fishCount);

    container.innerHTML = `
      <!-- User Balance & Tank Capacity Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 9px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Saldo Koin:</span>
          <span class="coin-icon-gold"></span>
          <strong style="color: var(--color-gold-coin); font-size: 13px;">${formatNumber(prof.coins)} Koin</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Kapasitas Akuarium:</span>
          <strong style="color: ${remainingSlots <= 0 ? '#FF758F' : '#80ED99'}; font-size: 13px;">
            🐡 ${fishCount} / ${aq.capacity} Ekor ${remainingSlots > 0 ? `(Sisa ${remainingSlots})` : '(Penuh)'}
          </strong>
        </div>
      </div>

      <div class="cards-grid">
        ${FISH_SPECIES_LIST.map((sp) => {
          const imgUrl = AssetGenerator.generateFishDataUrl(sp, 200, 120);
          const rawQty = this.fishQuantities.get(sp.id) || 1;
          const currentQty = remainingSlots > 0 ? Math.min(rawQty, remainingSlots) : 1;

          return `
            <div class="item-card rarity-${sp.rarity}">
              <div class="card-header-badge">
                <span class="badge-rarity ${sp.rarity}">${sp.rarity}</span>
                <span class="badge-origin ${sp.originType}">${sp.originType.toUpperCase()}</span>
              </div>
              <div class="card-img-preview">
                <img src="${imgUrl}" alt="${sp.name}" />
              </div>
              <div class="card-info">
                <div class="card-title">${sp.name}</div>
                <div class="card-scientific">${sp.scientificName}</div>
                <div style="display: flex; gap: 8px; margin: 3px 0 5px 0; font-size: 11px;">
                  <span style="color: #80ED99; font-weight: 700;">📏 Dewasa: ${sp.maxSizeCm} cm</span>
                  <span style="color: var(--color-text-muted);">•</span>
                  <span style="color: #FFD166;">⏳ ${formatSecondsToTime(sp.growthTimeSeconds)}</span>
                </div>
                <div class="card-desc">${sp.description}</div>

                <!-- Quantity Selector -->
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); padding: 4px 8px; margin-top: 8px;">
                  <span style="font-size: 11px; color: var(--color-text-muted);">Jumlah Bibit:</span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn-qty-minus" data-species-id="${sp.id}" style="width: 24px; height: 24px; border-radius: 4px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; cursor: pointer; font-weight: bold; font-size: 13px; display: flex; align-items: center; justify-content: center;">−</button>
                    <span class="qty-display" data-species-id="${sp.id}" style="font-size: 12px; font-weight: 800; min-width: 22px; text-align: center; color: #80ED99;">${currentQty}</span>
                    <button class="btn-qty-plus" data-species-id="${sp.id}" style="width: 24px; height: 24px; border-radius: 4px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; cursor: pointer; font-weight: bold; font-size: 13px; display: flex; align-items: center; justify-content: center;">+</button>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <div class="price-tag">
                  <span class="coin-icon-gold"></span>
                  <span class="price-val" data-species-id="${sp.id}">${formatCoins(sp.buyPrice * currentQty)}</span>
                </div>
                <button class="btn-buy" data-species-id="${sp.id}" ${remainingSlots <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                  ${remainingSlots <= 0 ? 'Penuh' : `Adopsi (${currentQty})`}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind quantity minus buttons
    container.querySelectorAll('.btn-qty-minus').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const spId = (e.currentTarget as HTMLElement).dataset.speciesId;
        if (!spId) return;
        const current = this.fishQuantities.get(spId) || 1;
        if (current > 1) {
          const next = current - 1;
          this.fishQuantities.set(spId, next);
          this.updateFishCardQty(container, spId, next);
        }
      });
    });

    // Bind quantity plus buttons
    container.querySelectorAll('.btn-qty-plus').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const spId = (e.currentTarget as HTMLElement).dataset.speciesId;
        if (!spId) return;
        const current = this.fishQuantities.get(spId) || 1;
        if (remainingSlots <= 0) {
          Toast.show('Kapasitas akuarium sudah penuh! Tingkatkan akuarium di tab Fasilitas.', 'error');
          return;
        }
        if (current >= remainingSlots) {
          Toast.show(`Kapasitas akuarium tersisa ${remainingSlots} ekor lagi!`, 'info');
          return;
        }
        const next = current + 1;
        this.fishQuantities.set(spId, next);
        this.updateFishCardQty(container, spId, next);
      });
    });

    // Bind buy buttons
    container.querySelectorAll('.btn-buy').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const speciesId = (e.currentTarget as HTMLElement).dataset.speciesId;
        if (!speciesId) return;

        const species = FISH_SPECIES_LIST.find((s) => s.id === speciesId);
        const qty = this.fishQuantities.get(speciesId) || 1;
        const res = await storage.buyFish(speciesId, undefined, qty);
        if (res.success) {
          Toast.show(res.message, 'success');
          if (species && (species.rarity === 'epic' || species.rarity === 'legendary')) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }
          this.fishQuantities.set(speciesId, 1);
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }

  /**
   * Specialized Renderer for Aquarium Facilities & Real Upgrades
   */
  private renderAquariumFacilities(container: Element): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();

    container.innerHTML = `
      <!-- User Balance Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 9px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Saldo Koin:</span>
          <span class="coin-icon-gold"></span>
          <strong style="color: var(--color-gold-coin); font-size: 13px;">${formatNumber(prof.coins)} Koin</strong>
        </div>
        <div style="color: #80ED99; font-weight: 700; font-size: 12px;">
          ✨ Upgrade langsung mengubah fisik perangkat & dekorasi di akuarium!
        </div>
      </div>

      <div class="cards-grid">
        <!-- 1. KURAS AIR -->
        <div class="item-card rarity-uncommon">
          <div class="card-header-badge">
            <span class="badge-rarity common">PERAWATAN AIR</span>
            <span style="font-size: 10px; font-weight: 800; color: #80ED99;">
              ${Math.round(aq.waterQuality)}% ➔ 100%
            </span>
          </div>
          <div class="card-img-preview" style="background: radial-gradient(circle, rgba(0,180,216,0.25), rgba(0,0,0,0.4));">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <!-- Glass Bottle Body -->
              <rect x="22" y="24" width="20" height="32" rx="4" fill="url(#bottleGrad)" stroke="#4CC9F0" stroke-width="2"/>
              <!-- Neck & Cap -->
              <rect x="27" y="16" width="10" height="8" rx="2" fill="#0077B6" stroke="#90E0EF" stroke-width="1.5"/>
              <rect x="25" y="12" width="14" height="5" rx="2.5" fill="#48CAE4"/>
              <!-- Water Liquid Inside -->
              <path d="M23 38c3-2 6 2 9 0s5-2 9 0v14a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3V38z" fill="#00B4D8" fill-opacity="0.8"/>
              <!-- Droplet Falling -->
              <path d="M48 20c0 4-4 8-4 8s-4-4-4-8a4 4 0 0 1 8 0z" fill="#80ED99"/>
              <!-- Sparkles -->
              <circle cx="16" cy="18" r="2" fill="#FFD166"/>
              <circle cx="49" cy="45" r="1.5" fill="#FFFFFF"/>
              <circle cx="14" cy="40" r="1.5" fill="#4CC9F0"/>
              <!-- Gradients -->
              <defs>
                <linearGradient id="bottleGrad" x1="22" y1="24" x2="42" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#CAF0F8" stop-opacity="0.6"/>
                  <stop offset="1" stop-color="#0077B6" stop-opacity="0.3"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="card-info">
            <div class="card-title">Kuras & Water Treatment</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #4CC9F0;">Kejernihan Air:</span>
              <strong style="font-size: 11px; color: ${aq.waterQuality >= 90 ? '#80ED99' : '#FFD166'};">${Math.round(aq.waterQuality)}% ➔ 100%</strong>
            </div>
            <!-- Progress Bar -->
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; margin: 4px 0 6px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #00B4D8, #80ED99); width: ${Math.round(aq.waterQuality)}%; height: 100%;"></div>
            </div>
            <div class="card-desc">
              Kuras air total dan beri bakteri pengurai. Air kembali 100% jernih dan kesehatan ikan pulih seketika.
            </div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 5px; background: rgba(0, 180, 216, 0.15); border: 1px solid rgba(0, 180, 216, 0.3); font-size: 10.5px; color: #90E0EF;">
              ✨ Efek Nyata: Air seketika kembali bening kristal & memulihkan stamina ikan.
            </div>
          </div>
          <div class="card-footer">
            <div class="price-tag">
              <span class="coin-icon-gold"></span>
              <span>30 Koin</span>
            </div>
            <button class="btn-buy" data-item-id="clean_water_kit" ${aq.waterQuality >= 99 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${aq.waterQuality >= 99 ? 'Air Bersih' : 'Kuras Air'}
            </button>
          </div>
        </div>

        <!-- 2. FILTER BIO-SPONGE -->
        <div class="item-card rarity-rare">
          <div class="card-header-badge">
            <span class="badge-rarity rare">LEVEL ${aq.filterLevel} / 5</span>
            <span style="font-size: 10px; font-weight: 800; color: #FFD166;">
              ${aq.filterLevel >= 5 ? 'MAX' : `Lv. ${aq.filterLevel} ➔ Lv. ${aq.filterLevel + 1}`}
            </span>
          </div>
          <div class="card-img-preview" style="background: radial-gradient(circle, rgba(54,166,92,0.25), rgba(0,0,0,0.4));">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <!-- Central Riser Pipe -->
              <rect x="29" y="10" width="6" height="42" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.2"/>
              <!-- Outflow Nozzle -->
              <path d="M29 10c-5-2-12-1-15 4v6h6c3-6 8-8 9-10z" fill="#CBD5E1"/>
              <!-- Water Outflow Ripple -->
              <circle cx="15" cy="18" r="4" stroke="#80ED99" stroke-width="1.5" stroke-dasharray="2 2"/>
              <!-- Left Sponge Cylinder -->
              <rect x="14" y="24" width="13" height="26" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
              <line x1="14" y1="30" x2="27" y2="30" stroke="#64748B" stroke-width="1.2"/>
              <line x1="14" y1="36" x2="27" y2="36" stroke="#64748B" stroke-width="1.2"/>
              <line x1="14" y1="42" x2="27" y2="42" stroke="#64748B" stroke-width="1.2"/>
              <!-- Right Sponge Cylinder -->
              <rect x="37" y="24" width="13" height="26" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
              <line x1="37" y1="30" x2="50" y2="30" stroke="#64748B" stroke-width="1.2"/>
              <line x1="37" y1="36" x2="50" y2="36" stroke="#64748B" stroke-width="1.2"/>
              <line x1="37" y1="42" x2="50" y2="42" stroke="#64748B" stroke-width="1.2"/>
              <!-- Base Weighted Plate -->
              <rect x="20" y="50" width="24" height="5" rx="2" fill="#0F172A"/>
            </svg>
          </div>
          <div class="card-info">
            <div class="card-title">Filter Bio-Sponge Pro</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #80ED99;">Tingkat Filtrasi:</span>
              <strong style="font-size: 11px; color: #FFD166;">Level ${aq.filterLevel} / 5 (${aq.filterLevel * 20}% Efisiensi)</strong>
            </div>
            <!-- Segmented Level Gauge -->
            <div style="display: flex; gap: 4px; margin: 4px 0 6px;">
              ${[1, 2, 3, 4, 5].map((lvl) => `
                <div style="flex: 1; height: 6px; border-radius: 3px; background: ${lvl <= aq.filterLevel ? 'linear-gradient(90deg, #52B788, #80ED99)' : 'rgba(255,255,255,0.1)'};"></div>
              `).join('')}
            </div>
            <div class="card-desc">
              Menampilkan hardware filter fisik di tank & memperlambat keruh air hingga ${Math.round((aq.filterLevel) * 15)}%.
            </div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 5px; background: rgba(54, 166, 92, 0.15); border: 1px solid rgba(82, 183, 136, 0.3); font-size: 10.5px; color: #80ED99;">
              ✨ Efek Nyata: Menampilkan unit filter fisik di sudut kiri dan riak air permukaan.
            </div>
          </div>
          <div class="card-footer">
            <div class="price-tag">
              <span class="coin-icon-gold"></span>
              <span>${aq.filterLevel >= 5 ? 'MAX' : '350 Koin'}</span>
            </div>
            <button class="btn-buy" data-item-id="upgrade_filter_sponge" ${aq.filterLevel >= 5 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${aq.filterLevel >= 5 ? 'Maksimal' : 'Upgrade Filter'}
            </button>
          </div>
        </div>

        <!-- 3. AERATOR TURBO SILENT -->
        <div class="item-card rarity-epic">
          <div class="card-header-badge">
            <span class="badge-rarity epic">LEVEL ${aq.aeratorLevel} / 5</span>
            <span style="font-size: 10px; font-weight: 800; color: #FFD166;">
              ${aq.aeratorLevel >= 5 ? 'MAX' : `Lv. ${aq.aeratorLevel} ➔ Lv. ${aq.aeratorLevel + 1}`}
            </span>
          </div>
          <div class="card-img-preview" style="background: radial-gradient(circle, rgba(0,180,216,0.25), rgba(0,0,0,0.4));">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <!-- Air Pump Machine Body -->
              <rect x="14" y="24" width="36" height="24" rx="8" fill="#1E293B" stroke="#00B4D8" stroke-width="2"/>
              <!-- Dial & Status LED -->
              <circle cx="32" cy="36" r="6" fill="#0F172A" stroke="#48CAE4" stroke-width="1.5"/>
              <circle cx="44" cy="30" r="2.5" fill="#80ED99"/>
              <!-- Air Hose Outlet -->
              <path d="M22 24v-8c0-4 6-4 6 0v4" stroke="#CAF0F8" stroke-width="2" stroke-linecap="round"/>
              <!-- Diffuser Stone with Ascending Micro-Bubbles -->
              <rect x="25" y="8" width="6" height="4" rx="1.5" fill="#475569"/>
              <circle cx="28" cy="4" r="1.8" fill="#CAF0F8"/>
              <circle cx="24" cy="1" r="1.2" fill="#FFFFFF"/>
              <circle cx="33" cy="2" r="1.5" fill="#90E0EF"/>
              <!-- Ambient Air Waves -->
              <path d="M10 42c-3 1-5 4-5 6" stroke="#48CAE4" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M54 42c3 1 5 4 5 6" stroke="#48CAE4" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="card-info">
            <div class="card-title">Aerator Turbo Silent</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #00B4D8;">Titik Aerasi:</span>
              <strong style="font-size: 11px; color: #FFD166;">Level ${aq.aeratorLevel} / 5 (${aq.aeratorLevel} Titik Diffuser Pasir)</strong>
            </div>
            <!-- Segmented Level Gauge -->
            <div style="display: flex; gap: 4px; margin: 4px 0 6px;">
              ${[1, 2, 3, 4, 5].map((lvl) => `
                <div style="flex: 1; height: 6px; border-radius: 3px; background: ${lvl <= aq.aeratorLevel ? 'linear-gradient(90deg, #0077B6, #48CAE4)' : 'rgba(255,255,255,0.1)'};"></div>
              `).join('')}
            </div>
            <div class="card-desc">
              Menambah diffuser batu aerasi fisik di dasar pasir & memperbanyak semburan gelembung oksigen mikro segar.
            </div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 5px; background: rgba(0, 180, 216, 0.15); border: 1px solid rgba(0, 180, 216, 0.3); font-size: 10.5px; color: #90E0EF;">
              ✨ Efek Nyata: Menambah batu diffuser fisik ke-${Math.min(5, aq.aeratorLevel + 1)} di pasir & melipatgandakan gelembung.
            </div>
          </div>
          <div class="card-footer">
            <div class="price-tag">
              <span class="coin-icon-gold"></span>
              <span>${aq.aeratorLevel >= 5 ? 'MAX' : '450 Koin'}</span>
            </div>
            <button class="btn-buy" data-item-id="upgrade_aerator_silent" ${aq.aeratorLevel >= 5 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${aq.aeratorLevel >= 5 ? 'Maksimal' : 'Upgrade Aerator'}
            </button>
          </div>
        </div>

        <!-- 4. EKSPANSI RUANG (+3 IKAN) -->
        <div class="item-card rarity-legendary">
          <div class="card-header-badge">
            <span class="badge-rarity legendary">${aq.capacity >= 20 ? 'BATAS MAKSIMAL' : 'KAPASITAS +3'}</span>
            <span style="font-size: 10px; font-weight: 800; color: #80ED99;">
              ${aq.capacity >= 20 ? '20 / 20 Ekor (MAX)' : `${aq.capacity} ➔ ${Math.min(20, aq.capacity + 3)} Ekor`}
            </span>
          </div>
          <div class="card-img-preview" style="background: radial-gradient(circle, rgba(255,209,102,0.25), rgba(0,0,0,0.4));">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <!-- Glass Aquarium Tank -->
              <rect x="10" y="16" width="44" height="34" rx="4" fill="rgba(255,209,102,0.12)" stroke="#FFD166" stroke-width="2"/>
              <!-- Sand Substrate Bed -->
              <path d="M11 42c6-1 12 1 18 0s14-2 24 1v6a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3v-7z" fill="#E8D2A0"/>
              <!-- River Stones on Bed -->
              <ellipse cx="22" cy="44" rx="5" ry="3" fill="#475569"/>
              <ellipse cx="40" cy="43" rx="6" ry="3.5" fill="#33415C"/>
              <!-- Expansion Arrows -->
              <path d="M4 32h5M55 32h5" stroke="#80ED99" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M2 32l4-4M2 32l4 4M62 32l-4-4M62 32l-4 4" stroke="#80ED99" stroke-width="2" stroke-linecap="round"/>
              <!-- +3 Badge -->
              <circle cx="32" cy="28" r="8" fill="#FFD166"/>
              <text x="32" y="32" font-size="10" font-weight="900" fill="#0B5367" text-anchor="middle">+3</text>
            </svg>
          </div>
          <div class="card-info">
            <div class="card-title">Ekspansi Ruang (+3 Ikan)</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #FFD166;">Kapasitas Tangki:</span>
              <strong style="font-size: 11px; color: ${aq.capacity >= 20 ? '#FF758F' : '#80ED99'};">
                ${aq.capacity} / 20 Ekor (${aq.capacity >= 20 ? 'Maksimal' : `+3 Slot`})
              </strong>
            </div>
            <!-- Progress Bar to 20 Fish Max -->
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; margin: 4px 0 6px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #F4A261, #E76F51); width: ${(aq.capacity / 20) * 100}%; height: 100%;"></div>
            </div>
            <div class="card-desc">
              ${aq.capacity >= 20 
                ? 'Kapasitas telah mencapai batas maksimal 20 ekor ikan agar akuarium tetap nyaman dipandang.' 
                : 'Menambah slot ikan & memunculkan formasi bebatuan sungai alami baru di dasar pasir.'}
            </div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 5px; background: rgba(255, 209, 102, 0.15); border: 1px solid rgba(255, 209, 102, 0.3); font-size: 10.5px; color: #FFD166;">
              ✨ Efek Nyata: Menambah 4 formasi batu kali alami di dasar tangki & memperluas ruang renang.
            </div>
          </div>
          <div class="card-footer">
            <div class="price-tag">
              <span class="coin-icon-gold"></span>
              <span>${aq.capacity >= 20 ? 'MAX' : '500 Koin'}</span>
            </div>
            <button class="btn-buy" data-item-id="upgrade_capacity_small" ${aq.capacity >= 20 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${aq.capacity >= 20 ? 'Maksimal (20 Ikan)' : `Perluas (+${Math.min(3, 20 - aq.capacity)})`}
            </button>
          </div>
        </div>

        <!-- 5. EKSPANSI MEGA (+6 IKAN) -->
        <div class="item-card rarity-legendary">
          <div class="card-header-badge">
            <span class="badge-rarity legendary">${aq.capacity >= 20 ? 'BATAS MAKSIMAL' : 'MEGA EXPANSION'}</span>
            <span style="font-size: 10px; font-weight: 800; color: #FFD166;">
              ${aq.capacity >= 20 ? '20 / 20 Ekor (MAX)' : `${aq.capacity} ➔ ${Math.min(20, aq.capacity + 6)} Ekor`}
            </span>
          </div>
          <div class="card-img-preview" style="background: radial-gradient(circle, rgba(239,71,111,0.25), rgba(0,0,0,0.4));">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <!-- Ultra-wide Rimless Tank -->
              <rect x="6" y="14" width="52" height="38" rx="5" fill="rgba(239,71,111,0.15)" stroke="#FF758F" stroke-width="2"/>
              <!-- Top LED Lighting Bar Fixture -->
              <rect x="4" y="10" width="56" height="4" rx="2" fill="#E2E8F0"/>
              <line x1="12" y1="14" x2="12" y2="24" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.6"/>
              <line x1="52" y1="14" x2="52" y2="24" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.6"/>
              <!-- Sand Bed with Layered Rocks -->
              <path d="M7 40c8-2 18 2 26 0s16-3 24 1v7a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-8z" fill="#E8D2A0"/>
              <ellipse cx="18" cy="42" rx="7" ry="4" fill="#1E293B"/>
              <ellipse cx="44" cy="41" rx="8" ry="4.5" fill="#33415C"/>
              <!-- Aquatic Plant Sprig -->
              <path d="M48 42c-2-8 3-14 0-18" stroke="#52B788" stroke-width="2.5" stroke-linecap="round"/>
              <!-- +6 Badge -->
              <circle cx="32" cy="28" r="8" fill="#FF758F"/>
              <text x="32" y="32" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">+6</text>
            </svg>
          </div>
          <div class="card-info">
            <div class="card-title">Ekspansi Mega (+6 Ikan)</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #FF758F;">Kapasitas Tangki:</span>
              <strong style="font-size: 11px; color: ${aq.capacity >= 20 ? '#FF758F' : '#80ED99'};">
                ${aq.capacity} / 20 Ekor (${aq.capacity >= 20 ? 'Maksimal' : `+6 Slot`})
              </strong>
            </div>
            <!-- Progress Bar to 20 Fish Max -->
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; margin: 4px 0 6px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #E63946, #FF758F); width: ${(aq.capacity / 20) * 100}%; height: 100%;"></div>
            </div>
            <div class="card-desc">
              ${aq.capacity >= 20 
                ? 'Kapasitas telah mencapai batas maksimal 20 ekor ikan. Pemandangan akuarium tetap lega dan tidak padat.' 
                : 'Renovasi besar! Menambah slot ikan, formasi batu kali besar, ranting kayu apung, dan lampu LED atas.'}
            </div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 5px; background: rgba(239, 71, 111, 0.15); border: 1px solid rgba(239, 71, 111, 0.3); font-size: 10.5px; color: #FF758F;">
              ✨ Efek Nyata: Menambah formasi batu tebing besar, kayu apung alami, dan lampu LED atas.
            </div>
          </div>
          <div class="card-footer">
            <div class="price-tag">
              <span class="coin-icon-gold"></span>
              <span>${aq.capacity >= 20 ? 'MAX' : '1.200 Koin'}</span>
            </div>
            <button class="btn-buy" data-item-id="upgrade_capacity_large" ${aq.capacity >= 20 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${aq.capacity >= 20 ? 'Maksimal (20 Ikan)' : `Perluas (+${Math.min(6, 20 - aq.capacity)})`}
            </button>
          </div>
        </div>
              ${aq.capacity >= 20 ? 'Maksimal (20 Ikan)' : `Perluas (+${Math.min(6, 20 - aq.capacity)})`}
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind upgrade buttons
    container.querySelectorAll('.btn-buy').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const itemId = (e.currentTarget as HTMLElement).dataset.itemId;
        if (!itemId) return;

        const res = await storage.buyItem(itemId, 1);
        if (res.success) {
          Toast.show(res.message, 'success');
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }

  /**
   * Specialized Renderer for 5 World-Class Aquascaping Themes & Backgrounds
   */
  private renderAquascapeThemesShop(container: Element): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();
    const currentTheme = (aq.theme || 'nature').toLowerCase();

    const themes = [
      {
        id: 'theme_nature',
        key: 'nature',
        name: 'Nature Style',
        subtitle: 'Lanskap Alami Takashi Amano',
        description: 'Meniru lanskap alam bebas seperti bukit, hutan, atau lembah menggunakan kombinasi batu, kayu apung (driftwood), dan tanaman air.',
        price: 0,
        svg: `
          <svg width="100%" height="110" viewBox="0 0 200 110" style="border-radius: 8px; display: block;">
            <defs>
              <linearGradient id="bg_nature_svg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="60%" stop-color="#DCF2F7" />
                <stop offset="100%" stop-color="#8DC6D4" />
              </linearGradient>
            </defs>
            <rect width="200" height="110" fill="url(#bg_nature_svg)" />
            <!-- Valley Light Shafts -->
            <polygon points="75,0 95,0 108,80 88,80" fill="#FFFFFF" opacity="0.35" />
            <polygon points="110,0 125,0 118,80 102,80" fill="#FFFFFF" opacity="0.35" />
            <!-- Background Stem Hills with Red Tips -->
            <path d="M0,70 L0,20 Q40,16 75,55 L75,110 L0,110 Z" fill="#2D5A27" />
            <path d="M200,70 L200,18 Q160,15 125,55 L125,110 L200,110 Z" fill="#2D5A27" />
            <ellipse cx="30" cy="22" rx="22" ry="5" fill="#B83A28" opacity="0.8" />
            <ellipse cx="170" cy="20" rx="22" ry="5" fill="#B83A28" opacity="0.8" />
            <!-- Substrate base -->
            <rect y="84" width="200" height="26" fill="#1F241A" />
            <path d="M0,80 L75,85 L85,110 L0,110 Z" fill="#2D6A4F" />
            <path d="M200,80 L125,85 L115,110 L200,110 Z" fill="#2D6A4F" />
            <!-- Central White Winding Path -->
            <path d="M98,62 Q92,82 86,110 L114,110 Q108,82 102,62 Z" fill="#FFFDF5" />
            <!-- Left Dragon Stone Massif -->
            <polygon points="30,86 45,35 60,30 78,85" fill="#9E692D" />
            <polygon points="50,32 60,30 78,85 68,85" fill="#D8A250" />
            <polygon points="62,86 68,52 78,54 86,86" fill="#B88036" />
            <!-- Right Dragon Stone Massif -->
            <polygon points="122,86 138,28 155,34 172,86" fill="#9E692D" />
            <polygon points="138,28 148,31 162,86 150,86" fill="#D8A250" />
            <polygon points="114,86 122,54 132,58 138,86" fill="#B88036" />
            <!-- Monte Carlo & Clover Greenery -->
            <circle cx="68" cy="84" r="5" fill="#70E000" />
            <circle cx="76" cy="83" r="4.5" fill="#80ED99" />
            <circle cx="124" cy="83" r="4.5" fill="#80ED99" />
            <circle cx="132" cy="84" r="5" fill="#70E000" />
          </svg>
        `
      },
      {
        id: 'theme_iwagumi',
        key: 'iwagumi',
        name: 'Iwagumi Style',
        subtitle: 'Zen Bebatuan & Karpet Rumput Hijau',
        description: 'Berfokus pada susunan batu dengan ukuran berbeda dan satu jenis tanaman karpet, biasanya dipadukan dengan satu jenis ikan kecil berkelompok.',
        price: 320,
        svg: `
          <svg width="100%" height="110" viewBox="0 0 200 110" style="border-radius: 8px; display: block;">
            <defs>
              <linearGradient id="bg_iwagumi_svg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0077B6" />
                <stop offset="60%" stop-color="#0096C7" />
                <stop offset="100%" stop-color="#48CAE4" />
              </linearGradient>
            </defs>
            <rect width="200" height="110" fill="url(#bg_iwagumi_svg)" />
            <polygon points="40,0 90,0 120,110 70,110" fill="#CAF0F8" opacity="0.22" />
            <rect y="84" width="200" height="26" fill="#1E232A" />
            <path d="M0,82 Q40,78 80,82 T160,80 Q180,82 200,81 L200,110 L0,110 Z" fill="#2D6A4F" />
            <path d="M0,80 Q40,76 80,80 T160,78 Q180,80 200,79 L200,110 L0,110 Z" fill="#70E000" opacity="0.9" />
            <polygon points="120,84 135,32 155,38 165,84" fill="#2A3446" />
            <polygon points="135,32 148,35 165,84 150,84" fill="#1E293B" opacity="0.6" />
            <line x1="128" y1="56" x2="156" y2="60" stroke="#E2E8F0" stroke-width="1.8" />
            <line x1="132" y1="68" x2="160" y2="72" stroke="#E2E8F0" stroke-width="1.4" />
            <polygon points="60,84 72,48 88,54 94,84" fill="#33415C" />
            <polygon points="72,48 82,51 94,84 84,84" fill="#1E293B" opacity="0.6" />
            <line x1="68" y1="65" x2="88" y2="68" stroke="#E2E8F0" stroke-width="1.4" />
            <polygon points="42,84 48,68 56,72 60,84" fill="#475569" />
          </svg>
        `
      },
      {
        id: 'theme_dutch',
        key: 'dutch',
        name: 'Dutch Style',
        subtitle: 'Kebun Tanaman Air Berwarna Bertingkat',
        description: 'Menonjolkan kepadatan dan variasi warna tanaman air (sering kali tanpa hardscape batu/kayu) yang disusun bertingkat.',
        price: 480,
        svg: `
          <svg width="100%" height="110" viewBox="0 0 200 110" style="border-radius: 8px; display: block;">
            <defs>
              <linearGradient id="bg_dutch_svg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#08252B" />
                <stop offset="100%" stop-color="#145A68" />
              </linearGradient>
            </defs>
            <rect width="200" height="110" fill="url(#bg_dutch_svg)" />
            <polygon points="60,0 95,0 125,110 85,110" fill="#FFEAA7" opacity="0.12" />
            <rect y="84" width="200" height="26" fill="#3A2416" />
            <rect x="8" y="25" width="22" height="60" fill="#1B4332" rx="4" />
            <rect x="170" y="25" width="22" height="60" fill="#1B4332" rx="4" />
            <ellipse cx="45" cy="72" rx="16" ry="24" fill="#9B2226" />
            <ellipse cx="43" cy="70" rx="12" ry="18" fill="#E63946" />
            <ellipse cx="62" cy="76" rx="14" ry="20" fill="#9B2226" />
            <ellipse cx="60" cy="74" rx="10" ry="15" fill="#E63946" />
            <ellipse cx="95" cy="78" rx="16" ry="22" fill="#38B000" />
            <ellipse cx="95" cy="75" rx="12" ry="16" fill="#70E000" />
            <ellipse cx="115" cy="76" rx="16" ry="24" fill="#38B000" />
            <ellipse cx="115" cy="73" rx="12" ry="18" fill="#80ED99" />
            <ellipse cx="145" cy="74" rx="16" ry="24" fill="#D97706" />
            <ellipse cx="145" cy="72" rx="12" ry="18" fill="#F59E0B" />
          </svg>
        `
      },
      {
        id: 'theme_jungle',
        key: 'jungle',
        name: 'Jungle Style',
        subtitle: 'Hutan Tropis Rimbun & Akar Gantung',
        description: 'Menampilkan kesan hutan tropis yang rimbun dan lebat dengan pertumbuhan tanaman yang lebih bebas serta alami.',
        price: 620,
        svg: `
          <svg width="100%" height="110" viewBox="0 0 200 110" style="border-radius: 8px; display: block;">
            <defs>
              <linearGradient id="bg_jungle_svg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#02130E" />
                <stop offset="100%" stop-color="#104231" />
              </linearGradient>
            </defs>
            <rect width="200" height="110" fill="url(#bg_jungle_svg)" />
            <path d="M20,0 Q25,35 15,65" stroke="#082A1E" stroke-width="3" fill="none" />
            <path d="M60,0 Q50,40 65,70" stroke="#082A1E" stroke-width="4" fill="none" />
            <path d="M140,0 Q150,45 135,75" stroke="#082A1E" stroke-width="4" fill="none" />
            <path d="M185,0 Q175,35 190,60" stroke="#082A1E" stroke-width="3" fill="none" />
            <rect y="82" width="200" height="28" fill="#382516" />
            <path d="M35,0 Q50,45 75,85" stroke="#2B1A0E" stroke-width="10" fill="none" stroke-linecap="round" />
            <path d="M165,0 Q150,45 125,84" stroke="#2B1A0E" stroke-width="10" fill="none" stroke-linecap="round" />
            <path d="M55,45 Q70,70 95,85" stroke="#3D2516" stroke-width="6" fill="none" stroke-linecap="round" />
            <ellipse cx="65" cy="55" rx="16" ry="26" fill="#2D6A4F" transform="rotate(-20 65 55)" />
            <ellipse cx="66" cy="53" rx="10" ry="18" fill="#52B788" transform="rotate(-20 66 53)" />
            <ellipse cx="140" cy="55" rx="16" ry="26" fill="#2D6A4F" transform="rotate(20 140 55)" />
            <ellipse cx="139" cy="53" rx="10" ry="18" fill="#52B788" transform="rotate(20 139 53)" />
          </svg>
        `
      },
      {
        id: 'theme_biotope',
        key: 'biotope',
        name: 'Biotope Style',
        subtitle: 'Ekosistem Rawa Hitam & Daun Tanin',
        description: 'Meniru ekosistem alami tertentu secara akurat, lengkap dengan jenis tanaman, substrat, dan ikan yang berasal dari habitat yang sama.',
        price: 780,
        svg: `
          <svg width="100%" height="110" viewBox="0 0 200 110" style="border-radius: 8px; display: block;">
            <defs>
              <linearGradient id="bg_biotope_svg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2E1703" />
                <stop offset="60%" stop-color="#5C3108" />
                <stop offset="100%" stop-color="#8A4B0E" />
              </linearGradient>
            </defs>
            <rect width="200" height="110" fill="url(#bg_biotope_svg)" />
            <polygon points="50,0 80,0 120,110 90,110" fill="#FFA200" opacity="0.12" />
            <path d="M0,84 Q50,81 100,85 T200,83 L200,110 L0,110 Z" fill="#D8C29D" />
            <rect y="98" width="200" height="12" fill="#C4AB82" />
            <ellipse cx="105" cy="85" rx="55" ry="8" fill="#4E311B" />
            <rect x="75" y="82" width="60" height="4" fill="#6D4527" />
            <ellipse cx="45" cy="86" rx="18" ry="8" fill="#6A3816" transform="rotate(-10 45 86)" />
            <line x1="30" y1="86" x2="60" y2="86" stroke="#3E1E09" stroke-width="1.5" />
            <ellipse cx="160" cy="88" rx="19" ry="9" fill="#5E3015" transform="rotate(8 160 88)" />
            <line x1="144" y1="88" x2="176" y2="88" stroke="#3E1E09" stroke-width="1.5" />
            <line x1="20" y1="84" x2="20" y2="30" stroke="#6A5C3D" stroke-width="2.5" />
            <line x1="26" y1="84" x2="26" y2="38" stroke="#52462E" stroke-width="2.5" />
            <line x1="185" y1="84" x2="185" y2="28" stroke="#6A5C3D" stroke-width="2.5" />
          </svg>
        `
      }
    ];

    container.innerHTML = `
      <!-- User Balance Bar & Info -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 9px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Saldo Koin:</span>
          <span class="coin-icon-gold"></span>
          <strong style="color: var(--color-gold-coin); font-size: 13px;">${formatNumber(prof.coins)} Koin</strong>
        </div>
        <div style="color: #80ED99; font-weight: 700; font-size: 12px;">
          🌿 Mengubah background air, pasir substrat & hardscape estetika tangki!
        </div>
      </div>

      <div class="cards-grid">
        ${themes.map((t) => {
          const isCurrent = currentTheme === t.key;
          const isUnlocked = storage.isThemeUnlocked(t.id);

          return `
            <div class="item-card" style="${isCurrent ? 'border-color: #80ED99; box-shadow: 0 0 12px rgba(128, 237, 153, 0.3);' : ''}">
              <div class="card-header-badge">
                <span class="badge-rarity uncommon">TEMA AQUASCAPE</span>
                ${
                  isCurrent
                    ? '<span style="font-size: 11px; font-weight: 800; color: #80ED99;">✓ Aktif Dipasang</span>'
                    : isUnlocked
                    ? '<span style="font-size: 11px; font-weight: 800; color: #90E0EF;">Dimiliki</span>'
                    : `<span style="font-size: 11px; font-weight: 800; color: #FFD166;">Terkunci</span>`
                }
              </div>

              <div class="card-img-preview" style="padding: 4px; background: rgba(0,0,0,0.2);">
                ${t.svg}
              </div>

              <div class="card-info">
                <div class="card-title">${t.name}</div>
                <div style="font-size: 11px; font-weight: 700; color: #80ED99; margin-top: 1px;">${t.subtitle}</div>
                <div class="card-desc" style="margin-top: 6px; font-size: 11px; line-height: 1.4;">${t.description}</div>
              </div>

              <div class="card-footer">
                <div class="price-tag">
                  ${
                    isUnlocked || t.price === 0
                      ? '<span style="color: #80ED99; font-size: 12px; font-weight: 700;">Gratis</span>'
                      : `
                        <span class="coin-icon-gold"></span>
                        <span>${formatCoins(t.price)}</span>
                      `
                  }
                </div>
                ${
                  isCurrent
                    ? `<button class="btn-buy" disabled style="background: rgba(128, 237, 153, 0.2); border: 1px solid #80ED99; color: #80ED99; cursor: default;">✓ Terpasang</button>`
                    : isUnlocked
                    ? `<button class="btn-buy btn-switch-theme" data-theme-key="${t.key}" style="background: linear-gradient(135deg, #2D6A4F, #52B788);">Gunakan Tema</button>`
                    : `<button class="btn-buy btn-buy-theme" data-theme-id="${t.id}" data-theme-key="${t.key}">Buka & Pasang</button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind switch theme
    container.querySelectorAll('.btn-switch-theme').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const themeKey = (e.currentTarget as HTMLElement).dataset.themeKey;
        if (!themeKey) return;
        const res = storage.setAquascapeTheme(themeKey);
        if (res.success) {
          Toast.show(res.message, 'success');
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });

    // Bind buy & apply theme
    container.querySelectorAll('.btn-buy-theme').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const themeId = (e.currentTarget as HTMLElement).dataset.themeId;
        if (!themeId) return;
        const res = await storage.buyItem(themeId, 1);
        if (res.success) {
          Toast.show(res.message, 'success');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }

  private renderItemShop(container: Element, category: 'food' | 'decoration'): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();
    const items = SHOP_ITEMS.filter((i) => i.category === category);
    const decoCount = (aq.decorations || []).length;
    const isDecoFull = category === 'decoration' && decoCount >= 6;

    container.innerHTML = `
      <!-- User Balance Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 9px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-text-secondary);">Saldo Koin:</span>
          <span class="coin-icon-gold"></span>
          <strong style="color: var(--color-gold-coin); font-size: 13px;">${formatNumber(prof.coins)} Koin</strong>
        </div>
        <div>
          ${
            category === 'food'
              ? '<span style="color: var(--color-text-muted); font-size: 11px;">Nutrisi untuk mempercepat tumbuh & menjaga kesehatan</span>'
              : `<span style="color: var(--color-text-secondary); font-size: 11px;">Tata Letak Aquascape:</span>
                 <strong style="color: ${isDecoFull ? '#FF758F' : '#80ED99'}; font-size: 12px; margin-left: 4px;">
                   🌿 ${decoCount} / 6 Elemen (${isDecoFull ? 'Penuh Ideal' : 'Rapi & Lega'})
                 </strong>`
          }
        </div>
      </div>

      <div class="cards-grid">
        ${items.map((item) => {
          return `
            <div class="item-card">
              <div class="card-img-preview" style="background: rgba(22, 134, 154, 0.15);">
                <span style="font-size: 38px;">${
                  category === 'food' ? '🍲' : '🌿'
                }</span>
              </div>
              <div class="card-info">
                <div class="card-title">${item.name}</div>
                <div class="card-desc">${item.description}</div>
              </div>
              <div class="card-footer">
                <div class="price-tag">
                  <span class="coin-icon-gold"></span>
                  <span>${formatCoins(item.price)}</span>
                </div>
                <button class="btn-buy" data-item-id="${item.id}" ${isDecoFull ? 'disabled style="opacity: 0.5;"' : ''}>
                  ${isDecoFull ? 'Aquascape Penuh (6/6)' : category === 'decoration' ? 'Beli & Tanam' : 'Beli'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-buy').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const itemId = (e.currentTarget as HTMLElement).dataset.itemId;
        if (!itemId) return;

        const res = await storage.buyItem(itemId, 1);
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
