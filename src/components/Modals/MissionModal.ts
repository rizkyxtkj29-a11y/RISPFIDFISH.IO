import { storage } from '../../services/storageService';
import { formatCoins } from '../../utils/formatters';
import { Toast } from '../Toast';
import confetti from 'canvas-confetti';

export class MissionModal {
  private overlay: HTMLElement;
  private currentTab: 'missions' | 'achievements' = 'missions';

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 22px;">🎯</span>
            <h2>Misi Harian & Pencapaian</h2>
          </div>
          <button class="modal-close-btn" id="mission-close-btn">✕</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="missions">📅 Misi Harian</button>
          <button class="tab-btn" data-tab="achievements">🏆 Pencapaian Prestasi</button>
        </div>
        <div class="modal-body" id="mission-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#mission-close-btn');
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
    const body = this.overlay.querySelector('#mission-body');
    if (!body) return;

    if (this.currentTab === 'missions') {
      this.renderMissions(body);
    } else {
      this.renderAchievements(body);
    }
  }

  private renderMissions(container: Element): void {
    const missions = storage.getMissions();
    const prof = storage.getProfile();

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Daily Reset Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(11, 83, 103, 0.35); border: 1px solid rgba(128, 237, 153, 0.3); border-radius: 8px; padding: 10px 14px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🔄</span>
            <div>
              <strong style="color: #80ED99;">Misi Di-Reset Setiap Hari!</strong>
              <div style="color: var(--color-text-secondary); font-size: 11px;">
                Misi selalu berganti harian dengan hadiah koin & XP semakin melimpah pada tingkat kesulitan tinggi (Level Anda: ${prof.level}).
              </div>
            </div>
          </div>
          <span style="padding: 4px 8px; border-radius: 6px; background: rgba(0, 0, 0, 0.3); color: #FFD166; font-size: 11px; font-weight: 700; border: 1px solid rgba(255, 209, 102, 0.3);">
            📅 Rotasi Harian
          </span>
        </div>

        ${missions.map((m) => {
          const progressPercent = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));
          
          let diffBadge = '<span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #80ED99; background: rgba(128, 237, 153, 0.15); border: 1px solid rgba(128, 237, 153, 0.3);">🟢 MUDAH</span>';
          if (m.difficulty === 'medium') {
            diffBadge = '<span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #48CAE4; background: rgba(72, 202, 228, 0.15); border: 1px solid rgba(72, 202, 228, 0.3);">🔵 MENENGAH</span>';
          } else if (m.difficulty === 'hard') {
            diffBadge = '<span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #C77DFF; background: rgba(199, 125, 255, 0.15); border: 1px solid rgba(199, 125, 255, 0.3);">🟣 SULIT</span>';
          } else if (m.difficulty === 'master') {
            diffBadge = '<span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #FFD166; background: rgba(255, 209, 102, 0.2); border: 1px solid rgba(255, 209, 102, 0.5);">👑 MASTER</span>';
          }

          let iconEmoji = '🎯';
          if (m.category === 'feed') iconEmoji = '🍲';
          else if (m.category === 'clean') iconEmoji = '🧼';
          else if (m.category === 'buy') iconEmoji = '🐠';
          else if (m.category === 'sell') iconEmoji = '💰';

          return `
            <div class="mission-card" style="border: 1px solid ${m.difficulty === 'master' ? 'rgba(255, 209, 102, 0.4)' : m.difficulty === 'hard' ? 'rgba(199, 125, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};">
              <div class="mission-left">
                <div class="mission-icon" style="font-size: 20px;">${iconEmoji}</div>
                <div class="mission-info">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px; font-weight: 700; color: #FFFFFF;">${m.title}</span>
                    ${diffBadge}
                  </div>
                  <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 2px;">${m.description}</div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                    <div class="mission-progress-bar">
                      <div class="mission-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: #80ED99;">
                      ${m.currentCount} / ${m.targetCount}
                    </span>
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                  <div style="font-size: 13px; font-weight: 800; color: var(--color-gold-coin); display: flex; align-items: center; gap: 4px;">
                    <span class="coin-icon-gold"></span>
                    +${formatCoins(m.rewardCoins)}
                  </div>
                  <div style="font-size: 11px; color: #80ED99; font-weight: 700;">+${m.rewardXp} XP</div>
                </div>
                ${
                  m.isClaimed
                    ? `<span style="font-size: 12px; color: #52B788; font-weight: 700;">✓ Selesai</span>`
                    : m.isCompleted
                    ? `<button class="btn-claim btn-claim-mission" data-mission-id="${m.id}">Klaim Hadiah</button>`
                    : `<span style="font-size: 11px; color: var(--color-text-muted);">Sedang Berjalan</span>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-claim-mission').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.missionId;
        if (!id) return;
        const res = storage.claimMission(id);
        if (res.success) {
          Toast.show(res.message, 'success');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }

  private renderAchievements(container: Element): void {
    const achs = storage.getAchievements();
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${achs.map((a) => {
          const progressPercent = Math.min(100, Math.round((a.currentCount / a.targetCount) * 100));
          return `
            <div class="mission-card">
              <div class="mission-left">
                <div class="mission-icon">🏆</div>
                <div class="mission-info">
                  <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">${a.title}</div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">${a.description}</div>
                  ${
                    a.rewardTitle
                      ? `<div style="font-size: 11px; color: #FFD166; font-weight: 600;">Gelar: "${a.rewardTitle}"</div>`
                      : ''
                  }
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <div class="mission-progress-bar">
                      <div class="mission-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: #80ED99;">
                      ${a.currentCount} / ${a.targetCount}
                    </span>
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                <div style="font-size: 12px; font-weight: 800; color: var(--color-gold-coin); display: flex; align-items: center; gap: 4px;">
                  <span class="coin-icon-gold"></span>
                  +${formatCoins(a.rewardCoins)}
                </div>
                ${
                  a.isClaimed
                    ? `<span style="font-size: 12px; color: #52B788; font-weight: 700;">✓ Terbuka</span>`
                    : a.isUnlocked
                    ? `<button class="btn-claim btn-claim-ach" data-ach-id="${a.id}">Klaim</button>`
                    : `<span style="font-size: 11px; color: var(--color-text-muted);">Terkunci</span>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-claim-ach').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.achId;
        if (!id) return;
        const res = storage.claimAchievement(id);
        if (res.success) {
          Toast.show(res.message, 'success');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      });
    });
  }
}
