export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type OriginType = 'endemik' | 'asli';
export type GrowthStage = 'small' | 'medium' | 'adult';
export type FishMood = 'happy' | 'normal' | 'hungry' | 'sick';

export interface FishSpecies {
  id: string;
  name: string; // e.g. "Rainbow Boesemani"
  scientificName: string; // e.g. "Melanotaenia boesemani"
  originHabitat: string; // e.g. "Danau Ayamaru, Semenanjung Kepala Burung, Papua Barat"
  originType: OriginType; // 'endemik' or 'asli'
  rarity: Rarity;
  description: string;
  uniqueFact: string;
  buyPrice: number;
  baseSellPrice: number;
  growthTimeSeconds: number; // Time from small to adult
  hungerRate: number; // points per minute
  preferredWaterQuality: number; // minimum quality (0-100)
  maxSizeCm: number;
  swimSpeed: number; // base speed
  colors: {
    primary: string;
    secondary: string;
    belly: string;
    fins: string;
    pattern?: string;
    accent?: string;
    glow?: string;
  };
  bodyShape: 'elongated' | 'oval' | 'deep' | 'slender' | 'round' | 'streamlined';
}

export interface PlayerFish {
  id: string;
  userId: string;
  speciesId: string;
  aquariumId: string;
  nickname: string;
  hunger: number; // 0 (starving) to 100 (full)
  health: number; // 0 to 100
  ageSeconds: number;
  stage: GrowthStage;
  currentSizeCm: number;
  inAquarium: boolean;
  bornAt: string;
  lastFedAt: string;
  sellPrice: number;
}

export interface AquariumDecoration {
  id: string;
  type: 'plant' | 'rock' | 'wood' | 'castle' | 'shipwreck';
  name: string;
  xPercent: number; // 0 - 100%
  yPercent: number; // 0 - 100%
  scale: number;
  textureKey: string;
}

export interface AquariumData {
  id: string;
  userId: string;
  name: string;
  capacity: number;
  currentFishCount: number;
  waterQuality: number; // 0 - 100 (100 = crystal clear)
  filterLevel: number; // 1 to 5
  aeratorLevel: number; // 1 to 5
  temperature: number; // 25 - 28 C
  theme: string;
  decorations: AquariumDecoration[];
  lastCleanedAt: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  coins: number;
  isGuest: boolean;
  activeAquariumId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopItem {
  id: string;
  category: 'fish' | 'food' | 'decoration' | 'aquarium';
  name: string;
  description: string;
  price: number;
  rarity?: Rarity;
  icon: string;
  speciesId?: string;
  effect?: {
    foodValue?: number;
    healthRestore?: number;
    cleanValue?: number;
    capacityIncrease?: number;
    filterBoost?: number;
    aeratorBoost?: number;
  };
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  category: 'fish' | 'food' | 'decoration' | 'filter' | 'aquarium';
  name: string;
  quantity: number;
  description: string;
  icon: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'feed' | 'buy' | 'sell' | 'clean' | 'level';
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'master';
  dateCreated?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  speciesCount?: number;
  coinsEarned?: number;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardTitle?: string;
  isUnlocked: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'buy_fish' | 'sell_fish' | 'buy_item' | 'clean_aquarium' | 'mission_reward' | 'achievement_reward' | 'daily_bonus';
  amount: number; // positive or negative
  balanceAfter: number;
  description: string;
  createdAt: string;
}
