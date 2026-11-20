import {
  PlayerProfile,
  AquariumData,
  PlayerFish,
  InventoryItem,
  Mission,
  Achievement,
  TransactionRecord,
  GrowthStage
} from '../types/game';
import { FISH_SPECIES_LIST, SPECIES_MAP } from '../data/fishSpecies';
import { SHOP_ITEMS, ITEM_MAP } from '../data/items';
import { INITIAL_DAILY_MISSIONS, INITIAL_ACHIEVEMENTS, generateDailyMissions } from '../data/missions';
import { supabase, isSupabaseConfigured } from './supabase';
import { sound } from './soundService';

type ChangeListener = () => void;

class StorageService {
  public static readonly MAX_CAPACITY: number = 20;
  public static readonly MAX_DECORATIONS: number = 6;

  private profile: PlayerProfile;
  private aquarium: AquariumData;
  private fishList: PlayerFish[] = [];
  private inventory: InventoryItem[] = [];
  private missions: Mission[] = [];
  private achievements: Achievement[] = [];
  private transactions: TransactionRecord[] = [];
  private discoveredSpecies: Set<string> = new Set();
  private unlockedThemes: Set<string> = new Set(['theme_nature']);
  private listeners: Set<ChangeListener> = new Set();

  private isOnlineSupabase: boolean = false;
  private authUser: { id: string; email?: string } | null = null;

  constructor() {
    this.profile = this.createDefaultProfile();
    this.aquarium = this.createDefaultAquarium();
    this.init();
  }

