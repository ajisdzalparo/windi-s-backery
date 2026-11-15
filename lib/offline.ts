"use client";

// Penyimpanan lokal di HP supaya game tetap jalan tanpa internet (offline-first).
// Semua akses dibungkus try/catch: kalau penyimpanan browser diblokir, game tetap jalan lewat server.
import type { LetterItem, SaveData } from "./types";

const SAVE_KEY = "windi-save-v1";
const LETTERS_KEY = "windi-letters-v1";
const READS_KEY = "windi-pending-reads-v1";

export type LocalSave = { save: SaveData; savedAt: number; name: string };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* penyimpanan penuh/diblokir: abaikan, server tetap menyimpan */
  }
}

export const readLocalSave = () => read<LocalSave>(SAVE_KEY);
export const writeLocalSave = (save: SaveData, name: string) => write(SAVE_KEY, { save, savedAt: Date.now(), name } satisfies LocalSave);

export const cachedLetters = () => read<LetterItem[]>(LETTERS_KEY) ?? [];
export const cacheLetters = (letters: LetterItem[]) => write(LETTERS_KEY, letters);

/** Surat yang dibaca saat offline, dikirim ke server begitu online. */
export const pendingReads = () => read<string[]>(READS_KEY) ?? [];
export const queueRead = (id: string) => write(READS_KEY, [...new Set([...pendingReads(), id])]);
export const setPendingReads = (ids: string[]) => write(READS_KEY, ids);
