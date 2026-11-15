"use client";

// Tekstur permukaan dari public/textures (hasil generate), diulang sesuai ukuran benda.
import { useMemo } from "react";
import { MirroredRepeatWrapping, SRGBColorSpace, TextureLoader } from "three";

export type TexName = "grass" | "path" | "wood_floor" | "wall" | "roof";

const loader = new TextureLoader();

/**
 * Satu tekstur per pemakaian (supaya pengulangan bisa berbeda). Gambar dimuat sekali oleh cache browser.
 * Mirrored repeat menyamarkan sambungan karena tekstur hasil generate tidak selalu seamless.
 */
export function useTiled(name: TexName, rx: number, ry: number) {
  return useMemo(() => {
    const t = loader.load(`/textures/${name}.jpg`);
    t.wrapS = t.wrapT = MirroredRepeatWrapping;
    t.repeat.set(Math.max(1, rx), Math.max(1, ry));
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [name, rx, ry]);
}

type V3 = [number, number, number];

/**
 * Balok bertekstur. `face` menentukan sisi mana yang menentukan pengulangan:
 * "top" (lantai/jalan: x×z), "front" (dinding menghadap z: x×y), "side" (dinding menghadap x: z×y).
 */
export function TexBox({ p, s, r, tex, face, tile = 2, tint = "#ffffff" }: { p: V3; s: V3; r?: V3; tex: TexName; face: "top" | "front" | "side"; tile?: number; tint?: string }) {
  const [u, v] = face === "top" ? [s[0], s[2]] : face === "front" ? [s[0], s[1]] : [s[2], s[1]];
  const map = useTiled(tex, Math.round(u / tile), Math.round(v / tile));
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial map={map} color={tint} roughness={0.9} />
    </mesh>
  );
}
