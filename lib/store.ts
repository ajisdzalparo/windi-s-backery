"use client";

import { create } from "zustand";
import { ajisChat, ajisLines } from "./ajis";
import {
  ANIMAL_NAMES,
  ANIMAL_SHOP,
  BENCHES,
  LAND_SHOP,
  PET_SHOP,
  UPGRADE_SHOP,
  animalInfo,
  bakeEnergy,
  bakeSeconds,
  bakeYield,
  maxEnergy,
  plotUsable,
  rescueFromLockedLand,
  BUSINESS_HOURS,
  CROPS,
  DAY_END,
  DAY_START,
  DECOR_SHOP,
  ENERGY,
  GAME_MINUTES_PER_SECOND,
  OUTFITS,
  RECIPES,
  SEED_SHOP,
  SPOTS,
  dayKey,
  forageForDay,
  itemOf,
} from "./data";
import type { Interaction } from "./interactions";
import { playMusic, stopMusic, trackCount } from "./music";
import { runtime } from "./runtime";
import { playSfx } from "./sfx";
import { townsfolkById } from "./townsfolk";
import { TUTORIAL } from "./tutorial";
import { cacheLetters, cachedLetters, pendingReads, queueRead, readLocalSave, setPendingReads, writeLocalSave } from "./offline";
import { STORY, applyEvent, dailyQuest, isDone, normalizeQuests, storyQuest, type Reward } from "./quests";
import type { GameState, LetterItem, SaveData } from "./types";

export type BuyKind = "seed" | "decor" | "outfit" | "land" | "upgrade" | "animal" | "pet";
export type CatalogTab = "seed" | "animal" | "pet" | "land" | "upgrade" | "decor";

export type Panel = null | "bag" | "kitchen" | "case" | "catalog" | "boutique" | "quests" | "archive" | "music" | "ajis" | "sleep" | "seeds";

type Store = {
  status: "loading" | "ready" | "error";
  offline: boolean; // server tidak terjangkau; progres tersimpan di HP
  syncNow: () => Promise<void>;
  name: string;
  today: string;
  save: SaveData;
  letters: LetterItem[];

  minute: number; // menit game dibulatkan, untuk HUD
  panel: Panel;
  seedPlot: number | null;
  openLetterId: string | null;
  /** Dialog bawah yang sedang tampil (Ajis atau warga). */
  ajis: { lines: string[]; index: number; name: string; portrait: string };
  nearby: Interaction | null;
  sittingAt: number | null; // indeks bangku
  bake: { recipeId: string; endsAt: number } | null;
  photo: boolean;
  menu: boolean; // layar menu utama
  previewOutfit: string | null; // baju yang sedang dicoba di butik
  toast: string | null;
  toastPortrait: string | null; // potret yang tampil di samping notifikasi (mis. warga yang disapa)
  sales: { id: number; text: string }[];
  music: { on: boolean; index: number };
  questBanner: { id: number; title: string } | null; // pita "Misi Selesai!"
  tutorialStep: number | null;
  startTutorial: () => void;
  nextTutorial: () => void;
  endTutorial: () => void;

  load: () => Promise<void>;
  track: (event: string, amount?: number) => void;
  claimQuest: (which: "story" | number) => void;
  tick: (dt: number) => void;
  setPanel: (p: Panel) => void;
  setNearby: (n: Interaction | null) => void;
  interact: () => void;
  standUp: () => void;

  plant: (plot: number, seedId: string) => void;
  startBake: (recipeId: string) => void;
  placeInCase: (itemId: string) => void;
  takeFromCase: (index: number) => void;
  toggleShop: () => void;
  sellOne: () => string | null;
  eat: (itemId: string) => void;
  buy: (kind: BuyKind, id: string) => void;
  setActivePet: (id: string | null) => void;
  catalogTab: CatalogTab;
  atShop: boolean; // sedang di Toko Ajis (hanya di sini bisa membeli)
  shopGreeting: string | null;
  ajisThenShop: boolean;
  openCatalog: (tab: CatalogTab) => void;
  wear: (outfitId: string) => void;
  sleep: (passedOut?: boolean) => void;
  nextAjisLine: () => void;
  chatAjis: () => void;

  openLetter: (id: string) => void;
  closeLetter: () => void;
  toggleMusic: () => void;
  skipTrack: (dir: 1 | -1) => void;
  setPhoto: (on: boolean) => void;
  setMenu: (on: boolean) => void;
  setPreview: (outfitId: string | null) => void;
  say: (text: string, portrait?: string) => void;
};

