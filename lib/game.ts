import type { Prisma, User } from "@prisma/client";
import { prisma } from "./prisma";
import { LETTER_SPOTS, MAP_LIMIT, PLOT_COUNT, dayKey } from "./data";
import { normalizeQuests } from "./quests";
import type { Animal, GameState, Plot, SaveData } from "./types";

const STARTER_INVENTORY: Record<string, number> = { seed_wheat: 3, seed_strawberry: 2, wheat: 2 };

/** Membersihkan daftar hewan ternak dari database/client. */
function normalizeAnimals(v: unknown): Animal[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((a): Animal | null => {
      const o = (a ?? {}) as Record<string, unknown>;
      if (typeof o.id !== "string" || (o.kind !== "chicken" && o.kind !== "cow")) return null;
      const love = typeof o.love === "number" && Number.isFinite(o.love) ? Math.max(0, Math.min(10, Math.floor(o.love))) : 0;
      return {
        id: o.id.slice(0, 40),
        kind: o.kind,
        name: typeof o.name === "string" ? o.name.slice(0, 30) : "Hewan",
        fed: o.fed === true,
        petted: o.petted === true,
        product: o.product === true,
        love,
      };
    })
    .filter((a): a is Animal => a !== null)
    .slice(0, 12);
}

const strings = (v: Prisma.JsonValue): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Game ini single-user: profil pertama adalah Windi, dibuat otomatis lengkap dengan bekal awal. */
export async function getUser(): Promise<User> {
  const existing = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      inventories: { create: Object.entries(STARTER_INVENTORY).map(([itemId, quantity]) => ({ itemId, quantity })) },
      farmPlots: { create: Array.from({ length: PLOT_COUNT }, (_, plotIndex) => ({ plotIndex })) },
    },
  });
}

export async function loadState(): Promise<GameState> {
  const user = await getUser();
  const today = dayKey();

  // Surat yang jadwalnya sudah tiba diberi titik spawn acak di kota (sekali saja).
  const unplaced = await prisma.letter.findMany({ where: { availableOn: { lte: today }, posX: null }, select: { id: true } });
  for (const l of unplaced) {
    const [x, z] = LETTER_SPOTS[Math.floor(Math.random() * LETTER_SPOTS.length)];
    await prisma.letter.update({ where: { id: l.id }, data: { posX: x + (Math.random() - 0.5), posZ: z + (Math.random() - 0.5) } });
  }

  const [inventories, plots, letters] = await Promise.all([
    prisma.inventory.findMany({ where: { userId: user.id } }),
    prisma.farmPlot.findMany({ where: { userId: user.id }, orderBy: { plotIndex: "asc" } }),
    prisma.letter.findMany({ where: { availableOn: { lte: today } }, orderBy: { availableOn: "asc" } }),
  ]);

  const plotList: Plot[] = Array.from({ length: PLOT_COUNT }, (_, i) => {
    const p = plots.find((x) => x.plotIndex === i);
    return { seedId: p?.seedId ?? null, watered: p?.watered ?? false, growthStage: p?.growthStage ?? 0 };
  });

  return {
    name: user.name,
    today,
    savedAt: user.updatedAt.getTime(),
    save: {
      coins: user.coins,
      inGameDay: user.inGameDay,
      minutes: user.minutes,
      energy: user.energy,
      outfitId: user.outfitId,
      posX: user.posX,
      posZ: user.posZ,
      shopOpen: user.shopOpen,
      caseSlots: user.caseSlots,
      caseItems: strings(user.caseItems),
      ownedOutfits: strings(user.ownedOutfits),
      decorations: strings(user.decorations),
      unlockedRecipes: strings(user.unlockedRecipes),
      foraged: strings(user.foraged),
      ajisTalkDay: user.ajisTalkDay,
      quests: normalizeQuests(user.quests, user.inGameDay),
      upgrades: strings(user.upgrades),
      animals: normalizeAnimals(user.animals),
      pets: strings(user.pets),
      activePet: user.activePet,
      petDay: user.petDay,
      tutorialDone: user.tutorialDone,
      inventory: Object.fromEntries(inventories.filter((i) => i.quantity > 0).map((i) => [i.itemId, i.quantity])),
      plots: plotList,
    },
    letters: letters.map((l) => ({
      id: l.id,
      title: l.title,
      body: l.body,
      photoUrl: l.photoUrl,
      availableOn: l.availableOn,
      posX: l.posX ?? 0,
      posZ: l.posZ ?? 0,
      readAt: l.readAt ? l.readAt.toISOString() : null,
    })),
  };
}

