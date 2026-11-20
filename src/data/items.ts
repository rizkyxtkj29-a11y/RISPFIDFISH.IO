import { ShopItem } from '../types/game';

export const SHOP_ITEMS: ShopItem[] = [
  // --- FOOD SHOP ---
  {
    id: 'food_basic_pellet',
    category: 'food',
    name: 'Pelet Nutrisi Dasar',
    description: 'Makanan harian bergizi seimbang untuk segala jenis ikan air tawar nusantara.',
    price: 15,
    icon: 'cookie',
    effect: {
      foodValue: 25,
      healthRestore: 5
    }
  },
  {
    id: 'food_bloodworm',
    category: 'food',
    name: 'Cacing Sutra (Tubifex)',
    description: 'Pakan alami kaya protein segar untuk memicu nafsu makan dan mempercepat pertumbuhan.',
    price: 45,
    icon: 'sparkles',
    effect: {
      foodValue: 50,
      healthRestore: 15
    }
  },
  {
    id: 'food_artemia',
    category: 'food',
    name: 'Artemia Salina Organik',
    description: 'Pakan mikro kaya pigmen karotenoid alami untuk mempertajam kilau warna sisik ikan.',
    price: 90,
    icon: 'flame',
    effect: {
      foodValue: 75,
      healthRestore: 25
    }
  },
  {
    id: 'food_shrimp_krill',
    category: 'food',
    name: 'Udang Krill Premium',
    description: 'Pakan gourmet favorit predator air tawar seperti Arwana, Gabus Ocellated, dan Buntal.',
    price: 150,
    icon: 'star',
    effect: {
      foodValue: 100,
      healthRestore: 40
    }
  },

  // --- AQUASCAPE THEMES & BACKGROUND SHOP ---
  {
    id: 'theme_nature',
    category: 'decoration',
    name: 'Nature Style',
    description: 'Meniru lanskap alam bebas seperti bukit, hutan, atau lembah menggunakan kombinasi batu, kayu apung (driftwood), dan tanaman air.',
    price: 0,
    icon: 'mountain'
  },
  {
    id: 'theme_iwagumi',
    category: 'decoration',
    name: 'Iwagumi Style',
    description: 'Berfokus pada susunan batu dengan ukuran berbeda dan satu jenis tanaman karpet, biasanya dipadukan dengan satu jenis ikan kecil berkelompok.',
    price: 320,
    icon: 'shield'
  },
  {
    id: 'theme_dutch',
    category: 'decoration',
    name: 'Dutch Style',
    description: 'Menonjolkan kepadatan dan variasi warna tanaman air (sering kali tanpa hardscape batu/kayu) yang disusun bertingkat.',
    price: 480,
    icon: 'sparkles'
  },
  {
    id: 'theme_jungle',
    category: 'decoration',
    name: 'Jungle Style',
    description: 'Menampilkan kesan hutan tropis yang rimbun dan lebat dengan pertumbuhan tanaman yang lebih bebas serta alami.',
    price: 620,
    icon: 'tree-pine'
  },
  {
    id: 'theme_biotope',
    category: 'decoration',
    name: 'Biotope Style',
    description: 'Meniru ekosistem alami tertentu secara akurat, lengkap dengan jenis tanaman, substrat, dan ikan yang berasal dari habitat yang sama.',
    price: 780,
    icon: 'droplets'
  },

  // Legacy items for inventory backwards compatibility
  {
    id: 'deco_vallisneria',
    category: 'decoration',
    name: 'Tanaman Vallisneria Air',
    description: 'Tanaman pita air melambai lembut.',
    price: 80,
    icon: 'leaf'
  },
  {
    id: 'deco_anubias',
    category: 'decoration',
    name: 'Anubias Barteri Karst',
    description: 'Tanaman berdaun hijau gelap tebal.',
    price: 140,
    icon: 'tree-pine'
  },
  {
    id: 'deco_driftwood',
    category: 'decoration',
    name: 'Kayu Apung Rasamala',
    description: 'Ranting kayu alami eksotis.',
    price: 220,
    icon: 'box'
  },
  {
    id: 'deco_maros_rock',
    category: 'decoration',
    name: 'Batu Karst Maros',
    description: 'Formasi batuan karst alami.',
    price: 260,
    icon: 'shield'
  },
  {
    id: 'deco_sriwijaya_ruin',
    category: 'decoration',
    name: 'Arca Kuno Sriwijaya',
    description: 'Replika artefak purbakala.',
    price: 600,
    icon: 'castle'
  },

  // --- AQUARIUM SHOP & UPGRADES ---
  {
    id: 'clean_water_kit',
    category: 'aquarium',
    name: 'Kuras & Water Treatment',
    description: 'Perawatan air lengkap dengan bakteri pengurai untuk mengembalikan kualitas air menjadi 100% kristal.',
    price: 30,
    icon: 'droplets',
    effect: {
      cleanValue: 100
    }
  },
  {
    id: 'upgrade_filter_sponge',
    category: 'aquarium',
    name: 'Filter Bio-Sponge Pro',
    description: 'Tingkatkan sistem filtrasi biologis untuk memperlambat kekeruhan air akuarium.',
    price: 350,
    icon: 'refresh-cw',
    effect: {
      filterBoost: 1
    }
  },
  {
    id: 'upgrade_aerator_silent',
    category: 'aquarium',
    name: 'Aerator Turbo Silent',
    description: 'Pompa gelembung oksigen mikro berkinerja tinggi untuk menjaga kesehatan ikan tetap prima.',
    price: 450,
    icon: 'wind',
    effect: {
      aeratorBoost: 1
    }
  },
  {
    id: 'upgrade_capacity_small',
    category: 'aquarium',
    name: 'Ekspansi Ruang (+3 Ikan)',
    description: 'Memperluas dimensi akuarium agar dapat menampung slot ikan lebih banyak (maksimal 20 ekor).',
    price: 500,
    icon: 'maximize-2',
    effect: {
      capacityIncrease: 3
    }
  },
  {
    id: 'upgrade_capacity_large',
    category: 'aquarium',
    name: 'Ekspansi Mega (+6 Ikan)',
    description: 'Renovasi akuarium besar dengan kapasitas bertambah banyak (maksimal 20 ekor).',
    price: 1200,
    icon: 'layers',
    effect: {
      capacityIncrease: 6
    }
  }
];

export const ITEM_MAP = new Map<string, ShopItem>(
  SHOP_ITEMS.map((item) => [item.id, item])
);