  private createDefaultProfile(): PlayerProfile {
    return {
      id: 'guest_user_' + Math.floor(1000 + Math.random() * 9000),
      username: 'Akuaris Nusantara',
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      coins: 500,
      isGuest: true,
      activeAquariumId: 'aq_default_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private createDefaultAquarium(): AquariumData {
    return {
      id: 'aq_default_1',
      userId: this.profile ? this.profile.id : 'guest',
      name: 'Akuarium Tawar Nusantara',
      capacity: 5,
      currentFishCount: 1,
      waterQuality: 100,
      filterLevel: 1,
      aeratorLevel: 1,
      temperature: 26.5,
      theme: 'nature',
      decorations: [
        {
          id: 'deco_vallisneria_1',
          type: 'plant',
          name: 'Vallisneria Asli',
          xPercent: 15,
          yPercent: 80,
          scale: 1,
          textureKey: 'plant_vallisneria'
        },
        {
          id: 'deco_rock_1',
          type: 'rock',
          name: 'Batu Karst Maros',
          xPercent: 82,
          yPercent: 88,
          scale: 1,
          textureKey: 'rock_karst'
        }
      ],
      lastCleanedAt: new Date().toISOString()
    };
  }

  public async init(): Promise<void> {
    // 1. Check Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          this.authUser = session.user;
          this.isOnlineSupabase = true;
          await this.loadFromSupabase(session.user.id);
          this.notify();
          return;
        }
      } catch (err) {
        console.warn('Gagal memverifikasi sesi Supabase, beralih ke mode offline:', err);
      }
    }

    // 2. Load LocalStorage fallback
    this.loadFromLocalStorage();
    this.notify();
  }

  private loadFromLocalStorage(): void {
    try {
      const savedProfile = localStorage.getItem('rispfid_profile');
      const savedAquarium = localStorage.getItem('rispfid_aquarium');
      const savedFish = localStorage.getItem('rispfid_fish');
      const savedInv = localStorage.getItem('rispfid_inventory');
      const savedMissions = localStorage.getItem('rispfid_missions');
      const savedAch = localStorage.getItem('rispfid_achievements');
      const savedTx = localStorage.getItem('rispfid_transactions');
      const savedDiscovery = localStorage.getItem('rispfid_discovery');

      if (savedProfile) {
        this.profile = JSON.parse(savedProfile);
      }

      if (savedAquarium) {
        this.aquarium = JSON.parse(savedAquarium);
        // Batasi kapasitas maksimal akuarium hanya di 20 ekor ikan
        this.aquarium.capacity = Math.min(StorageService.MAX_CAPACITY, this.aquarium.capacity || 5);
        if (!['nature', 'iwagumi', 'dutch', 'jungle', 'biotope'].includes(this.aquarium.theme)) {
          this.aquarium.theme = 'nature';
        }
      }

      const savedThemes = localStorage.getItem('rispfid_themes');
      if (savedThemes) {
        try {
          const list = JSON.parse(savedThemes);
          if (Array.isArray(list)) {
            list.forEach((t: string) => this.unlockedThemes.add(t));
          }
        } catch {}
      }
      this.unlockedThemes.add('theme_nature');

      if (savedFish) {
        this.fishList = JSON.parse(savedFish);
        // Normalize fish sizes so existing saves reflect real biological size immediately
        this.fishList.forEach((fish) => {
          const sp = SPECIES_MAP.get(fish.speciesId);
          if (sp) {
            const progress = Math.min(1, Math.max(0, (fish.ageSeconds || 0) / (sp.growthTimeSeconds || 120)));
            if (fish.stage === 'adult') {
              fish.currentSizeCm = sp.maxSizeCm;
            } else {
              fish.currentSizeCm = Math.round((sp.maxSizeCm * (0.32 + 0.68 * progress)) * 10) / 10;
            }
          }
        });
      } else {
        // Starter fish: Ikan Sumatra
        this.fishList = [
          {
            id: 'fish_starter_1',
            userId: this.profile.id,
            speciesId: 'tiger_barb',
            aquariumId: this.aquarium.id,
            nickname: 'Si Belang Sumatra',
            hunger: 85,
            health: 100,
            ageSeconds: 30,
            stage: 'small',
            currentSizeCm: 2.8,
            inAquarium: true,
            bornAt: new Date().toISOString(),
            lastFedAt: new Date().toISOString(),
            sellPrice: 35
          }
        ];
      }

      if (savedInv) {
        this.inventory = JSON.parse(savedInv);
      } else {
        // Starter inventory
        this.inventory = [
          {
            id: 'inv_starter_pellet',
            userId: this.profile.id,
            itemId: 'food_basic_pellet',
            category: 'food',
            name: 'Pelet Nutrisi Dasar',
            quantity: 20,
            description: 'Makanan harian bergizi seimbang untuk segala jenis ikan air tawar nusantara.',
            icon: 'cookie'
          }
        ];
      }

      if (savedMissions) {
        this.missions = JSON.parse(savedMissions);
      } else {
        this.missions = [...INITIAL_DAILY_MISSIONS];
      }
      this.checkAndPerformDailyReset();

      if (savedAch) {
        this.achievements = JSON.parse(savedAch);
      } else {
        this.achievements = [...INITIAL_ACHIEVEMENTS];
      }

      if (savedTx) {
        this.transactions = JSON.parse(savedTx);
      }

      if (savedDiscovery) {
        this.discoveredSpecies = new Set(JSON.parse(savedDiscovery));
      } else {
        this.discoveredSpecies = new Set(['tiger_barb']);
      }

      // Sync active fish count
      this.aquarium.currentFishCount = this.fishList.filter((f) => f.inAquarium).length;

      // Ensure decorations array exists
      if (!this.aquarium.decorations) {
        this.aquarium.decorations = [];
      }

      // Batasi aquascape agar tidak terlalu ramai (maksimal 6 elemen seimbang)
      if (this.aquarium.decorations.length > StorageService.MAX_DECORATIONS) {
        this.aquarium.decorations = this.aquarium.decorations.slice(0, StorageService.MAX_DECORATIONS);
      }

      // Auto-migrate any previously bought decorations in inventory to aquarium (up to MAX_DECORATIONS)
      this.inventory.forEach((invItem) => {
        if (invItem.category === 'decoration' && this.aquarium.decorations.length < StorageService.MAX_DECORATIONS) {
          const alreadyPlaced = this.aquarium.decorations.some(
            (d) => d.name === invItem.name || d.textureKey.includes(invItem.itemId.replace('deco_', ''))
          );
          if (!alreadyPlaced) {
            let textureKey = 'plant_vallisneria';
            let decoType: 'plant' | 'rock' | 'wood' | 'castle' = 'plant';
            if (invItem.itemId.includes('anubias')) {
              textureKey = 'plant_anubias';
              decoType = 'plant';
            } else if (invItem.itemId.includes('driftwood')) {
              textureKey = 'wood_driftwood';
              decoType = 'wood';
            } else if (invItem.itemId.includes('rock') || invItem.itemId.includes('karst')) {
              textureKey = 'rock_karst';
              decoType = 'rock';
            } else if (invItem.itemId.includes('ruin') || invItem.itemId.includes('sriwijaya')) {
              textureKey = 'ruin_sriwijaya';
              decoType = 'castle';
            }

            const candidateX = [16, 36, 68, 84, 28, 74];
            const xPercent = candidateX[this.aquarium.decorations.length % candidateX.length];

            this.aquarium.decorations.push({
              id: 'deco_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              type: decoType,
              name: invItem.name,
              xPercent,
              yPercent: 88,
              scale: 0.95,
              textureKey
            });
          }
        }
      });
    } catch (e) {
      console.error('Error loading LocalStorage:', e);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('rispfid_profile', JSON.stringify(this.profile));
      localStorage.setItem('rispfid_aquarium', JSON.stringify(this.aquarium));
      localStorage.setItem('rispfid_fish', JSON.stringify(this.fishList));
      localStorage.setItem('rispfid_inventory', JSON.stringify(this.inventory));
      localStorage.setItem('rispfid_missions', JSON.stringify(this.missions));
      localStorage.setItem('rispfid_achievements', JSON.stringify(this.achievements));
      localStorage.setItem('rispfid_transactions', JSON.stringify(this.transactions));
      localStorage.setItem('rispfid_discovery', JSON.stringify(Array.from(this.discoveredSpecies)));
    } catch (e) {
      console.error('Error saving LocalStorage:', e);
    }
  }

  private async loadFromSupabase(userId: string): Promise<void> {
    if (!supabase) return;
    try {
      const client = supabase as any;
      // 1. Profile & Wallet
      const { data: prof } = await client.from('profiles').select('*').eq('id', userId).single();
      const { data: wall } = await client.from('player_wallet').select('*').eq('user_id', userId).single();

      if (prof && wall) {
        this.profile = {
          id: prof.id,
          username: prof.username,
          avatarUrl: prof.avatar_url || undefined,
          level: prof.level,
          xp: prof.xp,
          nextLevelXp: prof.level * 100,
          coins: Number(wall.coins),
          isGuest: false,
          activeAquariumId: prof.active_aquarium_id || 'aq_online_1',
          createdAt: prof.created_at,
          updatedAt: prof.updated_at
        };
      }

      // 2. Aquarium
      const { data: aq } = await client.from('aquariums').select('*').eq('user_id', userId).single();
      if (aq) {
        this.aquarium = {
          id: aq.id,
          userId: aq.user_id,
          name: aq.name,
          capacity: Math.min(StorageService.MAX_CAPACITY, aq.capacity || 5),
          currentFishCount: 0,
          waterQuality: aq.water_quality,
          filterLevel: aq.filter_level,
          aeratorLevel: aq.aerator_level,
          temperature: Number(aq.temperature),
          theme: aq.theme,
          decorations: (aq.decorations as any) || [],
          lastCleanedAt: aq.last_cleaned_at
        };
      }

      // 3. Fish
      const { data: fishRows } = await client.from('player_fish').select('*').eq('user_id', userId);
      if (fishRows) {
        this.fishList = fishRows.map((f: any) => {
          const sp = SPECIES_MAP.get(f.species_id);
          const baseSell = sp ? sp.baseSellPrice : 30;
          return {
            id: f.id,
            userId: f.user_id,
            speciesId: f.species_id,
            aquariumId: f.aquarium_id,
            nickname: f.nickname,
            hunger: Number(f.hunger),
            health: Number(f.health),
            ageSeconds: f.age_seconds,
            stage: f.stage as GrowthStage,
            currentSizeCm: Number(f.current_size_cm),
            inAquarium: f.in_aquarium,
            bornAt: f.born_at,
            lastFedAt: f.last_fed_at,
            sellPrice: Math.round(baseSell * (f.stage === 'adult' ? 2.2 : f.stage === 'medium' ? 1.4 : 0.8))
          };
        });
        this.aquarium.currentFishCount = this.fishList.filter((f) => f.inAquarium).length;
        this.fishList.forEach((f) => this.discoveredSpecies.add(f.speciesId));
      }

      // 4. Inventory
      const { data: invRows } = await client.from('inventory').select('*').eq('user_id', userId);
      if (invRows) {
        this.inventory = invRows.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          itemId: item.item_id,
          category: item.category as any,
          name: item.name,
          quantity: item.quantity,
          description: item.description,
          icon: item.icon
        }));
      }

      // 5. Transactions
      const { data: txRows } = await client.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      if (txRows) {
        this.transactions = txRows.map((tx: any) => ({
          id: tx.id,
          userId: tx.user_id,
          type: tx.type as any,
          amount: tx.amount,
          balanceAfter: tx.balance_after,
          description: tx.description,
          createdAt: tx.created_at
        }));
      }

      this.missions = [...INITIAL_DAILY_MISSIONS];
      this.achievements = [...INITIAL_ACHIEVEMENTS];
      this.updateAchievementCounters();
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    }
  }

  // --- OBSERVER PATTERN ---
  public subscribe(fn: ChangeListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.saveToLocalStorage();
    this.listeners.forEach((fn) => fn());
  }

  // --- GETTERS ---
  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public getAquarium(): AquariumData {
    return { ...this.aquarium };
  }

  public getUnlockedThemes(): string[] {
    return Array.from(this.unlockedThemes);
  }

  public isThemeUnlocked(themeId: string): boolean {
    const key = themeId.startsWith('theme_') ? themeId : `theme_${themeId}`;
    return this.unlockedThemes.has(key) || key === 'theme_nature';
  }

  public setAquascapeTheme(themeId: string): { success: boolean; message: string } {
    const cleanId = themeId.replace('theme_', '').toLowerCase();
    const validThemes = ['nature', 'iwagumi', 'dutch', 'jungle', 'biotope'];
    if (!validThemes.includes(cleanId)) {
      return { success: false, message: 'Tema aquascape tidak valid.' };
    }

    this.aquarium.theme = cleanId;
    this.unlockedThemes.add(`theme_${cleanId}`);
    this.saveUnlockedThemes();
    this.saveToLocalStorage();
    this.notify();
    sound.playCoin();
    return { success: true, message: `Tema ${cleanId.toUpperCase()} Style berhasil diterapkan!` };
  }

  private saveUnlockedThemes(): void {
    try {
      localStorage.setItem('rispfid_themes', JSON.stringify(Array.from(this.unlockedThemes)));
    } catch {}
  }

  public getFishList(): PlayerFish[] {
    return [...this.fishList];
  }

  public getInventory(): InventoryItem[] {
    return [...this.inventory];
  }

  public checkAndPerformDailyReset(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('rispfid_last_mission_reset') || '';
    const hasOldDate = this.missions.some((m) => m.dateCreated && m.dateCreated !== today);

    if (lastReset !== today || hasOldDate || this.missions.length === 0) {
      this.missions = generateDailyMissions(this.profile.level, today);
      localStorage.setItem('rispfid_last_mission_reset', today);
      this.saveToLocalStorage();
      this.notify();
      return true;
    }
    return false;
  }

  public getMissions(): Mission[] {
    this.checkAndPerformDailyReset();
    return [...this.missions];
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getTransactions(): TransactionRecord[] {
    return [...this.transactions];
  }

  public getDiscoveredSpecies(): Set<string> {
    return new Set(this.discoveredSpecies);
  }

  public isOnline(): boolean {
    return this.isOnlineSupabase;
  }

  public getAuthUser() {
    return this.authUser;
  }

  // --- XP & LEVEL SYSTEM ---
  public addXp(amount: number): void {
    this.profile.xp += amount;
    const requiredXp = this.profile.level * 100;
    if (this.profile.xp >= requiredXp) {
      this.profile.level += 1;
      this.profile.xp -= requiredXp;
      this.profile.nextLevelXp = this.profile.level * 100;
      sound.playLevelUp();
      this.recordTransaction('daily_bonus', 100, `Naik ke Level ${this.profile.level}! Bonus Koin`);
    }
    this.notify();
  }

  // --- TRANSACTION RECORDER ---
  private recordTransaction(
    type: TransactionRecord['type'],
    amount: number,
    description: string
  ): void {
    this.profile.coins += amount;
    const record: TransactionRecord = {
      id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: this.profile.id,
      type,
      amount,
      balanceAfter: this.profile.coins,
      description,
      createdAt: new Date().toISOString()
    };
    this.transactions.unshift(record);
    if (this.transactions.length > 50) this.transactions.pop();
  }

  // --- TRANSACTIONS IMPLEMENTATION ---

  /**
   * Buy Fish with Server/Local Atomic Validation (supports quantity)
   */
  public async buyFish(
    speciesId: string,
    nickname?: string,
    quantity: number = 1
  ): Promise<{ success: boolean; message: string; count?: number; fish?: PlayerFish }> {
    const species = SPECIES_MAP.get(speciesId);
    if (!species) {
      return { success: false, message: 'Spesies ikan tidak dikenali.' };
    }

    const buyQty = Math.max(1, Math.floor(quantity || 1));
    const totalCost = species.buyPrice * buyQty;

    if (this.profile.coins < totalCost) {
      return {
        success: false,
        message: `Koin tidak cukup! Butuh ${totalCost} Koin untuk ${buyQty} ekor (Saldo: ${this.profile.coins}).`
      };
    }

    const currentCount = this.fishList.filter((f) => f.inAquarium).length;
    if (currentCount + buyQty > this.aquarium.capacity) {
      const remainingSlots = Math.max(0, this.aquarium.capacity - currentCount);
      return {
        success: false,
        message: remainingSlots > 0
          ? `Kapasitas akuarium hanya tersisa ${remainingSlots} ekor lagi (${currentCount}/${this.aquarium.capacity})!`
          : `Kapasitas akuarium penuh (${currentCount}/${this.aquarium.capacity}). Tingkatkan akuarium di Toko!`
      };
    }

    // Supabase RPC if online
    if (this.isOnlineSupabase && supabase && this.authUser) {
      try {
        for (let i = 0; i < buyQty; i++) {
          const itemNick = buyQty > 1 ? `${nickname || species.name} #${i + 1}` : (nickname || species.name);
          const { data, error } = await (supabase as any).rpc('buy_fish_transaction', {
            p_species_id: speciesId,
            p_aquarium_id: this.aquarium.id,
            p_nickname: itemNick
          });
          if (error || !data || !(data as any).success) {
            throw new Error((data as any)?.error || error?.message || 'Gagal memproses pembelian di Supabase.');
          }
        }
        await this.loadFromSupabase(this.authUser.id);
        sound.playCoin();
        return { 
          success: true, 
          count: buyQty,
          message: buyQty > 1 
            ? `Berhasil mengadopsi ${buyQty} ekor ${species.name}!` 
            : `Berhasil mengadopsi ${species.name}!` 
        };
      } catch (err) {
        console.warn('RPC gagal, beralih ke validasi aman lokal:', err);
      }
    }

    // Local atomic transaction
    const desc = buyQty > 1 ? `Membeli ${buyQty}x bibit ikan ${species.name}` : `Membeli bibit ikan ${species.name}`;
    this.recordTransaction('buy_fish', -totalCost, desc);
    sound.playCoin();

    const baseNickname = nickname && nickname.trim() ? nickname.trim() : species.name;
    let lastCreatedFish: PlayerFish | undefined;

    for (let i = 0; i < buyQty; i++) {
      const actualNickname = buyQty > 1 ? `${baseNickname} #${currentCount + i + 1}` : baseNickname;
      const newFish: PlayerFish = {
        id: 'fish_' + Date.now() + '_' + Math.floor(Math.random() * 100000) + '_' + i,
        userId: this.profile.id,
        speciesId,
        aquariumId: this.aquarium.id,
        nickname: actualNickname,
        hunger: 100,
        health: 100,
        ageSeconds: 0,
        stage: 'small',
        currentSizeCm: Math.round((species.maxSizeCm * 0.32) * 10) / 10,
        inAquarium: true,
        bornAt: new Date().toISOString(),
        lastFedAt: new Date().toISOString(),
        sellPrice: Math.round(species.baseSellPrice * 0.8)
      };

      this.fishList.push(newFish);
      lastCreatedFish = newFish;
    }

    this.aquarium.currentFishCount = this.fishList.filter((f) => f.inAquarium).length;
    this.discoveredSpecies.add(speciesId);

    // Update missions and achievements
    this.incrementMissionProgress('buy', buyQty);
    this.updateAchievementCounters();
    this.addXp(25 * buyQty);

    this.notify();
    return { 
      success: true, 
      count: buyQty,
      message: buyQty > 1 
        ? `Selamat! ${buyQty} ekor ${species.name} telah berenang di akuarium.` 
        : `Selamat! ${baseNickname} telah berenang di akuarium.`, 
      fish: lastCreatedFish 
    };
  }

  /**
   * Sell Fish with Server/Local Atomic Validation
   */
  public async sellFish(fishId: string): Promise<{ success: boolean; message: string; coinsEarned?: number }> {
    const fishIdx = this.fishList.findIndex((f) => f.id === fishId);
    if (fishIdx === -1) {
      return { success: false, message: 'Ikan tidak ditemukan di kepemilikan Anda.' };
    }

    const fish = this.fishList[fishIdx];
    const species = SPECIES_MAP.get(fish.speciesId);
    const basePrice = species ? species.baseSellPrice : 30;

    // Validasi: Hanya ikan berukuran dewasa yang dapat dijual
    if (fish.stage !== 'adult') {
      const growthTime = species ? species.growthTimeSeconds : 120;
      const remaining = Math.max(0, Math.ceil(growthTime - fish.ageSeconds));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      return {
        success: false,
        message: `Ikan belum dewasa! Tunggu timer selesai (sisa ${timeStr}) agar siap dijual.`
      };
    }

    // Calculate dynamic market value
    let mult = 0.8;
    if (fish.stage === 'adult') mult = 2.2;
    else if (fish.stage === 'medium') mult = 1.4;

    if (fish.health < 50) {
      mult *= Math.max(0.3, fish.health / 100);
    }

    const payout = Math.round(basePrice * mult);

    if (this.isOnlineSupabase && supabase && this.authUser) {
      try {
        const { data, error } = await (supabase as any).rpc('sell_fish_transaction', {
          p_fish_id: fishId
        });
        if (error || !data || !(data as any).success) {
          return { success: false, message: (data as any)?.error || error?.message || 'Gagal memproses penjualan di server.' };
        }
        await this.loadFromSupabase(this.authUser.id);
        sound.playCoin();
        return { success: true, message: `Berhasil menjual ${fish.nickname} seharga ${payout} Koin!`, coinsEarned: payout };
      } catch (err) {
        console.warn('RPC gagal, beralih ke lokal:', err);
      }
    }

    // Local transaction
    this.recordTransaction('sell_fish', payout, `Menjual ${fish.nickname} (${fish.stage})`);
    sound.playCoin();

    this.fishList.splice(fishIdx, 1);
    this.aquarium.currentFishCount = this.fishList.filter((f) => f.inAquarium).length;

    this.incrementMissionProgress('sell', 1);
    this.updateAchievementCounters();
    this.addXp(20);

    this.notify();
    return { success: true, message: `Berhasil menjual ${fish.nickname} seharga ${payout} Koin!`, coinsEarned: payout };
  }

  /**
   * Sell All Adult Fishes with Single Click Batch Operation
   */
  public async sellAllAdultFish(): Promise<{ success: boolean; count: number; totalCoins: number; message: string }> {
    const adultFish = this.fishList.filter((f) => f.stage === 'adult');
    if (adultFish.length === 0) {
      return {
        success: false,
        count: 0,
        totalCoins: 0,
        message: 'Belum ada ikan dewasa yang siap dijual.'
      };
    }

    let totalCoins = 0;
    const soldFishIds = new Set<string>();

    for (const fish of adultFish) {
      const species = SPECIES_MAP.get(fish.speciesId);
      const basePrice = species ? species.baseSellPrice : 30;
      let mult = 2.2;
      if (fish.health < 50) {
        mult *= Math.max(0.3, fish.health / 100);
      }
      const payout = Math.round(basePrice * mult);
      totalCoins += payout;
      soldFishIds.add(fish.id);
    }

    // Supabase RPC if online
    if (this.isOnlineSupabase && supabase && this.authUser) {
      try {
        for (const fish of adultFish) {
          await (supabase as any).rpc('sell_fish_transaction', { p_fish_id: fish.id });
        }
        await this.loadFromSupabase(this.authUser.id);
        sound.playCoin();
        return {
          success: true,
          count: adultFish.length,
          totalCoins,
          message: `Berhasil menjual ${adultFish.length} ekor ikan dewasa! Total pendapatan: +${totalCoins} Koin.`
        };
      } catch (err) {
        console.warn('RPC batch sell gagal, beralih ke transaksi lokal:', err);
      }
    }

    // Local transaction
    this.recordTransaction('sell_fish', totalCoins, `Menjual borongan ${adultFish.length} ekor ikan dewasa`);
    sound.playCoin();

    this.fishList = this.fishList.filter((f) => !soldFishIds.has(f.id));
    this.aquarium.currentFishCount = this.fishList.filter((f) => f.inAquarium).length;

    this.incrementMissionProgress('sell', adultFish.length);
    this.updateAchievementCounters();
    this.addXp(20 * adultFish.length);

    this.notify();
    return {
      success: true,
      count: adultFish.length,
      totalCoins,
      message: `Berhasil menjual ${adultFish.length} ekor ikan dewasa! Total pendapatan: +${totalCoins} Koin.`
    };
  }

  /**
   * Feed Aquarium Fishes
   */
  public feedAquarium(foodItemId?: string): { success: boolean; message: string; hungerRestored: number } {
    const selectedItem = foodItemId
      ? this.inventory.find((i) => i.itemId === foodItemId && i.quantity > 0)
      : this.inventory.find((i) => i.category === 'food' && i.quantity > 0);

    let foodValue = 20;
    let healthRestore = 5;

    if (selectedItem) {
      selectedItem.quantity -= 1;
      if (selectedItem.quantity <= 0) {
        this.inventory = this.inventory.filter((i) => i.id !== selectedItem.id);
      }
      const shopDef = ITEM_MAP.get(selectedItem.itemId);
      if (shopDef && shopDef.effect) {
        foodValue = shopDef.effect.foodValue || 25;
        healthRestore = shopDef.effect.healthRestore || 5;
      }
    } else {
      // Free basic flakes if inventory is empty
      foodValue = 15;
    }

    sound.playFeedSplash();

    let fedCount = 0;
    this.fishList.forEach((fish) => {
      if (fish.inAquarium) {
        fish.hunger = Math.min(100, fish.hunger + foodValue);
        fish.health = Math.min(100, fish.health + healthRestore);
        fish.lastFedAt = new Date().toISOString();
        fedCount++;
      }
    });

    // Slight water dirtiness increase from feeding
    this.aquarium.waterQuality = Math.max(10, this.aquarium.waterQuality - 1.5);

    this.incrementMissionProgress('feed', 1);
    this.updateAchievementCounters();
    this.addXp(10);

    this.notify();
    return {
      success: true,
      message: `Makanan diberikan ke ${fedCount} ekor ikan! (+${foodValue}% kenyang)`,
      hungerRestored: foodValue
    };
  }

  /**
   * Clean Aquarium Water
   */
  public async cleanAquarium(): Promise<{ success: boolean; message: string }> {
    const cost = 25;
    if (this.profile.coins < cost) {
      return { success: false, message: `Koin tidak cukup! Butuh ${cost} Koin untuk menguras air.` };
    }

    if (this.aquarium.waterQuality >= 98) {
      return { success: false, message: 'Air akuarium masih sangat jernih dan bersih!' };
    }

    this.recordTransaction('clean_aquarium', -cost, 'Kuras air dan pembersihan akuarium');
    this.aquarium.waterQuality = 100;
    this.aquarium.lastCleanedAt = new Date().toISOString();

    sound.playWaterClean();

    // Fish health boost when water is cleaned
    this.fishList.forEach((f) => {
      f.health = Math.min(100, f.health + 10);
    });

    this.incrementMissionProgress('clean', 1);
    this.addXp(15);
    this.notify();

    return { success: true, message: 'Akuarium berhasil dikuras! Kualitas air kembali 100% jernih kristal.' };
  }

  /**
   * Buy Item from Shop (Food, Decoration, Aquarium Upgrade)
   */
  public async buyItem(itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    const item = ITEM_MAP.get(itemId);
    if (!item) {
      return { success: false, message: 'Item toko tidak valid.' };
    }

    const totalCost = item.price * quantity;
    if (this.profile.coins < totalCost) {
      return {
        success: false,
        message: `Koin tidak cukup! Butuh ${totalCost} Koin (Saldo: ${this.profile.coins}).`
      };
    }

    // Apply immediate effects for direct upgrades
    if (item.category === 'aquarium') {
      if (item.effect?.capacityIncrease) {
        if (this.aquarium.capacity >= StorageService.MAX_CAPACITY) {
          return {
            success: false,
            message: `Kapasitas akuarium sudah mencapai batas maksimal (${StorageService.MAX_CAPACITY} ekor ikan)!`
          };
        }
        const requestedIncrease = item.effect.capacityIncrease;
        const newCapacity = Math.min(StorageService.MAX_CAPACITY, this.aquarium.capacity + requestedIncrease);
        this.aquarium.capacity = newCapacity;
        this.recordTransaction('buy_item', -totalCost, `Upgrade: ${item.name}`);
        sound.playCoin();
        this.addXp(40);
        this.updateAchievementCounters();
        this.notify();
        return {
          success: true,
          message: this.aquarium.capacity >= StorageService.MAX_CAPACITY
            ? `Berhasil upgrade! Kapasitas akuarium telah mencapai batas maksimal (${StorageService.MAX_CAPACITY} ekor ikan).`
            : `Berhasil upgrade! Kapasitas akuarium kini ${this.aquarium.capacity} ekor ikan.`
        };
      }
      if (item.effect?.cleanValue) {
        return this.cleanAquarium();
      }
      if (item.effect?.filterBoost) {
        if (this.aquarium.filterLevel >= 5) {
          return { success: false, message: 'Filter akuarium sudah mencapai level maksimum!' };
        }
        this.aquarium.filterLevel += 1;
        this.recordTransaction('buy_item', -totalCost, `Upgrade Filter Level ${this.aquarium.filterLevel}`);
        sound.playCoin();
        this.addXp(35);
        this.notify();
        return {
          success: true,
          message: `Filter berhasil diupgrade ke Level ${this.aquarium.filterLevel}!`
        };
      }
      if (item.effect?.aeratorBoost) {
        if (this.aquarium.aeratorLevel >= 5) {
          return { success: false, message: 'Aerator sudah mencapai level maksimum!' };
        }
        this.aquarium.aeratorLevel += 1;
        this.recordTransaction('buy_item', -totalCost, `Upgrade Aerator Level ${this.aquarium.aeratorLevel}`);
        sound.playCoin();
        this.addXp(35);
        this.notify();
        return {
          success: true,
          message: `Aerator berhasil diupgrade ke Level ${this.aquarium.aeratorLevel}!`
        };
      }
    }

    // Aquascape Themes & Backgrounds
    if (item.id.startsWith('theme_')) {
      const cleanTheme = item.id.replace('theme_', '').toLowerCase();
      if (this.isThemeUnlocked(item.id)) {
        this.setAquascapeTheme(cleanTheme);
        return {
          success: true,
          message: `Tema ${item.name} berhasil diterapkan di akuarium!`
        };
      }

      if (this.profile.coins < totalCost) {
        return {
          success: false,
          message: `Koin tidak cukup! Butuh ${totalCost} Koin untuk membuka tema ${item.name}.`
        };
      }

      this.recordTransaction('buy_item', -totalCost, `Membeli Tema Aquascape: ${item.name}`);
      this.unlockedThemes.add(item.id);
      this.saveUnlockedThemes();
      this.aquarium.theme = cleanTheme;
      this.saveToLocalStorage();
      sound.playLevelUp();
      this.addXp(50);
      this.notify();
      return {
        success: true,
        message: `Selamat! Tema ${item.name} berhasil dibeli & diterapkan di akuarium!`
      };
    }

    // Decoration: Automatically install in aquarium & track in inventory
    if (item.category === 'decoration') {
      if (!this.aquarium.decorations) {
        this.aquarium.decorations = [];
      }

      if (this.aquarium.decorations.length >= StorageService.MAX_DECORATIONS) {
        return {
          success: false,
          message: `Tata letak aquascape sudah seimbang (maksimal ${StorageService.MAX_DECORATIONS} elemen)! Tarik dekorasi di Inventaris jika ingin mengganti agar akuarium tetap lega.`
        };
      }

      let textureKey = 'plant_vallisneria';
      let decoType: 'plant' | 'rock' | 'wood' | 'castle' = 'plant';

      if (item.id.includes('anubias')) {
        textureKey = 'plant_anubias';
        decoType = 'plant';
      } else if (item.id.includes('driftwood')) {
        textureKey = 'wood_driftwood';
        decoType = 'wood';
      } else if (item.id.includes('rock') || item.id.includes('karst')) {
        textureKey = 'rock_karst';
        decoType = 'rock';
      } else if (item.id.includes('ruin') || item.id.includes('sriwijaya')) {
        textureKey = 'ruin_sriwijaya';
        decoType = 'castle';
      }

      const candidateX = [16, 36, 68, 84, 28, 74];
      const xPercent = candidateX[this.aquarium.decorations.length % candidateX.length];

      this.aquarium.decorations.push({
        id: 'deco_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: decoType,
        name: item.name,
        xPercent,
        yPercent: 88,
        scale: 0.95 + Math.random() * 0.1,
        textureKey
      });

      this.recordTransaction('buy_item', -totalCost, `Membeli & menanam ${item.name}`);
      sound.playCoin();
      this.addXp(30);

      const existing = this.inventory.find((i) => i.itemId === itemId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.inventory.push({
          id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          userId: this.profile.id,
          itemId: item.id,
          category: item.category,
          name: item.name,
          quantity,
          description: item.description,
          icon: item.icon
        });
      }

      this.saveToLocalStorage();
      this.notify();
      return {
        success: true,
        message: `Berhasil membeli dan menanam ${item.name} di dalam akuarium! 🌿`
      };
    }

    // Add to inventory (Food)
    this.recordTransaction('buy_item', -totalCost, `Membeli ${quantity}x ${item.name}`);
    sound.playCoin();

    const existing = this.inventory.find((i) => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({
        id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        userId: this.profile.id,
        itemId: item.id,
        category: item.category,
        name: item.name,
        quantity,
        description: item.description,
        icon: item.icon
      });
    }

    this.addXp(15 * quantity);
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: `Berhasil membeli ${quantity}x ${item.name}!` };
  }

  /**
   * Place decoration in aquarium
   */
  public placeDecoration(itemId: string): { success: boolean; message: string } {
    const invItem = this.inventory.find((i) => i.itemId === itemId && i.quantity > 0);
    if (!invItem) {
      return { success: false, message: 'Dekorasi tidak tersedia di inventaris.' };
    }

    if (!this.aquarium.decorations) {
      this.aquarium.decorations = [];
    }

    if (this.aquarium.decorations.length >= StorageService.MAX_DECORATIONS) {
      return {
        success: false,
        message: `Tata letak aquascape sudah penuh (maksimal ${StorageService.MAX_DECORATIONS} elemen)! Tarik elemen yang ada terlebih dahulu agar tidak terlalu ramai.`
      };
    }

    let textureKey = 'plant_vallisneria';
    let decoType: 'plant' | 'rock' | 'wood' | 'castle' = 'plant';
    if (itemId.includes('anubias')) {
      textureKey = 'plant_anubias';
      decoType = 'plant';
    } else if (itemId.includes('driftwood')) {
      textureKey = 'wood_driftwood';
      decoType = 'wood';
    } else if (itemId.includes('rock') || itemId.includes('karst')) {
      textureKey = 'rock_karst';
      decoType = 'rock';
    } else if (itemId.includes('ruin') || itemId.includes('sriwijaya')) {
      textureKey = 'ruin_sriwijaya';
      decoType = 'castle';
    }

    const candidateX = [16, 36, 68, 84, 28, 74];
    const xPercent = candidateX[this.aquarium.decorations.length % candidateX.length];

    this.aquarium.decorations.push({
      id: 'deco_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: decoType,
      name: invItem.name,
      xPercent,
      yPercent: 88,
      scale: 0.95 + Math.random() * 0.1,
      textureKey
    });

    this.aquarium.waterQuality = Math.min(100, this.aquarium.waterQuality + 5);
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: `Dekorasi ${invItem.name} berhasil dipasang di akuarium! 🌿` };
  }

  /**
   * Remove decoration from aquarium back to inventory
   */
  public removeDecoration(decoId: string): { success: boolean; message: string } {
    if (!this.aquarium.decorations) return { success: false, message: 'Tidak ada dekorasi.' };
    const idx = this.aquarium.decorations.findIndex((d) => d.id === decoId);
    if (idx === -1) {
      return { success: false, message: 'Dekorasi tidak ditemukan di akuarium.' };
    }
    const removed = this.aquarium.decorations.splice(idx, 1)[0];
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: `${removed.name} berhasil disimpan kembali ke inventaris!` };
  }

  /**
   * Mission Progress Helper
   */
  public incrementMissionProgress(category: Mission['category'], amount: number = 1): void {
    this.missions.forEach((m) => {
      if (m.category === category && !m.isCompleted) {
        m.currentCount = Math.min(m.targetCount, m.currentCount + amount);
        if (m.currentCount >= m.targetCount) {
          m.isCompleted = true;
        }
      }
    });
  }

  /**
   * Claim Mission Reward
   */
  public claimMission(missionId: string): { success: boolean; message: string } {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission) return { success: false, message: 'Misi tidak ditemukan.' };
    if (!mission.isCompleted) return { success: false, message: 'Misi belum diselesaikan.' };
    if (mission.isClaimed) return { success: false, message: 'Reward misi sudah diambil.' };

    mission.isClaimed = true;
    this.recordTransaction('mission_reward', mission.rewardCoins, `Reward Misi Harian: ${mission.title}`);
    sound.playCoin();
    this.addXp(mission.rewardXp);
    this.notify();

    return {
      success: true,
      message: `Selamat! Anda mendapatkan ${mission.rewardCoins} Koin & ${mission.rewardXp} XP!`
    };
  }

  /**
   * Update Achievement Counters
   */
  public updateAchievementCounters(): void {
    const totalFish = this.fishList.length;
    const uniqueSpecies = this.discoveredSpecies.size;
    const adultFish = this.fishList.filter((f) => f.stage === 'adult').length;
    const hasEpicOrLeg = this.fishList.some((f) => {
      const sp = SPECIES_MAP.get(f.speciesId);
      return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary');
    });

    this.achievements.forEach((ach) => {
      if (ach.id === 'ach_first_fish') ach.currentCount = Math.max(ach.currentCount, totalFish);
      if (ach.id === 'ach_collect_5_species') ach.currentCount = uniqueSpecies;
      if (ach.id === 'ach_first_adult') ach.currentCount = Math.max(ach.currentCount, adultFish);
      if (ach.id === 'ach_epic_owner') ach.currentCount = hasEpicOrLeg ? 1 : 0;
      if (ach.id === 'ach_aquarium_expansion') ach.currentCount = this.aquarium.capacity;

      if (ach.currentCount >= ach.targetCount && !ach.isUnlocked) {
        ach.isUnlocked = true;
      }
    });
  }

  /**
   * Claim Achievement Reward
   */
  public claimAchievement(achId: string): { success: boolean; message: string } {
    const ach = this.achievements.find((a) => a.id === achId);
    if (!ach) return { success: false, message: 'Achievement tidak ditemukan.' };
    if (!ach.isUnlocked) return { success: false, message: 'Achievement belum terbuka.' };
    if (ach.isClaimed) return { success: false, message: 'Reward achievement sudah diambil.' };

    ach.isClaimed = true;
    this.recordTransaction('achievement_reward', ach.rewardCoins, `Pencapaian: ${ach.title}`);
    sound.playLevelUp();
    this.addXp(100);
    this.notify();

    return {
      success: true,
      message: `Pencapaian Terbuka! Menerima ${ach.rewardCoins} Koin dan gelar '${ach.rewardTitle}'!`
    };
  }

  /**
   * Periodic Growth, Hunger, & Water Quality Loop
   * Called by Phaser / Game loop every 3 seconds
   */
  public tick(deltaSeconds: number): void {
    if (deltaSeconds <= 0) return;

    // Filter effect: slower water dirtiness
    const filterDampener = 1 - (this.aquarium.filterLevel - 1) * 0.15;
    const waterQualityLoss = (deltaSeconds / 60) * 0.8 * filterDampener;
    this.aquarium.waterQuality = Math.max(0, this.aquarium.waterQuality - waterQualityLoss);

    let changed = false;

    this.fishList.forEach((fish) => {
      if (!fish.inAquarium) return;
      const species = SPECIES_MAP.get(fish.speciesId);
      if (!species) return;

      // 1. Hunger reduction
      const hungerLoss = (species.hungerRate * (deltaSeconds / 60));
      fish.hunger = Math.max(0, fish.hunger - hungerLoss);

      // 2. Health impacts: Dirty water (< 40) or Starving (< 20) decreases health
      if (this.aquarium.waterQuality < 40 || fish.hunger < 20) {
        const healthLoss = (deltaSeconds / 60) * 4;
        fish.health = Math.max(10, fish.health - healthLoss);
      } else if (fish.hunger > 60 && this.aquarium.waterQuality > 70) {
        // Natural healing
        fish.health = Math.min(100, fish.health + (deltaSeconds / 60) * 2);
      }

      // 3. Growth: grows only if not starving
      if (fish.hunger > 30) {
        fish.ageSeconds += deltaSeconds;
        const progress = Math.min(1, fish.ageSeconds / species.growthTimeSeconds);

        // Smooth biological growth in cm: starts at ~32% length (bibit), reaches 100% when adult
        const targetSize = progress >= 1.0 
          ? species.maxSizeCm 
          : Math.round((species.maxSizeCm * (0.32 + 0.68 * progress)) * 10) / 10;

        if (fish.currentSizeCm !== targetSize) {
          fish.currentSizeCm = targetSize;
          changed = true;
        }

        if (progress >= 1.0 && fish.stage !== 'adult') {
          fish.stage = 'adult';
          fish.currentSizeCm = species.maxSizeCm;
          fish.sellPrice = Math.round(species.baseSellPrice * 2.2);
          changed = true;
        } else if (progress >= 0.45 && fish.stage === 'small') {
          fish.stage = 'medium';
          fish.sellPrice = Math.round(species.baseSellPrice * 1.4);
          changed = true;
        }
      }
    });

    if (changed) {
      this.updateAchievementCounters();
    }
  }

  // --- AUTH INTEGRATION ---

  public async signInWithEmail(email: string, pass: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Kredensial Supabase belum dikonfigurasi di file .env. Game saat ini berjalan dalam Mode Tamu / Offline Dev.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        this.authUser = data.user;
        this.isOnlineSupabase = true;
        await this.loadFromSupabase(data.user.id);
        this.notify();
        return { success: true, message: `Selamat datang kembali, ${this.profile.username}!` };
      }
      return { success: false, message: 'Autentikasi gagal.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan saat masuk.' };
    }
  }

  public async signUpWithEmail(email: string, pass: string, username: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Kredensial Supabase belum dikonfigurasi di .env. Anda dapat terus bermain sebagai Tamu, progres tersimpan di peramban.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { username }
        }
      });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        this.authUser = data.user;
        this.isOnlineSupabase = true;
        await this.loadFromSupabase(data.user.id);
        this.notify();
        return { success: true, message: 'Pendaftaran berhasil! Akun dan data online telah aktif.' };
      }
      return { success: false, message: 'Pendaftaran gagal.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan saat mendaftar.' };
    }
  }

  public async signOut(): Promise<void> {
    if (supabase && this.isOnlineSupabase) {
      await supabase.auth.signOut();
    }
    this.authUser = null;
    this.isOnlineSupabase = false;
    this.profile = this.createDefaultProfile();
    this.aquarium = this.createDefaultAquarium();
    this.loadFromLocalStorage();
    this.notify();
  }

  public setGuestUsername(newName: string): void {
    if (newName && newName.trim()) {
      this.profile.username = newName.trim();
      this.notify();
    }
  }
}

export const storage = new StorageService();