const int = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : null;
const num = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : null;
const strList = (v: unknown) => (Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]).slice(0, 200) : null);

/** Memvalidasi bentuk snapshot dari client. Mengembalikan null kalau ada yang tidak masuk akal. */
export function parseSave(body: unknown): SaveData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const fields = {
    coins: int(b.coins, 0, 10_000_000),
    inGameDay: int(b.inGameDay, 1, 1_000_000),
    minutes: int(b.minutes, 0, 1440),
    energy: int(b.energy, 0, 200),
    outfitId: typeof b.outfitId === "string" ? b.outfitId : null,
    posX: num(b.posX, -MAP_LIMIT, MAP_LIMIT),
    posZ: num(b.posZ, -MAP_LIMIT, MAP_LIMIT),
    shopOpen: typeof b.shopOpen === "boolean" ? b.shopOpen : null,
    caseSlots: int(b.caseSlots, 1, 12),
    caseItems: strList(b.caseItems),
    ownedOutfits: strList(b.ownedOutfits),
    decorations: strList(b.decorations),
    unlockedRecipes: strList(b.unlockedRecipes),
    foraged: strList(b.foraged),
    ajisTalkDay: int(b.ajisTalkDay, 0, 1_000_000),
    upgrades: strList(b.upgrades),
    pets: strList(b.pets),
    petDay: int(b.petDay, 0, 1_000_000),
  };
  if (Object.values(fields).some((v) => v === null)) return null;

  const inv = b.inventory;
  if (!inv || typeof inv !== "object" || Array.isArray(inv)) return null;
  const inventory: Record<string, number> = {};
  for (const [k, v] of Object.entries(inv)) {
    const q = int(v, 0, 100_000);
    if (q === null) return null;
    if (q > 0) inventory[k] = q;
  }

  if (!Array.isArray(b.plots) || b.plots.length !== PLOT_COUNT) return null;
  const plots: Plot[] = [];
  for (const p of b.plots as unknown[]) {
    const o = p as Record<string, unknown> | null;
    const stage = int(o?.growthStage, 0, 99);
    if (!o || stage === null || typeof o.watered !== "boolean" || !(o.seedId === null || typeof o.seedId === "string")) return null;
    plots.push({ seedId: o.seedId as string | null, watered: o.watered, growthStage: stage });
  }

  const activePet = typeof b.activePet === "string" ? b.activePet : null;
  const base = fields as Omit<SaveData, "inventory" | "plots" | "quests" | "animals" | "activePet" | "tutorialDone">;
  return {
    ...base,
    quests: normalizeQuests(b.quests, base.inGameDay),
    animals: normalizeAnimals(b.animals),
    activePet,
    tutorialDone: b.tutorialDone === true,
    inventory,
    plots,
  };
}

export async function writeSave(save: SaveData) {
  const user = await getUser();
  const { inventory, plots, quests, animals, upgrades, pets, ...rest } = save;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        ...rest,
        quests: quests as unknown as Prisma.InputJsonValue,
        animals: animals as unknown as Prisma.InputJsonValue,
        upgrades,
        pets,
      },
    }),
    prisma.inventory.deleteMany({ where: { userId: user.id } }),
    prisma.inventory.createMany({
      data: Object.entries(inventory).map(([itemId, quantity]) => ({ userId: user.id, itemId, quantity })),
    }),
    ...plots.map((p, plotIndex) =>
      prisma.farmPlot.upsert({
        where: { userId_plotIndex: { userId: user.id, plotIndex } },
        update: p,
        create: { ...p, userId: user.id, plotIndex },
      }),
    ),
  ]);
}
