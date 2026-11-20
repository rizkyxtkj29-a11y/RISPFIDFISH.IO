import { storage } from '../services/storageService';
import { sound } from '../services/soundService';
import { formatNumber } from '../utils/formatters';
import { ShopModal } from './Modals/ShopModal';
import { InventoryModal } from './Modals/InventoryModal';
import { CollectionModal } from './Modals/CollectionModal';
import { MissionModal } from './Modals/MissionModal';
import { AquariumUpgradeModal } from './Modals/AquariumUpgradeModal';
import { ProfileModal } from './Modals/ProfileModal';
import { FishDetailModal } from './Modals/FishDetailModal';
import { PlayerFish } from '../types/game';
import { Toast } from './Toast';

export class HUD {
  private element: HTMLElement;
  private shopModal: ShopModal;
  private inventoryModal: InventoryModal;
  private collectionModal: CollectionModal;
  private missionModal: MissionModal;
  private upgradeModal: AquariumUpgradeModal;
  private profileModal: ProfileModal;
  private fishDetailModal: FishDetailModal;

  public onFeedRequested?: () => void;

  constructor() {
    this.shopModal = new ShopModal();
    this.inventoryModal = new InventoryModal();
    this.collectionModal = new CollectionModal();
    this.missionModal = new MissionModal();
    this.upgradeModal = new AquariumUpgradeModal();
    this.profileModal = new ProfileModal();
    this.fishDetailModal = new FishDetailModal();

    // Hook cross-modal triggers
    this.inventoryModal.onInspectFish = (fish: PlayerFish) => {
      this.fishDetailModal.open(fish);
    };

    this.element = document.createElement('div');
    this.element.id = 'hud-root';
    document.body.appendChild(this.element);

    this.render();
    this.bindEvents();

    // Re-render when game state changes
    storage.subscribe(() => {
      this.updateValues();
    });
  }

  public inspectFish(fish: PlayerFish): void {
    this.fishDetailModal.open(fish);
  }

  private render(): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();
    const fishCount = storage.getFishList().filter((f) => f.inAquarium).length;
    const isOnline = storage.isOnline();
    const xpPercent = Math.min(100, Math.round((prof.xp / prof.nextLevelXp) * 100));

