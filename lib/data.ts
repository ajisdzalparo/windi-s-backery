// Data game yang dipakai bersama client dan server: item, resep, katalog, baju, dan tata letak kota.

export type ItemKind = "seed" | "crop" | "wild" | "farm" | "supply" | "product";

export type Item = {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  price?: number; // harga jual produk ke pelanggan (koin)
  energy?: number; // energi yang pulih kalau dimakan/diminum
};

export const ITEMS: Record<string, Item> = {
  seed_wheat: { id: "seed_wheat", name: "Benih Gandum", icon: "🌾", kind: "seed" },
  seed_strawberry: { id: "seed_strawberry", name: "Benih Stroberi", icon: "🍓", kind: "seed" },
  wheat: { id: "wheat", name: "Gandum", icon: "🌾", kind: "crop" },
  strawberry: { id: "strawberry", name: "Stroberi", icon: "🍓", kind: "crop" },
  wild_berry: { id: "wild_berry", name: "Beri Liar", icon: "🫐", kind: "wild" },
  chamomile: { id: "chamomile", name: "Bunga Chamomile", icon: "🌼", kind: "wild" },
  mushroom: { id: "mushroom", name: "Jamur", icon: "🍄", kind: "wild" },
  egg: { id: "egg", name: "Telur", icon: "🥚", kind: "farm" },
  milk: { id: "milk", name: "Susu Segar", icon: "🥛", kind: "farm" },
  feed: { id: "feed", name: "Pakan Ayam", icon: "🌾", kind: "supply" },
  feed_cow: { id: "feed_cow", name: "Pakan Sapi", icon: "🌿", kind: "supply" },
  bread: { id: "bread", name: "Roti Gandum", icon: "🍞", kind: "product", price: 25, energy: 20 },
  chamomile_tea: { id: "chamomile_tea", name: "Teh Chamomile", icon: "🍵", kind: "product", price: 35, energy: 25 },
  berry_tart: { id: "berry_tart", name: "Tart Beri Liar", icon: "🥧", kind: "product", price: 55, energy: 25 },
  mushroom_pie: { id: "mushroom_pie", name: "Pai Jamur", icon: "🥟", kind: "product", price: 60, energy: 30 },
  strawberry_cake: { id: "strawberry_cake", name: "Kue Stroberi", icon: "🍰", kind: "product", price: 75, energy: 30 },
  windi_special: { id: "windi_special", name: "Kue Spesial Windi", icon: "🎂", kind: "product", price: 180, energy: 60 },
  pancake: { id: "pancake", name: "Pancake Madu", icon: "🥞", kind: "product", price: 70, energy: 30 },
  milk_pudding: { id: "milk_pudding", name: "Puding Susu", icon: "🍮", kind: "product", price: 65, energy: 25 },
  sponge_cake: { id: "sponge_cake", name: "Kue Bolu", icon: "🧁", kind: "product", price: 90, energy: 35 },
  cheesecake: { id: "cheesecake", name: "Cheesecake Stroberi", icon: "🍰", kind: "product", price: 160, energy: 45 },
};

export const itemOf = (id: string) => ITEMS[id] ?? { id, name: id, icon: "❔", kind: "product" as const };

export type Recipe = { id: string; result: string; needs: Record<string, number>; secret?: boolean; fridge?: boolean };

export const RECIPES: Recipe[] = [
  { id: "bread", result: "bread", needs: { wheat: 2 } },
  { id: "chamomile_tea", result: "chamomile_tea", needs: { chamomile: 2 } },
  { id: "berry_tart", result: "berry_tart", needs: { wheat: 1, wild_berry: 2 } },
  { id: "mushroom_pie", result: "mushroom_pie", needs: { wheat: 1, mushroom: 2 } },
  { id: "strawberry_cake", result: "strawberry_cake", needs: { wheat: 1, strawberry: 2 } },
  { id: "windi_special", result: "windi_special", needs: { wheat: 1, strawberry: 1, wild_berry: 1, chamomile: 1 }, secret: true },
  // Resep susu & telur butuh Kulkas.
  { id: "pancake", result: "pancake", needs: { wheat: 1, egg: 1, milk: 1 }, fridge: true },
  { id: "milk_pudding", result: "milk_pudding", needs: { milk: 2, egg: 1 }, fridge: true },
  { id: "sponge_cake", result: "sponge_cake", needs: { wheat: 2, egg: 2 }, fridge: true },
  { id: "cheesecake", result: "cheesecake", needs: { wheat: 1, milk: 1, egg: 1, strawberry: 2 }, fridge: true },
];