// ---------- Simpan ke server ----------

let saveTimer: ReturnType<typeof setTimeout> | undefined;

/** Saat menu utama terbuka, Windi berpose di depan pintu toko; posisi aslinya disimpan di sini. */
const MENU_STAGE = { x: 0, z: -1.7 };
let menuReturn: { x: number; z: number } | null = null;
/** Posisi awal langkah tutorial (untuk mengukur "sudah berjalan"). */
let tutorialFrom = { x: 0, z: 0 };

function enterMenuStage() {
  if (!menuReturn) menuReturn = { x: runtime.player.x, z: runtime.player.z };
  runtime.player.x = MENU_STAGE.x;
  runtime.player.z = MENU_STAGE.z;
}

function leaveMenuStage() {
  if (!menuReturn) return;
  runtime.player.x = menuReturn.x;
  runtime.player.z = menuReturn.z;
  menuReturn = null;
}

function snapshot(): SaveData {
  const { save } = useGame.getState();
  const pos = menuReturn ?? runtime.player;
  return { ...save, minutes: Math.floor(runtime.clock), posX: pos.x, posZ: pos.z };
}

/**
 * Simpan: selalu ke HP dulu (langsung), lalu ke server kalau online. Kalau gagal, ditandai offline
 * dan dikirim ulang otomatis saat koneksi kembali.
 */
export function saveNow(keepalive = false) {
  clearTimeout(saveTimer);
  const { status, name } = useGame.getState();
  if (status !== "ready") return Promise.resolve();
  const snap = snapshot();
  writeLocalSave(snap, name);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    useGame.setState({ offline: true });
    return Promise.resolve();
  }
  return fetch("/api/save", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snap),
    keepalive,
  })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      useGame.setState({ offline: false });
    })
    .catch(() => useGame.setState({ offline: true }));
}

/** Kirim surat yang dibaca saat offline. */
async function flushReads() {
  const ids = pendingReads();
  if (!ids.length) return;
  const left: string[] = [];
  for (const id of ids) {
    const ok = await fetch(`/api/letters/${id}/read`, { method: "POST" }).then((r) => r.ok).catch(() => false);
    if (!ok) left.push(id);
  }
  setPendingReads(left);
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void saveNow(), 1500);
}

const add = (inv: Record<string, number>, id: string, n: number) => {
  const next = { ...inv, [id]: (inv[id] ?? 0) + n };
  if (next[id] <= 0) delete next[id];
  return next;
};

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let saleId = 0;

