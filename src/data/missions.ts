import { Mission, Achievement } from '../types/game';

/**
 * Dynamic Daily Mission Generator with Difficulty Tiers and Level-Scaled Rewards
 * Generates fresh, varied daily missions that rotate every day!
 */
export function generateDailyMissions(playerLevel: number = 1, dateStr?: string): Mission[] {
  const dateKey = dateStr || new Date().toISOString().split('T')[0];
  
  // Deterministic seed from date string
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const lvl = Math.max(1, playerLevel);
  // Scaling difficulty multiplier: as player levels up, rewards increase substantially!
  const scaleMult = 1 + (lvl - 1) * 0.15;

  const easyPool: Array<(s: number) => Mission> = [
    (s) => ({
      id: `daily_feed_easy_${dateKey}`,
      title: 'Sarapan Pagi Penghuni Tangki',
      description: `Beri makan ikan di akuarium sebanyak ${3 + (s % 3)} kali hari ini.`,
      category: 'feed',
      targetCount: 3 + (s % 3),
      currentCount: 0,
      rewardCoins: Math.round(80 * scaleMult),
      rewardXp: Math.round(50 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'cookie',
      difficulty: 'easy',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_clean_easy_${dateKey}`,
      title: 'Segarkan Kualitas Air',
      description: 'Kuras dan bersihkan air akuarium agar ikan tetap sehat dan segar.',
      category: 'clean',
      targetCount: 1,
      currentCount: 0,
      rewardCoins: Math.round(75 * scaleMult),
      rewardXp: Math.round(45 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'droplets',
      difficulty: 'easy',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_buy_easy_${dateKey}`,
      title: 'Adopsi Bibit Baru',
      description: 'Adopsi 1 ekor bibit ikan air tawar baru dari Pasar Akuatik.',
      category: 'buy',
      targetCount: 1,
      currentCount: 0,
      rewardCoins: Math.round(90 * scaleMult),
      rewardXp: Math.round(60 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'shopping-cart',
      difficulty: 'easy',
      dateCreated: dateKey
    })
  ];

  const mediumPool: Array<(s: number) => Mission> = [
    (s) => ({
      id: `daily_feed_med_${dateKey}`,
      title: 'Nutrisi Harian Terjadwal',
      description: `Beri makan penghuni tangki sebanyak ${7 + (s % 3) * 2} kali hari ini.`,
      category: 'feed',
      targetCount: 7 + (s % 3) * 2,
      currentCount: 0,
      rewardCoins: Math.round(220 * scaleMult),
      rewardXp: Math.round(150 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'cookie',
      difficulty: 'medium',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_buy_med_${dateKey}`,
      title: 'Ekspansi Fauna Akuatik',
      description: `Beli ${2 + (s % 2)} ekor ikan baru untuk meramaikan ekosistem tangki Anda.`,
      category: 'buy',
      targetCount: 2 + (s % 2),
      currentCount: 0,
      rewardCoins: Math.round(260 * scaleMult),
      rewardXp: Math.round(180 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'shopping-cart',
      difficulty: 'medium',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_sell_med_${dateKey}`,
      title: 'Panen Perdana Ikan Dewasa',
      description: 'Rawat ikan hingga dewasa sempurna lalu jual 1 ekor dengan harga terbaik.',
      category: 'sell',
      targetCount: 1,
      currentCount: 0,
      rewardCoins: Math.round(250 * scaleMult),
      rewardXp: Math.round(160 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'coins',
      difficulty: 'medium',
      dateCreated: dateKey
    })
  ];

  const hardPool: Array<(s: number) => Mission> = [
    (s) => ({
      id: `daily_sell_hard_${dateKey}`,
      title: 'Saudagar Ikan Sukses',
      description: `Besarkan dan jual ${2 + (s % 2)} ekor ikan yang telah mencapai fase dewasa.`,
      category: 'sell',
      targetCount: 2 + (s % 2),
      currentCount: 0,
      rewardCoins: Math.round(550 * scaleMult),
      rewardXp: Math.round(380 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'coins',
      difficulty: 'hard',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_feed_hard_${dateKey}`,
      title: 'Perjamuan Makan Akbar',
      description: `Berikan makan intensif sebanyak ${14 + (s % 3) * 2} kali untuk memicu pertumbuhan ikan.`,
      category: 'feed',
      targetCount: 14 + (s % 3) * 2,
      currentCount: 0,
      rewardCoins: Math.round(480 * scaleMult),
      rewardXp: Math.round(340 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'cookie',
      difficulty: 'hard',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_clean_hard_${dateKey}`,
      title: 'Sanitasi Air Paripurna',
      description: 'Kuras dan bersihkan air akuarium minimal 2 kali agar kualitas air mencapai 100%.',
      category: 'clean',
      targetCount: 2,
      currentCount: 0,
      rewardCoins: Math.round(420 * scaleMult),
      rewardXp: Math.round(300 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'droplets',
      difficulty: 'hard',
      dateCreated: dateKey
    })
  ];

  const masterPool: Array<(s: number) => Mission> = [
    (s) => ({
      id: `daily_sell_master_${dateKey}`,
      title: 'Konglomerat Pasar Akuatik',
      description: `Panen dan jual borongan ${3 + (s % 2)} ekor ikan dewasa siap panen!`,
      category: 'sell',
      targetCount: 3 + (s % 2),
      currentCount: 0,
      rewardCoins: Math.round(1400 * scaleMult),
      rewardXp: Math.round(900 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'crown',
      difficulty: 'master',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_buy_master_${dateKey}`,
      title: 'Borongan Bibit Fauna Nusantara',
      description: `Adopsi minimal ${4 + (s % 2)} ekor bibit ikan sekaligus untuk ekspansi akuarium.`,
      category: 'buy',
      targetCount: 4 + (s % 2),
      currentCount: 0,
      rewardCoins: Math.round(1200 * scaleMult),
      rewardXp: Math.round(800 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'shopping-cart',
      difficulty: 'master',
      dateCreated: dateKey
    }),
    (s) => ({
      id: `daily_feed_master_${dateKey}`,
      title: 'Festival Makan Spektakuler',
      description: `Beri makan ikan sebanyak ${20 + (s % 4) * 2} kali hari ini demi mempercepat tumbuh kembang semua fauna!`,
      category: 'feed',
      targetCount: 20 + (s % 4) * 2,
      currentCount: 0,
      rewardCoins: Math.round(1100 * scaleMult),
      rewardXp: Math.round(750 * scaleMult),
      isCompleted: false,
      isClaimed: false,
      icon: 'cookie',
      difficulty: 'master',
      dateCreated: dateKey
    })
  ];

  const m1 = easyPool[seed % easyPool.length](seed);
  const m2 = mediumPool[(seed + 1) % mediumPool.length](seed + 1);
  const m3 = hardPool[(seed + 2) % hardPool.length](seed + 2);
  const m4 = masterPool[(seed + 3) % masterPool.length](seed + 3);

  return [m1, m2, m3, m4];
}

export const INITIAL_DAILY_MISSIONS: Mission[] = generateDailyMissions(1);

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_fish',
    title: 'Akuaris Pemula',
    description: 'Miliki ikan pertama di dalam akuarium RISPFID FISH.',
    targetCount: 1,
    currentCount: 1,
    rewardCoins: 100,
    rewardTitle: 'Sahabat Ikan',
    isUnlocked: true,
    isClaimed: false,
    icon: 'award'
  },
  {
    id: 'ach_feed_master',
    title: 'Pemberi Makan Teladan',
    description: 'Beri makan ikan sebanyak 20 kali secara total.',
    targetCount: 20,
    currentCount: 0,
    rewardCoins: 250,
    rewardTitle: 'Koki Air Tawar',
    isUnlocked: false,
    isClaimed: false,
    icon: 'cookie'
  },
  {
    id: 'ach_collect_5_species',
    title: 'Kolektor Nusantara Muda',
    description: 'Buka dan miliki sedikitnya 5 spesies ikan asli / endemik Indonesia yang berbeda.',
    targetCount: 5,
    currentCount: 1,
    rewardCoins: 500,
    rewardTitle: 'Kurator Ikan',
    isUnlocked: false,
    isClaimed: false,
    icon: 'book-open'
  },
  {
    id: 'ach_first_adult',
    title: 'Perawatan Penuh Kasih',
    description: 'Besarkan 1 ekor ikan dari anakan hingga mencapai fase dewasa sempurna.',
    targetCount: 1,
    currentCount: 0,
    rewardCoins: 300,
    rewardTitle: 'Induk Penyayang',
    isUnlocked: false,
    isClaimed: false,
    icon: 'heart'
  },
  {
    id: 'ach_epic_owner',
    title: 'Pesona Spesies Langka',
    description: 'Miliki minimal 1 ikan dengan rarity Epic atau Legendary (seperti Boesemani atau Arwana).',
    targetCount: 1,
    currentCount: 0,
    rewardCoins: 1000,
    rewardTitle: 'Sultan Akuarium',
    isUnlocked: false,
    isClaimed: false,
    icon: 'crown'
  },
  {
    id: 'ach_aquarium_expansion',
    title: 'Mega Aquascape',
    description: 'Tingkatkan kapasitas akuarium hingga mencapai minimal 10 ekor ikan.',
    targetCount: 10,
    currentCount: 5,
    rewardCoins: 750,
    rewardTitle: 'Arsitek Air',
    isUnlocked: false,
    isClaimed: false,
    icon: 'maximize'
  }
];