export const BAKE_SECONDS = 5;
export const BAKE_ENERGY = 10;

export type Crop = { seed: string; crop: string; days: number; yield: number };
export const CROPS: Record<string, Crop> = {
  seed_wheat: { seed: "seed_wheat", crop: "wheat", days: 3, yield: 3 },
  seed_strawberry: { seed: "seed_strawberry", crop: "strawberry", days: 4, yield: 3 },
};

export const ENERGY = { max: 100, water: 4, plant: 2, harvest: 2, forage: 1, feed: 2 };

export type Outfit = {
  id: string;
  name: string;
  top: string;
  bottom: string;
  skirt: boolean;
  accent: string;
  apron?: string;
  bow?: string; // pita rambut
  hat?: "beret" | "straw";
  hatColor?: string;
  price: number;
  note?: string;
};

export const OUTFITS: Outfit[] = [
  // Warna seragam toko diambil dari foto Windi: kemeja plum dan celemek merah.
  { id: "apron_06", name: "Seragam Toko", top: "#7e1d5a", bottom: "#4a1031", skirt: true, accent: "#fbcfe8", apron: "#b51a2b", price: 0, note: "Seragam kebanggaan toko" },
  { id: "casual_01", name: "Kasual Pink", top: "#f9a8d4", bottom: "#60a5fa", skirt: false, accent: "#ffffff", price: 0, note: "Santai jalan-jalan" },
  { id: "hoodie_02", name: "Hoodie Matcha", top: "#a7c7a5", bottom: "#57534e", skirt: false, accent: "#fef3c7", price: 80, note: "Hangat & nyaman" },
  { id: "pajama_04", name: "Piyama Lemon", top: "#fde68a", bottom: "#fde68a", skirt: false, accent: "#fb7185", bow: "#fb7185", price: 90, note: "Siap bobo cantik" },
  { id: "overall_07", name: "Overall Denim", top: "#fff7ed", bottom: "#60a5fa", skirt: false, accent: "#facc15", apron: "#3b82f6", bow: "#facc15", price: 110, note: "Cocok buat berkebun" },
  { id: "dress_03", name: "Dress Lavender", top: "#c4b5fd", bottom: "#c4b5fd", skirt: true, accent: "#fde68a", bow: "#a78bfa", price: 120, note: "Lembut dan anggun" },
  { id: "beret_08", name: "Sweater & Beret", top: "#b45309", bottom: "#fef3c7", skirt: true, accent: "#fde68a", hat: "beret", hatColor: "#be123c", price: 140, note: "Gaya ala Paris" },
  { id: "date_05", name: "Kencan Rose", top: "#fb7185", bottom: "#fecdd3", skirt: true, accent: "#ffffff", bow: "#e11d48", price: 150, note: "Buat jalan sama Ajis 💕" },
  { id: "sundress_09", name: "Sundress & Topi", top: "#fef08a", bottom: "#fde047", skirt: true, accent: "#ffffff", hat: "straw", hatColor: "#f59e0b", price: 160, note: "Piknik di taman" },
  { id: "gown_10", name: "Gaun Pesta", top: "#93c5fd", bottom: "#bfdbfe", skirt: true, accent: "#ffffff", bow: "#ffffff", price: 250, note: "Spesial hari jadi" },
];

export const getOutfit = (id: string) => OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];

export type CatalogEntry = { id: string; name: string; icon: string; price: number; note: string };

