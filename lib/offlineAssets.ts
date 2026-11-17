// Daftar semua aset statis game, untuk disimpan di cache HP supaya bisa dimainkan offline.
import { ANIMAL_SHOP, DECOR_SHOP, ITEMS, LAND_SHOP, OUTFITS, PET_SHOP, UPGRADE_SHOP } from "./data";
import { PLAYLIST } from "./music";
import { TOWNSFOLK } from "./townsfolk";

const SFX = ["plant", "harvest", "coins", "door", "click"];

export function offlineAssetUrls(): string[] {
  const shopIds = [...LAND_SHOP, ...UPGRADE_SHOP, ...ANIMAL_SHOP, ...PET_SHOP, ...DECOR_SHOP].map((e) => e.id);
  return [
    "/manifest.webmanifest",
    ...Object.keys(ITEMS).map((id) => `/icons/${id}.webp`),
    ...OUTFITS.map((o) => `/outfits/${o.id}.webp`),
    ...shopIds.map((id) => `/shop/${id}.webp`),
    ...["windi", "ajis", ...TOWNSFOLK.map((t) => t.id)].map((id) => `/portraits/${id}.webp`),
    ...["grass", "path", "wood_floor", "wall", "roof"].map((n) => `/textures/${n}.jpg`),
    "/ui/logo.webp",
    "/ui/menu-bg.jpg",
    "/models/bed.glb",
    ...PLAYLIST.map((t) => t.src),
    ...SFX.map((n) => `/sfx/${n}.mp3`),
  ];
}

export const ASSET_CACHE = "windi-assets-v2";

/** Simpan aset ke cache satu per satu (yang gagal dilewati, tidak menggagalkan yang lain). */
export async function precacheAssets() {
  if (typeof caches === "undefined") return;
  const cache = await caches.open(ASSET_CACHE);
  await Promise.all(
    offlineAssetUrls().map(async (url) => {
      if (await cache.match(url)) return;
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {
        /* offline / tidak ada: lewati */
      }
    }),
  );
}
