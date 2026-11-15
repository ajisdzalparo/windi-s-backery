import { AJIS_BENCH, BENCHES, CROPS, PLOT_COUNT, RANCH, SPOTS, WEST_FIELD, animalInfo, forageForDay, itemOf, plotPos, plotUsable } from "./data";
import { runtime } from "./runtime";
import type { LetterItem, SaveData } from "./types";

export type Interaction = { key: string; label: string; icon: string };

type Candidate = Interaction & { x: number; z: number; r: number };

/** Daftar semua hal yang bisa dipakai di dunia, sesuai keadaan game saat ini. */
function candidates(save: SaveData, letters: LetterItem[]): Candidate[] {
  const list: Candidate[] = [
    { key: "bed", label: "Tidur", icon: "🛏️", x: SPOTS.bed[0], z: SPOTS.bed[1], r: 1.9 },
    { key: "oven", label: "Masak", icon: "🔥", x: SPOTS.oven[0], z: SPOTS.oven[1], r: 1.7 },
    { key: "case", label: "Etalase", icon: "🧁", x: SPOTS.case[0], z: SPOTS.case[1], r: 1.8 },
    { key: "radio", label: "Radio", icon: "📻", x: SPOTS.radio[0], z: SPOTS.radio[1], r: 1.4 },
    { key: "ajis", label: "Belanja", icon: "🛒", x: AJIS_BENCH.pos[0] - 1.1, z: AJIS_BENCH.pos[1], r: 1.8 },
  ];

  BENCHES.forEach((b, i) =>
    list.push({ key: `bench:${i}`, label: "Duduk", icon: "🪑", x: b.pos[0], z: b.pos[1], r: 1.5 }),
  );

  // Papan "Dijual" di lahan yang belum dibeli
  if (!save.upgrades.includes("land_farm2")) {
    list.push({ key: "sign:land_farm2", label: "Lahan dijual", icon: "🪧", x: (WEST_FIELD.gate[0] + WEST_FIELD.gate[1]) / 2, z: WEST_FIELD.maxZ + 0.9, r: 1.6 });
  }
  if (!save.upgrades.includes("land_ranch")) {
    list.push({ key: "sign:land_ranch", label: "Lahan dijual", icon: "🪧", x: (RANCH.gate[0] + RANCH.gate[1]) / 2, z: RANCH.maxZ + 0.9, r: 1.6 });
  }

  for (const a of save.animals) {
    const p = runtime.animals.get(a.id);
    if (!p) continue;
    const info = animalInfo(a.kind);
    const action: Interaction | null = a.product
      ? { key: `animal:${a.id}`, label: a.kind === "cow" ? "Perah susu" : "Ambil telur", icon: itemOf(info.product).icon }
      : !a.fed
        ? { key: `animal:${a.id}`, label: `Beri makan ${a.name}`, icon: "🌾" }
        : !a.petted
          ? { key: `animal:${a.id}`, label: `Elus ${a.name}`, icon: "💕" }
          : null;
    if (action) list.push({ ...action, x: p.x, z: p.z, r: a.kind === "cow" ? 1.7 : 1.2 });
  }

  if (runtime.pet && save.activePet && save.petDay !== save.inGameDay) {
    list.push({ key: "pet", label: "Elus", icon: "🐾", x: runtime.pet.x, z: runtime.pet.z, r: 1.1 });
  }

  for (let i = 0; i < PLOT_COUNT; i++) {
    if (!plotUsable(i, save.upgrades)) continue;
    const p = save.plots[i];
    const [x, z] = plotPos(i);
    const crop = p.seedId ? CROPS[p.seedId] : null;
    let action: Interaction;
    if (!crop) action = { key: `plant:${i}`, label: "Tanam", icon: "🌱" };
    else if (p.growthStage >= crop.days) action = { key: `harvest:${i}`, label: "Panen", icon: itemOf(crop.crop).icon };
    else if (!p.watered) action = { key: `water:${i}`, label: "Siram", icon: "💧" };
    else continue;
    list.push({ ...action, x, z, r: 1.05 });
  }

  for (const f of forageForDay(save.inGameDay)) {
    if (save.foraged.includes(f.id)) continue;
    list.push({ key: `forage:${f.id}`, label: `Ambil ${itemOf(f.item).name}`, icon: itemOf(f.item).icon, x: f.pos[0], z: f.pos[1], r: 1.3 });
  }

  for (const [id, p] of runtime.npcs) {
    list.push({ key: `npc:${id}`, label: "Sapa", icon: "👋", x: p.x, z: p.z, r: 1.5 });
  }

  for (const l of letters) {
    if (!l.readAt) list.push({ key: `letter:${l.id}`, label: "Buka surat", icon: "💌", x: l.posX, z: l.posZ, r: 1.4 });
  }
  return list;
}

export function findNearby(save: SaveData, letters: LetterItem[], x: number, z: number): Interaction | null {
  let best: Candidate | null = null;
  let bestD = Infinity;
  for (const c of candidates(save, letters)) {
    const d = Math.hypot(c.x - x, c.z - z);
    if (d <= c.r && d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best ? { key: best.key, label: best.label, icon: best.icon } : null;
}