export const SEED_SHOP: CatalogEntry[] = [
  { id: "seed_wheat", name: "Benih Gandum", icon: "🌾", price: 10, note: "Panen 3 hari" },
  { id: "seed_strawberry", name: "Benih Stroberi", icon: "🍓", price: 20, note: "Panen 4 hari" },
];

export const FEED_SHOP: CatalogEntry[] = [
  { id: "feed", name: "Pakan Ayam", icon: "🌾", price: 5, note: "Biji-bijian untuk ayam · 1 pakan/ayam/hari" },
  { id: "feed_cow", name: "Pakan Sapi", icon: "🌿", price: 10, note: "Rumput jerami untuk sapi · 1 pakan/sapi/hari" },
];

export const DECOR_SHOP: CatalogEntry[] = [
  { id: "big_case", name: "Etalase Besar", icon: "🧁", price: 250, note: "Etalase jadi 6 slot" },
  { id: "flowers", name: "Pot Bunga", icon: "🌷", price: 60, note: "Di depan toko" },
  { id: "lanterns", name: "Lampion", icon: "🏮", price: 80, note: "Menggantung di toko" },
  { id: "rug", name: "Karpet Rajut", icon: "🧶", price: 100, note: "Di dalam toko" },
  { id: "menu_board", name: "Papan Menu", icon: "🪧", price: 70, note: "Di depan pintu" },
];

/** Jam buka pelanggan, dalam menit game. */
export const BUSINESS_HOURS: [number, number] = [8 * 60, 20 * 60];
export const DAY_START = 6 * 60;
export const DAY_END = 24 * 60;
/** 1 hari game (06:00–24:00) = 10 menit nyata. */
export const GAME_MINUTES_PER_SECOND = (DAY_END - DAY_START) / 600;

// ---------- Tata letak kota (meter; utara = z negatif) ----------

export const MAP_LIMIT = 26;

export const SHOP = { minX: -6, maxX: 6, minZ: -14, maxZ: -4, doorHalf: 1.3 };
export const SPOTS = {
  bed: [-4.4, -12] as [number, number],
  fridge: [0.55, -13.2] as [number, number],
  oven: [4.3, -12.9] as [number, number],
  case: [0, -8.6] as [number, number], // Windi melayani dari sisi utara etalase
  counterCustomer: [0, -6.6] as [number, number],
  radio: [-5.3, -6.5] as [number, number],
  door: [0, -3] as [number, number],
};

export const GARDEN_ORIGIN: [number, number] = [9.2, -12.2];
export const PLOT_COUNT = 12; // 6 di kebun timur + 6 di lahan barat (harus dibeli)
export const BASE_PLOTS = 6;
export const WEST_ORIGIN: [number, number] = [-13.3, -12.2];
export const plotPos = (i: number): [number, number] => {
  const o = i < BASE_PLOTS ? GARDEN_ORIGIN : WEST_ORIGIN;
  const k = i % BASE_PLOTS;
  return [o[0] + (k % 3) * 1.9, o[1] + Math.floor(k / 3) * 2.4];
};
export const plotUsable = (i: number, upgrades: string[]) => i < BASE_PLOTS || upgrades.includes("land_farm2");

/** Lahan barat (kebun tambahan) dan lahan peternakan di utara-timur. */
export const WEST_FIELD = { minX: -14.6, maxX: -7.9, minZ: -13.8, maxZ: -8.0, gate: [-11.8, -10.2] as [number, number] };
export const RANCH = { minX: 9, maxX: 21, minZ: -25, maxZ: -16.5, gate: [15.4, 17.2] as [number, number] };
/**
 * Kalau posisi berada di dalam lahan yang belum dibeli (pagarnya tertutup), kembalikan titik aman di depan
 * gerbangnya. Mencegah Windi terkurung, mis. dari simpanan lama sebelum lahan itu dipagari.
 */
export function rescueFromLockedLand(x: number, z: number, upgrades: string[]): [number, number] | null {
  const areas = [
    { r: WEST_FIELD, owned: upgrades.includes("land_farm2") },
    { r: RANCH, owned: upgrades.includes("land_ranch") },
  ];
  for (const { r, owned } of areas) {
    if (owned) continue;
    if (x > r.minX - 0.3 && x < r.maxX + 0.3 && z > r.minZ - 0.3 && z < r.maxZ + 0.3) {
      return [(r.gate[0] + r.gate[1]) / 2, r.maxZ + 1.6];
    }
  }
  return null;
}

