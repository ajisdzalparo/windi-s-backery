import type { QuestState } from "./quests";

export type LetterItem = {
  id: string;
  title: string;
  body: string;
  photoUrl: string | null;
  availableOn: string;
  posX: number;
  posZ: number;
  readAt: string | null;
};

/** Hewan ternak. product = hasil (telur/susu) siap diambil pagi ini. */
export type Animal = {
  id: string;
  kind: "chicken" | "cow";
  name: string;
  fed: boolean;
  petted: boolean;
  product: boolean;
  love: number; // 0..10, naik kalau dielus; love ≥ 6 → hasil 2
};

export type Plot ={ seedId: string | null; watered: boolean; growthStage: number };

/** Semua yang disimpan ke database lewat PUT /api/save. */
export type SaveData = {
  coins: number;
  inGameDay: number;
  minutes: number;
  energy: number;
  outfitId: string;
  posX: number;
  posZ: number;
  shopOpen: boolean;
  caseSlots: number;
  caseItems: string[];
  ownedOutfits: string[];
  decorations: string[];
  unlockedRecipes: string[];
  foraged: string[];
  ajisTalkDay: number;
  quests: QuestState;
  upgrades: string[]; // lahan, bangunan, alat yang sudah dibeli
  animals: Animal[];
  pets: string[]; // jenis peliharaan yang dimiliki
  activePet: string | null; // peliharaan yang sedang ikut Windi
  petDay: number; // hari terakhir peliharaan dielus (bonus energi sekali sehari)
  tutorialDone: boolean;
  inventory: Record<string, number>;
  plots: Plot[];
};

export type GameState = { name: string; save: SaveData; letters: LetterItem[]; today: string; savedAt: number };
