import { storage } from '../../services/storageService';
import { isSupabaseConfigured } from '../../services/supabase';
import { formatCoins } from '../../utils/formatters';
import { Toast } from '../Toast';

export class ProfileModal {
  private overlay: HTMLElement;
  private authTab: 'profile' | 'auth' = 'profile';
  private authMode: 'login' | 'register' = 'login';

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-window" style="max-width: 640px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span style="font-size: 22px;">👤</span>
            <h2>Profil & Sinkronisasi Akun</h2>
          </div>
          <button class="modal-close-btn" id="profile-close-btn">✕</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="profile">📊 Ringkasan Profil</button>
          <button class="tab-btn" data-tab="auth">🌐 Cloud Sync (Supabase)</button>
        </div>
        <div class="modal-body" id="profile-body"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.overlay.querySelector('#profile-close-btn');
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
        this.authTab = target.dataset.tab as any;
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
    const body = this.overlay.querySelector('#profile-body');
    if (!body) return;

    if (this.authTab === 'profile') {
      this.renderProfileTab(body);
    } else {
      this.renderAuthTab(body);
    }
  }

  private renderProfileTab(container: Element): void {
    const prof = storage.getProfile();
    const fishCount = storage.getFishList().length;
    const discoveredCount = storage.getDiscoveredSpecies().size;
    const txs = storage.getTransactions().slice(0, 5);

    container.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: center; background: rgba(22, 134, 154, 0.15); padding: 18px; border-radius: var(--radius-md);">
        <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, var(--color-aqua-green), var(--color-ocean-blue)); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; border: 2px solid #FFFFFF;">
          ${prof.username.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="text" id="username-edit-input" value="${prof.username}"
              style="padding: 4px 8px; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #FFF; font-weight: 800; font-size: 16px; width: 170px;" />
            <button id="btn-save-username" style="padding: 4px 8px; background: var(--color-ocean-blue); color: #fff; border-radius: 6px; font-size: 11px; font-weight: 700;">Ubah</button>
          </div>
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
            Status Akun: <strong style="color: ${storage.isOnline() ? '#80ED99' : '#FFD166'};">${storage.isOnline() ? '🌐 Terhubung ke Supabase' : '💾 Mode Tamu / Offline Dev'}</strong>
          </div>
        </div>
      </div>

      <div class="detail-specs-grid" style="margin-top: 10px;">
        <div class="spec-box">
          <span class="spec-label">Level Pemain</span>
          <span class="spec-val">Level ${prof.level}</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Total Koin</span>
          <span class="spec-val" style="color: var(--color-gold-coin); display: flex; align-items: center; gap: 5px;">
            <span class="coin-icon-gold"></span>
            ${formatCoins(prof.coins)}
          </span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Ikan Dimiliki</span>
          <span class="spec-val">${fishCount} Ekor</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Spesies Ditemukan</span>
          <span class="spec-val">${discoveredCount} / 14 Spesies</span>
        </div>
      </div>

      <div style="margin-top: 10px;">
        <h4 style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
          Riwayat Transaksi Terakhir (Audit Ledger)
        </h4>
        <div style="display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto;">
          ${
            txs.length === 0
              ? `<div style="font-size: 11px; color: var(--color-text-muted);">Belum ada riwayat transaksi.</div>`
              : txs.map((tx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; font-size: 11px;">
                  <span>${tx.description}</span>
                  <strong style="color: ${tx.amount >= 0 ? '#80ED99' : '#FF758F'};">
                    ${tx.amount >= 0 ? '+' : ''}${formatCoins(tx.amount)}
                  </strong>
                </div>
              `).join('')
          }
        </div>
      </div>
    `;

    // Save username
    container.querySelector('#btn-save-username')?.addEventListener('click', () => {
      const input = container.querySelector('#username-edit-input') as HTMLInputElement;
      if (input && input.value.trim()) {
        storage.setGuestUsername(input.value.trim());
        Toast.show(`Nama berhasil diubah menjadi "${input.value.trim()}"`, 'success');
      }
    });
  }

  private renderAuthTab(container: Element): void {
    const isOnline = storage.isOnline();
    const authUser = storage.getAuthUser();

    if (isOnline && authUser) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <span style="font-size: 44px;">🌐</span>
          <h3 style="margin-top: 10px; color: #80ED99;">Akun Supabase Terhubung</h3>
          <p style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">
            Email: <strong>${authUser.email || 'Terdaftar'}</strong>
          </p>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 8px; line-height: 1.4;">
            Seluruh transaksi, ikan, dan progres akuarium Anda tersinkronisasi otomatis dengan database PostgreSQL Supabase dengan perlindungan Row Level Security (RLS).
          </p>
          <button id="btn-auth-signout" class="btn-sell" style="margin-top: 20px; padding: 10px 24px;">
            Keluar Akun (Sign Out)
          </button>
        </div>
      `;

      container.querySelector('#btn-auth-signout')?.addEventListener('click', async () => {
        await storage.signOut();
        Toast.show('Berhasil keluar akun.', 'info');
        this.renderTabContent();
      });
      return;
    }

    if (!isSupabaseConfigured) {
      container.innerHTML = `
        <div style="background: rgba(255, 183, 3, 0.1); border: 1px solid rgba(255, 183, 3, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span style="font-size: 24px;">⚙️</span>
            <div>
              <h4 style="color: var(--color-gold-coin); font-size: 14px; font-weight: 800;">Mode Tamu / Offline Dev Aktif</h4>
              <p style="font-size: 12px; color: #FFF3C4; margin-top: 4px; line-height: 1.45;">
                Game saat ini berjalan lancar dengan penyimpanan lokal otomatis. Kredensial Supabase belum terdeteksi pada <code>.env</code>.
              </p>
            </div>
          </div>

          <div style="margin-top: 14px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 11px; line-height: 1.5; color: var(--color-text-secondary);">
            <strong>Untuk Mengaktifkan Database Supabase:</strong><br/>
            1. Buka <code>.env</code> di root project game ini.<br/>
            2. Masukkan URL & Anon Key dari project Supabase Anda:<br/>
            <code>VITE_SUPABASE_URL=https://xxxx.supabase.co</code><br/>
            <code>VITE_SUPABASE_ANON_KEY=eyJh...</code><br/>
            3. Jalankan SQL migration yang sudah disiapkan di folder <code>supabase/migrations/</code>.
          </div>
        </div>
      `;
      return;
    }

    // Form if Supabase is configured but user is not signed in
    container.innerHTML = `
      <div class="auth-form">
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 10px;">
          <button id="btn-toggle-login" class="tab-btn ${this.authMode === 'login' ? 'active' : ''}">Masuk (Login)</button>
          <button id="btn-toggle-register" class="tab-btn ${this.authMode === 'register' ? 'active' : ''}">Daftar Akun Baru</button>
        </div>

        ${
          this.authMode === 'register'
            ? `
              <div class="form-group">
                <label>Username Akuaris</label>
                <input type="text" id="auth-username" class="form-input" placeholder="Contoh: RajaSungai99" />
              </div>
            `
            : ''
        }

        <div class="form-group">
          <label>Alamat Email</label>
          <input type="email" id="auth-email" class="form-input" placeholder="akuaris@gmail.com" />
        </div>

        <div class="form-group">
          <label>Kata Sandi</label>
          <input type="password" id="auth-password" class="form-input" placeholder="Minimal 6 karakter" />
        </div>

        <button id="btn-auth-submit" class="btn-submit">
          ${this.authMode === 'login' ? 'Masuk ke Game' : 'Daftar & Mulai Petualangan'}
        </button>
      </div>
    `;

    container.querySelector('#btn-toggle-login')?.addEventListener('click', () => {
      this.authMode = 'login';
      this.renderTabContent();
    });

    container.querySelector('#btn-toggle-register')?.addEventListener('click', () => {
      this.authMode = 'register';
      this.renderTabContent();
    });

    container.querySelector('#btn-auth-submit')?.addEventListener('click', async () => {
      const email = (container.querySelector('#auth-email') as HTMLInputElement)?.value.trim();
      const password = (container.querySelector('#auth-password') as HTMLInputElement)?.value;
      const username = (container.querySelector('#auth-username') as HTMLInputElement)?.value.trim() || 'Akuaris';

      if (!email || !password) {
        Toast.show('Mohon lengkapi email dan kata sandi.', 'error');
        return;
      }

      if (this.authMode === 'login') {
        const res = await storage.signInWithEmail(email, password);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      } else {
        const res = await storage.signUpWithEmail(email, password, username);
        if (res.success) {
          Toast.show(res.message, 'success');
          this.renderTabContent();
        } else {
          Toast.show(res.message, 'error');
        }
      }
    });
  }
}
