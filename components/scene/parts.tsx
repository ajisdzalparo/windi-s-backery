"use client";

type V3 = [number, number, number];

// Hanya benda yang cukup besar yang memberi bayangan; detail kecil (mata, kancing, bunga) tidak,
// supaya pass bayangan jauh lebih ringan di HP.
const SHADOW_MIN = 0.35;

/** Balok low-poly: bahan dasar hampir semua model. */
export function Box({ p, s, c, r }: { p: V3; s: V3; c: string; r?: V3 }) {
  return (
    <mesh position={p} rotation={r} castShadow={Math.max(...s) > SHADOW_MIN} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  );
}

export function Cyl({
  p,
  rt,
  rb,
  h,
  c,
  seg = 12,
  r,
}: {
  p: V3;
  rt: number;
  rb: number;
  h: number;
  c: string;
  seg?: number;
  r?: V3;
}) {
  return (
    <mesh position={p} rotation={r} castShadow={Math.max(h, rt * 2, rb * 2) > SHADOW_MIN} receiveShadow>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
  );
}

export function Ball({ p, rad, c, s }: { p: V3; rad: number; c: string; s?: V3 }) {
  return (
    <mesh position={p} scale={s} castShadow={rad * 2 > SHADOW_MIN}>
      <sphereGeometry args={[rad, 14, 12]} />
      <meshStandardMaterial color={c} roughness={0.8} />
    </mesh>
  );
}

/** Selisih sudut terpendek, supaya karakter berbelok lewat arah terdekat. */
export function turnToward(current: number, target: number, t: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * t;
}