export const useGame = create<Store>((set, get) => {
  /** Ubah data simpanan lalu jadwalkan penyimpanan. */
  const patch = (fn: (s: SaveData) => Partial<SaveData>) => {
    set({ save: { ...get().save, ...fn(get().save) } });
    scheduleSave();
  };

  /** Pakai energi; false (dan pesan) kalau tidak cukup. */
  const spend = (n: number) => {
    if (get().save.energy < n) {
      get().say("Energinya habis 😮‍💨 Makan kue, duduk, atau tidur dulu");
      return false;
    }
    patch((s) => ({ energy: s.energy - n }));
    return true;
  };

  return {
    status: "loading",
    name: "Windi",
    today: "",
    save: null as unknown as SaveData,
    letters: [],

    minute: DAY_START,
    panel: null,
    seedPlot: null,
    openLetterId: null,
    ajis: { lines: [], index: 0, name: "Ajis", portrait: "ajis" },
    nearby: null,
    sittingAt: null,
    bake: null,
    photo: false,
    menu: true,
    previewOutfit: null,
    toast: null,
    toastPortrait: null,
    sales: [],
    music: { on: false, index: 0 },
    questBanner: null,
    tutorialStep: null,
    startTutorial: () => {
      tutorialFrom = { x: runtime.player.x, z: runtime.player.z };
      set({ tutorialStep: 0, panel: null, menu: false });
    },
    nextTutorial: () => {
      const step = get().tutorialStep;
      if (step === null) return;
      if (step + 1 >= TUTORIAL.length) return get().endTutorial();
      tutorialFrom = { x: runtime.player.x, z: runtime.player.z };
      playSfx("click");
      set({ tutorialStep: step + 1 });
    },
    endTutorial: () => {
      set({ tutorialStep: null });
      if (!get().save.tutorialDone) patch(() => ({ tutorialDone: true }));
    },
    catalogTab: "seed",
    atShop: false,
    shopGreeting: null,
    ajisThenShop: false,
    openCatalog: (catalogTab) => {
      playSfx("click");
      set({ panel: "catalog", catalogTab });
    },
    setActivePet: (id) => {
      if (id !== null && !get().save.pets.includes(id)) return;
      patch(() => ({ activePet: id }));
    },

    track: (event, amount = 1) => {
      const s = get();
      if (s.status !== "ready") return;
      // Langkah tutorial yang menunggu aksi ini ikut maju.
      const tStep = s.tutorialStep !== null ? TUTORIAL[s.tutorialStep] : null;
      if (tStep && tStep.until.kind === "event" && tStep.until.event === event) setTimeout(() => get().nextTutorial(), 400);
      const { next, finished } = applyEvent(s.save.quests, event, amount);
      set({ save: { ...s.save, quests: next } });
      scheduleSave();
      if (finished.length) {
        playSfx("harvest");
        const id = ++saleId;
        set({ questBanner: { id, title: finished[0].title } });
        setTimeout(() => {
          if (get().questBanner?.id === id) set({ questBanner: null });
        }, 3200);
      }
    },

    claimQuest: (which) => {
      const s = get();
      const q = s.save.quests;
      let reward: Reward | null = null;
      let quests = q;
      if (which === "story") {
        const story = storyQuest(q);
        if (!story || !isDone(story, q.storyProgress)) return;
        reward = story.reward;
        const nextIndex = q.storyIndex + 1;
        const nextQuest = STORY[nextIndex];
        quests = { ...q, storyIndex: nextIndex, storyProgress: nextQuest ? nextQuest.objectives.map(() => 0) : [] };
      } else {
        const slot = q.daily[which];
        const quest = slot && dailyQuest(slot.id);
        if (!slot || !quest || slot.claimed || !isDone(quest, slot.progress)) return;
        reward = quest.reward;
        quests = { ...q, daily: q.daily.map((d, i) => (i === which ? { ...d, claimed: true } : d)) };
      }
      const r = reward;
      patch((sv) => {
        let inventory = sv.inventory;
        for (const [id, n] of Object.entries(r.items ?? {})) inventory = add(inventory, id, n);
        return {
          quests,
          inventory,
          coins: sv.coins + (r.coins ?? 0),
          decorations: r.decor && !sv.decorations.includes(r.decor) ? [...sv.decorations, r.decor] : sv.decorations,
          caseSlots: r.decor === "big_case" ? 6 : sv.caseSlots,
          ownedOutfits: r.outfit && !sv.ownedOutfits.includes(r.outfit) ? [...sv.ownedOutfits, r.outfit] : sv.ownedOutfits,
        };
      });
      playSfx("coins");
      const parts = [
        r.coins ? `+${r.coins} 🪙` : "",
        ...Object.entries(r.items ?? {}).map(([id, n]) => `+${n} ${itemOf(id).icon}`),
        r.decor ? `dekorasi ${DECOR_SHOP.find((d) => d.id === r.decor)?.name ?? ""}` : "",
        r.outfit ? `baju ${OUTFITS.find((o) => o.id === r.outfit)?.name ?? ""}` : "",
      ].filter(Boolean);
      s.say(`🎁 Hadiah: ${parts.join(", ")}`);
    },

    offline: false,
    syncNow: async () => {
      await saveNow();
      await flushReads();
    },

    load: async () => {
      set({ status: "loading" });
      // Coba server (maks 5 detik); kalau gagal, pakai simpanan di HP.
      let state: GameState | null = null;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch("/api/state", { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(timer);
        if (res.ok) state = await res.json();
      } catch {
        /* offline */
      }
      const local = readLocalSave();
      const fromServer = state !== null;
      let pushLocal = false;
      if (state) {
        cacheLetters(state.letters);
        // Simpanan di HP lebih baru (dimainkan saat offline) → pakai itu lalu kirim ke server.
        if (local && local.savedAt > state.savedAt + 2000) {
          state = { ...state, save: local.save };
          pushLocal = true;
        }
      } else if (local) {
        state = { name: local.name, today: dayKey(), save: local.save, letters: cachedLetters(), savedAt: local.savedAt };
      }
      if (!state) return set({ status: "error" });
      // Surat yang dibaca saat offline tetap tercatat dibaca.
      const reads = new Set(pendingReads());
      if (reads.size) state = { ...state, letters: state.letters.map((l) => (reads.has(l.id) && !l.readAt ? { ...l, readAt: new Date().toISOString() } : l)) };
      set({ offline: !fromServer || !navigator.onLine });
      try {
        runtime.clock = state.save.minutes;
        runtime.player.x = state.save.posX;
        runtime.player.z = state.save.posZ;
        const safe = rescueFromLockedLand(runtime.player.x, runtime.player.z, state.save.upgrades);
        if (safe) [runtime.player.x, runtime.player.z] = safe;
        if (get().menu) enterMenuStage();
        set({ ...state, minute: state.save.minutes, status: "ready" });
        if (pushLocal || reads.size) void get().syncNow();
      } catch {
        set({ status: "error" });
      }
    },

    tick: (dt) => {
      const s = get();
      if (s.status !== "ready") return;
      // Waktu berhenti selama ada jendela/surat terbuka atau sedang mode foto.
      const paused = s.menu || s.panel !== null || s.openLetterId !== null || s.photo;
      if (!paused) runtime.clock += dt * GAME_MINUTES_PER_SECOND;
      if (runtime.clock >= DAY_END) return s.sleep(true);

      // Tutorial: langkah "berjalan" dan "mendekati" diperiksa tiap frame.
      if (s.tutorialStep !== null && !s.panel) {
        const u = TUTORIAL[s.tutorialStep].until;
        if (u.kind === "move" && Math.hypot(runtime.player.x - tutorialFrom.x, runtime.player.z - tutorialFrom.z) >= u.meters) s.nextTutorial();
        if (u.kind === "near" && s.nearby && u.prefix.some((p) => s.nearby!.key.startsWith(p))) s.nextTutorial();
      }

      const minute = Math.floor(runtime.clock);
      if (minute !== s.minute) {
        set({ minute });
        // Duduk di bangku memulihkan energi sedikit demi sedikit.
        const cap = maxEnergy(s.save.upgrades);
        if (s.sittingAt !== null && s.save.energy < cap) {
          set({ save: { ...s.save, energy: Math.min(cap, s.save.energy + 1) } });
        }
        if (minute % 30 === 0) scheduleSave();
      }
      if (s.bake && Date.now() >= s.bake.endsAt) {
        const recipe = RECIPES.find((r) => r.id === s.bake!.recipeId)!;
        set({ bake: null });
        const n = bakeYield(s.save.upgrades);
        patch((sv) => ({ inventory: add(sv.inventory, recipe.result, n) }));
        playSfx("oven");
        get().track("bake");
        get().track(`bake:${recipe.id}`);
        s.say(`${itemOf(recipe.result).icon} ${itemOf(recipe.result).name} matang!`);
      }
    },

    setPanel: (panel) => {
      if (panel) playSfx("click");
      set({ panel, ...(panel === null ? { seedPlot: null, previewOutfit: null, atShop: false } : {}) });
    },
    setNearby: (nearby) => {
      if (get().nearby?.key !== nearby?.key) set({ nearby });
    },

    interact: () => {
      const s = get();
      const n = s.nearby;
      if (!n || s.panel || s.openLetterId) return;
      const [kind, arg] = n.key.split(":");
      switch (kind) {
        case "bed":
          return set({ panel: "sleep" });
        case "oven":
          return set({ panel: "kitchen" });
        case "case":
          return set({ panel: "case" });
        case "radio":
          return set({ panel: "music" });
        case "ajis": {
          const first = !s.save.unlockedRecipes.includes("windi_special");
          if (first) patch((sv) => ({ unlockedRecipes: [...sv.unlockedRecipes, "windi_special"] }));
          if (s.save.ajisTalkDay !== s.save.inGameDay) patch(() => ({ ajisTalkDay: s.save.inGameDay }));
          get().track("talk_ajis");
          playSfx("door");
          // Kunjungan pertama: Ajis bercerita dulu (dan memberi resep rahasia), lalu toko terbuka.
          if (first) return set({ panel: "ajis", ajis: { lines: ajisLines(s.save.inGameDay, true), index: 0, name: "Ajis", portrait: "ajis" }, ajisThenShop: true });
          return set({ panel: "catalog", atShop: true, shopGreeting: ajisLines(s.save.inGameDay, false)[0] });
        }
        case "bench": {
          const b = BENCHES[Number(arg)];
          runtime.player.x = b.pos[0];
          runtime.player.z = b.pos[1];
          runtime.player.rot = b.rot;
          set({ sittingAt: Number(arg) });
          return get().track("sit");
        }
        case "plant": {
          const seeds = SEED_SHOP.filter((x) => (s.save.inventory[x.id] ?? 0) > 0);
          if (!seeds.length) return s.say("Benihnya habis. Beli di Toko Ajis ya");
          if (seeds.length === 1) return s.plant(Number(arg), seeds[0].id);
          return set({ panel: "seeds", seedPlot: Number(arg) });
        }
        case "water": {
          if (!spend(ENERGY.water)) return;
          const i = Number(arg);
          patch((sv) => ({ plots: sv.plots.map((p, j) => (j === i ? { ...p, watered: true } : p)) }));
          playSfx("water");
          get().track("water");
          return s.say("💧 Disiram");
        }
        case "harvest": {
          const i = Number(arg);
          const crop = CROPS[s.save.plots[i].seedId!];
          if (!spend(ENERGY.harvest)) return;
          patch((sv) => ({
            inventory: add(sv.inventory, crop.crop, crop.yield),
            plots: sv.plots.map((p, j) => (j === i ? { seedId: null, watered: false, growthStage: 0 } : p)),
          }));
          playSfx("harvest");
          get().track("harvest");
          return s.say(`Panen ${crop.yield} ${itemOf(crop.crop).icon} ${itemOf(crop.crop).name}!`);
        }
        case "forage": {
          const f = forageForDay(s.save.inGameDay).find((x) => x.id === arg);
          if (!f || !spend(ENERGY.forage)) return;
          patch((sv) => ({ foraged: [...sv.foraged, f.id], inventory: add(sv.inventory, f.item, 1) }));
          playSfx("pickup");
          get().track("forage");
          return s.say(`+1 ${itemOf(f.item).icon} ${itemOf(f.item).name}`);
        }
        case "letter":
          return s.openLetter(arg);
        case "npc": {
          const npc = townsfolkById(arg);
          if (!npc) return;
          playSfx("click");
          runtime.greet = { id: arg, at: Date.now() };
          get().track("greet");
          if (!get().save.quests.greeted.includes(arg)) {
            patch((sv) => ({ quests: { ...sv.quests, greeted: [...sv.quests.greeted, arg] } }));
            get().track("greet_new");
          }
          // Sapaan tampil sebagai dialog di bawah (ketuk untuk menutup), seperti kartu tutorial.
          const line = npc.lines[Math.floor(Math.random() * npc.lines.length)];
          return set({ panel: "ajis", ajis: { lines: [line], index: 0, name: npc.name, portrait: arg }, ajisThenShop: false });
        }
        case "animal": {
          const a = s.save.animals.find((x) => x.id === arg);
          if (!a) return;
          const info = animalInfo(a.kind);
          const update = (fn: (x: typeof a) => Partial<typeof a>) =>
            s.save.animals.map((x) => (x.id === a.id ? { ...x, ...fn(x) } : x));
          if (a.product) {
            const n = a.love >= 6 ? 2 : 1;
            patch((sv) => ({ inventory: add(sv.inventory, info.product, n), animals: update(() => ({ product: false })) }));
            playSfx("pickup");
            get().track("collect");
            get().track(`collect:${info.product}`);
            return s.say(`+${n} ${itemOf(info.product).icon} ${itemOf(info.product).name} dari ${a.name}`);
          }
          if (!a.fed) {
            if ((s.save.inventory.feed ?? 0) < 1) return s.say("Pakan habis. Beli Pakan Ternak di Toko Ajis");
            if (!spend(ENERGY.feed)) return;
            patch((sv) => ({ inventory: add(sv.inventory, "feed", -1), animals: update(() => ({ fed: true })) }));
            playSfx("plant");
            get().track("feed_animal");
            return s.say(`${a.name} makan dengan lahap 😋`);
          }
          if (!a.petted) {
            patch(() => ({ animals: update(() => ({ petted: true })) }));
            playSfx("click");
            get().track("pet_animal");
            return s.say(`${a.name} senang dielus 💕`);
          }
          return;
        }
        case "pet": {
          if (s.save.petDay === s.save.inGameDay) return s.say("Peliharaanmu lagi santai, besok elus lagi ya");
          const cap = maxEnergy(s.save.upgrades);
          patch((sv) => ({ petDay: sv.inGameDay, energy: Math.min(cap, sv.energy + 8) }));
          playSfx("click");
          get().track("pet_animal");
          return s.say("Dielus-elus… energi +8 💕");
        }
        case "sign":
          // Papan "Dijual" di lahan yang belum dibeli
          return s.say("Lahan ini dijual di Toko Ajis, di sisi timur taman");
      }
    },

    standUp: () => {
      if (get().sittingAt !== null) set({ sittingAt: null });
    },

    plant: (plot, seedId) => {
      const s = get();
      if ((s.save.inventory[seedId] ?? 0) < 1 || s.save.plots[plot].seedId || !plotUsable(plot, s.save.upgrades)) return;
      if (!spend(ENERGY.plant)) return;
      patch((sv) => ({
        inventory: add(sv.inventory, seedId, -1),
        plots: sv.plots.map((p, j) => (j === plot ? { seedId, watered: false, growthStage: 0 } : p)),
      }));
      set({ panel: null, seedPlot: null });
      playSfx("plant");
      get().track("plant");
      s.say(`${itemOf(seedId).icon} Ditanam. Jangan lupa disiram!`);
    },

    startBake: (recipeId) => {
      const s = get();
      const recipe = RECIPES.find((r) => r.id === recipeId);
      if (!recipe || s.bake) return;
      if (recipe.secret && !s.save.unlockedRecipes.includes(recipe.id)) return;
      if (recipe.fridge && !s.save.upgrades.includes("fridge")) return s.say("Butuh Kulkas dulu, beli di Toko Ajis");
      if (Object.entries(recipe.needs).some(([id, n]) => (s.save.inventory[id] ?? 0) < n)) {
        return s.say("Bahannya belum cukup");
      }
      if (!spend(bakeEnergy(s.save.upgrades))) return;
      let inv = s.save.inventory;
      for (const [id, n] of Object.entries(recipe.needs)) inv = add(inv, id, -n);
      patch(() => ({ inventory: inv }));
      set({ bake: { recipeId, endsAt: Date.now() + bakeSeconds(s.save.upgrades) * 1000 } });
    },

    placeInCase: (itemId) => {
      const s = get();
      if (s.save.caseItems.length >= s.save.caseSlots) return s.say("Etalasenya sudah penuh");
      if ((s.save.inventory[itemId] ?? 0) < 1 || itemOf(itemId).kind !== "product") return;
      patch((sv) => ({ inventory: add(sv.inventory, itemId, -1), caseItems: [...sv.caseItems, itemId] }));
      get().track("display");
    },

    takeFromCase: (index) => {
      const itemId = get().save.caseItems[index];
      if (!itemId) return;
      patch((sv) => ({ inventory: add(sv.inventory, itemId, 1), caseItems: sv.caseItems.filter((_, i) => i !== index) }));
    },

    toggleShop: () => {
      const open = !get().save.shopOpen;
      patch(() => ({ shopOpen: open }));
      get().say(open ? "Toko buka! Pelanggan akan datang 🔔" : "Toko tutup");
    },

    sellOne: () => {
      const s = get();
      const itemId = s.save.caseItems[0];
      if (!itemId) return null;
      const price = itemOf(itemId).price ?? 0;
      patch((sv) => ({ coins: sv.coins + price, caseItems: sv.caseItems.slice(1) }));
      playSfx("coins");
      const id = ++saleId;
      set({ sales: [...get().sales, { id, text: `+${price} 🪙` }] });
      setTimeout(() => set({ sales: get().sales.filter((x) => x.id !== id) }), 1800);
      get().track("sell");
      get().track(`sell:${itemId}`);
      get().track("earn", price);
      return itemId;
    },

    eat: (itemId) => {
      const s = get();
      const item = itemOf(itemId);
      if (!item.energy || (s.save.inventory[itemId] ?? 0) < 1) return;
      if (s.save.energy >= maxEnergy(s.save.upgrades)) return s.say("Masih kenyang, energinya penuh");
      patch((sv) => ({ inventory: add(sv.inventory, itemId, -1), energy: Math.min(maxEnergy(sv.upgrades), sv.energy + item.energy!) }));
      playSfx("eat");
      get().track("eat");
      s.say(`Nyam! +${item.energy} energi`);
    },

    buy: (kind, id) => {
      const s = get();
      if (!s.atShop) return s.say("Belanjanya di Toko Ajis ya, di sisi timur taman");
      const sv0 = s.save;
      const owned = [...sv0.upgrades, ...sv0.decorations];
      const outfit = OUTFITS.find((x) => x.id === id);
      const entry: { id: string; name: string; price: number; requires?: string; requiresName?: string } | undefined =
        kind === "seed"
          ? SEED_SHOP.find((x) => x.id === id)
          : kind === "decor"
            ? DECOR_SHOP.find((x) => x.id === id)
            : kind === "land"
              ? LAND_SHOP.find((x) => x.id === id)
              : kind === "upgrade"
                ? UPGRADE_SHOP.find((x) => x.id === id)
                : kind === "animal"
                  ? ANIMAL_SHOP.find((x) => x.id === id)
                  : kind === "pet"
                    ? PET_SHOP.find((x) => x.id === id)
                    : outfit && { id: outfit.id, name: outfit.name, price: outfit.price };
      if (!entry) return;

      // Sudah punya / syarat belum terpenuhi / kandang penuh
      if (kind === "decor" && sv0.decorations.includes(id)) return;
      if (kind === "outfit" && sv0.ownedOutfits.includes(id)) return;
      if ((kind === "land" || kind === "upgrade") && sv0.upgrades.includes(id)) return;
      if (kind === "pet" && sv0.pets.includes(id)) return;
      if (entry.requires && !owned.includes(entry.requires)) return s.say(`Butuh ${entry.requiresName ?? entry.requires} dulu`);
      if (kind === "animal") {
        const info = ANIMAL_SHOP.find((a) => a.id === id)!;
        if (sv0.animals.filter((a) => a.kind === info.kind).length >= info.max) return s.say(`Kandang ${info.name.toLowerCase()} sudah penuh`);
      }
      if (sv0.coins < entry.price) return s.say("Koinnya belum cukup 🪙");

      patch((sv) => {
        const base = { coins: sv.coins - entry.price };
        switch (kind) {
          case "seed":
            return { ...base, inventory: add(sv.inventory, id, 1) };
          case "decor":
            return { ...base, decorations: [...sv.decorations, id], ...(id === "big_case" ? { caseSlots: Math.max(sv.caseSlots, 6) } : {}) };
          case "outfit":
            return { ...base, ownedOutfits: [...sv.ownedOutfits, id], outfitId: id };
          case "land":
          case "upgrade":
            return { ...base, upgrades: [...sv.upgrades, id], ...(id === "case_lux" ? { caseSlots: 9 } : {}) };
          case "animal": {
            const info = ANIMAL_SHOP.find((a) => a.id === id)!;
            const used = new Set(sv.animals.map((a) => a.name));
            const name = ANIMAL_NAMES[info.kind].find((n) => !used.has(n)) ?? `${info.name} ${sv.animals.length + 1}`;
            const animal = { id: `${info.kind}-${Date.now().toString(36)}`, kind: info.kind, name, fed: false, petted: false, product: false, love: 0 };
            return { ...base, animals: [...sv.animals, animal] };
          }
          case "pet":
            return { ...base, pets: [...sv.pets, id], activePet: id };
        }
      });
      playSfx("coins");
      if (kind !== "seed") {
        get().track(`buy_${kind}`);
        get().track(`buy:${id}`);
      }
      s.say(kind === "animal" ? `${entry.name} baru datang ke peternakan! 🎉` : `Dibeli: ${entry.name}`);
    },

    wear: (outfitId) => {
      if (!get().save.ownedOutfits.includes(outfitId)) return;
      patch(() => ({ outfitId }));
    },

    sleep: (passedOut = false) => {
      const s = get();
      // Tanaman yang disiram tumbuh satu tahap; semua tanah kembali kering.
      const sprinkler = s.save.upgrades.includes("sprinkler");
      const plots = s.save.plots.map((p) =>
        // Penyiram otomatis langsung menyiram petak yang ditanami untuk hari berikutnya.
        p.seedId ? { ...p, growthStage: p.watered ? p.growthStage + 1 : p.growthStage, watered: sprinkler } : p,
      );
      // Hewan yang diberi makan menghasilkan telur/susu besok pagi; yang dielus makin sayang.
      const animals = s.save.animals.map((a) => ({
        ...a,
        product: a.product || a.fed,
        love: Math.min(10, a.love + (a.petted ? 1 : 0)),
        fed: false,
        petted: false,
      }));
      runtime.clock = DAY_START;
      runtime.player.x = SPOTS.bed[0] + 1.6; // bangun di samping kasur
      runtime.player.z = SPOTS.bed[1] + 0.5;
      set({
        minute: DAY_START,
        panel: null,
        sittingAt: null,
        bake: null,
        save: {
          ...s.save,
          inGameDay: s.save.inGameDay + 1,
          energy: passedOut ? 60 : maxEnergy(s.save.upgrades),
          plots,
          animals,
          foraged: [],
          shopOpen: false,
          // Misi harian baru untuk hari berikutnya.
          quests: normalizeQuests(s.save.quests, s.save.inGameDay + 1),
        },
      });
      void saveNow();
      playSfx("sleep");
      setTimeout(() => playSfx("wake"), 2200);
      s.say(passedOut ? "Windi ketiduran… energi cuma pulih 60" : `Selamat pagi! Hari ke-${s.save.inGameDay + 1} ☀️`);
    },

    chatAjis: () => {
      playSfx("click");
      runtime.greet = { id: "ajis", at: Date.now() };
      get().track("greet");
      // Setelah ngobrol, kembali ke toko.
      set({ panel: "ajis", ajis: { lines: ajisChat(), index: 0, name: "Ajis", portrait: "ajis" }, ajisThenShop: true });
    },

    nextAjisLine: () => {
      const { ajis } = get();
      if (ajis.index + 1 < ajis.lines.length) set({ ajis: { ...ajis, index: ajis.index + 1 } });
      else if (get().ajisThenShop)
        set({ panel: "catalog", atShop: true, ajisThenShop: false, shopGreeting: get().shopGreeting ?? "Selamat datang di Toko Ajis! Mau beli apa hari ini?" });
      else set({ panel: null });
    },

    openLetter: (id) => {
      const letter = get().letters.find((l) => l.id === id);
      if (!letter) return;
      playSfx("letter");
      set({ openLetterId: id, panel: null });
      if (letter.readAt) return;
      get().track("read_letter");
      fetch(`/api/letters/${id}/read`, { method: "POST" })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(({ readAt }: { readAt: string }) =>
          set({ letters: get().letters.map((l) => (l.id === id ? { ...l, readAt } : l)) }),
        )
        .catch(() => {
          // Offline: tandai dibaca di HP, kirim ke server nanti.
          queueRead(id);
          set({ letters: get().letters.map((l) => (l.id === id ? { ...l, readAt: new Date().toISOString() } : l)) });
        });
    },
    closeLetter: () => set({ openLetterId: null }),

    toggleMusic: () => {
      const { on, index } = get().music;
      if (on) stopMusic();
      else playMusic(index, () => get().skipTrack(1));
      set({ music: { on: !on, index } });
    },
    skipTrack: (dir) => {
      const n = trackCount();
      const index = (get().music.index + dir + n) % n;
      set({ music: { on: true, index } });
      playMusic(index, () => get().skipTrack(1));
    },

    setPhoto: (photo) => set({ photo, panel: null }),
    setMenu: (menu) => {
      if (menu) {
        void saveNow();
        enterMenuStage();
      } else {
        leaveMenuStage();
        // Pemain baru: tutorial otomatis dimulai setelah keluar dari menu.
        if (!get().save.tutorialDone && get().tutorialStep === null) {
          setTimeout(() => get().startTutorial(), 600);
        }
      }
      set({ menu, panel: null, previewOutfit: null, sittingAt: null });
    },
    setPreview: (previewOutfit) => set({ previewOutfit }),

    say: (toast, portrait) => {
      set({ toast, toastPortrait: portrait ?? null });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => set({ toast: null }), 2600);
    },
  };
});

export const isBusinessHours = (minute: number) => minute >= BUSINESS_HOURS[0] && minute < BUSINESS_HOURS[1];