    this.element.innerHTML = `
      <!-- TOP HUD -->
      <div class="hud-top">
        <div class="hud-section-left">
          <!-- Game Brand Badge -->
          <div class="brand-badge">
            <span class="brand-icon">🐠</span>
            <span class="brand-title">RISPFID FISH</span>
          </div>

          <!-- Profile & Level -->
          <div class="glass-panel profile-badge" id="btn-profile-badge">
            <div class="profile-avatar">${prof.username.charAt(0).toUpperCase()}</div>
            <div class="level-info">
              <span class="level-text">Lv.${prof.level} ${prof.username}</span>
              <div class="xp-bar-container">
                <div class="xp-bar-fill" id="hud-xp-fill" style="width: ${xpPercent}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="hud-section-center">
          <!-- Coins Badge -->
          <div class="glass-panel coins-badge">
            <div class="coin-icon">K</div>
            <span id="hud-coins-text">${formatNumber(prof.coins)}</span>
          </div>

          <!-- Water Quality -->
          <div class="glass-panel water-badge">
            <span style="font-size: 13px;">💧</span>
            <div class="water-indicator-bar">
              <div class="water-indicator-fill" id="hud-water-fill" style="width: ${aq.waterQuality}%;"></div>
            </div>
            <button class="btn-clean-mini" id="btn-quick-clean">Kuras</button>
          </div>

          <!-- Capacity -->
          <div class="glass-panel capacity-badge">
            <span id="hud-capacity-text">🐡 ${fishCount}/${aq.capacity}</span>
          </div>
        </div>

        <div class="hud-section-right">
          <!-- Cloud Sync Status -->
          <div class="sync-badge ${isOnline ? 'online' : 'offline'}" id="btn-sync-badge">
            <span class="sync-dot"></span>
            <span>${isOnline ? 'Supabase' : 'Mode Tamu'}</span>
          </div>

          <!-- Volume & Sound Controls -->
          <div class="volume-control-box">
            <button class="btn-icon" id="btn-sound-toggle" title="Suara On/Off">
              <span id="sound-icon-text">${sound.getMuted() ? '🔇' : '🔊'}</span>
            </button>
            <div class="volume-slider-wrapper" id="volume-slider-wrapper">
              <input 
                type="range" 
                id="hud-volume-slider" 
                min="0" 
                max="100" 
                value="${Math.round(sound.getVolume() * 100)}" 
                class="volume-slider"
                title="Atur Volume Musik & Suara Air"
              />
              <span class="volume-percent-label" id="volume-percent-label">${Math.round(sound.getVolume() * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM NAVIGATION DOCK -->
      <div class="hud-bottom">
        <button class="nav-item nav-item-feed" id="nav-btn-feed">
          <span style="font-size: 18px;">🍲</span>
          <span>Beri Makan</span>
        </button>

        <button class="nav-item" id="nav-btn-shop">
          <span style="font-size: 18px;">🛒</span>
          <span>Toko</span>
        </button>

        <button class="nav-item" id="nav-btn-inventory">
          <span style="font-size: 18px;">🎒</span>
          <span>Inventaris</span>
        </button>

        <button class="nav-item" id="nav-btn-collection">
          <span style="font-size: 18px;">📖</span>
          <span>Ensiklopedia</span>
        </button>

        <button class="nav-item" id="nav-btn-upgrade">
          <span style="font-size: 18px;">⚙️</span>
          <span>Fasilitas</span>
        </button>

        <button class="nav-item" id="nav-btn-missions">
          <span style="font-size: 18px;">🎯</span>
          <span>Misi</span>
          <span class="nav-badge-dot" id="mission-notification-dot" style="display: none;"></span>
        </button>

        <button class="nav-item" id="nav-btn-profile">
          <span style="font-size: 18px;">👤</span>
          <span>Akun</span>
        </button>
      </div>
    `;
  }

  private updateValues(): void {
    const prof = storage.getProfile();
    const aq = storage.getAquarium();
    const fishCount = storage.getFishList().filter((f) => f.inAquarium).length;
    const isOnline = storage.isOnline();
    const xpPercent = Math.min(100, Math.round((prof.xp / prof.nextLevelXp) * 100));

    const coinsEl = document.getElementById('hud-coins-text');
    if (coinsEl) coinsEl.textContent = formatNumber(prof.coins);

    const waterFill = document.getElementById('hud-water-fill');
    if (waterFill) waterFill.style.width = `${aq.waterQuality}%`;

    const xpFill = document.getElementById('hud-xp-fill');
    if (xpFill) xpFill.style.width = `${xpPercent}%`;

    const capEl = document.getElementById('hud-capacity-text');
    if (capEl) capEl.textContent = `🐡 ${fishCount}/${aq.capacity}`;

    const syncEl = document.getElementById('btn-sync-badge');
    if (syncEl) {
      syncEl.className = `sync-badge ${isOnline ? 'online' : 'offline'}`;
      syncEl.innerHTML = `<span class="sync-dot"></span><span>${isOnline ? 'Supabase' : 'Mode Tamu'}</span>`;
    }

    // Check if missions or achievements have claimable rewards
    const hasClaimable = storage.getMissions().some((m) => m.isCompleted && !m.isClaimed) ||
                         storage.getAchievements().some((a) => a.isUnlocked && !a.isClaimed);
    const dot = document.getElementById('mission-notification-dot');
    if (dot) {
      dot.style.display = hasClaimable ? 'block' : 'none';
    }
  }

  private bindEvents(): void {
    // Navigation items
    document.getElementById('nav-btn-feed')?.addEventListener('click', () => {
      if (this.onFeedRequested) {
        this.onFeedRequested();
      } else {
        const res = storage.feedAquarium();
        Toast.show(res.message, res.success ? 'success' : 'info');
      }
    });

    document.getElementById('nav-btn-shop')?.addEventListener('click', () => {
      this.shopModal.open();
    });

    document.getElementById('nav-btn-inventory')?.addEventListener('click', () => {
      this.inventoryModal.open();
    });

    document.getElementById('nav-btn-collection')?.addEventListener('click', () => {
      this.collectionModal.open();
    });

    document.getElementById('nav-btn-upgrade')?.addEventListener('click', () => {
      this.upgradeModal.open();
    });

    document.getElementById('nav-btn-missions')?.addEventListener('click', () => {
      this.missionModal.open();
    });

    document.getElementById('nav-btn-profile')?.addEventListener('click', () => {
      this.profileModal.open();
    });

    // Top buttons
    document.getElementById('btn-profile-badge')?.addEventListener('click', () => {
      this.profileModal.open();
    });

    document.getElementById('btn-sync-badge')?.addEventListener('click', () => {
      this.profileModal.open();
    });

    document.getElementById('btn-quick-clean')?.addEventListener('click', async () => {
      const res = await storage.cleanAquarium();
      if (res.success) {
        Toast.show(res.message, 'success');
      } else {
        Toast.show(res.message, 'error');
      }
    });

    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon-text');
    const volumeSlider = document.getElementById('hud-volume-slider') as HTMLInputElement | null;
    const volumeLabel = document.getElementById('volume-percent-label');

    soundToggleBtn?.addEventListener('click', () => {
      const muted = sound.toggleMute();
      if (soundIcon) soundIcon.textContent = muted ? '🔇' : '🔊';
      if (volumeSlider && volumeLabel) {
        if (muted) {
          volumeLabel.textContent = '0%';
        } else {
          volumeLabel.textContent = `${Math.round(sound.getVolume() * 100)}%`;
          volumeSlider.value = String(Math.round(sound.getVolume() * 100));
        }
      }
      Toast.show(muted ? 'Suara dinonaktifkan' : 'Musik santai & gemericik air aktif 🎵🌊', 'info');
    });

    volumeSlider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const volNum = parseInt(target.value, 10);
      sound.setVolume(volNum / 100);
      if (volumeLabel) volumeLabel.textContent = `${volNum}%`;
      if (soundIcon) soundIcon.textContent = volNum === 0 || sound.getMuted() ? '🔇' : '🔊';
    });
  }
}