export const COOP_POS: [number, number] = [11.8, -23];
export const BARN_POS: [number, number] = [18.2, -23];
export const CHICKEN_AREA = { center: [12, -19.6] as [number, number], radius: 1.9 };
export const COW_AREA = { center: [18, -19.4] as [number, number], radius: 1.8 };

export const BENCHES: { pos: [number, number]; rot: number }[] = [
  { pos: [-6, 6], rot: Math.PI / 2 },
  { pos: [6, 6], rot: -Math.PI / 2 },
  { pos: [-6, 12], rot: Math.PI / 2 },
  { pos: [-13, 15], rot: 0 },
];
/** Bangku tempat Ajis nongkrong, menghadap barat ke arah taman. */
export const AJIS_BENCH = { pos: [12.5, 14.5] as [number, number], rot: -Math.PI / 2 };

export const FOUNTAIN: [number, number] = [0, 9];

export const TREES: [number, number][] = [
  [-16, -2], [-17, 6], [-15, 11], [-17, 17], [-10, 18], [-3, 17.5], [4, 18], [16, 17],
  [17, 9], [16, 1], [-9, -16], [19.5, -5], [-17, -14], [9.5, 3.5], [-9.5, 3.5],
  // Pinggiran kota yang lebih luas
  [-23, -5], [-22, 8], [-24, 18], [22, 6], [24, 15], [23, -8], [-20, -20], [-24, -12], [0, -22], [-5, -21],
  [5, 24], [-14, 23], [10, 23], [20, 22], [-22, 24], [24, 0], [-3, 23], [24, -18], [3, -21],
];

/** Kandidat titik item liar; tiap hari game dipilih sebagian secara acak tapi tetap (seeded). */
export const FORAGE_SPOTS: [number, number][] = [
  [-14, 3], [-11, 8], [-15, 14], [-8, 16], [-2, 14], [3, 15], [9, 16], [14, 11],
  [12, 6], [15, -2], [-12, -4], [-16, -11], [-11, -17], [17.8, -12], [8, 9], [-4, 4.5],
  [-21, 0], [21, 10], [-20, 14], [22, -12], [-18, 21], [14, 21], [-2, -18], [7, -19],
];
export const FORAGE_PER_DAY = 6;
const FORAGE_TYPES = ["wild_berry", "chamomile", "mushroom"];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function forageForDay(day: number) {
  const rand = mulberry32(day * 9973 + 17);
  const idx = FORAGE_SPOTS.map((_, i) => i).sort(() => rand() - 0.5).slice(0, FORAGE_PER_DAY);
  return idx.map((i) => ({
    id: `f${i}`,
    pos: FORAGE_SPOTS[i],
    item: FORAGE_TYPES[Math.floor(rand() * FORAGE_TYPES.length)],
  }));
}

