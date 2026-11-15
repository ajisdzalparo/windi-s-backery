"use client";

// Efek suara (hasil Higgsfield Seed Audio, di public/sfx) + ambience taman yang berulang.
// File yang belum ada diabaikan diam-diam, jadi game tetap jalan tanpa audio.

export type Sfx =
  | "pickup"
  | "water"
  | "plant"
  | "harvest"
  | "oven"
  | "coins"
  | "door"
  | "click"
  | "letter"
  | "sleep"
  | "eat"
  | "wake";

const VOLUME: Partial<Record<Sfx, number>> = { click: 0.35, door: 0.5, coins: 0.6 };

/** File yang sudah ada di public/sfx. Tambahkan nama di sini setelah generate efek suara baru. */
const AVAILABLE = new Set<string>(["plant", "harvest", "coins", "door", "click"]);
const AMBIENCE_VOLUME = 0.22;

const KEY = "windi-sound-muted";
let muted = false;
try {
  muted = localStorage.getItem(KEY) === "1";
} catch {}

const cache = new Map<Sfx, HTMLAudioElement>();
let ambience: HTMLAudioElement | null = null;

function base(name: Sfx) {
  let a = cache.get(name);
  if (!a) {
    a = new Audio(`/sfx/${name}.mp3`);
    a.preload = "auto";
    cache.set(name, a);
  }
  return a;
}

export function playSfx(name: Sfx) {
  if (muted || typeof window === "undefined" || !AVAILABLE.has(name)) return;
  const a = base(name).cloneNode() as HTMLAudioElement;
  a.volume = VOLUME[name] ?? 0.7;
  void a.play().catch(() => {});
}

/** Dipanggil saat sentuhan pertama (aturan autoplay browser HP). */
export function startAmbience() {
  if (muted || typeof window === "undefined" || !AVAILABLE.has("ambience")) return;
  if (!ambience) {
    ambience = new Audio("/sfx/ambience.mp3");
    ambience.loop = true;
    ambience.volume = AMBIENCE_VOLUME;
  }
  void ambience.play().catch(() => {});
}

export const isMuted = () => muted;

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? "1" : "0");
  } catch {}
  if (m) ambience?.pause();
  else startAmbience();
}
