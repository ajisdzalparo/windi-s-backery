// Nilai yang berubah tiap frame. Disimpan di luar Zustand supaya tidak memicu render ulang React.
export const runtime = {
  player: { x: 0, z: -1, rot: 0 },
  input: { x: 0, z: 0 }, // keyboard, -1..1 relatif terhadap layar
  /** Titik tujuan ketuk-untuk-jalan (null = diam). */
  moveTarget: null as null | { x: number; z: number; at: number },
  clock: 360, // menit game (float)
  capture: null as null | (() => void),
  /** Posisi warga yang sedang ada di kota (diisi tiap frame oleh komponen Townsfolk). */
  npcs: new Map<string, { x: number; z: number }>(),
  /** Posisi hewan ternak dan peliharaan yang ikut Windi. */
  animals: new Map<string, { x: number; z: number }>(),
  pet: null as null | { x: number; z: number },
  /** Warga yang terakhir disapa Windi (untuk animasi lambaian). */
  greet: null as null | { id: string; at: number },
};