/** Titik terbuka di kota tempat surat harian bisa muncul. */
export const LETTER_SPOTS: [number, number][] = [
  [-13, 1], [-9, 10], [-4, 12], [4, 12], [10, 12], [13, 4], [-3, 1.5], [7, -1], [-12, -7], [14, -9], [-7, 17], [6, 16.5],
];

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Tanggal nyata "YYYY-MM-DD" dalam WIB, untuk surat harian. */
export function dayKey(offsetDays = 0) {
  return new Date(Date.now() + WIB_OFFSET_MS + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

export function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------- Lahan, bangunan, upgrade, ternak, peliharaan (dibeli dengan koin) ----------

export type ShopEntry = CatalogEntry & { requires?: string; requiresName?: string };

/** Lahan & bangunan. Disimpan di save.upgrades. */
export const LAND_SHOP: ShopEntry[] = [
  { id: "land_farm2", name: "Lahan Kebun Barat", icon: "🟫", price: 400, note: "+6 petak kebun di barat toko" },
  { id: "land_ranch", name: "Lahan Peternakan", icon: "🏞️", price: 600, note: "Padang rumput di utara kebun" },
  { id: "coop", name: "Kandang Ayam", icon: "🛖", price: 250, note: "Muat 4 ayam", requires: "land_ranch", requiresName: "Lahan Peternakan" },
  { id: "barn", name: "Kandang Sapi", icon: "🏠", price: 450, note: "Muat 2 sapi", requires: "land_ranch", requiresName: "Lahan Peternakan" },
];

/** Upgrade alat & perabot. Disimpan di save.upgrades. */
export const UPGRADE_SHOP: ShopEntry[] = [
  { id: "fridge", name: "Kulkas", icon: "🧊", price: 300, note: "Simpan susu & telur, buka 4 resep baru" },
  { id: "oven2", name: "Oven Besar", icon: "🔥", price: 350, note: "Masak 3 detik & hemat energi (7)" },
  { id: "oven3", name: "Oven Profesional", icon: "♨️", price: 800, note: "Sekali masak dapat 2 kue", requires: "oven2", requiresName: "Oven Besar" },
  { id: "case_lux", name: "Etalase Mewah", icon: "✨", price: 700, note: "Etalase jadi 9 slot", requires: "big_case", requiresName: "Etalase Besar" },
  { id: "sprinkler", name: "Penyiram Otomatis", icon: "💦", price: 500, note: "Semua petak tersiram tiap pagi" },
  { id: "bed", name: "Kasur Empuk", icon: "🛏️", price: 300, note: "Energi maksimal jadi 130" },
  { id: "shoes", name: "Sepatu Lari", icon: "👟", price: 150, note: "Jalan 30% lebih cepat" },
];

export type AnimalKind = "chicken" | "cow";
export const ANIMAL_SHOP: (ShopEntry & { kind: AnimalKind; max: number; product: string; feed: string })[] = [
  { id: "chicken", kind: "chicken", name: "Ayam", icon: "🐔", price: 80, note: "Bertelur tiap hari kalau diberi Pakan Ayam", requires: "coop", requiresName: "Kandang Ayam", max: 4, product: "egg", feed: "feed" },
  { id: "cow", kind: "cow", name: "Sapi", icon: "🐄", price: 300, note: "Susu segar tiap hari kalau diberi Pakan Sapi", requires: "barn", requiresName: "Kandang Sapi", max: 2, product: "milk", feed: "feed_cow" },
];
export const animalInfo = (kind: AnimalKind) => ANIMAL_SHOP.find((a) => a.kind === kind)!;
export const ANIMAL_NAMES: Record<AnimalKind, string[]> = {
  chicken: ["Cimol", "Kuning", "Pipit", "Dodol", "Bakpao", "Gemoy"],
  cow: ["Moli", "Susi", "Belang", "Coklat"],
};

export type PetKind = "cat" | "dog" | "bunny";
export const PET_SHOP: (ShopEntry & { kind: PetKind })[] = [
  { id: "bunny", kind: "bunny", name: "Kelinci Putih", icon: "🐰", price: 120, note: "Lompat-lompat ngikutin Windi" },
  { id: "cat", kind: "cat", name: "Kucing Oren", icon: "🐱", price: 150, note: "Manja, suka dielus" },
  { id: "dog", kind: "dog", name: "Anjing Shiba", icon: "🐶", price: 200, note: "Setia menemani jalan-jalan" },
];

export const ENERGY_BASE = 100;
export const maxEnergy = (upgrades: string[]) => (upgrades.includes("bed") ? 130 : ENERGY_BASE);
export const bakeSeconds = (upgrades: string[]) => (upgrades.includes("oven2") ? 3 : BAKE_SECONDS);
export const bakeEnergy = (upgrades: string[]) => (upgrades.includes("oven2") ? 7 : BAKE_ENERGY);
export const bakeYield = (upgrades: string[]) => (upgrades.includes("oven3") ? 2 : 1);
export const walkBoost = (upgrades: string[]) => (upgrades.includes("shoes") ? 1.3 : 1);