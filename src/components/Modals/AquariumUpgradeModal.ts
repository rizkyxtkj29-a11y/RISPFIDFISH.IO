import { storage } from '../../services/storageService';
import { formatCoins } from '../../utils/formatters';
import { Toast } from '../Toast';
import confetti from 'canvas-confetti';

export class AquariumUpgradeModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window" style="max-width: 660px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 20px;">⚙️</span>
            <h2>Fasilitas & Pemeliharaan Akuarium</h2>
          </div>
          <button class="modal-close-btn" id="aq-upgrade-close">✕</button>
        </div>
        <div class="modal-body" id="aq-upgrade-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#aq-upgrade-close');
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
    const body = this.overlay.querySelector('#aq-upgrade-body');
    if (!body) return;

    const aq = storage.getAquarium();
    const fishCount = storage.getFishList().filter((f) => f.inAquarium).length;
    const filterCost = aq.filterLevel * 350;
    const aeratorCost = aq.aeratorLevel * 450;
    const capacityCost = (aq.capacity - 2) * 200;

    body.innerHTML = `
      <div style="background: rgba(22, 134, 154, 0.15); border: 1px solid rgba(22, 134, 154, 0.35); border-radius: var(--radius-md); padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 16px; font-weight: 800; color: #FFFFFF;">${aq.name}</h3>
            <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">
              Kapasitas Terisi: <strong style="color: #80ED99;">${fishCount} / ${aq.capacity} Ekor</strong> | Suhu Air: <strong>${aq.temperature}°C</strong>
            </p>
          </div>
          <button class="btn-buy" id="btn-clean-tank-action" style="padding: 8px 14px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <span>💧</span>
            <span>Kuras Air (25 Koin)</span>
          </button>
        </div>

        <div style="margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="font-weight: 600;">Kejernihan & Kualitas Air</span>
            <span style="color: #00B4D8; font-weight: 800;">${Math.round(aq.waterQuality)}%</span>
          </div>
          <div style="height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
            <div style="width: ${aq.waterQuality}%; height: 100%; background: linear-gradient(90deg, #00B4D8, #90E0EF);"></div>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
        <!-- Filter Upgrade -->
        <div class="mission-card">
          <div class="mission-left">
            <div class="mission-icon">🔄</div>
            <div class="mission-info">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">Filter Biologis Pro</div>
                <span class="badge-rarity rare" style="font-size: 9px;">LEVEL ${aq.filterLevel} / 5</span>
              </div>
              <div style="font-size: 12px; color: #80ED99; font-weight: 600; margin-top: 2px;">
                ${aq.filterLevel >= 5 ? 'Status: Maksimal (Level 5/5)' : `Lv. ${aq.filterLevel} ➔ Lv. ${aq.filterLevel + 1} (+15% Daya Tahan Air)`}
              </div>
              <!-- Segmented Level Gauge -->
              <div style="display: flex; gap: 4px; margin: 4px 0;">
                ${[1, 2, 3, 4, 5].map((lvl) => `
                  <div style="flex: 1; height: 5px; border-radius: 3px; background: ${lvl <= aq.filterLevel ? 'linear-gradient(90deg, #52B788, #80ED99)' : 'rgba(255,255,255,0.1)'};"></div>
                `).join('')}
              </div>
              <div style="font-size: 11px; color: var(--color-text-muted);">
                Menampilkan hardware unit filter di tangki & memperlambat laju kekeruhan air.
              </div>
              <div style="margin-top: 4px; font-size: 11px; color: #80ED99;">
                🌿 Efek di Akuarium: Menampilkan unit filter bio-sponge di sudut kiri & riak air.
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${
              aq.filterLevel >= 5
                ? `<span style="font-size: 12px; color: #80ED99; font-weight: 700;">Level Maksimal</span>`
                : `<button class="btn-buy" id="btn-upgrade-filter" style="display: flex; align-items: center; gap: 6px;">
                    <span class="coin-icon-gold"></span>
                    <span>Upgrade (${formatCoins(filterCost)})</span>
                   </button>`
            }
          </div>
        </div>

        <!-- Aerator Upgrade -->
        <div class="mission-card">
          <div class="mission-left">
            <div class="mission-icon">💨</div>
            <div class="mission-info">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">Aerator Turbo Silent</div>
                <span class="badge-rarity epic" style="font-size: 9px;">LEVEL ${aq.aeratorLevel} / 5</span>
              </div>
              <div style="font-size: 12px; color: #00B4D8; font-weight: 600; margin-top: 2px;">
                ${aq.aeratorLevel >= 5 ? 'Status: Maksimal (Tirai Oksigen Penuh)' : `Lv. ${aq.aeratorLevel} ➔ Lv. ${aq.aeratorLevel + 1} (${aq.aeratorLevel + 1} Titik Diffuser Pasir)`}
              </div>
              <!-- Segmented Level Gauge -->
              <div style="display: flex; gap: 4px; margin: 4px 0;">
                ${[1, 2, 3, 4, 5].map((lvl) => `
                  <div style="flex: 1; height: 5px; border-radius: 3px; background: ${lvl <= aq.aeratorLevel ? 'linear-gradient(90deg, #0077B6, #48CAE4)' : 'rgba(255,255,255,0.1)'};"></div>
                `).join('')}
              </div>
              <div style="font-size: 11px; color: var(--color-text-muted);">
                Menambah diffuser batu aerasi fisik di dasar pasir & memperbanyak gelembung oksigen.
              </div>
              <div style="margin-top: 4px; font-size: 11px; color: #00B4D8;">
                🌿 Efek di Akuarium: Menambah batu diffuser fisik ke-${Math.min(5, aq.aeratorLevel + 1)} di pasir & semburan gelembung.
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${
              aq.aeratorLevel >= 5
                ? `<span style="font-size: 12px; color: #80ED99; font-weight: 700;">Level Maksimal</span>`
                : `<button class="btn-buy" id="btn-upgrade-aerator" style="display: flex; align-items: center; gap: 6px;">
                    <span class="coin-icon-gold"></span>
                    <span>Upgrade (${formatCoins(aeratorCost)})</span>
                   </button>`
            }
          </div>
        </div>

        <!-- Capacity Expansion -->
        <div class="mission-card">
          <div class="mission-left">
            <div class="mission-icon">📐</div>
            <div class="mission-info">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">Ekspansi Dimensi Akuarium</div>
                <span class="badge-rarity legendary" style="font-size: 9px;">
                  ${aq.capacity >= 20 ? 'BATAS MAKSIMAL' : 'KAPASITAS +3'}
                </span>
              </div>
              <div style="font-size: 12px; color: #FFD166; font-weight: 600; margin-top: 2px;">
                ${
                  aq.capacity >= 20
                    ? 'Kapasitas: 20 Ekor (Maksimal Optimal)'
                    : `Kapasitas: ${aq.capacity} ➔ ${Math.min(20, aq.capacity + 3)} Ekor (Batas: 20 Ekor)`
                }
              </div>
              <!-- Progress Bar -->
              <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 5px; margin: 4px 0; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #F4A261, #E76F51); width: ${(aq.capacity / 20) * 100}%; height: 100%;"></div>
              </div>
              <div style="font-size: 11px; color: var(--color-text-muted);">
                ${
                  aq.capacity >= 20
                    ? 'Akuarium telah mencapai batas kapasitas maksimal 20 ekor ikan agar ekosistem tetap nyaman dan tidak membuat pusing.'
                    : 'Memperluas ruang ikan & memunculkan formasi bebatuan sungai alami baru di dasar pasir (maksimal 20 ekor).'
                }
              </div>
              <div style="margin-top: 4px; font-size: 11px; color: #FFD166;">
                🌿 Efek di Akuarium: Menambah hamparan batu kali alami (river rocks) di dasar akuarium & memperluas ruang renang.
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${
              aq.capacity >= 20
                ? `<span style="font-size: 12px; color: #80ED99; font-weight: 700;">Level Maksimal (20 Ikan)</span>`
                : `<button class="btn-buy" id="btn-upgrade-capacity" style="display: flex; align-items: center; gap: 6px;">
                    <span class="coin-icon-gold"></span>
                    <span>Perluas (${formatCoins(capacityCost)})</span>
                   </button>`
            }
          </div>
        </div>
      </div>
    `;

    // Clean tank
    body.querySelector('#btn-clean-tank-action')?.addEventListener('click', async () => {
      const res = await storage.cleanAquarium();
      if (res.success) {
        Toast.show(res.message, 'success');
        this.render();
      } else {
        Toast.show(res.message, 'error');
      }
    });

    // Upgrade filter
    body.querySelector('#btn-upgrade-filter')?.addEventListener('click', async () => {
      const res = await storage.buyItem('upgrade_filter_sponge');
      if (res.success) {
        Toast.show(res.message, 'success');
        confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
        this.render();
      } else {
        Toast.show(res.message, 'error');
      }
    });

    // Upgrade aerator
    body.querySelector('#btn-upgrade-aerator')?.addEventListener('click', async () => {
      const res = await storage.buyItem('upgrade_aerator_silent');
      if (res.success) {
        Toast.show(res.message, 'success');
        confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
        this.render();
      } else {
        Toast.show(res.message, 'error');
      }
    });

    // Upgrade capacity
    body.querySelector('#btn-upgrade-capacity')?.addEventListener('click', async () => {
      const res = await storage.buyItem('upgrade_capacity_small');
      if (res.success) {
        Toast.show(res.message, 'success');
        confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
        this.render();
      } else {
        Toast.show(res.message, 'error');
      }
    });
  }
}
